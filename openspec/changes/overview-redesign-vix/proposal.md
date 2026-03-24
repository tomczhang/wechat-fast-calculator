## Why

总览页需要更清晰的信息层级：宽指跌幅 → VIX 恐慌指标 → 个股跌幅，同时加入"击球点"提示帮助用户快速判断是否触发加仓条件。

## What Changes

- 总览页顶部区域重构：VOO/QQQ 独立置顶，显示距前高跌幅 + 击球点标记
- 新增 VIX（标普500波动率指数）展示区域，含当前值、涨跌百分比、恐慌等级标记
- 个股区域增加击球点标记（跌幅超过 30% 触发）
- 后端新增 VIX 数据获取（MASSIVE API `I:VIX` ticker）

## Capabilities

### New Capabilities
- `vix-display`: VIX 波动率指数获取与展示，含恐慌等级判定（≥30 一般恐慌、≥40 中等恐慌、≥50 特别恐慌）
- `strike-zone-alert`: 击球点判定与标记（VOO ≤-6.5%、QQQ ≤-9%、个股 ≤-30%）
- `overview-layout-v2`: 总览页布局重构，三层信息架构（宽指 → VIX → 个股）

### Modified Capabilities

## Impact

- `server/index.js`: 新增 VIX ticker 数据获取 + `/api/vix` 端点
- `miniprogram/utils/stock.js`: 新增 `getVix()` 请求方法
- `miniprogram/pages/home/`: 页面布局、样式、逻辑全面重构
- 去掉独立的"宽指"和"个股"tab 页（合并到总览）或保留但总览变为主视图
