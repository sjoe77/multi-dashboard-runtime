
<script>
  import { onMount } from 'svelte';
  import SimpleEditor from './components/SimpleEditor.svelte';
  import LivePreview from './components/LivePreview.svelte';
  import { saveDashboard, loadDashboard, listDashboards } from './lib/dashboardAPI.js';
  
  let code = '';

  let currentDashboard = 'sales';
  let currentPage = 'Overview';
  let saveMessage = '';
  let dashboards = {};
  let drawerOpen = false;
  
  // Load dashboard content from file system
  async function loadCurrentDashboard() {
    try {
      // Fetch directly from public/dashboards served by Vite
      const response = await fetch(`/dashboards/${currentDashboard}/${currentPage}.svelte?t=${Date.now()}`);
      if (response.ok) {
        const content = await response.text();
        // Check if we got HTML instead of Svelte (common dev server issue)
        if (content.includes('<!doctype') || content.includes('<html')) {
          code = '<div>Error: Got HTML instead of Svelte file. Check file path.</div>';
        } else {
          code = content;
        }
      } else {
        code = '<div>Dashboard file not found</div>';
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      code = '<div>Error loading dashboard</div>';
    }
  }

  // Load on startup and whenever dashboard/page changes
  onMount(() => {
    loadCurrentDashboard();
  });
  
  // Reload when dashboard or page changes
  $: if (currentDashboard && currentPage) {
    loadCurrentDashboard();
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
    }
  }
</script>

<div class="app">
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
      <SimpleEditor bind:value={code} />
    </div>
    <div class="preview">
      <LivePreview {code} />
    </div>
  </div>
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

  .menu-btn {
    position: fixed;
    top: 15px;
    left: 15px;
    z-index: 1001;
    background: rgba(45, 55, 72, 0.9);
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 18px;
    backdrop-filter: blur(10px);
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
    padding: 15px;
    background: #2d3748;
    color: white;
    border-bottom: 1px solid #4a5568;
  }

  .current-file {
    font-family: monospace;
    color: #e2e8f0;
  }

  .save-btn {
    background: #3182ce;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
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
