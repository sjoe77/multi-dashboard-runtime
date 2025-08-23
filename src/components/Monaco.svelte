<script>
  import { onMount, onDestroy } from 'svelte';

  import { createEventDispatcher } from 'svelte';
  export let value = '';
  export let language = 'svelte';
  export let theme = 'vs-dark';
  export let onChange = () => {};
  let editorDiv;
  let editor;
  const dispatch = createEventDispatcher();
  let initializing = false;

  onMount(async () => {
    initializing = true;
    const monaco = await import('monaco-editor');
    editor = monaco.editor.create(editorDiv, {
      value,
      language,
      theme,
      automaticLayout: true,
      minimap: { enabled: false }
    });
    editor.onDidChangeModelContent(() => {
      if (initializing) return;
      const newValue = editor.getValue();
      value = newValue;
      dispatch('input', newValue); // enables bind:value
      onChange();
    });
    initializing = false;
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
    font-family: 'Fira Mono', 'Menlo', 'Monaco', 'Consolas', monospace;
    font-size: 1rem;
    background: #23272e;
    color: #eee;
  }
</style>
