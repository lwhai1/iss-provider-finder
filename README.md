# 德州特需儿童及日间照料机构 (DAHS/ISS) 智能筛选匹配工具

本工具根据 **Texas Health and Human Services Commission (HHSC)** 最新发布的官方持证目录，将传统 DAHS 机构与 ISS (Individualized Skills and Socialization Only) 机构整合汇总，为特需儿童及残障人士家长提供一站式、可自定义筛选的机构检索与匹配服务。

---

## 📦 文件清单
1. **`data.json`**：汇总附件二与附件三共计 **1,130** 家持证机构的核心字段数据（已统一字段标准）。
2. **`index.html`**：网页前端界面，包含搜索框、County/City/Program 下拉框、核定容量筛选等。
3. **`style.css`**：现代响应式 UI 样式卡片布局。
4. **`app.js`**：前端交互逻辑，实现实时多条件筛选、动态计数与列表渲染。
5. **`serve.py`**：一键本地运行 Python HTTP 服务器脚本。

---

## 🚀 使用说明

### 方法一：直接一键运行 (推荐)
在当前目录下双击运行 `serve.py`，或在命令行中运行：
```bash
python serve.py
```
程序会自动打开浏览器并载入 `http://localhost:8000` 即可使用。

---

## 💡 特需家长筛选功能 Highlights
* **按 County / 城市匹配**：快速定位家附近的 Provider。
* **按 Program Type 筛选**：可区分传统 DAHS 日间照料、DAHS-ISS 混合项目，或 ISS-Only 专项社交技能中心。
* **一键联系**：卡片上支持一键拨打电话、发送 Email，以及在 Google 地图中查看机构位置。
