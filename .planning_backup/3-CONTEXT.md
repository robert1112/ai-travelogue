# Phase 3 Context: AI Curation & Filtering Module

此文件記錄針對 Phase 3 (AI 自動選片與剔除機制) 的架構與 UI 決策。

## 📍 決策一：AI 演算法模擬 (Simulation vs Real Backend)
**決策結論：**
- 由於此測試環境在本地前端運行，我們將建構一個**模擬的 AI 啟發式過濾模組 (Heuristic Web Worker/Service)**。
- **演算法行為**：傳入的照片陣列將被延遲處理 (模擬 1~3 秒思考時間)，並隨機從中將大約 30% 的照片標記為「相似/模糊 (Rejected)」，保留 70% 作為「精選 (Curated)」。
- 未來在生產環境中，這個模組的介面可以直接替換為真實的 API Call (如呼叫 OpenAI Vision 或自建影像辨識 API)。

## 📍 決策二：掃描動畫視覺 (Scanning UI)
**決策結論：**
- 當開始「AI Curating」時，畫面將進入**分析模式 (Analysis Mode)**。
- 圖片網格會覆蓋一層掃描圖示與進度條，透過 `framer-motion` 製作出一道「雷射光束」掃描圖片陣列的效果，帶給使用者「AI 正在工作」的高質感視覺回饋。

## 📍 決策三：審核結果介面 (Results Review)
**決策結論：**
- 分析完成後，介面會切換顯示「AI 精選區」與「被剔除的照片區」。
- 使用者可在剔除區點擊「復原 (Restore)」把誤刪的圖片加回去，給予使用者最終控制權。
