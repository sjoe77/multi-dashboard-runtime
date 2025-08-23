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
    background: #ffffff; 
    color: #000000; 
    border: 1px solid #e2e8f0; 
    font-family: 'Fira Code', 'Monaco', 'Consolas', monospace; 
    font-size: 14px; 
    padding: 16px; 
    resize: none; 
    outline: none;
    line-height: 1.5;
    box-sizing: border-box;
    flex: 1;
    overflow: auto;
    border-radius: 6px;
  "
></textarea>

<style>
  textarea {
    box-sizing: border-box;
  }
</style>
