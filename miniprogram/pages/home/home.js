var stock = require("../../utils/stock");

var INDEX_TICKERS = ["VOO", "QQQ"];
var STOCK_TICKERS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "TSM"];

var STRIKE_ZONE = { VOO: -6.5, QQQ: -9, _stock: -30 };

var PANIC_LABELS = { normal: "正常", elevated: "一般恐慌", high: "中等恐慌", extreme: "特别恐慌" };
var PANIC_CLASSES = { normal: "panic-normal", elevated: "panic-elevated", high: "panic-high", extreme: "panic-extreme" };

var ECG_PATTERN = [2, 2, 3, 5, 3, 2, 2, 24, 2, 2, 2, 4, 7, 4, 2, 2, 2, 2, 2, 2];
var ECG_SCALES = { normal: 1, elevated: 1.5, high: 2.2, extreme: 3 };
var ECG_SPEED = { normal: "ecg-slow", elevated: "ecg-medium", high: "ecg-fast", extreme: "ecg-fastest" };

function makeEcgBars(panicLevel) {
  var scale = ECG_SCALES[panicLevel] || 1;
  var bars = [];
  for (var i = 0; i < ECG_PATTERN.length; i++) {
    var h = ECG_PATTERN[i];
    bars.push({ h: Math.max(4, Math.round(h * scale)), d: i * 80 });
  }
  return bars;
}

function dropClass(val) {
  if (val >= 0) return "dd-green";
  if (val > -10) return "dd-orange";
  return "dd-red";
}

function isStrikeZone(ticker, drop) {
  var threshold = STRIKE_ZONE[ticker] || STRIKE_ZONE._stock;
  return drop <= threshold;
}

Page({
  data: {
    loading: false,
    error: null,
    indexes: [],
    vix: null,
    stocks: [],
    updateTime: "",
  },

  onLoad: function () {
    this.fetchAll();
  },

  onPullDownRefresh: function () {
    this.fetchAll().then(function () {
      wx.stopPullDownRefresh();
    });
  },

  onRefresh: function () {
    if (this.data.loading) return;
    this.fetchAll();
  },

  fetchAll: function () {
    var that = this;
    that.setData({ loading: true, error: null });

    var allTickers = INDEX_TICKERS.concat(STOCK_TICKERS);
    var p1 = stock.getMultipleDrawdowns(allTickers);
    var p2 = stock.getVix();

    return Promise.all([p1, p2])
      .then(function (results) {
        var drawdownResult = results[0];
        var vixResult = results[1];

        if (!drawdownResult.success) {
          that.setData({ loading: false, error: "数据加载失败" });
          return;
        }

        var indexes = [];
        INDEX_TICKERS.forEach(function (t) {
          var d = drawdownResult.data[t];
          if (d && !d.error) {
            indexes.push({
              ticker: d.ticker,
              nameCN: d.nameCN,
              currentPrice: d.currentPrice,
              highPrice: d.highPrice,
              highDate: d.highDate,
              dropFromHigh: d.dropFromHigh,
              dropClass: dropClass(d.dropFromHigh),
              strikeZone: isStrikeZone(t, d.dropFromHigh),
              threshold: STRIKE_ZONE[t],
            });
          }
        });

        var stocks = [];
        STOCK_TICKERS.forEach(function (t) {
          var d = drawdownResult.data[t];
          if (d && !d.error) {
            stocks.push({
              ticker: d.ticker,
              nameCN: d.nameCN,
              currentPrice: d.currentPrice,
              highPrice: d.highPrice,
              highDate: d.highDate,
              dropFromHigh: d.dropFromHigh,
              dropClass: dropClass(d.dropFromHigh),
              strikeZone: isStrikeZone(t, d.dropFromHigh),
            });
          }
        });

        stocks.sort(function (a, b) {
          return a.dropFromHigh - b.dropFromHigh;
        });

        var vix = null;
        if (vixResult && vixResult.success) {
          var v = vixResult.data;
          vix = {
            value: v.value,
            change: v.change,
            changePercent: v.changePercent,
            panicLabel: PANIC_LABELS[v.panicLevel] || "正常",
            panicClass: PANIC_CLASSES[v.panicLevel] || "panic-normal",
            changeClass: v.change >= 0 ? "vix-up" : "vix-down",
            changeSign: v.change >= 0 ? "+" : "",
            ecgBars: makeEcgBars(v.panicLevel),
            ecgSpeed: ECG_SPEED[v.panicLevel] || "ecg-slow",
          };
        }

        var now = new Date();
        var h = String(now.getHours()).padStart(2, "0");
        var m = String(now.getMinutes()).padStart(2, "0");
        var s = String(now.getSeconds()).padStart(2, "0");

        that.setData({
          loading: false,
          indexes: indexes,
          vix: vix,
          stocks: stocks,
          updateTime: h + ":" + m + ":" + s,
        });
      })
      .catch(function (err) {
        that.setData({ loading: false, error: err.message || "网络错误" });
      });
  },

  onItemTap: function (e) {
    var type = e.currentTarget.dataset.type;
    if (type === "index") {
      wx.switchTab({ url: "/pages/index/index" });
    } else {
      wx.switchTab({ url: "/pages/stocks/stocks" });
    }
  },
});
