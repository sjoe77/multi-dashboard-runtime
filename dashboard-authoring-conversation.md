# Key Discussion Points

- **Declarative Authoring:** Authors write dashboards as Svelte markup, not JSON/YAML. This allows use of Svelte features like `{#if}` and `{#each}` for logic and layout.
- **Dashboard Structure:** Each dashboard is a directory under `dashboards/`, with each page as a `.svelte` file. Drawer-based navigation is generated from the directory structure.
- **Runtime Compilation:** On save, the backend compiles `.svelte` files to JS. Compiled artifacts are served to users; compilation only happens on edit, not on every view.
- **Simplicity Over Complexity:** The architecture avoids queues and extra services. A single runtime service handles compile-on-save and serves compiled code. Scaling is achieved by running multiple replicas with shared storage.
- **Performance:** Svelte compilation is fast (tens to hundreds of ms per file). Blocking the event loop for compilation is acceptable due to the low frequency of edits.
- **Versioning Ready:** The structure supports future git-style versioning for dashboard history and rollback.

