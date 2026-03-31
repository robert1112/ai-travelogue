# AGENTS.md — AI Travelogue Development Guide

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Project Overview

AI-powered travelogue generation toolkit. Users upload photos, AI curates and generates travel narratives.

**Stack:** Next.js 16.2, React 19, TypeScript, Prisma, PostgreSQL, Tailwind CSS v4

---

## Build & Development Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

### Running Single Components

```bash
# Type check without building
npx tsc --noEmit

# Lint specific files
npx eslint app/page.tsx components/*.tsx

# Prisma commands
npx prisma generate    # Regenerate Prisma client
npx prisma studio      # Open database GUI
npx prisma db push     # Push schema changes to database
```

---

## Code Style Guidelines

### TypeScript

- **Strict mode enabled** — no implicit any, strict null checks
- Use explicit types for function parameters and return values
- Define interfaces for all data structures (see `lib/ai-curator.ts`)
- Prefer `type` over `interface` for simple unions; use `interface` for extendable types

```typescript
// Good
export interface PhotoItem {
  id: string;
  file?: File;
  preview: string;
  included: boolean;
  exif: {
    latitude: number | null;
    longitude: number | null;
    date: string | null;
  } | null;
}

// Avoid
const process = (data: any) => { ... }
```

### React Components

- **"use client"** directive at top of all client components
- Server components by default (no directive = server)
- Use `React.FC` or inline function types for props
- Extract sub-components when JSX exceeds ~100 lines

```typescript
// Client component
"use client";
import React, { useState } from "react";

interface Props {
  initialValue?: string;
}

export default function MyComponent({ initialValue }: Props) {
  const [value, setValue] = useState(initialValue);
  // ...
}

// Inline sub-component
const SubComponent = ({ label }: { label: string }) => {
  return <div>{label}</div>;
};
```

### Imports

Order imports by:
1. React and core React types
2. Next.js imports
3. Third-party libraries (alphabetical)
4. Internal imports (`@/` alias)
5. Relative imports (`./`, `../`)

```typescript
// Example: components/MyComponent.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiImage, FiTrash } from "react-icons/fi";

import PhotoUploader from "@/components/PhotoUploader";
import { PhotoItem } from "@/lib/ai-curator";
import { authButton } from "@/components/auth-button";
```

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase.tsx | `TravelogueEditor.tsx` |
| Utilities | camelCase.ts | `ai-curator.ts` |
| API Routes | route.ts | `app/api/travelogues/route.ts` |
| Pages | page.tsx | `app/dashboard/page.tsx` |
| Styles | kebab-case.css | `globals.css` |

### API Routes

- Use `NextRequest` and `NextResponse` from `next/server`
- Always check session first with `auth()` from `@/lib/auth`
- Return appropriate HTTP status codes (401, 400, 500)
- Wrap database operations in try/catch
- Log errors with `console.error`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await prisma.travelogue.findMany({
      where: { userId: session.user.id },
    });
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
```

### CSS & Styling

- **Tailwind CSS v4** — use `@tailwindcss/postcss`
- Use CSS variables for theme colors (defined in `globals.css`)
- Custom colors in `@theme` block
- Utility classes for rapid prototyping, extract to classes for repeated patterns

```css
/* globals.css */
@theme {
  --color-leica-red: #CC0000;
  --color-leica-black: #0D0D0D;
}

/* Component */
<div className="bg-leica-red text-white" />
```

### Error Handling

```typescript
// Async operations
try {
  const result = await someAsyncOperation();
  return NextResponse.json({ result });
} catch (error: unknown) {
  console.error("Operation failed:", error);
  const message = error instanceof Error ? error.message : "Unknown error";
  return NextResponse.json({ error: message }, { status: 500 });
}

// Optional chaining for safe property access
const value = obj?.nested?.property ?? "default";

// Nullish coalescing
const final = value ?? "fallback";
```

---

## Project Structure

```
app/
├── api/              # API routes
│   ├── auth/[...nextauth]/  # NextAuth handlers
│   ├── travelogues/         # Travelogue CRUD
│   └── travelogue/          # AI generation
├── t/[id]/           # Travelogue view/edit pages
├── dashboard/        # User dashboard
└── globals.css       # Global styles + theme

components/           # React components
lib/                  # Utilities and config
│   ├── auth.ts       # NextAuth configuration
│   ├── prisma.ts     # Prisma client singleton
│   └── ai-curator.ts # Type definitions
prisma/
└── schema.prisma     # Database schema

@/* alias maps to project root
```

---

## Database

- **Prisma** with PostgreSQL
- Run `npx prisma generate` after schema changes
- Models: User, Account, Session, VerificationToken, Travelogue

---

## Key Dependencies

| Library | Purpose |
|---------|---------|
| `next-auth` | Authentication with email magic link |
| `prisma` | Database ORM |
| `framer-motion` | Animations |
| `@dnd-kit/*` | Drag and drop |
| `exifr` | EXIF metadata parsing |
| `heic2any` | HEIC image conversion |
| `zod` | Schema validation |
| `react-icons` | Icon library (Fi* for Feather Icons) |

---

## GSD Methodology (from PROJECT_RULES.md)

Reference: `PROJECT_RULES.md` for full methodology.

**Core Protocol:** SPEC → PLAN → EXECUTE → VERIFY → COMMIT

- SPEC.md must be FINALIZED before implementation
- One task = one atomic commit
- Verify before declaring done
- No enterprise patterns (solo dev + AI only)

**Commit Format:** `type(scope): description`
- Types: feat, fix, docs, refactor, test, chore

---

## Common Patterns

### Client State with Auto-save

```typescript
useEffect(() => {
  const autoSave = async () => {
    if (!shouldSave) return;
    setIsSaving(true);
    try {
      await fetch("/api/travelogues", { method: "POST", ... });
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };
  const timer = setTimeout(autoSave, 2000);
  return () => clearTimeout(timer);
}, [dependencyArray]);
```

### Drag and Drop with dnd-kit

```typescript
import { DndContext, closestCenter, ... } from "@dnd-kit/core";
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const { attributes, listeners, setNodeRef, transform } = useSortable({ id });
const style = { transform: CSS.Transform.toString(transform), transition };
```

---

## Environment Variables

See `.env.example` or existing `.env.local`. Key variables:
- `DATABASE_URL` / `DIRECT_URL` — PostgreSQL
- `AUTH_SECRET` — NextAuth secret
- `EMAIL_SERVER` / `EMAIL_FROM` — Nodemailer config
- `OPENAI_API_KEY` — AI generation (if needed)
- `SUPABASE_*` — Supabase config
