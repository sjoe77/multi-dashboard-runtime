<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  
  export let value = '';
  export let language = 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let editorDiv;
  let editor;
  let monaco;
  let errorMessage = '';
  let loadingState = 'initializing';

  onMount(async () => {
    console.log('🔧 MonacoFixed: Starting initialization...');
    loadingState = 'importing';
    
    try {
      // Configure Monaco environment
      if (!window.MonacoEnvironment) {
        window.MonacoEnvironment = {
          getWorker: function (moduleId, label) {
            return null; // Disable workers for now
          }
        };
      }
      
      // Import Monaco
      monaco = await import('monaco-editor');
      console.log('✅ MonacoFixed: Successfully imported monaco-editor');
      
      loadingState = 'creating-editor';
      
      if (!editorDiv) {
        console.error('❌ MonacoFixed: editorDiv is not available');
        errorMessage = 'Editor container not found';
        return;
      }

      // Define themes
      monaco.editor.defineTheme('fixed-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: '', foreground: 'ffffff' },
          { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
          { token: 'keyword', foreground: '569cd6' },
          { token: 'string', foreground: 'ce9178' },
          { token: 'number', foreground: 'b5cea8' },
        ],
        colors: {
          'editor.background': '#1e1e1e',
          'editor.foreground': '#ffffff',
          'editorLineNumber.foreground': '#ffffff',
          'editorLineNumber.activeForeground': '#ffffff',
          'editor.lineHighlightBackground': '#2d2d30',
          'editor.selectionBackground': '#264f78',
          'editorCursor.foreground': '#ffffff',
        }
      });

      // Create editor with explicit options
      editor = monaco.editor.create(editorDiv, {
        value: value,
        language: language === 'svelte' ? 'html' : language,
        theme: 'fixed-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        lineHeight: 21,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace",
        lineNumbers: 'on',
        lineNumbersMinChars: 5,
        glyphMargin: false,
        folding: false,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        tabSize: 2,
        insertSpaces: true,
        readOnly: false,
        contextmenu: false,  // Disable Monaco context menu for debugging
        padding: {
          top: 16,
          bottom: 16
        }
      });

      console.log('✅ MonacoFixed: Editor created successfully');
      loadingState = 'ready';

      // Listen for content changes
      editor.onDidChangeModelContent(() => {
        const newValue = editor.getValue();
        value = newValue;
        dispatch('change', { value: newValue });
      });

      // Force focus and layout
      setTimeout(() => {
        if (editor) {
          editor.focus();
          editor.layout();
        }
      }, 100);

    } catch (error) {
      console.error('❌ MonacoFixed: Failed to initialize:', error);
      errorMessage = `Monaco failed: ${error.message}`;
      loadingState = 'error';
    }
  });

  // Update Monaco editor if value changes from outside
  $: if (editor && editor.getValue() !== value) {
    editor.setValue(value);
  }

  onDestroy(() => {
    if (editor) {
      editor.dispose();
    }
  });
</script>

<div class="monaco-fixed-container">
  {#if loadingState === 'initializing' || loadingState === 'importing'}
    <div class="loading">Loading Monaco Editor...</div>
  {:else if loadingState === 'creating-editor'}
    <div class="loading">Creating Editor...</div>
  {:else if errorMessage}
    <div class="error">
      <p>Error: {errorMessage}</p>
    </div>
  {/if}
  
  <div bind:this={editorDiv} class="monaco-editor-container" class:hidden={loadingState !== 'ready'}></div>
</div>

<style>
  .monaco-fixed-container {
    height: 100%;
    width: 100%;
    position: relative;
    background: #1e1e1e;
    border-radius: 0;
    overflow: hidden;
    /* CSS isolation techniques */
    isolation: isolate;
    contain: layout style paint;
  }

  .monaco-editor-container {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: #1e1e1e;
    color: #ffffff;
    font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace;
    font-size: 0.875rem;
  }

  .error {
    height: 100%;
    background: #2d1b1b;
    color: #f85149;
    padding: 1.5rem;
    font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace;
    overflow-y: auto;
  }

  .error p {
    margin: 0 0 1rem 0;
    font-weight: 500;
  }

  .hidden {
    display: none;
  }

  /* TARGETED Beer CSS interference fixes */
  .monaco-fixed-container * {
    box-sizing: border-box;
    /* Reset Beer CSS universal selector interference */
    vertical-align: baseline !important;
    line-height: normal !important;
  }
  
  .monaco-fixed-container {
    /* Reset any inherited line-height from Beer CSS body */
    line-height: normal !important;
  }

  /* Isolate from external CSS */
  :global(.monaco-fixed-container .monaco-editor) {
    font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace !important;
    font-size: 14px !important;
    line-height: 21px !important;
  }

  /* Fix line number spacing and alignment */
  :global(.monaco-fixed-container .margin) {
    background: transparent !important;
    width: 120px !important;
    min-width: 120px !important;
  }

  :global(.monaco-fixed-container .line-numbers) {
    color: #ffffff !important;
    font-weight: normal !important;
    padding-right: 30px !important;
    text-align: right !important;
  }

  :global(.monaco-fixed-container .margin-view-overlays) {
    background: transparent !important;
    width: auto !important;
  }

  /* Remove extra gutter spaces */
  :global(.monaco-fixed-container .glyph-margin) {
    display: none !important;
  }

  /* Ensure proper spacing between line numbers and content */
  :global(.monaco-fixed-container .view-lines) {
    margin-left: 0 !important;
    padding-left: 25px !important;
  }
</style>