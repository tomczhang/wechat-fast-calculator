## ADDED Requirements

### Requirement: 汇总列表展示
首页 SHALL 展示所有标的的跌幅汇总，包括：宽指组合（VOO+QQQ 加权）、七姐妹（AAPL/MSFT/GOOGL/AMZN/NVDA/META/TSLA）、台积电（TSM）。每个条目显示 ticker、中文名、跌幅百分比。列表按跌幅从大到小排序。

#### Scenario: 正常展示
- **WHEN** 数据加载完成
- **THEN** 展示所有标的按跌幅排序的列表，跌幅大的排前面

### Requirement: 跳转详情
点击宽指组合条目 SHALL 跳转到宽指组合页（pages/index），点击个股条目 SHALL 跳转到个股详情页（pages/stocks）。

#### Scenario: 点击跳转
- **WHEN** 用户点击某个个股条目
- **THEN** SHALL 跳转到 pages/stocks 页面

### Requirement: 加载进度
首页 SHALL 展示分批加载进度，如"加载中 5/10"。

#### Scenario: 分批加载展示
- **WHEN** 第一批 5 个 ticker 已返回，第二批加载中
- **THEN** SHALL 显示已加载的数据并标注加载进度
