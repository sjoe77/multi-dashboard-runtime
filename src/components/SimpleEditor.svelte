<script>
  export let value = '';
  
  function handleInput(event) {
    value = event.target.value;
  }
</script>

<textarea 
  bind:value 
  on:input={handleInput}
  placeholder="Type your Svelte code here..."
  style="
    width: 100%; 
    height: 100%; 
    background: #1e1e1e; 
    color: #d4d4d4; 
    border: none; 
    font-family: 'Courier New', monospace; 
    font-size: 14px; 
    padding: 16px; 
    resize: none; 
    outline: none;
    line-height: 1.5;
    box-sizing: border-box;
    flex: 1;
    overflow: auto;
  "
></textarea>

<style>
  textarea {
    box-sizing: border-box;
  }
</style>
