## 1. 数据层重构

- [x] 1.1 重构 utils/stock.js：按 ticker 独立缓存（Map 结构，30s TTL）
- [x] 1.2 实现分批请求：每批 ≤5 个 ticker 并行，批间等待 12s，已缓存 ticker 跳过
- [x] 1.3 导出通用 getMultipleDrawdowns(tickers) 方法，返回所有 ticker 的6月跌幅数据
- [x] 1.4 保留 getIndexDrop() 兼容现有宽指页面

## 2. 首页（pages/home）

- [x] 2.1 创建 pages/home/ 目录及 4 个文件（js/wxml/wxss/json）
- [x] 2.2 实现汇总列表：ticker + 中文名 + 跌幅 badge，按跌幅从大到小排序
- [x] 2.3 实现分批加载进度提示（已加载 N/10）
- [x] 2.4 实现点击跳转：宽指组合 → pages/index，个股 → pages/stocks

## 3. 个股详情页（pages/stocks）

- [x] 3.1 创建 pages/stocks/ 目录及 4 个文件
- [x] 3.2 实现 8 张详情卡片（复用 etf-card 样式），展示七姐妹+台积电
- [x] 3.3 实现刷新功能和加载状态

## 4. 页面配置

- [x] 4.1 更新 app.json：新增页面路由，配置 tabBar（首页/宽指/个股）
- [x] 4.2 将 pages/home 设为默认首页
