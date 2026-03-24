import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { Config, QuoteContext } = require("longport");

const PORT = Number(process.env.PORT) || 3000;
const MASSIVE_BASE = "https://api.massive.com";
const MASSIVE_KEY = process.env.MASSIVE_API_KEY;
const BARS_TTL = 60 * 60 * 1000;
const QUOTE_TTL = 30 * 1000;
const WEIGHTS = { voo: 0.7, qqq: 0.3 };

const ALL_TICKERS = ["VOO", "QQQ", "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "TSM"];

const NAMES_CN = {
  VOO: "标普500 ETF", QQQ: "纳指100 ETF", AAPL: "苹果", MSFT: "微软", GOOGL: "谷歌",
  AMZN: "亚马逊", NVDA: "英伟达", META: "Meta", TSLA: "特斯拉", TSM: "台积电",
};

const NAMES_EN = {
  VOO: "Vanguard S&P 500 ETF", QQQ: "Invesco QQQ Trust", AAPL: "Apple Inc.",
  MSFT: "Microsoft Corp.", GOOGL: "Alphabet Inc.", AMZN: "Amazon.com Inc.",
  NVDA: "NVIDIA Corp.", META: "Meta Platforms Inc.", TSLA: "Tesla Inc.", TSM: "Taiwan Semiconductor",
};

// ---- Cache ----
const barsCache = {};
const quoteCache = {};
const barsPending = {};

// ---- MASSIVE: 6 个月日 K ----
function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

async function fetchBarsRaw(ticker) {
  const to = new Date();
  const from = new Date(to);
  from.setMonth(from.getMonth() - 6);
  const url = `${MASSIVE_BASE}/v2/aggs/ticker/${ticker}/range/1/day/${fmtDate(from)}/${fmtDate(to)}?adjusted=true&sort=asc&limit=5000`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${MASSIVE_KEY}` } });
  if (!res.ok) throw new Error(`MASSIVE ${res.status}`);
  const json = await res.json();
  return json.results || [];
}

async function getBars(ticker) {
  const cached = barsCache[ticker];
  if (cached && Date.now() - cached.ts < BARS_TTL) return cached.data;
  if (barsPending[ticker]) return barsPending[ticker];
  const p = fetchBarsRaw(ticker)
    .then((bars) => {
      barsCache[ticker] = { data: bars, ts: Date.now() };
      return bars;
    })
    .finally(() => delete barsPending[ticker]);
  barsPending[ticker] = p;
  return p;
}

// ---- LongPort: 实时报价 ----
let quoteCtx = null;

async function ensureQuoteCtx() {
  if (quoteCtx) return quoteCtx;
  try {
    const config = Config.fromEnv();
    quoteCtx = await QuoteContext.new(config);
    console.log("[LongPort] connected");
    return quoteCtx;
  } catch (e) {
    console.error("[LongPort] init failed:", e.message);
    return null;
  }
}

async function getQuotes(tickers) {
  const now = Date.now();
  const result = {};
  const need = [];
  for (const t of tickers) {
    const c = quoteCache[t];
    if (c && now - c.ts < QUOTE_TTL) result[t] = c.data;
    else need.push(t);
  }
  if (!need.length) return result;

  const ctx = await ensureQuoteCtx();
  if (!ctx) return result;

  try {
    const symbols = need.map((t) => t + ".US");
    const quotes = await ctx.quote(symbols);
    for (let i = 0; i < quotes.length; i++) {
      const q = quotes[i];
      const t = need[i];
      const price = Number(q.lastDone);
      let ts = q.timestamp;
      if (!(ts instanceof Date)) ts = new Date(Number(ts) * 1000);
      const data = { price, timestamp: ts };
      quoteCache[t] = { data, ts: now };
      result[t] = data;
    }
  } catch (e) {
    console.error("[LongPort] quote error:", e.message);
    if (/disconnect|closed|timeout/i.test(e.message)) quoteCtx = null;
  }
  return result;
}

// ---- 跌幅计算 ----
function calcDrawdown(ticker, bars, quote) {
  if (!bars?.length) return { ticker, error: "无日K数据", nameCN: NAMES_CN[ticker] || ticker };
  let maxBar = bars[0];
  for (let i = 1; i < bars.length; i++) if (bars[i].h > maxBar.h) maxBar = bars[i];
  const latestBar = bars[bars.length - 1];
  const currentPrice = quote?.price || latestBar.c;
  const priceDate = quote?.timestamp
    ? fmtDate(quote.timestamp)
    : fmtDate(new Date(latestBar.t));
  const drop = Math.round(((currentPrice - maxBar.h) / maxBar.h) * 100 * 100) / 100;
  return {
    ticker,
    nameCN: NAMES_CN[ticker] || ticker,
    nameEN: NAMES_EN[ticker] || ticker,
    highPrice: maxBar.h,
    highDate: fmtDate(new Date(maxBar.t)),
    currentPrice: Math.round(currentPrice * 100) / 100,
    priceDate,
    dropFromHigh: drop,
  };
}

// ---- 预热缓存 ----
async function warmCache() {
  console.log("[Warm] fetching bars...");
  for (let i = 0; i < ALL_TICKERS.length; i += 5) {
    const batch = ALL_TICKERS.slice(i, i + 5);
    await Promise.allSettled(batch.map((t) => getBars(t)));
    if (i + 5 < ALL_TICKERS.length) {
      console.log("[Warm] rate-limit pause 13s...");
      await new Promise((r) => setTimeout(r, 13000));
    }
  }
  console.log("[Warm] done");
}
warmCache();
setInterval(warmCache, BARS_TTL);

// ---- Hono ----
const app = new Hono();
app.use("/*", cors());

app.get("/api/health", (c) => c.json({ ok: true, uptime: process.uptime() }));

app.get("/api/drawdowns", async (c) => {
  const raw = c.req.query("tickers");
  const tickers = raw ? raw.split(",").filter(Boolean) : ALL_TICKERS;
  const quotes = await getQuotes(tickers);
  const data = {};
  for (const t of tickers) {
    try {
      const bars = await getBars(t);
      data[t] = calcDrawdown(t, bars, quotes[t]);
    } catch (e) {
      data[t] = { ticker: t, error: e.message, nameCN: NAMES_CN[t] || t };
    }
  }
  return c.json({ success: true, data });
});

app.get("/api/index-drop", async (c) => {
  const tickers = ["VOO", "QQQ"];
  const quotes = await getQuotes(tickers);
  const items = {};
  for (const t of tickers) {
    try {
      const bars = await getBars(t);
      items[t] = calcDrawdown(t, bars, quotes[t]);
    } catch (e) {
      return c.json({ success: false, error: `${t}: ${e.message}` });
    }
  }
  if (items.VOO.error || items.QQQ.error) {
    return c.json({ success: false, error: items.VOO.error || items.QQQ.error });
  }
  const prevHigh = WEIGHTS.voo * items.VOO.highPrice + WEIGHTS.qqq * items.QQQ.highPrice;
  const cur = WEIGHTS.voo * items.VOO.currentPrice + WEIGHTS.qqq * items.QQQ.currentPrice;
  const combinedDrop = Math.round(((cur - prevHigh) / prevHigh) * 100 * 100) / 100;
  return c.json({
    success: true,
    data: {
      voo: items.VOO,
      qqq: items.QQQ,
      prevHigh: Math.round(prevHigh * 100) / 100,
      currentTotal: Math.round(cur * 100) / 100,
      combinedDrop,
      weights: WEIGHTS,
      updatedAt: new Date().toISOString(),
    },
  });
});

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Server running on :${PORT}`);
});
