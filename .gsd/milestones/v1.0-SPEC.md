# 智慧旅居生成器 (AI Travelogue)

為解決多數人擁有海量旅行照片卻「懶得整理」的痛點，本專案旨在提供一個**低門檻、高質感產出**的網頁應用。使用者只需上傳旅行相片，系統即會透過 AI 進行相片優化與篩選，自動產生帶有優雅動畫且賞心悅目的「網頁版遊記」，並可一鍵分享給親朋好友。

## Core Value
解決「低門檻製作」與「高質感產出」的矛盾，將數百張未整理的相片，一鍵轉換為極具吸引力且有動態視覺體驗的精美回憶錄。

## Requirements

### Validated
(None yet — ship to validate)

### Active
- [x] 支援大批量旅行相片上傳機制
- [x] 整合 AI 代理進行圖片智能選用、篩選重複相片及影像最佳化
- [x] 生成具備高質感捲動動畫與版面編排的網頁遊記視圖 (包含 EXIF 時間軸與手動拖曳分類)
- [ ] 產生唯一分享連結 (Public Shareable Link)

### Out of Scope
- [Mobile App] — 為了極大化分享的流暢度與低門檻，初期完全以自適應 Web App 為主
- [複雜的影片轉場剪輯] — 保持靜態影像配合前端 CSS/JS 動畫即可，避免系統過於笨重

---
*Last updated: Phase 4 EXIF Timeline & Drag-Drop Integration Completed*
# Requirements

## Minimum Viable Product (Phase 1-4 核心需求)
- 大批量相片上傳拖拉介面 (Drag & Drop)
- 安全的雲端相片儲存方案
- 呼叫 AI Vision 模型或演算法進行相片美感評分與自動過濾
- 優美動態效果的遊記展示頁面 (例如 Framer Motion 捲動動畫)
- 一鍵產生分享網址供他人瀏覽

## Next Iteration (v2)
- 根據上傳的相片地理位置與時間戳自動生成敘事文案
- 朋友留言與點讚互動系統
- 支援加入背景音樂
