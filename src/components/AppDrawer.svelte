<script>
  import { createEventDispatcher } from 'svelte';
  
  export let isOpen = false;
  export let dashboards = {};
  export let currentDashboard = '';
  export let currentPage = '';
  
  const dispatch = createEventDispatcher();
  
    function closeDrawer() {
    console.log('closeDrawer called');
    // Use only Svelte state management
    dispatch('close');
  }

  // Handle ESC key to close drawer
  function handleKeydown(event) {
    if (event.key === 'Escape' && isOpen) {
      closeDrawer();
    }
  }
  
  function navigate(url) {
    console.log('navigate called with:', url);
    dispatch('navigate', url);
    // Don't close drawer automatically - let it stay open for navigation
  }
  
  function selectDashboard(dashboard, page) {
    console.log('selectDashboard called with:', dashboard, page);
    dispatch('select', { dashboard, page });
    navigate(`/dashboards/${dashboard}/edit`);
    // Don't auto-close drawer - let user keep it open for more navigation
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- No overlay needed for push-content layout -->

<!-- Clean Docs-Style Navigation -->
<nav class="left drawer scroll" class:active={isOpen} id="drawer">
  <header class="docs-header">
    <button class="circle transparent" on:click={closeDrawer}>
      <i>close</i>
    </button>
    <h6>Dashboards</h6>
  </header>
  
  <div class="docs-nav">
    <a href="/dashboards" class="docs-item home-item" on:click|preventDefault={() => navigate('/dashboards')}>
      <i>home</i>
      <span>Home</span>
    </a>
    
    {#each Object.entries(dashboards) as [name, pages]}
      <div class="docs-section">
        <div class="docs-section-title">{name}</div>
        {#each pages as page}
          <a
            href={`/dashboards/${name}/edit`}
            class="docs-item docs-page"
            class:active={name === currentDashboard && page === currentPage}
            on:click|preventDefault={() => selectDashboard(name, page)}
          >
            <i>description</i>
            <span>{page}</span>
          </a>
        {/each}
      </div>
    {/each}
  </div>
</nav><style>
  /* Minimal positioning only */
  .drawer {
    position: fixed;
    top: 0;
    left: -280px;
    width: 280px;
    height: 100vh;
    z-index: 100;
    transition: left 0.3s ease;
    background: var(--surface-container);
    border-right: 1px solid var(--outline-variant);
  }
  
  .drawer.active {
    left: 0;
  }
  
  /* Docs-style navigation */
  .docs-header {
    padding: 1rem;
    border-bottom: 1px solid var(--outline-variant);
  }
  
  .docs-nav {
    padding: 0;
    width: 100%;
  }
  
  .docs-section {
    margin-bottom: 0.25rem;
    width: 100%;
  }
  
  .docs-section-title {
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--on-surface-variant);
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 0.75rem 1rem 0.375rem 1rem;
    margin-bottom: 0.125rem;
    width: 100%;
    box-sizing: border-box;
    border-top: 1px solid var(--outline-variant);
    margin-top: 0.25rem;
  }
  
  .docs-section:first-child .docs-section-title {
    border-top: none;
    margin-top: 0;
  }
  
  .docs-item {
    display: flex;
    align-items: center;
    padding: 0.5rem 0;
    color: var(--on-surface);
    text-decoration: none;
    transition: all 0.2s ease;
    border-radius: 0;
    width: 100%;
    box-sizing: border-box;
    margin: 0;
    min-height: 44px;
  }
  
  .docs-item:hover {
    background: var(--surface-container-high);
    color: var(--primary);
  }
  
  .docs-item.active {
    background: var(--primary-container);
    color: var(--on-primary-container);
    position: relative;
    width: 100%;
    margin: 0;
    padding-right: 0;
    font-weight: 500;
  }
  
  .docs-item.active::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--primary);
  }
  
  .docs-item i {
    margin-right: 0.5rem;
    margin-left: 1rem;
    font-size: 1rem;
    opacity: 0.8;
    flex-shrink: 0;
    width: 1rem;
    text-align: left;
  }
  
  .docs-item span {
    font-size: 0.875rem;
    font-weight: inherit;
    margin-right: 1rem;
    flex: 1;
  }
  
  .docs-page {
    padding-left: 0;
  }
  
  .docs-page i {
    margin-left: 2rem;
  }
  
  .home-item {
    border-bottom: 1px solid var(--outline-variant);
    margin-bottom: 0.25rem;
  }
</style>