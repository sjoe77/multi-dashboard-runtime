<script>
  import { createEventDispatcher } from 'svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  
  export let currentDashboard = '';
  export let currentPage = '';
  export let currentView = 'landing';
  
  const dispatch = createEventDispatcher();
  
  function openDrawer() {
    dispatch('open-drawer');
  }
  
  function navigateHome() {
    dispatch('navigate', '/dashboards');
  }
  
  function logout() {
    // For now just redirect to home, in real app this would clear auth
    dispatch('navigate', '/dashboards');
  }
</script>

<header class="surface-container">
  <nav class="responsive">
    <div class="left-section">
      <!-- Hamburger menu -->
      <button class="transparent circle" on:click={openDrawer}>
        <i class="material-icons">menu</i>
      </button>
      
      <!-- Logo/Brand -->
      <button class="transparent" on:click={navigateHome}>
        <i class="material-icons">dashboard</i>
        <span class="large-text">Dashboard Runtime</span>
      </button>
    </div>
    
    <div class="center-section">
      <!-- Current context info -->
      {#if currentView === 'edit' && currentDashboard}
        <div class="breadcrumb">
          <i class="material-icons small">folder</i>
          <span class="small-text">{currentDashboard}</span>
          {#if currentPage}
            <i class="material-icons small">chevron_right</i>
            <span class="small-text">{currentPage}.svelte</span>
          {/if}
        </div>
      {:else if currentView === 'consumer' && currentDashboard}
        <div class="breadcrumb">
          <i class="material-icons small">visibility</i>
          <span class="medium-text">{currentDashboard} Dashboard</span>
        </div>
      {/if}
    </div>
    
    <div class="right-section">
      <!-- Theme toggle -->
      <ThemeToggle />
      
      <!-- Action buttons for different views -->
      {#if currentView === 'consumer' && currentDashboard}
        <button class="button" on:click={() => dispatch('navigate', `/dashboards/${currentDashboard}/edit`)}>
          <i class="material-icons">edit</i>
          <span>Edit</span>
        </button>
      {/if}
      
      <!-- User avatar and menu -->
      <div class="dropdown">
        <button class="button transparent circle" aria-label="User menu">
          <i class="material-icons">account_circle</i>
        </button>
        <div class="menu">
          <div class="menu-header">
            <div class="user-info">
              <i class="material-icons">account_circle</i>
              <div>
                <div class="user-name">User</div>
                <div class="user-email">user@example.com</div>
              </div>
            </div>
          </div>
          <div class="divider"></div>
          <button class="menu-item row" on:click={() => console.log('Profile')}>
            <i class="material-icons">person</i>
            <span>Profile</span>
          </button>
          <button class="menu-item row" on:click={() => console.log('Settings')}>
            <i class="material-icons">settings</i>
            <span>Settings</span>
          </button>
          <div class="divider"></div>
          <button class="menu-item row" on:click={logout}>
            <i class="material-icons">logout</i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  </nav>
</header>

<style>
  header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    border-bottom: 1px solid var(--outline-variant);
    backdrop-filter: blur(16px);
    background: rgba(var(--surface-container-rgb, 255, 255, 255), 0.95);
    height: 64px;
    box-sizing: border-box;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  }

  
  nav {
    height: 100%;
    padding: 0 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    max-width: none;
  }
  
  .left-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
  }
  
  .center-section {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 0;
  }
  
  .right-section {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
    min-width: 0;
  }
  
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--on-surface-variant);
    font-weight: 500;
    background: var(--surface-container-high);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.875rem;
    white-space: nowrap;
    overflow: hidden;
  }
  
  .breadcrumb .small-text {
    font-size: 0.8125rem;
    opacity: 0.9;
  }
  
  .breadcrumb .medium-text {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--on-surface);
  }
  
  .large-text {
    font-size: 1.125rem;
    font-weight: 500;
    margin-left: 0.75rem;
    color: var(--on-surface);
    white-space: nowrap;
  }


  /* Dropdown menu styling */
  .dropdown {
    position: relative;
  }

  .dropdown .menu {
    position: fixed;
    right: 1rem;
    top: 60px;
    min-width: 240px;
    max-width: 280px;
    background: var(--surface-container-high);
    border: 1px solid var(--outline-variant);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.16), 0 4px 16px rgba(0,0,0,0.12);
    z-index: 1001;
    padding: 0.5rem;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-8px) scale(0.95);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(16px);
  }

  .dropdown:hover .menu,
  .dropdown:focus-within .menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
  }

  .menu-header {
    padding: 0.75rem;
    border-bottom: 1px solid var(--outline-variant);
    margin-bottom: 0.25rem;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .user-info i {
    font-size: 24px;
    color: var(--on-surface-variant);
  }

  .user-name {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--on-surface);
    margin-bottom: 0.125rem;
  }

  .user-email {
    font-size: 0.75rem;
    color: var(--on-surface-variant);
  }

  .menu-item {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: none;
    background: transparent;
    text-align: left;
    border-radius: 6px;
    transition: background-color 0.2s ease;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.125rem;
    font-family: inherit;
    font-size: 0.8125rem;
    color: var(--on-surface);
  }

  .menu-item:hover {
    background: var(--surface-container-highest);
  }

  .menu-item i {
    font-size: 18px;
    color: var(--on-surface-variant);
  }

  .divider {
    height: 1px;
    background: var(--outline-variant);
    margin: 0.25rem 0;
  }
  
  /* Responsive behavior */
  @media (max-width: 960px) {
    .large-text {
      display: none;
    }
    
    nav {
      padding: 0 1rem;
    }
  }

  @media (max-width: 640px) {
    .breadcrumb {
      display: none;
    }

    .center-section {
      display: none;
    }

    nav {
      padding: 0 0.75rem;
      gap: 0.5rem;
    }
  }
</style>