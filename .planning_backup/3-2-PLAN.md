<plan>
<step>In `app/page.tsx`, add a new state `curationStep` ('idle' | 'scanning' | 'complete').</step>
<step>Update the "Begin AI Curating" button to trigger the `curationStep` transition to `scanning` and await the result from `lib/ai-curator.ts`.</step>
<step>Implement the `scanning` UI mode: wrap the existing photo grid in an AnimatePresence block that overlays a translucent dark layer with a glowing horizontal "laser" sweep powered by continuous Framer Motion keyframes.</step>
<step>Add a spinner and text "AI is analyzing your photos..." during this state.</step>
</plan>
