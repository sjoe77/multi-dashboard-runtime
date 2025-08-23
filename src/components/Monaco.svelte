<script>
  console.log('🟦 Monaco.svelte: Script executing');
  import { onMount, onDestroy } from 'svelte';

  export let value = '';
  export let language = 'svelte';
  
  let editorDiv;
  let editor;
  let errorMessage = '';
  let loadingState = 'initializing';

  onMount(async () => {
    console.log('Monaco: Component mounted, starting initialization...');
    loadingState = 'importing';
    
    try {
      console.log('Monaco: Attempting to import monaco-editor...');
      const monaco = await import('monaco-editor');
      console.log('Monaco: Successfully imported monaco-editor', monaco);
      
      loadingState = 'creating-editor';
      
      if (!editorDiv) {
        console.error('Monaco: editorDiv is not available');
        errorMessage = 'Editor container not found';
        return;
      }

      // Define a light theme for Monaco
      monaco.editor.defineTheme('light-theme', {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#ffffff',
          'editor.foreground': '#000000'
        }
      });

      editor = monaco.editor.create(editorDiv, {
        value,
        language: language === 'svelte' ? 'html' : language,
        theme: 'light-theme',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        tabSize: 2,
        insertSpaces: true
      });

      console.log('Monaco: Editor created successfully');
      loadingState = 'ready';

      // Listen for content changes
      editor.onDidChangeModelContent(() => {
        value = editor.getValue();
      });

    } catch (error) {
      console.error('Monaco: Failed to initialize:', error);
      errorMessage = `Monaco failed: ${error.message}`;
      loadingState = 'error';
    }
  });

  // Update Monaco editor if value changes from outside
  $: if (editor && editor.getValue() !== value) {
    editor.setValue(value);
  }

  onDestroy(() => {
    if (editor) editor.dispose();
  });
</script>

<div class="monaco-container">
  {#if loadingState === 'initializing' || loadingState === 'importing'}
    <div class="loading">Loading Monaco Editor...</div>
  {:else if loadingState === 'creating-editor'}
    <div class="loading">Creating Editor...</div>
  {:else if errorMessage}
    <div class="error">
      <p>Error: {errorMessage}</p>
      <textarea bind:value={value} placeholder="Monaco failed, using fallback textarea"></textarea>
    </div>
  {/if}
  
  <div bind:this={editorDiv} style="width:100%;height:100%;" class:hidden={loadingState !== 'ready'}></div>
</div>

<style>
  .monaco-container {
    height: 100%;
    width: 100%;
    position: relative;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: #f8f9fa;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    color: #4a5568;
  }

  .error {
    height: 100%;
    background: #fed7d7;
    border: 1px solid #fc8181;
    border-radius: 6px;
    padding: 1rem;
  }

  .error p {
    margin: 0 0 0.5rem 0;
    color: #c53030;
  }

  .error textarea {
    width: 100%;
    height: 200px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 0.5rem;
    font-family: monospace;
    resize: vertical;
  }

  .hidden {
    display: none;
  }
</style>