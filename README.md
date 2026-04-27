# ResLedge

> Your personal knowledge ledger — capture learnings, resources, ideas, tools, and templates in one clean workspace.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email + magic link)

---

## Project Structure

```
resledge/
├── app/
│   ├── (app)/                    # Protected app routes
│   │   ├── layout.tsx            # App shell with sidebar
│   │   ├── dashboard/page.tsx    # Dashboard with stats
│   │   ├── learnings/            # Learnings CRUD
│   │   ├── resources/            # Resources CRUD
│   │   ├── templates/            # Templates CRUD
│   │   ├── tools/                # Tools CRUD
│   │   ├── ideas/                # Ideas Vault CRUD
│   │   ├── archive/              # Archive & restore
│   │   ├── tags/                 # Tag management
│   │   └── search/               # Global search
│   ├── api/                      # API routes
│   │   ├── tags/route.ts
│   │   ├── search/route.ts
│   │   └── stats/route.ts
│   ├── auth/callback/route.ts    # OAuth callback
│   ├── login/page.tsx            # Auth page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── PageHeader.tsx
│   ├── entries/
│   │   ├── EntryCard.tsx
│   │   ├── TagSelector.tsx
│   │   └── InternalLinkSelector.tsx
│   └── ui/
│       ├── Modal.tsx
│       ├── EmptyState.tsx
│       ├── StatsCard.tsx
│       └── FilterBar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── database.types.ts
│   └── utils.ts
├── supabase/
│   └── schema.sql                # Full DB schema
└── middleware.ts                 # Auth middleware
```

---

## Setup Instructions

### 1. Clone and install

```bash
git clone <repo> resledge
cd resledge
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready

### 3. Run the database schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `supabase/schema.sql`
3. Paste and run it — this creates all tables, RLS policies, indexes, and triggers

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in your values from the Supabase dashboard (**Settings → API**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Configure Supabase Auth

In Supabase dashboard → **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000` (dev) or your production URL
- **Redirect URLs**: Add `http://localhost:3000/auth/callback`

For production, also add your live domain.

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to login.

---

## Features

| Feature | Description |
|---|---|
| **Dashboard** | Stats overview, pinned items, recent activity |
| **Learnings** | Capture lessons with title, summary, details, source, industry |
| **Resources** | Save links, docs, videos, articles with type classification |
| **Templates** | Store reusable frameworks with copyable content |
| **Tools** | Catalog tools with pricing and category |
| **Ideas Vault** | Raw ideas with status tracking (raw → exploring → validating → shelved) |
| **Archive** | Archive any entry, restore it any time |
| **Global Search** | Full-text search across all entry types with filters |
| **Tags** | Create and manage colour-coded tags, apply to any entry |
| **Internal Links** | Link entries across types (e.g. an idea → related resource) |
| **Pin/Favourite** | Pin important entries, shown first in lists and dashboard |

---

## Deployment (Vercel)

```bash
npm i -g vercel
vercel
```

Set the same env vars in Vercel's project settings. Update your Supabase Auth redirect URLs to include your production domain.

---

## Local Development Tips

- The app uses **Server Components** for the dashboard (fast initial load) and **Client Components** for interactive pages
- All data fetching uses the Supabase JS client directly — no separate API calls needed for most operations
- Tags are fetched inline with entries using a junction table (`entry_tags`)
- Internal links are stored in `internal_links` and fetched on detail pages

---

## Extending the App

To add a new entry type:

1. Add a table to `supabase/schema.sql`
2. Add the type to `lib/supabase/database.types.ts`
3. Add it to `TABLES` in `app/(app)/search/page.tsx`
4. Create `app/(app)/your-type/page.tsx`, `YourTypeForm.tsx`, `[id]/page.tsx`
5. Add a sidebar link in `components/layout/Sidebar.tsx`
