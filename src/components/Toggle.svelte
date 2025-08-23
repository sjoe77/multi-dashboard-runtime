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

<div class="toggle-container">
  <label class="toggle-label">
    <input 
      type="checkbox" 
      {name}
      checked={booleanValue}
      on:change={handleChange}
      class="toggle-input"
    />
    <span class="toggle-slider"></span>
    <span class="label-text">{label}</span>
  </label>
</div>

<style>
  .toggle-container {
    margin: 0;
    padding: 0.5rem 1rem;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    transition: all 0.2s ease;
    display: inline-block;
  }

  .toggle-container:hover {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .toggle-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #374151;
    font-size: 0.9rem;
    font-weight: 500;
    gap: 0.75rem;
  }
  
  .toggle-input {
    display: none;
  }
  
  .toggle-slider {
    position: relative;
    width: 44px;
    height: 24px;
    background: #e5e7eb;
    border-radius: 24px;
    transition: background 0.3s ease;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
  }
  
  .toggle-slider::before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: 2px;
    transition: transform 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }
  
  .toggle-input:checked + .toggle-slider {
    background: #3b82f6;
  }
  
  .toggle-input:checked + .toggle-slider::before {
    transform: translateX(20px);
  }
  
  .label-text {
    font-weight: 500;
    color: #374151;
  }
</style>
