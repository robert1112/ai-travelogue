# Phase 1 Context

此文件記錄針對 Phase 1 (Foundation & Web Shell) 的細節討論與技術決策。後續 Plan Agent 將依靠此資訊進行切割。

## 📍 決策一：基礎框架與架構 (Foundation & Architecture)
**決策結論：**
- **網頁框架**：Next.js (App Router) + TypeScript。
- **原因**：為了 Phase 5 一鍵分享的 SEO 預覽以及未來整合 Serverless AI API，SSR 架構是最穩定的選擇。

## 📍 決策二：樣式與動態展示語言 (Styling & Animation)
**決策結論：**
- **樣式工具**：Tailwind CSS (V4) 作為全站基礎樣式。
- **動態語言**：整合 `framer-motion` 提供絲滑的轉場與捲動特效。
- **背景支援**：強烈建議包含「暗色模式 (Dark Mode)」支援，讓數百張旅行相片的展現更具劇院感。

## 📍 決策三：初始 UI 佈局 (UI Shell)
**決策結論：**
- **全螢幕沉浸感設計**：導覽列 (Navbar) 需具備透明或毛玻璃 (Glassmorphism) 效果。
- 整個介面保持開闊乾淨，無側邊欄干擾視覺。

## 💡 遞延想法 (Deferred Ideas)
- *未來可能考慮加入 Three.js 製作 3D 地球展示軌跡（先不放入 Phase 1，待 Phase 4/5 視效能評估）。*
