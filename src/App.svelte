<script>
  import { onMount } from 'svelte';
  import SimpleEditor from './components/SimpleEditor.svelte';
  import Monaco from './components/Monaco.svelte';
  import LivePreview from './components/LivePreview.svelte';
  import { saveDashboard, loadDashboard, listDashboards } from './lib/dashboardAPI.js';
  
  let code = '';
  let currentDashboard = null;  // Don't hardcode - let parseURL() set it
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
      // Redirect to /dashboards
      window.history.pushState({}, '', '/dashboards');
      currentView = 'landing';
      return;
    }
    
    if (parts.length === 1) {
      // /dashboards - landing page
      currentView = 'landing';
    } else if (parts.length === 2) {
      // /dashboards/sales - consumer view
      currentView = 'consumer';
      currentDashboard = parts[1];
      isEditMode = false;
    } else if (parts.length === 3 && parts[2] === 'edit') {
      // /dashboards/sales/edit - edit mode
      currentView = 'edit';
      currentDashboard = parts[1];
      isEditMode = true;
    } else {
      // Default to landing
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
      // Fetch directly from public/dashboards served by Vite
      const url = `/dashboards/${currentDashboard}/${currentPage}.svelte?t=${Date.now()}`;
      console.log(`Fetching from: ${url}`);
      
      const response = await fetch(url);
      console.log(`Response status: ${response.status}`);
      
      if (response.ok) {
        const content = await response.text();
        console.log(`Content length: ${content.length}`);
        console.log(`Content preview: ${content.substring(0, 100)}...`);
        
        // Check if we got HTML instead of Svelte (common dev server issue)
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

  // Load on startup and whenever dashboard/page changes
  onMount(() => {
    parseURL();
    // Don't call loadCurrentDashboard here - let the reactive statement handle it
    
    window.addEventListener('popstate', () => {
      parseURL();
      // Let the reactive statement handle loading - don't duplicate here
    });
  });
  
  // Track last loaded state to prevent duplicate calls
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
  
  function toggleDrawer() {
    drawerOpen = !drawerOpen;
  }
  
  function closeDrawer() {
    drawerOpen = false;
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
    
    // Clear message after 3 seconds
    setTimeout(() => saveMessage = '', 3000);
  }
  
  async function handleLoad(dashboard, page) {
    const result = await loadDashboard(dashboard, page);
    if (result.success) {
      code = result.source;
      currentDashboard = dashboard;
      currentPage = page;
      saveMessage = `📁 Loaded ${dashboard}/${page}`;
      setTimeout(() => saveMessage = '', 2000);
      closeDrawer(); // Close drawer after selection
      
      // Update URL to edit mode when loading from menu
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

<div class="app">
  <!-- Landing Page View -->
  {#if currentView === 'landing'}
    <div class="landing">
      <header class="landing-header">
        <h1>📊 Dashboard Runtime</h1>
        <p>Select a dashboard to view or edit</p>
      </header>
      
      <div class="dashboard-grid">
        {#each Object.entries(dashboards) as [dashboardName, pages]}
          <div class="dashboard-tile">
            <div class="tile-header">
              <h3>{dashboardName}</h3>
              <div class="tile-actions">
                <button class="view-btn" on:click={() => viewDashboard(dashboardName)}>👁️ View</button>
                <button class="edit-btn" on:click={() => editDashboard(dashboardName)}>🔧 Edit</button>
              </div>
            </div>
            <div class="tile-content">
              <p>{pages.length} page{pages.length === 1 ? '' : 's'}</p>
              <div class="page-list">
                {#each pages as page}
                  <span class="page-tag">{page}</span>
                {/each}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  
  <!-- Consumer View -->
  {:else if currentView === 'consumer'}
    <div class="consumer-view">
      <header class="consumer-header">
        <div class="nav-section">
          <button class="back-btn" on:click={() => navigateTo('/dashboards')}>← All Dashboards</button>
          <h1>{currentDashboard} Dashboard</h1>
        </div>
        <div class="actions">
          <button class="edit-btn" on:click={() => editDashboard(currentDashboard)}>🔧 Edit Dashboard</button>
        </div>
      </header>
      
      <main class="consumer-content">
        <div class="dashboard-container">
          <LivePreview {code} />
        </div>
      </main>
    </div>
  
  <!-- Edit Mode View -->
  {:else if currentView === 'edit'}
    <!-- Navigation header for edit mode -->
    <div class="edit-nav-header">
      <button class="back-btn" on:click={() => navigateTo('/dashboards')}>← All Dashboards</button>
      <span class="separator">|</span>
      <button class="view-btn" on:click={() => viewDashboard(currentDashboard)}>👁️ View Dashboard</button>
    </div>

    <!-- Floating menu button -->
    <button class="menu-btn" on:click={toggleDrawer}>☰</button>
    
    <!-- Only show drawer and overlay when open -->
    {#if drawerOpen}
      <!-- Overlay -->
      <div class="overlay" on:click={closeDrawer} on:keydown={(e) => e.key === 'Escape' && closeDrawer()} role="button" tabindex="-1"></div>
      
      <!-- Drawer -->
      <div class="drawer">
        <div class="drawer-header">
          <h3>Dashboards</h3>
          <button class="close-btn" on:click={closeDrawer}>×</button>
        </div>
        <div class="drawer-content">
          {#each Object.entries(dashboards) as [dashboard, pages]}
            <div class="dashboard-group">
              <div class="dashboard-name">{dashboard}</div>
              {#each pages as page}
                <button 
                  class="page-link" 
                  class:active={dashboard === currentDashboard && page === currentPage}
                  on:click={() => handleLoad(dashboard, page)}
                >
                  {page}
                </button>
              {/each}
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Header -->
    <div class="header">
      <span class="current-file">{currentDashboard}/{currentPage}.svelte</span>
      <button class="save-btn" on:click={handleSave}>Save</button>
    </div>
    
    <!-- Save message -->
    {#if saveMessage}
      <div class="save-message">{saveMessage}</div>
    {/if}
    
    <!-- Content area -->
    <div class="content">
      <div class="editor">
        <Monaco bind:value={code} language="svelte" />
      </div>
      <div class="preview">
        <LivePreview {code} />
      </div>
    </div>
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
  
  .app {
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    font-family: system-ui, sans-serif;
  }

  /* Landing Page Styles */
  .landing {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem;
  }

  .landing-header {
    text-align: center;
    color: white;
    margin-bottom: 3rem;
  }

  .landing-header h1 {
    font-size: 3rem;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  }

  .landing-header p {
    font-size: 1.2rem;
    margin: 1rem 0 0 0;
    opacity: 0.9;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .dashboard-tile {
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .dashboard-tile:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 48px rgba(0,0,0,0.15);
  }

  .tile-header {
    padding: 1.5rem;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .tile-header h3 {
    margin: 0 0 1rem 0;
    color: #2d3748;
    font-size: 1.5rem;
    text-transform: capitalize;
  }

  .tile-actions {
    display: flex;
    gap: 0.5rem;
  }

  .view-btn, .edit-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    border: none;
    font-weight: 500;
    transition: all 0.2s ease;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .view-btn {
    background: #10b981;
    color: white;
  }

  .view-btn:hover {
    background: #059669;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }

  .edit-btn {
    background: #3b82f6;
    color: white;
  }

  .edit-btn:hover {
    background: #2563eb;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }

  .tile-content {
    padding: 1.5rem;
  }

  .tile-content p {
    margin: 0 0 1rem 0;
    color: #718096;
    font-size: 0.9rem;
  }

  .page-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .page-tag {
    background: #edf2f7;
    color: #4a5568;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  /* Consumer View Styles */
  .consumer-view {
    min-height: 100vh;
    background: #f7fafc;
  }

  .consumer-header {
    background: white;
    border-bottom: 1px solid #e2e8f0;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .nav-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .back-btn {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #3b82f6;
    font-weight: 500;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    transition: all 0.2s ease;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .back-btn:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }

  .consumer-header h1 {
    margin: 0;
    color: #2d3748;
    font-size: 1.8rem;
    text-transform: capitalize;
  }

  .consumer-content {
    padding: 0;
  }

  .dashboard-container {
    background: white;
    width: 100%;
    padding: 2rem;
  }

  /* Edit Mode Styles */
  .edit-nav-header {
    background: #1a202c;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border-bottom: 1px solid #4a5568;
  }

  .separator {
    color: #718096;
  }

  .menu-btn {
    position: fixed;
    top: 75px;
    left: 15px;
    z-index: 1001;
    background: #3b82f6;
    color: white;
    border: none;
    padding: 12px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 18px;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .menu-btn:hover {
    background: #2563eb;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }  .menu-btn:hover {
    background: #2563eb;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.5);
    z-index: 999;
  }

  .drawer {
    position: fixed;
    top: 0;
    left: 0;
    width: 250px;
    height: 100vh;
    background: #2d3748;
    color: white;
    z-index: 1000;
    overflow-y: auto;
  }

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #4a5568;
  }

  .drawer-header h3 {
    margin: 0;
    color: white;
  }

  .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
  }

  .drawer-content {
    padding: 15px;
  }

  .dashboard-group {
    margin-bottom: 20px;
  }

  .dashboard-name {
    font-weight: bold;
    margin-bottom: 10px;
    color: #cbd5e0;
    font-size: 14px;
  }

  .page-link {
    display: block;
    width: 100%;
    background: none;
    border: none;
    color: white;
    padding: 8px 12px;
    text-align: left;
    cursor: pointer;
    margin-bottom: 5px;
    border-radius: 4px;
  }

  .page-link:hover {
    background: #4a5568;
  }

  .page-link.active {
    background: #3182ce;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: #2d3748;
    color: white;
    border-bottom: 1px solid #4a5568;
    gap: 1rem;
  }

  .current-file {
    font-family: monospace;
    color: #e2e8f0;
  }

  .save-btn {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .save-btn:hover {
    background: #2563eb;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }

  .save-message {
    padding: 10px 15px;
    background: #1a202c;
    color: #e2e8f0;
    border-bottom: 1px solid #4a5568;
  }

  .content {
    display: flex;
    flex: 1;
  }

  .editor {
    flex: 1;
    background: #1a202c;
    border-right: 1px solid #4a5568;
  }

  .preview {
    flex: 1;
    background: #f7fafc;
    padding: 15px;
    overflow: auto;
  }
</style>
