# Phase 2 Context: Photo Upload & Storage System

此文件記錄針對 Phase 2 開發的大批量相片上傳機制的設計細節。

## 📍 決策一：前端大批量上傳方案
**決策結論：**
- **核心套件**：引入 `react-dropzone` 提供簡潔且強大的拖拉介面 (Drag & Drop)。
- **暫存預覽機制**：為了在無後端的測試環境下即時展示效能，我們將使用現代瀏覽器的 `URL.createObjectURL` 在記憶體中暫存並渲染縮圖。

## 📍 決策二：上傳量限制與 UI 狀態
**決策結論：**
- **上傳限制**：測試階段開放每次最高選取 100 張相片。
- **UI 回饋**：拖曳進入範圍時要有視覺的 Glassmorphism 反饋變化。
- **相片池**：一旦選取後，將相片整理成具有 Responsive Grid 佈局的精美預覽清單，方便 Phase 3 讓 AI 進行圈選與剔除。
