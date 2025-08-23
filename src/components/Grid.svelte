<script>
  export let columns = 2;
  export let rows = 1;
  
  $: gridStyle = `display: grid; grid-template-columns: repeat(${columns}, 1fr); grid-template-rows: repeat(${rows}, 1fr); gap: 1rem; width: 100%; height: auto; min-height: 400px;`;
</script>

<div style={gridStyle}>
  <slot />
</div>
