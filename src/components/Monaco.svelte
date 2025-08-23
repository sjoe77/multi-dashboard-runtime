<script>
  import { onMount, onDestroy } from 'svelte';

  import { createEventDispatcher } from 'svelte';
  export let value = '';
  export let language = 'svelte';
  export let theme = 'vs';
  export let onChange = () => {};
  let editorDiv;
  let editor;
  const dispatch = createEventDispatcher();
  let initializing = false;

  onMount(async () => {
    try {
      initializing = true;
      
      // Import Monaco with explicit configuration
      const monaco = await import('monaco-editor');
      
      editor = monaco.editor.create(editorDiv, {
        value,
        language: 'javascript', // Use javascript instead of svelte for now
        theme: 'vs',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        tabSize: 2,
        insertSpaces: true
      });
      
      editor.onDidChangeModelContent(() => {
        if (initializing) return;
        const newValue = editor.getValue();
        value = newValue;
        dispatch('input', newValue);
        onChange();
      });
      
      initializing = false;
    } catch (error) {
      console.error('Monaco failed to load:', error);
      // Fallback - you'll see this error in console
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

<div bind:this={editorDiv} style="width:100%;height:100%;"></div>

<style>
  div {
    height: 100%;
    width: 100%;
    outline: none;
    flex: 1 1 auto;
    font-family: 'Fira Code', 'Monaco', 'Menlo', 'Consolas', monospace;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    overflow: hidden;
  }

  /* Force Monaco light theme with CSS */
  div :global(.monaco-editor) {
    background-color: #ffffff !important;
  }

  div :global(.monaco-editor .margin) {
    background-color: #f8f9fa !important;
  }

  div :global(.monaco-editor .monaco-editor-background) {
    background-color: #ffffff !important;
  }

  div :global(.view-lines) {
    background-color: #ffffff !important;
  }

  div :global(.current-line) {
    background-color: #f0f8ff !important;
  }

  div :global(.mtk1) {
    color: #000000 !important;
  }
</style>
