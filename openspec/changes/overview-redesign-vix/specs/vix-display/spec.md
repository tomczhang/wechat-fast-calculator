## ADDED Requirements

### Requirement: 服务端获取 VIX 数据
服务端 SHALL 通过 MASSIVE API 获取 `I:VIX` 的日 K 数据，提取最新收盘值和前一日收盘值，计算涨跌百分比。

#### Scenario: 正常获取 VIX 数据
- **WHEN** 客户端请求 `GET /api/vix`
- **THEN** 服务端返回 `{ success: true, data: { value, prevClose, change, changePercent, panicLevel, updatedAt } }`

#### Scenario: VIX I:VIX 不可用时降级
- **WHEN** `I:VIX` 请求失败
- **THEN** 服务端尝试使用 `VIXY` ETF 价格作为替代指标

### Requirement: VIX 恐慌等级判定
前端 SHALL 根据 VIX 当前值判定恐慌等级：
- < 30：正常（无标记）
- ≥ 30 且 < 40：一般恐慌
- ≥ 40 且 < 50：中等恐慌
- ≥ 50：特别恐慌

#### Scenario: VIX 值 32
- **WHEN** VIX 当前值为 32
- **THEN** 显示"一般恐慌"标签，使用橙色样式

#### Scenario: VIX 值 45
- **WHEN** VIX 当前值为 45
- **THEN** 显示"中等恐慌"标签，使用红色样式

#### Scenario: VIX 值 55
- **WHEN** VIX 当前值为 55
- **THEN** 显示"特别恐慌"标签，使用深红色样式

#### Scenario: VIX 值 20
- **WHEN** VIX 当前值为 20
- **THEN** 不显示恐慌标签，显示"正常"状态
