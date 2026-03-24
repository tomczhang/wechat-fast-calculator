var stock = require("../../utils/stock");

var MAG7_TSM = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "TSM"];

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
    cards: [],
    updateTime: "",
  },

  onLoad: function () {
    this.fetchData();
  },

  onShow: function () {
    if (this.data.cards.length) return;
    this.fetchData();
  },

  onPullDownRefresh: function () {
    this.fetchData().then(function () {
      wx.stopPullDownRefresh();
    });
  },

  onRefresh: function () {
    if (this.data.loading) return;
    this.fetchData();
  },

  fetchData: function () {
    var that = this;
    that.setData({ loading: true, error: null, progress: "0/" + MAG7_TSM.length });

    return stock
      .getMultipleDrawdowns(MAG7_TSM, function (loaded, total) {
        that.setData({ progress: loaded + "/" + total });
      })
      .then(function (result) {
        if (!result.success) {
          that.setData({ loading: false, error: "数据加载失败" });
          return;
        }

        var list = [];
        MAG7_TSM.forEach(function (t) {
          var d = result.data[t];
          if (d && !d.error) {
            list.push({
              ticker: d.ticker,
              nameCN: d.nameCN,
              nameEN: d.nameEN,
              highPrice: d.highPrice,
              highDate: d.highDate,
              currentPrice: d.currentPrice,
              dropFromHigh: d.dropFromHigh,
              dropClass: dropClass(d.dropFromHigh),
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
          cards: list,
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
});
