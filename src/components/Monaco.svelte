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

      // Define professional themes for Monaco
      monaco.editor.defineTheme('professional-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: '', foreground: 'e6e6e6' },
          { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
          { token: 'keyword', foreground: '569cd6' },
          { token: 'string', foreground: 'ce9178' },
          { token: 'number', foreground: 'b5cea8' },
          { token: 'type', foreground: '4ec9b0' },
          { token: 'function', foreground: 'dcdcaa' }
        ],
        colors: {
          'editor.background': '#1e1e1e',
          'editor.foreground': '#d4d4d4',
          'editorLineNumber.foreground': '#858585',
          'editorLineNumber.activeForeground': '#c6c6c6',
          'editor.lineHighlightBackground': '#2d2d30',
          'editor.selectionBackground': '#264f78',
          'editor.inactiveSelectionBackground': '#3a3d41',
          'editorCursor.foreground': '#aeafad',
          'editor.wordHighlightBackground': '#575757',
          'editor.wordHighlightStrongBackground': '#004972',
          'editorBracketMatch.background': '#0064001a',
          'editorBracketMatch.border': '#888888'
        }
      });

      monaco.editor.defineTheme('professional-light', {
        base: 'vs',
        inherit: true,
        rules: [
          { token: '', foreground: '000000' },
          { token: 'comment', foreground: '008000', fontStyle: 'italic' },
          { token: 'keyword', foreground: '0000ff' },
          { token: 'string', foreground: 'a31515' },
          { token: 'number', foreground: '098658' },
          { token: 'type', foreground: '267f99' },
          { token: 'function', foreground: '795e26' }
        ],
        colors: {
          'editor.background': '#ffffff',
          'editor.foreground': '#000000',
          'editorLineNumber.foreground': '#237893',
          'editorLineNumber.activeForeground': '#0b216f',
          'editor.lineHighlightBackground': '#f0f0f0',
          'editor.selectionBackground': '#add6ff',
          'editor.inactiveSelectionBackground': '#e5ebf1',
          'editorCursor.foreground': '#000000',
          'editor.wordHighlightBackground': '#57575740',
          'editor.wordHighlightStrongBackground': '#004972',
          'editorBracketMatch.background': '#0064001a',
          'editorBracketMatch.border': '#b9b9b9'
        }
      });

      // Detect theme preference
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const theme = isDark ? 'professional-dark' : 'professional-light';

      editor = monaco.editor.create(editorDiv, {
        value,
        language: language === 'svelte' ? 'html' : language,
        theme: theme,
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 13,
        lineHeight: 20,
        letterSpacing: 0.5,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace",
        fontLigatures: true,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        tabSize: 2,
        insertSpaces: true,
        renderWhitespace: 'selection',
        renderLineHighlight: 'all',
        roundedSelection: false,
        scrollbar: {
          vertical: 'auto',
          horizontal: 'auto',
          verticalScrollbarSize: 12,
          horizontalScrollbarSize: 12
        },
        padding: {
          top: 16,
          bottom: 16
        }
      });

      console.log('Monaco: Editor created successfully');
      loadingState = 'ready';

      // Listen for content changes
      editor.onDidChangeModelContent(() => {
        value = editor.getValue();
      });

      // Listen for theme changes
      const themeObserver = new MutationObserver(() => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'professional-dark' : 'professional-light';
        monaco.editor.setTheme(newTheme);
      });
      
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
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
    background: var(--surface-container);
    border-radius: 0;
    overflow: hidden;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: var(--surface-container);
    color: var(--on-surface-variant);
    font-family: 'Roboto', system-ui, sans-serif;
    font-size: 0.875rem;
  }

  .error {
    height: 100%;
    background: var(--error-container);
    color: var(--on-error-container);
    padding: 1.5rem;
    font-family: 'Roboto', system-ui, sans-serif;
  }

  .error p {
    margin: 0 0 1rem 0;
    font-weight: 500;
  }

  .error textarea {
    width: 100%;
    height: 200px;
    border: 1px solid var(--outline-variant);
    border-radius: 8px;
    padding: 1rem;
    font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace;
    font-size: 0.875rem;
    background: var(--surface);
    color: var(--on-surface);
    resize: vertical;
  }

  .hidden {
    display: none;
  }

  /* Global Monaco Editor Overrides */
  :global(.monaco-editor) {
    font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace !important;
  }

  :global(.monaco-editor .margin) {
    background: transparent !important;
  }

  :global(.monaco-editor .monaco-editor-background) {
    background: transparent !important;
  }
</style>