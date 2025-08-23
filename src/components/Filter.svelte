<script>
  export let type = 'dropdown';
  export let label = '';
  export let options = [];
  export let value = '';
  
  // Parse options - support both string and object array formats
  $: parsedOptions = (() => {
    if (Array.isArray(options)) {
      // Already an array - check if it's objects or strings
      if (options.length > 0 && typeof options[0] === 'object') {
        // Object format: [{label: "North America", value: "NA"}, ...]
        return options;
      } else {
        // String array: ["North America", "Europe", ...]
        return options.map(opt => ({ label: opt, value: opt }));
      }
    } else if (typeof options === 'string') {
      // Comma-separated string: "North America,Europe,Asia Pacific"
      return options.split(',').map(opt => ({
        label: opt.trim(),
        value: opt.trim()
      }));
    } else {
      return [];
    }
  })();
  
  function onChange(e) {
    value = e.target.value;
    // dispatch event if needed
  }
</script>

{#if type === 'dropdown'}
  <label>{label}
    <select bind:value on:change={onChange}>
      {#each parsedOptions as opt}
        <option value={opt.value}>{opt.label}</option>
      {/each}
    </select>
  </label>
{/if}
