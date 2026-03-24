## ADDED Requirements

### Requirement: 展示组合跌幅结果

页面 SHALL 展示以下信息：
- VOO：6月最高价、最高价日期、当前价、个股跌幅
- QQQ：6月最高价、最高价日期、当前价、个股跌幅
- 组合：前高总额、当前总额、组合跌幅百分比（大字醒目显示）
- 权重说明：VOO 70% / QQQ 30%

#### Scenario: 正常展示数据
- **WHEN** 云函数成功返回计算结果
- **THEN** 页面 SHALL 展示上述所有字段，组合跌幅用大字号显示

#### Scenario: 跌幅不同级别的视觉区分
- **WHEN** 组合跌幅 ≥ 0（未下跌）
- **THEN** 跌幅数字 SHALL 显示为绿色
- **WHEN** 组合跌幅 < 0 且 > -10%
- **THEN** 跌幅数字 SHALL 显示为橙色
- **WHEN** 组合跌幅 ≤ -10%
- **THEN** 跌幅数字 SHALL 显示为红色（表示加仓信号较强）

### Requirement: 加载状态和错误处理

页面 SHALL 在数据加载时展示 loading 状态，在请求失败时展示错误信息和重试按钮。

#### Scenario: 数据加载中
- **WHEN** 页面发起云函数请求且尚未返回
- **THEN** SHALL 显示加载动画

#### Scenario: 请求失败
- **WHEN** 云函数返回错误
- **THEN** SHALL 显示错误信息和"重试"按钮

### Requirement: 手动刷新

页面 SHALL 提供刷新按钮，用户点击后重新调用云函数获取最新数据。同时支持下拉刷新。

#### Scenario: 点击刷新按钮
- **WHEN** 用户点击刷新按钮
- **THEN** SHALL 重新请求云函数并更新页面数据

#### Scenario: 下拉刷新
- **WHEN** 用户在页面顶部下拉
- **THEN** SHALL 触发数据刷新

### Requirement: 数据更新时间展示

页面 SHALL 展示数据的最后更新时间，格式为 "HH:mm:ss 更新"。

#### Scenario: 展示更新时间
- **WHEN** 数据成功加载
- **THEN** SHALL 在页面展示数据获取的时间戳
