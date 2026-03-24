// 替换为你的已备案域名（部署后修改）
var SERVER_URL = "https://api.tommiao.com";

var ALL_TICKERS = ["VOO", "QQQ", "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "TSM"];

var STOCK_NAMES = {
  VOO: "标普500 ETF",
  QQQ: "纳指100 ETF",
  AAPL: "苹果",
  MSFT: "微软",
  GOOGL: "谷歌",
  AMZN: "亚马逊",
  NVDA: "英伟达",
  META: "Meta",
  TSLA: "特斯拉",
  TSM: "台积电",
};

var STOCK_NAMES_EN = {
  VOO: "Vanguard S&P 500 ETF",
  QQQ: "Invesco QQQ Trust",
  AAPL: "Apple Inc.",
  MSFT: "Microsoft Corp.",
  GOOGL: "Alphabet Inc.",
  AMZN: "Amazon.com Inc.",
  NVDA: "NVIDIA Corp.",
  META: "Meta Platforms Inc.",
  TSLA: "Tesla Inc.",
  TSM: "Taiwan Semiconductor",
};

function request(path) {
  return new Promise(function (resolve, reject) {
    wx.request({
      url: SERVER_URL + path,
      success: function (res) {
        if (res.statusCode !== 200) {
          reject(new Error("服务器错误 " + res.statusCode));
          return;
        }
        resolve(res.data);
      },
      fail: function (err) {
        reject(new Error(err.errMsg || "网络请求失败"));
      },
    });
  });
}

function getMultipleDrawdowns(tickers, onBatchDone) {
  var tickerParam = tickers.join(",");
  return request("/api/drawdowns?tickers=" + tickerParam).then(function (result) {
    if (onBatchDone) onBatchDone(tickers.length, tickers.length);
    return result;
  });
}

function getIndexDrop(onBatchDone) {
  return request("/api/index-drop").then(function (result) {
    if (onBatchDone) onBatchDone(2, 2);
    return result;
  });
}

module.exports = {
  getIndexDrop: getIndexDrop,
  getMultipleDrawdowns: getMultipleDrawdowns,
  ALL_TICKERS: ALL_TICKERS,
  STOCK_NAMES: STOCK_NAMES,
  STOCK_NAMES_EN: STOCK_NAMES_EN,
};
