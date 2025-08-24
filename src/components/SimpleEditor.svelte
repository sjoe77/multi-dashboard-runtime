<script>
  export let value = '';
  
  function handleInput(event) {
    value = event.target.value;
  }
</script>

<!-- Beer CSS Themed Code Editor -->
<textarea 
  class="field extra textarea code-editor"
  bind:value 
  on:input={handleInput}
  placeholder="Type your Svelte code here..."
></textarea>

<style>
  /* Beer CSS Code Editor with proper theming */
  .code-editor {
    width: 100%;
    height: 100%;
    font-family: 'Fira Code', 'JetBrains Mono', 'Monaco', 'Consolas', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
    flex: 1;
    resize: none;
    border-radius: 8px;
    /* Beer CSS handles all theming automatically */
  }
</style>
