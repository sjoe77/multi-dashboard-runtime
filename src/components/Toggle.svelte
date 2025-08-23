<script>
  export let name = '';
  export let label = '';
  export let value = true;
  
  // Convert string values to boolean
  $: booleanValue = typeof value === 'string' ? value === 'true' : Boolean(value);
  
  function handleChange(event) {
    value = event.target.checked;
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
    margin: 0.5rem;
    padding: 0.5rem;
    background: #2d2d30;
    border-radius: 4px;
  }
  
  .toggle-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #d4d4d4;
    font-size: 0.9rem;
  }
  
  .toggle-input {
    display: none;
  }
  
  .toggle-slider {
    position: relative;
    width: 40px;
    height: 20px;
    background: #404040;
    border-radius: 20px;
    margin-right: 0.5rem;
    transition: background 0.3s;
  }
  
  .toggle-slider::before {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #888;
    top: 2px;
    left: 2px;
    transition: transform 0.3s, background 0.3s;
  }
  
  .toggle-input:checked + .toggle-slider {
    background: #569cd6;
  }
  
  .toggle-input:checked + .toggle-slider::before {
    transform: translateX(20px);
    background: white;
  }
  
  .label-text {
    font-weight: 500;
  }
</style>
