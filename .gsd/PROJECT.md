# AI Travelogue Project

AI-powered travelogue generation toolkit. Users upload photos, AI curates and generates travel narratives.

## Current State (v1.0 Shipped)
- **Status:** Functional MVP for photo curation, scene organization, and basic publishing.
- **Key Achievements:**
  - EXIF-based timeline clustering.
  - Interactive Drag-and-Drop scene editor with intuitive drop zones.
  - Supabase storage integration for photo persistence.
  - Automatic thumbnail generation and metadata sanitization.
  - SecurityError fixed for cross-origin canvas export.

## Next Milestone Goals (v2.0)
- [ ] **AI Narrative Refinement**: Enhancing the "Scribbling" engine with better tone control.
- [ ] **Auth & Dashboard**: Full multi-user support with persistence.
- [ ] **Mobile Optimization**: Progressive Web App (PWA) features for on-site travel logging.
- [ ] **Social Sharing**: Enhanced OG tags and interactive map previews.

## Environment & Tooling
- Framework: Next.js 16.2 (Turbopack)
- Styling: Tailwind CSS v4
- Database: Prisma + PostgreSQL (Supabase)
- Storage: Supabase Storage
