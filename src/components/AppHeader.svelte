<script>
  import { createEventDispatcher } from 'svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  
  export let currentDashboard = '';
  export let currentPage = '';
  export let currentView = 'landing';
  export let drawerOpen = false;
  
  const dispatch = createEventDispatcher();
  
    function openDrawer() {
    console.log('openDrawer called');
    // Use only Svelte state management
    dispatch('open-drawer');
  }
  
  function navigateHome() {
    dispatch('navigate', '/dashboards');
  }
  
  function logout() {
    // For now just redirect to home, in real app this would clear auth
    dispatch('navigate', '/dashboards');
  }
  
  function toggleViewMode() {
    if (currentView === 'edit') {
      dispatch('view-mode', 'consumer');
    } else if (currentView === 'consumer') {
      dispatch('view-mode', 'edit');
    }
  }

</script>

<!-- Beer CSS App Header with proper semantic structure -->
<header class="fixed top" class:drawer-open={drawerOpen}>
  <nav>
    <!-- Hamburger Menu (only show when drawer is closed) -->
    {#if !drawerOpen}
      <button class="transparent circle" on:click={openDrawer} aria-label="Open navigation">
        <i>menu</i>
      </button>
    {/if}
    
    <!-- Breadcrumb/Title Section -->
    <div class="max" on:click={navigateHome} on:keydown={(e) => e.key === 'Enter' && navigateHome()} role="button" tabindex="0">
      <span class="hide-on-small">Dashboard Runtime</span>
      {#if currentDashboard}
        <span class="responsive-text"> / {currentDashboard}</span>
      {/if}
      {#if currentPage && currentView === 'edit'}
        <span class="responsive-text"> / {currentPage}</span>
      {/if}
    </div>
    
    <!-- View/Edit Mode Toggle -->
    {#if currentDashboard && currentPage && (currentView === 'edit' || currentView === 'consumer')}
      <button class="chip fill" on:click={toggleViewMode}>
        {#if currentView === 'edit'}
          <i>visibility</i>
          <span>Switch to View</span>
        {:else}
          <i>edit</i>
          <span>Switch to Edit</span>
        {/if}
      </button>
    {/if}
    
    <!-- Theme Toggle -->
    <ThemeToggle />
    
    <!-- Avatar with Beer CSS nested menu (semantic only) -->
    <button class="transparent circle user" aria-label="User menu">
      <i>account_circle</i>
      <menu class="down left">
        <a href="/settings" on:click|preventDefault>
          <i>settings</i>
          <div>Settings</div>
        </a>
        <a href="/dashboards" on:click|preventDefault={logout}>
          <i>logout</i>
          <div>Logout</div>
        </a>
      </menu>
    </button>
  </nav>
</header>

<style>
  /* Header positioning with drawer awareness */
  header.fixed.top {
    transition: margin-left 0.3s ease;
    margin-left: 0;
  }
  
  header.fixed.top.drawer-open {
    margin-left: 280px;
  }

  /* Responsive text hiding */
  @media (max-width: 960px) {
    .responsive-text {
      display: none;
    }
  }

  @media (max-width: 640px) {
    .chip {
      display: none;
    }
  }

  .hide-on-small { display: inline; }
  @media (max-width: 640px) { .hide-on-small { display: none; } }
  /* Allow dropdown to overflow out of the header/nav area */
  :global(header.top nav) {
    overflow: visible;
    padding-right: 56px; /* deeper inset from viewport edge */
  }
  :global(header.top button.user) { margin-right: 16px; }
  /* Professional sizing and vertical stacking for nested avatar menu */
  :global(header.top button > menu) {
    min-width: 260px;
    display: block;         /* stack child anchors vertically */
  }
  :global(header.top button > menu a) {
    display: flex;           /* makes each item block-level and aligned */
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;     /* keep icon + label on one line per item */
  }
  :global(header.top button > menu a i) { font-size: 18px; }
  /* No other overrides — rely on Beer CSS helpers and defaults */
</style>