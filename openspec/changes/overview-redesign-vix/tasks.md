## 1. 服务端：VIX 数据

- [ ] 1.1 server/index.js 新增 VIX ticker（`I:VIX`）到 getBars + 缓存预热
- [ ] 1.2 新增 `GET /api/vix` 端点，返回当前值、涨跌幅、恐慌等级
- [ ] 1.3 本地测试 VIX 端点，确认 MASSIVE 支持 `I:VIX`

## 2. 小程序：stock.js 扩展

- [ ] 2.1 新增 `getVix()` 方法调用 `/api/vix`

## 3. 总览页重构

- [ ] 3.1 home.js：新增 VIX 数据获取 + 击球点判定逻辑（VOO -6.5%、QQQ -9%、个股 -30%）
- [ ] 3.2 home.wxml：三层布局（宽指卡片区 → VIX 区域 → 个股列表）
- [ ] 3.3 home.wxss：宽指卡片样式、VIX 区域样式、击球点标记样式、恐慌等级配色

## 4. 部署验证

- [ ] 4.1 提交代码推送到 GitHub，触发自动部署
- [ ] 4.2 微信开发者工具验证总览页三层布局 + VIX + 击球点
