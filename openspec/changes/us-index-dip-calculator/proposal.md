## Why

需要一个轻量级微信小程序，帮助投资者快速判断美股宽指（VOO + QQQ）的加仓时机。通过计算当前组合市值相对于近6个月前高的跌幅，提供直观的加仓信号。

## What Changes

- 新建微信小程序项目，包含完整的小程序目录结构
- 实现云函数调用 MASSIVE API 获取 VOO / QQQ 的日K数据，带 30s 内存缓存（免费账户每分钟限 5 次请求）
- 实现加权组合跌幅计算：前高总额 = 70% × VOO 6月最高 + 30% × QQQ 6月最高；当前总额 = 70% × VOO 当前价 + 30% × QQQ 当前价；输出跌幅百分比
- 提供简洁的结果展示页面，显示各标的价格、前高、跌幅等关键数据

## Capabilities

### New Capabilities

- `stock-data-service`: 云函数层，封装 MASSIVE API 调用和 30s 缓存逻辑，获取 VOO/QQQ 的日K数据及当前价格
- `index-drop-calculator`: 核心计算逻辑，基于 70/30 加权计算组合前高、当前总额和跌幅百分比
- `calculator-page`: 小程序前端页面，展示计算结果（各标的价格、前高、跌幅、组合跌幅）

### Modified Capabilities

（无已有能力需修改）

## Impact

- 新增微信小程序项目结构（`miniprogram/` + `cloudfunctions/`）
- 依赖 MASSIVE API（与 patient-hunter 共用同一 API Key）
- 需要微信云开发环境支持云函数部署
