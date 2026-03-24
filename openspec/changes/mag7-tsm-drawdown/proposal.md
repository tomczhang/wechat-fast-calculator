## Why

用户需要追踪美股纳指七姐妹（AAPL/MSFT/GOOGL/AMZN/NVDA/META/TSLA）和台积电（TSM）的6个月跌幅数据，同时需要一个首页汇总所有标的（含已有的宽指组合）的跌幅概览，方便快速判断哪些标的跌幅较大值得关注。

## What Changes

- 重构 `utils/stock.js`：通用化数据获取逻辑，支持任意 ticker 列表，增加按 ticker 缓存和分批请求（避免超出5次/分钟限制）
- 新增首页 `pages/home/`：展示所有标的（宽指组合 + 七姐妹 + 台积电）的跌幅汇总列表
- 新增详情页 `pages/stocks/`：展示七姐妹和台积电的详细跌幅卡片
- 改造现有 `pages/index/` 为宽指组合专属页
- 新增 tabBar 底部导航：首页 / 宽指组合 / 个股跌幅

## Capabilities

### New Capabilities

- `batch-stock-data`: 通用化数据层，支持任意 ticker 列表的分批获取和按 ticker 独立缓存
- `home-summary-page`: 首页汇总页，展示所有标的的跌幅排行
- `stocks-detail-page`: 七姐妹+台积电详情页，复用现有卡片样式

### Modified Capabilities

- `stock-data-service`: 缓存从单一全局缓存改为按 ticker 独立缓存，新增分批请求队列
- `calculator-page`: 现有宽指页面改为 tabBar 子页面

## Impact

- `utils/stock.js` 需要较大重构
- `app.json` 新增页面路由和 tabBar 配置
- 新增 2 个页面目录
- MASSIVE API 请求量从 2 个增加到 10 个，需分批（2批 × 5个）
