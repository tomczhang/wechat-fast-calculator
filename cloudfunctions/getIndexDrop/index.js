const fetch = require("node-fetch");

const MASSIVE_BASE_URL = "https://api.massive.com";
const CACHE_TTL_MS = 30 * 1000;
const WEIGHTS = { voo: 0.7, qqq: 0.3 };

// ============ 内存缓存 ============

let cache = { data: null, timestamp: 0 };

function isCacheValid() {
  return cache.data && Date.now() - cache.timestamp < CACHE_TTL_MS;
}

// ============ MASSIVE API ============

function getApiKey() {
  const key = process.env.MASSIVE_API_KEY;
  if (!key) throw new Error("未配置 MASSIVE_API_KEY，请在云函数环境变量中设置");
  return key;
}

async function massiveFetch(path, params) {
  const url = new URL(path, MASSIVE_BASE_URL);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") url.searchParams.set(k, v);
    });
  }

  const response = await fetch(url.toString(), {
    headers: { Authorization: "Bearer " + getApiKey() },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error("Massive API 调用失败 (" + response.status + "): " + detail);
  }

  return response.json();
}

async function getBars(ticker, from, to) {
  const data = await massiveFetch(
    "/v2/aggs/ticker/" +
      encodeURIComponent(ticker.toUpperCase()) +
      "/range/1/day/" +
      from +
      "/" +
      to,
    { adjusted: "true", sort: "asc", limit: "5000" }
  );
  return data.results || [];
}

// ============ 计算逻辑 ============

function formatDate(date) {
  var y = date.getFullYear();
  var m = String(date.getMonth() + 1).padStart(2, "0");
  var d = String(date.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}

function calcSixMonthHigh(ticker, bars) {
  if (!bars || bars.length === 0) {
    throw new Error(ticker + " 无日K数据");
  }

  var maxBar = bars[0];
  for (var i = 1; i < bars.length; i++) {
    if (bars[i].h > maxBar.h) {
      maxBar = bars[i];
    }
  }

  var latestBar = bars[bars.length - 1];

  return {
    ticker: ticker.toUpperCase(),
    highPrice: maxBar.h,
    highDate: formatDate(new Date(maxBar.t)),
    currentPrice: latestBar.c,
    dropFromHigh:
      Math.round(((latestBar.c - maxBar.h) / maxBar.h) * 100 * 100) / 100,
  };
}

function calcIndexDrop(voo, qqq) {
  var prevHigh =
    WEIGHTS.voo * voo.highPrice + WEIGHTS.qqq * qqq.highPrice;
  var currentTotal =
    WEIGHTS.voo * voo.currentPrice + WEIGHTS.qqq * qqq.currentPrice;
  var combinedDrop =
    Math.round(((currentTotal - prevHigh) / prevHigh) * 100 * 100) / 100;

  return {
    voo: voo,
    qqq: qqq,
    prevHigh: Math.round(prevHigh * 100) / 100,
    currentTotal: Math.round(currentTotal * 100) / 100,
    combinedDrop: combinedDrop,
    weights: WEIGHTS,
  };
}

// ============ 云函数入口 ============

exports.main = async function (event, context) {
  if (isCacheValid()) {
    return { success: true, cached: true, data: cache.data };
  }

  try {
    var now = new Date();
    var sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    var from = formatDate(sixMonthsAgo);
    var to = formatDate(now);

    var results = await Promise.all([
      getBars("VOO", from, to),
      getBars("QQQ", from, to),
    ]);

    var voo = calcSixMonthHigh("VOO", results[0]);
    var qqq = calcSixMonthHigh("QQQ", results[1]);
    var data = calcIndexDrop(voo, qqq);
    data.updatedAt = now.toISOString();

    cache = { data: data, timestamp: Date.now() };

    return { success: true, cached: false, data: data };
  } catch (err) {
    return { success: false, error: err.message || "未知错误" };
  }
};
