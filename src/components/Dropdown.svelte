<script>
  export let name = '';
  export let label = '';
  export let options = '';
  export let value = '';
  
  // Parse options string into array
  $: optionArray = typeof options === 'string' ? options.split(',').map(opt => opt.trim()) : options;
  
  function handleChange(event) {
    value = event.target.value;
  }
</script>

<div class="dropdown-container">
  <label class="dropdown-label">
    <span class="label-text">{label}</span>
    <select 
      {name}
      {value}
      on:change={handleChange}
      class="dropdown-select"
    >
      {#each optionArray as option}
        <option value={option}>{option}</option>
      {/each}
    </select>
  </label>
</div>

<style>
  .dropdown-container {
    margin: 0.5rem;
    padding: 0.5rem;
    background: #2d2d30;
    border-radius: 4px;
  }
  
  .dropdown-label {
    display: flex;
    flex-direction: column;
    color: #d4d4d4;
    font-size: 0.9rem;
  }
  
  .label-text {
    margin-bottom: 0.25rem;
    font-weight: 500;
  }
  
  .dropdown-select {
    background: #404040;
    color: #d4d4d4;
    border: 1px solid #666;
    border-radius: 4px;
    padding: 0.5rem;
    font-size: 0.9rem;
    outline: none;
  }
  
  .dropdown-select:focus {
    border-color: #569cd6;
    box-shadow: 0 0 0 2px rgba(86, 156, 214, 0.3);
  }
  
  .dropdown-select option {
    background: #2d2d30;
    color: #d4d4d4;
  }
</style>
