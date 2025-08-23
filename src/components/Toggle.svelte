<script>
  import { createEventDispatcher } from 'svelte';
  
  export let name = '';
  export let label = '';
  export let value = true;
  
  const dispatch = createEventDispatcher();
  
  // Convert string values to boolean
  $: booleanValue = typeof value === 'string' ? value === 'true' : Boolean(value);
  
  function handleChange(event) {
    value = event.target.checked;
    console.log(`🔄 Toggle "${name}" changed to:`, value);
    dispatch('change', value);
    console.log(`📤 Toggle "${name}" dispatched change event with:`, value);
  }
</script>

<nav class="toggle-nav">
  <div class="max">
    <span>{label}</span>
  </div>
  <label class="switch">
    <input 
      type="checkbox" 
      {name}
      checked={booleanValue}
      on:change={handleChange}
    />
    <span></span>
  </label>
</nav>

<style>
  .toggle-nav {
    padding: 0.5rem 1rem;
    margin: 0.25rem 0;
    border-radius: 6px;
    background: var(--surface-container);
    border: 1px solid var(--outline-variant);
    align-items: center;
    min-height: 48px;
    box-sizing: border-box;
  }

  .toggle-nav:hover {
    background: var(--surface-container-high);
    border-color: var(--primary);
  }

  .toggle-nav .max {
    display: flex;
    align-items: center;
  }

  .toggle-nav span {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--on-surface);
  }
</style>

