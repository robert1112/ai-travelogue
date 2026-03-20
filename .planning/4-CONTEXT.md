# Phase 4 Context: Cinematic Travelogue View

本文件記錄 Phase 4 (沉浸式遊記排版與生成) 的核心架構與視覺決策。

## 📍 決策一：視覺排版 (Visual Layout)
**決策結論：**
- **風格**：為了解決大量照片並排的枯燥感，我們將採用「非對稱式 (Asymmetric/Staggered)」版面。
- **動態效果**：利用 `framer-motion` 的 `whileInView` 與 `viewport={{ once: true }}`，達成使用者向下捲動時，照片帶有稍微視差 (Parallax) 與滑入 (Fade-up) 的高級電影感效果。
- **背景**：在遊記呈現模式 (Presentation Mode) 下，背景可以進一步抽離多餘 UI，使畫面完全聚焦在影像本身。

## 📍 決策二：遊記資訊與分享 (Information & Sharing)
**決策結論：**
- 加入一個簡單的「遊記標題 (Title)」與「日期 (Date)」的 Hero 區塊，置於遊記頂部。
- 在頁面底部或固定於右上角提供一個「Share 🔗」按鈕，模擬產生可對外分享的公開連結。

## 📍 決策三：狀態機切換 (State Transition)
**決策結論：**
- 在 `app/page.tsx` 中，當使用者在 Phase 3 的結果頁點擊 `Generate Travelogue View` 時，整個畫面的 Uploader 與檢閱區將被卸載 (Unmount)。
- 畫面流暢地轉場進入 `TravelogueView`，這是一個純粹供閱讀與觀賞的獨立元件。
