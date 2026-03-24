## Context

在现有宽指组合计算器基础上扩展，新增七姐妹+台积电跌幅追踪。需要解决 MASSIVE API 免费账户 5次/分钟的速率限制。

## Goals / Non-Goals

**Goals:**
- 支持 10 个 ticker 的 6 月跌幅数据获取
- 分批请求，每批 ≤5 个，批间延迟 12s
- 首页汇总 + 分类详情的两层导航
- 复用现有卡片设计语言

**Non-Goals:**
- 不支持自定义 ticker
- 不做实时股价推送
- 不做历史趋势图表

## Decisions

### 1. 分批请求策略

每批最多 5 个 ticker 并行请求，批间等待 12 秒（确保不超过 5次/分钟限制）。10 个 ticker 分为 2 批：
- 批次1: VOO, QQQ, AAPL, MSFT, GOOGL
- 批次2: AMZN, NVDA, META, TSLA, TSM

### 2. 按 ticker 独立缓存

从单一全局缓存改为 `Map<ticker, {data, timestamp}>`，30s TTL。已缓存的 ticker 不计入批次请求。

### 3. 页面结构：tabBar 三页

- 首页（home）：所有标的跌幅汇总排行
- 宽指（index）：原有组合计算器
- 个股（stocks）：七姐妹 + 台积电详情卡片

### 4. 首页设计

紧凑列表，每行显示：ticker + 名称 + 跌幅百分比 badge，按跌幅从大到小排序。点击可跳转对应详情页。

## Risks / Trade-offs

- **[分批延迟]** → 首次加载所有数据需 ~12s（2批），通过 loading 进度提示缓解
- **[缓存分散]** → 按 ticker 缓存增加内存占用，但 10 个 ticker 数据量很小可忽略
