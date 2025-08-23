<script>
  import { onMount } from 'svelte';
  import SimpleEditor from './components/SimpleEditor.svelte';
  import Monaco from './components/Monaco.svelte';
  import LivePreview from './components/LivePreview.svelte';
  import AppHeader from './components/AppHeader.svelte';
  import AppDrawer from './components/AppDrawer.svelte';
  import { saveDashboard, loadDashboard, listDashboards } from './lib/dashboardAPI.js';
  
  let code = '';
  let currentDashboard = null;
  let currentPage = 'Overview';
  let saveMessage = '';
  let dashboards = {};
  let drawerOpen = false;
  
  // Simple routing state
  let currentView = 'edit'; // 'landing', 'consumer', 'edit'
  let isEditMode = true;
  
  // Simple URL routing
  function parseURL() {
    const path = window.location.pathname;
    const parts = path.split('/').filter(p => p);
    
    if (parts.length === 0 || parts[0] !== 'dashboards') {
      window.history.pushState({}, '', '/dashboards');
      currentView = 'landing';
      return;
    }
    
    if (parts.length === 1) {
      currentView = 'landing';
    } else if (parts.length === 2) {
      currentView = 'consumer';
      currentDashboard = parts[1];
      isEditMode = false;
    } else if (parts.length === 3 && parts[2] === 'edit') {
      currentView = 'edit';
      currentDashboard = parts[1];
      isEditMode = true;
    } else {
      currentView = 'landing';
    }
  }
  
  function navigateTo(url) {
    window.history.pushState({}, '', url);
    parseURL();
  }
  
  // Load dashboard content from file system
  async function loadCurrentDashboard() {
    try {
      console.log(`Loading dashboard: ${currentDashboard}/${currentPage}.svelte`);
      const url = `/dashboards/${currentDashboard}/${currentPage}.svelte?t=${Date.now()}`;
      console.log(`Fetching from: ${url}`);
      
      const response = await fetch(url);
      console.log(`Response status: ${response.status}`);
      
      if (response.ok) {
        const content = await response.text();
        console.log(`Content length: ${content.length}`);
        console.log(`Content preview: ${content.substring(0, 100)}...`);
        
        if (content.includes('<!doctype') || content.includes('<html')) {
          code = '<div>Error: Got HTML instead of Svelte file. Check file path.</div>';
          console.error('Got HTML instead of Svelte content');
        } else {
          code = content;
          console.log('✅ Successfully loaded dashboard content');
        }
      } else {
        const errorText = await response.text();
        console.error(`Failed to load dashboard: ${response.status} - ${errorText}`);
        code = `<div>Dashboard file not found (${response.status}): ${currentDashboard}/${currentPage}.svelte</div>`;
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      code = `<div>Error loading dashboard: ${error.message}</div>`;
    }
  }

  // Load on startup
  onMount(() => {
    parseURL();
    
    window.addEventListener('popstate', () => {
      parseURL();
    });
  });
  
  // Track loading state
  let lastLoadedState = '';
  let isLoading = false;
  
  // Reload when dashboard or page changes
  $: {
    const currentState = `${currentDashboard}:${currentPage}:${currentView}`;
    if (currentDashboard && currentPage && (currentView === 'edit' || currentView === 'consumer') && currentState !== lastLoadedState && !isLoading) {
      lastLoadedState = currentState;
      isLoading = true;
      loadCurrentDashboard().finally(() => {
        isLoading = false;
      });
    }
  }
  
  // Load available dashboards
  $: dashboards = listDashboards();
  
  // Event handlers
  function handleOpenDrawer() {
    drawerOpen = true;
  }
  
  function handleCloseDrawer() {
    drawerOpen = false;
  }
  
  function handleNavigate(event) {
    navigateTo(event.detail);
  }
  
  async function handleSave() {
    const result = await saveDashboard(currentDashboard, currentPage, code);
    if (result.success) {
      saveMessage = `✅ ${result.message}`;
      if (result.warnings.length > 0) {
        saveMessage += ` (${result.warnings.length} warnings)`;
      }
    } else {
      saveMessage = `❌ Error: ${result.error}`;
    }
    
    setTimeout(() => saveMessage = '', 3000);
  }
  
  async function handleDrawerSelect(event) {
    const { dashboard, page } = event.detail;
    const result = await loadDashboard(dashboard, page);
    if (result.success) {
      code = result.source;
      currentDashboard = dashboard;
      currentPage = page;
      saveMessage = `📁 Loaded ${dashboard}/${page}`;
      setTimeout(() => saveMessage = '', 2000);
      
      navigateTo(`/dashboards/${dashboard}/edit`);
    }
  }
  
  function viewDashboard(dashboardName) {
    navigateTo(`/dashboards/${dashboardName}`);
  }
  
  function editDashboard(dashboardName) {
    navigateTo(`/dashboards/${dashboardName}/edit`);
  }
</script>

<!-- App Header -->
<AppHeader 
  {currentDashboard} 
  {currentPage} 
  {currentView}
  on:open-drawer={handleOpenDrawer}
  on:navigate={handleNavigate}
/>

<!-- App Drawer -->
<AppDrawer 
  isOpen={drawerOpen} 
  {dashboards}
  {currentDashboard}
  {currentPage}
  on:close={handleCloseDrawer}
  on:select={handleDrawerSelect}
  on:navigate={handleNavigate}
/>

<main class="app-main">
  <!-- Landing Page View -->
  {#if currentView === 'landing'}
    <div class="landing surface-container">
      <div class="landing-content">
        <div class="hero-section">
          <i class="material-icons hero-icon">dashboard</i>
          <h1 class="hero-title">Dashboard Runtime</h1>
          <p class="hero-subtitle">Create, edit, and share interactive dashboards with live data</p>
        </div>
        
        <div class="dashboard-grid">
          {#each Object.entries(dashboards) as [dashboardName, pages]}
            <article class="card dashboard-card">
              <div class="card-header">
                <h3 class="dashboard-title">{dashboardName}</h3>
                <div class="card-actions">
                  <button class="button fill" on:click={() => viewDashboard(dashboardName)}>
                    <i class="material-icons">visibility</i>
                    <span>View</span>
                  </button>
                  <button class="button" on:click={() => editDashboard(dashboardName)}>
                    <i class="material-icons">edit</i>
                    <span>Edit</span>
                  </button>
                </div>
              </div>
              <div class="card-content">
                <p class="page-count">{pages.length} page{pages.length === 1 ? '' : 's'}</p>
                <div class="page-tags">
                  {#each pages as page}
                    <span class="chip">{page}</span>
                  {/each}
                </div>
              </div>
            </article>
          {/each}
        </div>
      </div>
    </div>
  
  <!-- Consumer View -->
  {:else if currentView === 'consumer'}
    <div class="consumer-view surface">
      <div class="dashboard-container">
        <LivePreview {code} />
      </div>
    </div>
  
  <!-- Edit Mode View -->
  {:else if currentView === 'edit'}
    <!-- Save message snackbar -->
    {#if saveMessage}
      <div class="snackbar active">
        <span>{saveMessage}</span>
      </div>
    {/if}
    
    <!-- Editor layout -->
    <div class="editor-layout">
      <div class="editor-panel surface-container">
        <div class="editor-header">
          <div class="file-info">
            <i class="material-icons">description</i>
            <span class="file-path">{currentDashboard}/{currentPage}.svelte</span>
          </div>
          <button class="button fill" on:click={handleSave}>
            <i class="material-icons">save</i>
            <span>Save</span>
          </button>
        </div>
        <div class="editor-content">
          <Monaco bind:value={code} language="svelte" />
        </div>
      </div>
      
      <div class="preview-panel surface">
        <div class="preview-header">
          <h3 class="preview-title">Live Preview</h3>
          <button class="button" on:click={() => viewDashboard(currentDashboard)}>
            <i class="material-icons">open_in_new</i>
            <span>Full View</span>
          </button>
        </div>
        <div class="preview-content">
          <LivePreview {code} />
        </div>
      </div>
    </div>
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background: var(--background);
    color: var(--on-background);
    font-family: 'Inter', system-ui, sans-serif;
  }
  
  .app-main {
    padding-top: 64px; /* Account for fixed header */
    min-height: calc(100vh - 64px);
  }

  /* Landing Page Styles */
  .landing {
    min-height: calc(100vh - 64px);
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  }

  .landing-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 4rem 2rem;
  }

  .hero-section {
    text-align: center;
    color: var(--surface);
    margin-bottom: 4rem;
  }

  .hero-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.95;
    color: white;
    text-shadow: 0 2px 8px rgba(0,0,0,0.4);
  }

  .hero-title {
    font-size: 3.5rem;
    margin: 0 0 1rem 0;
    font-weight: 700;
    text-shadow: 0 2px 8px rgba(0,0,0,0.5);
    color: white;
  }

  .hero-subtitle {
    font-size: 1.25rem;
    margin: 0;
    opacity: 0.95;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 0 1px 4px rgba(0,0,0,0.3);
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    justify-content: center;
  }

  .dashboard-card {
    transition: box-shadow 0.2s ease;
    height: 100%;
  }

  .dashboard-card:hover {
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .dashboard-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 500;
    text-transform: capitalize;
    color: var(--on-surface);
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
    min-width: 0;
  }

  .page-count {
    margin: 0 0 1rem 0;
    color: var(--on-surface-variant);
    font-size: 0.875rem;
  }

  .page-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .chip {
    font-size: 0.75rem;
  }

  /* Consumer View Styles */
  .consumer-view {
    min-height: calc(100vh - 64px);
    background: var(--background);
  }

  .dashboard-container {
    width: 100%;
    height: 100%;
    background: var(--surface);
  }

  /* Edit Mode Styles */
  .snackbar {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s ease;
    background: var(--surface-container-high);
    color: var(--on-surface);
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-weight: 500;
  }

  .snackbar.active {
    opacity: 1;
  }

  .editor-layout {
    display: flex;
    height: calc(100vh - 64px);
    background: var(--background);
  }

  .editor-panel {
    flex: 1;
    min-width: 0; /* Prevent flex item from overflowing */
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--outline-variant);
    background: var(--surface-container);
  }

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1.5rem;
    border-bottom: 1px solid var(--outline-variant);
    background: var(--surface-container-high);
    min-height: 56px;
    box-sizing: border-box;
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
  }

  .file-info i {
    color: var(--on-surface-variant);
    font-size: 18px;
  }

  .file-path {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 0.8125rem;
    color: var(--on-surface-variant);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  .editor-content {
    flex: 1;
    position: relative;
    background: var(--surface-container);
    min-height: 0; /* Allow flex child to shrink */
  }

  .preview-panel {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    background: var(--surface);
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1.5rem;
    border-bottom: 1px solid var(--outline-variant);
    background: var(--surface-container);
    min-height: 56px;
    box-sizing: border-box;
  }

  .preview-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 500;
    color: var(--on-surface);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .preview-title::before {
    content: 'preview';
    font-family: 'Material Icons';
    font-size: 18px;
    color: var(--primary);
  }

  .preview-content {
    flex: 1;
    overflow: auto;
    background: var(--background);
    min-height: 0;
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .editor-layout {
      flex-direction: column;
    }
    
    .editor-panel {
      flex: none;
      height: 50vh;
      border-right: none;
      border-bottom: 1px solid var(--outline-variant);
    }
    
    .preview-panel {
      flex: none;
      height: 50vh;
    }
  }

  @media (max-width: 768px) {
    .landing-content {
      padding: 2rem 1rem;
    }
    
    .hero-title {
      font-size: 2.5rem;
    }
    
    .hero-subtitle {
      font-size: 1.125rem;
    }
    
    .dashboard-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    
    
    .editor-header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }
  }

  @media (max-width: 480px) {
    .card-header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }
    
    .card-actions {
      width: 100%;
    }
    
    .card-actions .button {
      flex: 1;
    }
  }
</style>
