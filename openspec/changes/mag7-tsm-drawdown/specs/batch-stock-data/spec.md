## ADDED Requirements

### Requirement: 按 ticker 独立缓存
系统 SHALL 为每个 ticker 维护独立的缓存条目（data + timestamp），30s TTL。已缓存且未过期的 ticker 在批量请求时 SHALL 直接返回缓存数据，不占用 API 配额。

#### Scenario: 部分 ticker 命中缓存
- **WHEN** 请求 [VOO, QQQ, AAPL]，其中 VOO 缓存有效
- **THEN** 仅请求 QQQ 和 AAPL，VOO 从缓存返回

### Requirement: 分批请求队列
系统 SHALL 将待请求的 ticker 按每批最多 5 个分组，批间等待 12 秒。

#### Scenario: 10 个 ticker 全部无缓存
- **WHEN** 请求全部 10 个 ticker 且无缓存
- **THEN** SHALL 分 2 批请求，第一批 5 个并行，等待 12s，第二批 5 个并行

#### Scenario: 缓存减少批次
- **WHEN** 请求 10 个 ticker 但 7 个有缓存，仅 3 个需请求
- **THEN** SHALL 只发 1 批（≤5 个），无需等待
