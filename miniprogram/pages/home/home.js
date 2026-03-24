var stock = require("../../utils/stock");

function dropClass(val) {
  if (val >= 0) return "dd-green";
  if (val > -10) return "dd-orange";
  return "dd-red";
}

Page({
  data: {
    loading: false,
    progress: "",
    error: null,
    items: [],
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
    that.setData({ loading: true, error: null, progress: "0/" + stock.ALL_TICKERS.length });

    return stock
      .getMultipleDrawdowns(stock.ALL_TICKERS, function (loaded, total) {
        that.setData({ progress: loaded + "/" + total });
      })
      .then(function (result) {
        if (!result.success) {
          that.setData({ loading: false, error: "数据加载失败" });
          return;
        }

        var list = [];
        stock.ALL_TICKERS.forEach(function (t) {
          var d = result.data[t];
          if (d && !d.error) {
            list.push({
              ticker: d.ticker,
              nameCN: d.nameCN,
              dropFromHigh: d.dropFromHigh,
              dropClass: dropClass(d.dropFromHigh),
              currentPrice: d.currentPrice,
              type: t === "VOO" || t === "QQQ" ? "index" : "stock",
            });
          }
        });

        list.sort(function (a, b) {
          return a.dropFromHigh - b.dropFromHigh;
        });

        var now = new Date();
        var h = String(now.getHours()).padStart(2, "0");
        var m = String(now.getMinutes()).padStart(2, "0");
        var s = String(now.getSeconds()).padStart(2, "0");

        that.setData({
          loading: false,
          items: list,
          updateTime: h + ":" + m + ":" + s,
          progress: "",
        });
      })
      .catch(function (err) {
        that.setData({
          loading: false,
          error: err.message || "网络错误",
        });
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
