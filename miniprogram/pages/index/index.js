var stock = require("../../utils/stock");

function splitDrop(val) {
  var sign = val >= 0 ? "+" : "-";
  var abs = Math.abs(val);
  var str = abs.toFixed(2);
  var parts = str.split(".");
  return { sign: sign, integer: parts[0], decimal: parts[1] };
}

function calcNeedlePos(drop) {
  // 0% → 100% (右侧), -20% → 0% (左侧)
  var clamped = Math.max(-20, Math.min(0, drop));
  return Math.round(((clamped + 20) / 20) * 100);
}

Page({
  data: {
    loading: false,
    error: null,
    data: null,
    updateTime: "",
    dropClass: "",
    dropSign: "",
    dropInteger: "0",
    dropDecimal: "00",
    needlePos: 50,
  },

  onLoad: function () {
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
    that.setData({ loading: true, error: null });

    return stock
      .getIndexDrop()
      .then(function (result) {
        if (!result.success) {
          that.setData({ loading: false, error: result.error || "请求失败" });
          return;
        }

        var d = result.data;
        var dropClass = "color-green";
        if (d.combinedDrop < -10) {
          dropClass = "color-red";
        } else if (d.combinedDrop < 0) {
          dropClass = "color-orange";
        }

        var parts = splitDrop(d.combinedDrop);

        var now = new Date();
        var h = String(now.getHours()).padStart(2, "0");
        var m = String(now.getMinutes()).padStart(2, "0");
        var s = String(now.getSeconds()).padStart(2, "0");

        that.setData({
          loading: false,
          data: d,
          dropClass: dropClass,
          dropSign: parts.sign,
          dropInteger: parts.integer,
          dropDecimal: parts.decimal,
          needlePos: calcNeedlePos(d.combinedDrop),
          updateTime: h + ":" + m + ":" + s,
        });
      })
      .catch(function (err) {
        that.setData({
          loading: false,
          error: err.errMsg || err.message || "网络错误",
        });
      });
  },
});
