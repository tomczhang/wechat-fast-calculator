## 1. 项目初始化

- [x] 1.1 创建微信小程序项目结构（app.js, app.json, app.wxss, project.config.json）
- [x] 1.2 创建云函数目录结构（cloudfunctions/getIndexDrop/）
- [x] 1.3 配置云开发环境（app.js 中初始化 wx.cloud）

## 2. 云函数 - 数据服务层

- [x] 2.1 实现 MASSIVE API 请求封装（massiveFetch），从环境变量读取 API Key，带 Authorization header
- [x] 2.2 实现 getBars 函数，调用 `/v2/aggs/ticker/{ticker}/range/1/day/{from}/{to}` 获取日K数据
- [x] 2.3 实现 30s 内存缓存机制（模块级变量，含 data + timestamp，请求时检查 TTL）
- [x] 2.4 实现 getIndexDrop 云函数入口，并行获取 VOO 和 QQQ 数据（Promise.all），统一错误处理

## 3. 核心计算逻辑

- [x] 3.1 实现 getSixMonthHigh 函数：从日K数据中找6个月最高价、最高价日期、当前收盘价
- [x] 3.2 实现加权组合计算：前高总额 = 0.7×VOO高 + 0.3×QQQ高，当前总额 = 0.7×VOO现 + 0.3×QQQ现
- [x] 3.3 实现跌幅百分比计算：(当前总额 - 前高总额) / 前高总额 × 100，保留两位小数

## 4. 小程序前端页面

- [x] 4.1 创建首页（pages/index/）的 wxml 布局：组合跌幅大字展示区 + VOO/QQQ 详情卡片
- [x] 4.2 实现 wxss 样式：跌幅颜色分级（绿≥0，橙0~-10%，红≤-10%）、加载动画、卡片布局
- [x] 4.3 实现 js 逻辑：调用云函数、处理返回数据、错误处理、loading 状态管理
- [x] 4.4 实现刷新功能：刷新按钮 + 下拉刷新（onPullDownRefresh）
- [x] 4.5 展示数据更新时间（HH:mm:ss 格式）

## 5. 配置与部署准备

- [x] 5.1 配置云函数的环境变量（MASSIVE_API_KEY）
- [x] 5.2 配置 app.json（页面路由、窗口标题、下拉刷新开关）
- [x] 5.3 云函数 package.json 添加 node-fetch 依赖（如需要）
