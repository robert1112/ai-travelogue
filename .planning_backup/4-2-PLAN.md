<plan>
<step>In `app/page.tsx`, add a new state `viewMode` ('curation' | 'travelogue').</step>
<step>Update the "Generate Travelogue View" button in the `complete` curation step to switch `viewMode` to `travelogue`.</step>
<step>When `viewMode === 'travelogue'`, hide the entire Curation UI (Hero text, Uploaders, Grids) and instead render `<TravelogueView photos={photos} />` component inside an `AnimatePresence` fade transition.</step>
<step>Add a floating "Back to Edit" or "Start Over" button so the user doesn't get stuck in presentation mode.</step>
</plan>
