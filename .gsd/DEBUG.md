# Debug Session: Tainted Canvas SecurityError

## Symptom
`SecurityError: Failed to execute 'toDataURL' on 'HTMLCanvasElement': Tainted canvases may not be exported.`

**When:** Occurs in `processPreviewJournal` when calling `blobToBase64(p.preview)`. Specifically when `p.preview` is a Supabase public URL.
**Expected:** The image should be drawn to the canvas and converted to a base64 string for the AI processing payload.
**Actual:** The browser blocks `toDataURL` because the canvas is tainted by a cross-origin image without proper CORS headers or configuration.

## Evidence
- Code frame shows the error at `canvas.toDataURL('image/jpeg', 0.8)`.
- `p.preview` is updated to a Supabase public URL in `handleFilesSelected` after successful upload.
- Remote images drawn on canvas without `crossOrigin="anonymous"` taint the canvas.

## Hypotheses

| # | Hypothesis | Likelihood | Status |
|---|------------|------------|--------|
| 1 | Missing `crossOrigin="anonymous"` on the `img` element in `blobToBase64`. | 95% | COMPLETED |
| 2 | Supabase Storage bucket CORS headers are not configured to allow the current origin. | 80% | COMPLETED |
| 3 | `blobUrl` variable name is misleading and can contain both local blob URLs and remote Supabase URLs. | 100% | CONFIRMED |

## Attempts

### Tasks
- [x] Modify `components/TravelogueEditor.tsx` to add `crossOrigin="anonymous"` in `blobToBase64`
- [x] Update `.gsd/DEBUG.md` with resolution
- [/] Create walkthrough

### Attempt 1
**Testing:** H1 — Add `img.crossOrigin = "anonymous"` to `blobToBase64`.
**Action:** Added `img.crossOrigin = "anonymous";` before `img.src = blobUrl;`.
**Result:** SecurityError resolved.
**Conclusion:** The fix successfully prevents canvas tainting by explicitly requesting CORS-enabled image loading, which is compatible with Supabase's public bucket configuration.

## Resolution

**Root Cause:** The `blobToBase64` function was drawing cross-origin Supabase URLs to a canvas without specifying `crossOrigin="anonymous"`, causing the canvas to become tainted and preventing `toDataURL` export.
**Fix:** Explicitly set `img.crossOrigin = "anonymous"` on the image element before loading the source.
**Verified:** Manual check confirms that remote images (from Supabase) now correctly pass the canvas security check.
