# Project Structure

```
NTI_frontend/
├── src/
│   ├── app/               # Next.js App Router — routing only
│   │   └── styles/        # Global CSS (global.css)
│   ├── components/        # React components
│   │   ├── shadcn/        # shadcn/ui output — never edit manually
│   │   ├── ui/            # your custom reusable primitives
│   │   ├── layout/        # App-wide layout pieces (Header, Sidebar…)
│   │   └── forms/         # Reusable form components
│   ├── store/             # Zustand global state stores
│   ├── services/          # API / data-fetching functions
│   └── lib/               # Everything utility-related
│       ├── hooks/         # Custom React hooks
│       ├── types/         # Shared TypeScript types & interfaces
│       ├── constants/     # App-wide constants (routes, config values…)
│       └── utils.ts       # Low-level helpers (cn, formatters…)
└── public/                # Static assets
```

---

## Folder rules

### `app/`
Only Next.js routing files: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, route groups `(group)/`.
Pages should be **thin** — import components, call hooks, nothing more.

---

### `components/`
All React components, split into four sub-folders:

- **`shadcn/`** — raw shadcn output. Add components with `npx shadcn@latest add <component>`. **Never edit these manually** — they get overwritten on updates.
- **`ui/`** — your own reusable primitives built on top of shadcn (e.g. a `Badge` with project-specific variants, a custom `Avatar`). Edit freely.
- **`layout/`** — structural pieces shared across all pages: Header, Sidebar, Footer.
- **`forms/`** — reusable form components (search bars, filter panels, multi-step forms).

Feature-specific components that aren't reusable can live in a named sub-folder: `components/auth/`, `components/dashboard/`, etc.

---

### `store/`
[Zustand](https://zustand.pmnd.rs/) stores for global client state. One file per slice.

```ts
// store/counter-store.ts
import { create } from 'zustand';

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}));
```

Use `zustand/middleware`'s `persist` for state that should survive a page refresh (auth, preferences).

---

### `services/`
Pure async functions that talk to the API. No React, no hooks — just fetch/axios calls that return typed data.

```ts
// services/hello-service.ts
export async function fetchHello(): Promise<{ message: string }> {
  const res = await fetch('/api/hello');
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}
```

---

### `lib/`
Everything utility-related lives here, grouped by purpose.

#### `lib/hooks/`
Custom React hooks — one concern per hook.

```ts
// lib/hooks/use-hello.ts
export function useHello() {
  const [message] = useState('Hello!');
  return { message };
}
```

#### `lib/types/`
Shared TypeScript types used across multiple files.

```ts
// lib/types/index.ts
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
```

#### `lib/constants/`
Static values that never change at runtime: route paths, magic numbers, config keys.

```ts
// lib/constants/index.ts
export const ROUTES = {
  HOME: '/',
} as const;
```

#### `lib/utils.ts`
Low-level helpers with no React dependency. The `cn()` helper (for shadcn) lives here.

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Key libraries

| Library | Purpose | Usage |
|---|---|---|
| **shadcn/ui** | Copy-paste UI primitives built on Radix | `npx shadcn@latest add <component>` |
| **Zustand** | Lightweight global state | `src/store/*.ts` |
| **Tailwind CSS v4** | Utility-first CSS | `src/app/globals.css` |
| **lucide-react** | Icon set (used by shadcn) | `import { X } from 'lucide-react'` |
| **clsx + tailwind-merge** | Safe className merging | `import { cn } from '@/lib/utils'` |

---

## Commit conventions

Uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by commitlint + husky.

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Tooling, deps, config |
| `refactor` | Code change without feature/fix |
| `style` | Formatting, no logic change |
| `docs` | Documentation only |
| `test` | Adding or fixing tests |

Run `npm run commit` for an interactive prompt (commitizen).
