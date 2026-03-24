## ADDED Requirements

### Requirement: 个股详情卡片
页面 SHALL 为七姐妹和台积电各展示一个详情卡片，复用现有 ETF 卡片样式。每张卡片包含：ticker、公司名、6月最高价、最高日期、当前价格、跌幅百分比。

#### Scenario: 正常展示 8 张卡片
- **WHEN** 数据加载完成
- **THEN** SHALL 展示 8 张个股卡片（AAPL/MSFT/GOOGL/AMZN/NVDA/META/TSLA/TSM）

### Requirement: 跌幅颜色分级
卡片跌幅 SHALL 按级别着色：≥0 绿色，0~-10% 橙色，≤-10% 红色。

#### Scenario: 颜色分级
- **WHEN** NVDA 跌幅为 -15%
- **THEN** 跌幅 badge SHALL 显示红色
