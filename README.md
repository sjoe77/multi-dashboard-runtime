
# Dashboard Authoring Platform (SvelteKit)

## Vision

This project enables authors to declaratively create, edit, and preview dashboards using Svelte markup. The workflow is:

- **Monaco Editor** on the left for editing `.svelte` dashboard pages.
- **Live Preview** on the right, instantly reflecting changes.
- **Drawer Navigation** for multi-page dashboards, with each dashboard as a directory under `dashboards/<dashboardName>/`.
- **Compile-on-Save**: When an author saves, the backend compiles the Svelte file and stores both the source and compiled JS. No compilation on view—users see precompiled JS for performance.
- **File-based Storage**: Dashboards are stored as folders with multiple `.svelte` pages and optional config files.
- **Versioning Ready**: The structure supports future git-style versioning for history and rollback.

## Key Features
- SvelteKit app with Vite for fast development
- Monaco-based authoring experience
- Runtime Svelte compilation on save
- Drawer navigation for dashboard pages
- Simple, scalable, and minimal architecture

## Getting Started

```bash
npm install
npm run dev
```

Then open your browser to the local dev server (default: http://localhost:5173).

---

See `dashboard-authoring-conversation.md` for the full design discussion and rationale.
