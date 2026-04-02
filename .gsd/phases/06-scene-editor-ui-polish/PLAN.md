---
phase: 6
plan: 1
wave: 1
gap_closure: false
---

# Plan 6.1: 移除場景編輯器中重複的 Drop Zone

## Objective
解決拖曳場景時同時出現 "drop here to create a new scene" 與 "new scene above" 的重複問題。優化後應僅保留場景間的單一放置區域，提升編輯體驗。

## Context
需檢查以下檔案：
- `components/TravelogueEditor.tsx` (或相關的場景列表與拖曳元件)
- `.gsd/SPEC.md` (參考場景編輯邏輯)

## Tasks

<task type="auto">
  <name>識別並移除重複的 Drop Zone</name>
  <files>
    {待確認的編輯器元件路徑}
  </files>
  <action>
    1. 搜尋包含 "drop here to create a new scene" 文字或相關邏輯的元件。
    2. 移除該重複區域。
    3. 確保 "new scene above/below" 的 Drop Zone 邏輯能正確涵蓋所有場景位置。
  </action>
  <verify>
    npm run dev 並手動測試拖曳場景的 UI 顯示。
  </verify>
  <done>
    拖曳時不再出現兩個重疊或重複的放置提示，且仍能正確在目標位置建立新場景或移動。
  </done>
</task>

## Must-Haves
- [ ] 移除 "drop here to create a new scene"
- [ ] 保留且優化場景間的放置區域 (Drop Zones)
- [ ] 拖曳功能運作正常

## Success Criteria
- [ ] 沒有重複的 UI 提示
- [ ] 拖曳流程順暢
- [ ] 無功能退化
