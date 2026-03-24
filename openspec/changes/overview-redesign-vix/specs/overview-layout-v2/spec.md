## ADDED Requirements

### Requirement: 三层信息架构
总览页 SHALL 按以下层级从上到下排列：
1. **宽指区域**：VOO 和 QQQ 置顶，显示 ticker、中文名、当前价、距前高跌幅百分比、击球点标记
2. **VIX 区域**：显示 VIX 当前值、涨跌百分比、恐慌等级标签
3. **个股区域**：七姐妹 + 台积电列表，按跌幅从大到小排序，含击球点标记

#### Scenario: 页面加载完成
- **WHEN** 数据全部加载完成
- **THEN** 页面从上到下依次显示宽指区域、VIX 区域、个股区域

### Requirement: 宽指区域与个股视觉区分
宽指区域（VOO/QQQ）SHALL 使用独立的卡片样式，与下方个股列表在视觉上明确区分。

#### Scenario: 渲染宽指区域
- **WHEN** VOO 和 QQQ 数据就绪
- **THEN** 使用带背景色的卡片展示，区别于个股的列表行样式

### Requirement: 数据加载与刷新
总览页 SHALL 一次请求获取所有数据（drawdowns + VIX），支持手动刷新。

#### Scenario: 点击刷新
- **WHEN** 用户点击刷新按钮
- **THEN** 重新请求所有数据并更新页面
