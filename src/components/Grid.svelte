<script>
  export let columns = 2;
  export let rows = 1;
</script>

<div class="dashboard-grid" style="grid-template-columns: repeat({columns}, 1fr);">
  <slot />
</div>

<style>
  .dashboard-grid {
    display: grid;
    gap: 1.5rem;
    width: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .dashboard-grid :global(> *) {
    width: 100%;
    box-sizing: border-box;
  }

  @media (max-width: 1024px) {
    .dashboard-grid {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 768px) {
    .dashboard-grid {
      gap: 1rem;
      margin: 1rem 0;
    }
    
    .dashboard-grid :global(> *) {
      padding: 1rem;
    }
  }
</style>
