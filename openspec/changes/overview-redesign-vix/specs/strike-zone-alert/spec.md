## ADDED Requirements

### Requirement: 宽指击球点判定
前端 SHALL 根据以下阈值判定宽指是否触发击球点：
- VOO 距前高跌幅 ≤ -6.5%：触发击球点
- QQQ 距前高跌幅 ≤ -9%：触发击球点

#### Scenario: VOO 跌幅 -7%
- **WHEN** VOO 距前高跌幅为 -7%
- **THEN** VOO 行显示"击球点"标记

#### Scenario: VOO 跌幅 -5%
- **WHEN** VOO 距前高跌幅为 -5%
- **THEN** VOO 行不显示"击球点"标记

#### Scenario: QQQ 跌幅 -10%
- **WHEN** QQQ 距前高跌幅为 -10%
- **THEN** QQQ 行显示"击球点"标记

### Requirement: 个股击球点判定
前端 SHALL 对七姐妹+台积电个股，距前高跌幅 ≤ -30% 时标记为触发击球点。

#### Scenario: MSFT 跌幅 -31%
- **WHEN** MSFT 距前高跌幅为 -31%
- **THEN** MSFT 行显示"击球点"标记

#### Scenario: AAPL 跌幅 -12%
- **WHEN** AAPL 距前高跌幅为 -12%
- **THEN** AAPL 行不显示"击球点"标记
