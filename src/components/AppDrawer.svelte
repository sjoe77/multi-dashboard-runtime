<script>
  import { createEventDispatcher } from 'svelte';
  
  export let isOpen = false;
  export let dashboards = {};
  export let currentDashboard = '';
  export let currentPage = '';
  
  const dispatch = createEventDispatcher();
  
  function closeDrawer() {
    dispatch('close');
  }
  
  function selectDashboard(dashboard, page) {
    dispatch('select', { dashboard, page });
    closeDrawer();
  }
  
  function navigateHome() {
    dispatch('navigate', '/dashboards');
    closeDrawer();
  }
</script>

<!-- Overlay -->
{#if isOpen}
  <div class="overlay" on:click={closeDrawer} on:keydown={(e) => e.key === 'Escape' && closeDrawer()} role="button" tabindex="-1"></div>
{/if}

<!-- Drawer -->
<!-- Beer CSS Left Navigation Drawer -->
<nav class="left max" class:active={isOpen}>
  <!-- Header with close button -->
  <div class="drawer-header">
    <a 
      on:click={navigateHome} 
      on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && navigateHome()}
      role="button" 
      tabindex="0"
      href="javascript:void(0)"
    >
      <i>dashboard</i>
      <div>Dashboards</div>
    </a>
    <button class="transparent circle small" on:click={closeDrawer}>
      <i>close</i>
    </button>
  </div>
  
  <!-- Navigation items -->
  <a 
    on:click={navigateHome} 
    on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && navigateHome()}
    role="button" 
    tabindex="0"
    href="javascript:void(0)"
  >
    <i>home</i>
    <div>All Dashboards</div>
  </a>
  
  <!-- Dashboard list -->
  {#each Object.entries(dashboards) as [dashboardName, pages]}
    <div class="dashboard-section">
      <div class="dashboard-header">
        <i>folder_open</i>
        <div>{dashboardName}</div>
      </div>
      
      <!-- Dashboard pages -->
      {#each pages as page}
        <a 
          on:click={() => selectDashboard(dashboardName, page)} 
          on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && selectDashboard(dashboardName, page)}
          role="button"
          tabindex="0"
          href="javascript:void(0)"
          class:active={dashboardName === currentDashboard && page === currentPage}
          class="page-link"
        >
          <i>description</i>
          <div>{page}</div>
          {#if dashboardName === currentDashboard && page === currentPage}
            <i class="right">check</i>
          {/if}
        </a>
      {/each}
    </div>
  {/each}
</nav>

<style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 200;
    backdrop-filter: blur(2px);
  }
  
  /* Beer CSS nav.left customizations */
  nav.left {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 300;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
    width: 320px;
    box-shadow: 0 8px 10px -5px rgba(0,0,0,0.2), 0 16px 24px 2px rgba(0,0,0,0.14), 0 6px 30px 5px rgba(0,0,0,0.12);
  }
  
  nav.left.active {
    transform: translateX(0);
  }
  
  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid var(--outline-variant);
  }
  
  .dashboard-section {
    margin: 0.5rem 0;
  }
  
  .dashboard-header {
    padding: 0.5rem 1rem;
    color: var(--on-surface-variant);
    font-weight: 500;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .page-link {
    margin-left: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    transition: background-color 0.2s ease;
  }
  
  .page-link:hover {
    background: var(--surface-container-high);
  }
  
  .page-link.active {
    background: var(--primary-container);
    color: var(--on-primary-container);
  }
  
  .right {
    margin-left: auto;
  }
  
  /* Ensure proper Beer CSS nav item spacing */
  nav.left a {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    transition: background-color 0.2s ease;
    text-decoration: none;
    color: var(--on-surface);
  }
  
  nav.left a:hover {
    background: var(--surface-container-high);
  }
  
  nav.left a i {
    font-size: 20px;
    color: var(--on-surface-variant);
    flex-shrink: 0;
  }
</style>