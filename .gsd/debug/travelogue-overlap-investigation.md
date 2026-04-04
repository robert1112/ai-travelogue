---
status: investigating
trigger: "在iphone chrome瀏覽器上看相片集 如果是兩張大小相同照片排版 沒有後照片重疊前面照片問題 但是如果是兩張 一大一小 或是三張照片 就會有overlapped問題 只有出現在小視窗畫面"
created: 2026-04-04T17:30:00+08:00
updated: 2026-04-04T17:30:00+08:00
---

## Current Focus
hypothesis: 
The `aspect-ratio` or `framer-motion` initialization is failing on iPhone Chrome/Safari when photos have different aspect ratios in a `grid` or `flex` container, causing them to not reserve their full height in the layout flow during hydration or animation.

test: 
1. Replace `aspect-*` utilities with inline `aspect-ratio` styles or explicit padding-bottom hacks if needed.
2. Disable `x` and `scale` animations on mobile to see if they are the cause.
3. Ensure `w-full` and `h-auto` are correctly set.

expecting: 
Stable, non-overlapping stacked photos on mobile regardless of size.

## Symptoms
- Overlap on mobile when heights are uneven.
- No overlap when heights are identical.
- Occurs in diptych (2 photos) and mosaic (3+ photos).
- iPhone Chrome specific.

## Evidence
- `framer-motion` `initial` and `whileInView` are present on all photos.
- `aspect-ratio` is used for containers.
- `flex-col` is used for mobile diptych.
- `grid-cols-1` is used for mobile mosaic.
