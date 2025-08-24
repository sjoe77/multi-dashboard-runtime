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

<!-- Beer CSS Switch with proper semantic structure -->
<div class="field border">
  <nav class="max">
    <span class="helper">{label}</span>
  </nav>
  <label class="switch">
    <input 
      type="checkbox" 
      {name}
      checked={booleanValue}
      on:change={handleChange}
    />
    <span></span>
  </label>
</div>

