<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import LivePreview from '../../../components/LivePreview.svelte';
  
  let dashboardName = '';
  let code = '';
  let loading = true;
  
  // Get dashboard name from URL params
  $: dashboardName = $page.params.slug;
  
  // Load dashboard content
  async function loadDashboard() {
    if (!dashboardName) return;
    
    try {
      loading = true;
      // Default to Overview page for consumer view
      const response = await fetch(`/dashboards/${dashboardName}/Overview.svelte?t=${Date.now()}`);
      if (response.ok) {
        const content = await response.text();
        if (content.includes('<!doctype') || content.includes('<html')) {
          code = '<div>Error: Dashboard not found</div>';
        } else {
          code = content;
        }
      } else {
        code = '<div>Dashboard not found</div>';
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      code = '<div>Error loading dashboard</div>';
    } finally {
      loading = false;
    }
  }
  
  onMount(() => {
    loadDashboard();
  });
  
  $: if (dashboardName) {
    loadDashboard();
  }
</script>

<div class="consumer-view">
  <header class="header">
    <div class="nav-section">
      <a href="/dashboards" class="back-btn">← All Dashboards</a>
      <h1>{dashboardName} Dashboard</h1>
    </div>
    <div class="actions">
      <a href="/dashboards/{dashboardName}/edit" class="edit-btn">🔧 Edit Dashboard</a>
    </div>
  </header>
  
  <main class="content">
    {#if loading}
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    {:else}
      <div class="dashboard-container">
        <LivePreview {code} />
      </div>
    {/if}
  </main>
</div>

<style>
    .consumer-view {
    min-height: 100vh;
    background: #ffffff;
    overflow-x: auto;
  }

  .header {
    background: white;
    border-bottom: 1px solid #e2e8f0;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    z-index: 10;
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
    text-decoration: none;
    font-weight: 500;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .back-btn:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }

  .header h1 {
    margin: 0;
    color: #2d3748;
    font-size: 1.8rem;
    text-transform: capitalize;
  }

  .edit-btn {
    background: #3b82f6;
    color: white;
    text-decoration: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .edit-btn:hover {
    background: #2563eb;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }

  .content {
    flex: 1;
    overflow-y: auto;
    padding: 0;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    color: #718096;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e2e8f0;
    border-top: 4px solid #3182ce;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .dashboard-container {
    min-height: calc(100vh - 80px);
    padding: 1rem;
    margin: 0;
    width: 100%;
    box-sizing: border-box;
  }
</style>
