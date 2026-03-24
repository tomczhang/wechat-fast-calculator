## ADDED Requirements

### Requirement: 云函数获取 ETF 日K数据

云函数 SHALL 调用 MASSIVE API 的 `/v2/aggs/ticker/{ticker}/range/1/day/{from}/{to}` 接口，获取指定 ETF 的日K数据。云函数 SHALL 从环境变量 `MASSIVE_API_KEY` 读取 API Key，通过 `Authorization: Bearer` 请求头传递。

#### Scenario: 成功获取 VOO 日K数据
- **WHEN** 云函数被调用请求 VOO 的近6个月日K数据
- **THEN** 返回包含每日 OHLCV 数据的数组，每条记录包含 open/high/low/close/volume/timestamp

#### Scenario: MASSIVE API 返回错误
- **WHEN** MASSIVE API 返回非 200 状态码
- **THEN** 云函数 SHALL 返回错误信息，包含 HTTP 状态码和错误详情

#### Scenario: API Key 未配置
- **WHEN** 环境变量 `MASSIVE_API_KEY` 未设置
- **THEN** 云函数 SHALL 返回明确的配置错误提示

### Requirement: 30秒内存缓存

云函数 SHALL 在模块级维护缓存，对相同请求在 30 秒内直接返回缓存数据。缓存结构 SHALL 包含数据和时间戳。当缓存超过 30 秒时 SHALL 重新请求 MASSIVE API。

#### Scenario: 缓存命中
- **WHEN** 在上次请求后 30 秒内再次调用云函数
- **THEN** SHALL 直接返回缓存数据，不调用 MASSIVE API，响应中 SHALL 标记 `cached: true`

#### Scenario: 缓存过期
- **WHEN** 距离上次请求超过 30 秒后调用云函数
- **THEN** SHALL 重新调用 MASSIVE API 获取数据并更新缓存

#### Scenario: 云函数冷启动
- **WHEN** 云函数实例首次启动（无缓存）
- **THEN** SHALL 调用 MASSIVE API 获取数据并初始化缓存

### Requirement: 并行获取 VOO 和 QQQ 数据

云函数 SHALL 支持一次调用同时获取 VOO 和 QQQ 的数据，使用 Promise.all 并行请求以减少延迟。两个标的 SHALL 共享同一个缓存机制。

#### Scenario: 同时获取两个标的
- **WHEN** 前端请求组合数据
- **THEN** 云函数 SHALL 并行获取 VOO 和 QQQ 数据，返回合并结果

#### Scenario: 其中一个标的请求失败
- **WHEN** VOO 请求成功但 QQQ 请求失败
- **THEN** 云函数 SHALL 返回错误，不返回部分数据
