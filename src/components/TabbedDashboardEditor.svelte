<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor } from '@codemirror/view';
  import { EditorState } from '@codemirror/state';
  import { indentOnInput, bracketMatching, foldGutter } from '@codemirror/language';
  import { defaultKeymap, historyKeymap, history } from '@codemirror/commands';
  import { closeBrackets } from '@codemirror/autocomplete';
  import { highlightSelectionMatches } from '@codemirror/search';
  import { html } from '@codemirror/lang-html';
  import { javascript } from '@codemirror/lang-javascript';
  import { sql } from '@codemirror/lang-sql';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
  import { tags } from '@lezer/highlight';
  
  export let svelteCode = '';
  export let sqlCode = '';
  export let currentDashboard = '';
  export let currentPage = '';
  
  // Detect actual theme from the app
  let theme = 'light';
  
  function updateTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const dataTheme = document.documentElement.getAttribute('data-theme');
    theme = dataTheme || savedTheme;
    console.log('Current theme detected:', theme);
  }
  
  const dispatch = createEventDispatcher();
  
  let activeTab = 'svelte';
  let editorContainer;
  let editor;
  
  // Custom highlight styles for light theme
  const lightHighlightStyle = HighlightStyle.define([
    { tag: tags.keyword, color: '#d73a49', fontWeight: 'bold' },
    { tag: tags.string, color: '#032f62' },
    { tag: tags.comment, color: '#6a737d', fontStyle: 'italic' },
    { tag: tags.variableName, color: '#e36209' },
    { tag: tags.typeName, color: '#6f42c1' },
    { tag: tags.atom, color: '#005cc5' },
    { tag: tags.number, color: '#005cc5' },
    { tag: tags.operator, color: '#d73a49' },
    // Force ALL possible tag types to be the same green color
    { tag: tags.tagName, color: '#22863a' },
    { tag: tags.definition(tags.tagName), color: '#22863a' },
    { tag: tags.name, color: '#22863a' },
    { tag: tags.namespace, color: '#22863a' },
    { tag: tags.standard(tags.tagName), color: '#22863a' },
    { tag: tags.local(tags.tagName), color: '#22863a' },
    // Attributes
    { tag: tags.attributeName, color: '#6f42c1' },
    { tag: tags.attributeValue, color: '#032f62' },
    { tag: tags.propertyName, color: '#6f42c1' },
    { tag: tags.className, color: '#6f42c1' },
    // Brackets and punctuation
    { tag: tags.bracket, color: '#24292e' },
    { tag: tags.angleBracket, color: '#24292e' },
    { tag: tags.paren, color: '#24292e' },
    { tag: tags.brace, color: '#24292e' }
  ]);
  
  // Basic setup equivalent for CodeMirror 6
  const basicSetupExtensions = [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    foldGutter(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    rectangularSelection(),
    crosshairCursor(),
    highlightSelectionMatches(),
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
    ])
  ];
  
  // Create editor extensions for each language
  function createSvelteExtensions(currentTheme) {
    console.log('Creating Svelte extensions for theme:', currentTheme);
    const extensions = [
      ...basicSetupExtensions,
      html(), // HTML highlighting for Svelte markup
      ...(currentTheme === 'dark' ? [oneDark] : [syntaxHighlighting(lightHighlightStyle)]),
      EditorView.updateListener.of(update => {
        if (update.docChanged && activeTab === 'svelte') {
          svelteCode = editor.state.doc.toString();
          dispatch('change', { type: 'svelte', value: svelteCode });
        }
      }),
      EditorView.theme({
        '&': { 
          height: '100%',
          backgroundColor: currentTheme === 'dark' ? '#1e1e1e' : '#ffffff'
        },
        '.cm-editor': { 
          height: '100%',
          backgroundColor: currentTheme === 'dark' ? '#1e1e1e' : '#ffffff'
        },
        '.cm-focused': { outline: 'none' },
        '.cm-scroller': { 
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace",
          overflow: 'auto'
        },
        '.cm-content': {
          color: currentTheme === 'dark' ? '#ffffff' : '#1a202c'
        },
        // Force consistent tag colors in light theme as fallback
        ...(currentTheme === 'light' ? {
          '.cm-tag': { color: '#22863a !important' },
          '.cmt-tagName': { color: '#22863a !important' },
          '.cmt-tag': { color: '#22863a !important' }
        } : {})
      })
    ];
    console.log('Svelte extensions created:', extensions.length);
    return extensions;
  }
  
  function createSqlExtensions(currentTheme) {
    return [
      ...basicSetupExtensions,
      sql(),
      ...(currentTheme === 'dark' ? [oneDark] : [syntaxHighlighting(lightHighlightStyle)]),
      EditorView.updateListener.of(update => {
        if (update.docChanged && activeTab === 'sql') {
          sqlCode = editor.state.doc.toString();
          dispatch('change', { type: 'sql', value: sqlCode });
        }
      }),
      EditorView.theme({
        '&': { 
          height: '100%',
          backgroundColor: currentTheme === 'dark' ? '#1e1e1e' : '#ffffff'
        },
        '.cm-editor': { 
          height: '100%',
          backgroundColor: currentTheme === 'dark' ? '#1e1e1e' : '#ffffff'
        },
        '.cm-focused': { outline: 'none' },
        '.cm-scroller': { 
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace",
          overflow: 'auto'
        },
        '.cm-content': {
          color: currentTheme === 'dark' ? '#ffffff' : '#1a202c'
        }
      })
    ];
  }
  
  function createEditor(content, extensions) {
    if (editor) {
      editor.destroy();
    }
    
    console.log('Creating editor with extensions:', extensions.length);
    console.log('Content preview:', content.substring(0, 50));
    
    const state = EditorState.create({
      doc: content,
      extensions: extensions
    });
    
    editor = new EditorView({
      state,
      parent: editorContainer
    });
    
    console.log('Editor created successfully');
  }
  
  function switchTab(tab) {
    if (tab === activeTab) return;
    
    console.log(`Switching to ${tab} tab`);
    activeTab = tab;
    
    if (tab === 'svelte') {
      console.log(`Loading Svelte content: ${svelteCode.length} chars`);
      createEditor(svelteCode, createSvelteExtensions(theme));
    } else {
      console.log(`Loading SQL content: ${sqlCode.length} chars`);
      console.log(`SQL content preview:`, sqlCode.substring(0, 100));
      createEditor(sqlCode, createSqlExtensions(theme));
    }
  }
  
  // Update editor content when props change
  $: if (editor && activeTab === 'svelte' && editor.state.doc.toString() !== svelteCode) {
    const transaction = editor.state.update({
      changes: { from: 0, to: editor.state.doc.length, insert: svelteCode }
    });
    editor.dispatch(transaction);
  }
  
  $: if (editor && activeTab === 'sql' && editor.state.doc.toString() !== sqlCode) {
    const transaction = editor.state.update({
      changes: { from: 0, to: editor.state.doc.length, insert: sqlCode }
    });
    editor.dispatch(transaction);
  }
  
  // Only recreate editor when theme actually changes, not on mount
  let previousTheme = theme;
  $: if (editor && theme && theme !== previousTheme) {
    previousTheme = theme;
    const currentContent = editor.state.doc.toString();
    if (activeTab === 'svelte') {
      createEditor(currentContent, createSvelteExtensions(theme));
    } else {
      createEditor(currentContent, createSqlExtensions(theme));
    }
  }
  
  onMount(() => {
    console.log('TabbedDashboardEditor mounted');
    console.log('Initial svelteCode length:', svelteCode.length);
    console.log('Initial sqlCode length:', sqlCode.length);
    
    // Detect theme
    updateTheme();
    
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      updateTheme();
    });
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['data-theme'] 
    });
    
    // Initialize with Svelte tab
    createEditor(svelteCode, createSvelteExtensions(theme));
    
    return () => observer.disconnect();
  });
  
  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }
  });
</script>

<div class="tabbed-editor" class:light-theme={theme === 'light'}>
  <!-- Tab Navigation -->
  <div class="tab-bar">
    <button 
      class="tab" 
      class:active={activeTab === 'svelte'}
      on:click={() => switchTab('svelte')}
    >
      📄 {currentPage}.svelte
    </button>
    <button 
      class="tab" 
      class:active={activeTab === 'sql'}
      on:click={() => switchTab('sql')}
    >
      🗄️ {currentPage}.sql
    </button>
  </div>
  
  <!-- Editor Container -->
  <div class="editor-wrapper">
    <div bind:this={editorContainer} class="editor-container"></div>
  </div>
</div>

<style>
  .tabbed-editor {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    background: #1e1e1e;
  }
  
  .tabbed-editor.light-theme {
    background: #ffffff;
  }
  
  .tab-bar {
    display: flex;
    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
    border-bottom: 1px solid #4a5568;
    padding: 0;
    margin: 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .light-theme .tab-bar {
    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
    border-bottom: 1px solid #e2e8f0;
  }
  
  .tab {
    background: transparent;
    border: none;
    color: #a0aec0;
    padding: 8px 16px;
    cursor: pointer;
    font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.3s ease;
    border-bottom: 2px solid transparent;
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .light-theme .tab {
    color: #4a5568;
  }
  
  .tab:hover {
    background: rgba(74, 85, 104, 0.3);
    color: #ffffff;
    transform: translateY(-1px);
  }
  
  .light-theme .tab:hover {
    background: rgba(226, 232, 240, 0.5);
    color: #2d3748;
  }
  
  .tab.active {
    background: #1e1e1e;
    color: #63b3ed;
    border-bottom-color: #63b3ed;
    box-shadow: 0 -2px 8px rgba(99, 179, 237, 0.2);
  }
  
  .light-theme .tab.active {
    background: #ffffff;
    color: #3182ce;
    border-bottom-color: #3182ce;
    box-shadow: 0 -2px 8px rgba(49, 130, 206, 0.2);
  }
  
  .tab.active::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #63b3ed, #4299e1);
  }
  
  .editor-wrapper {
    flex: 1;
    position: relative;
    overflow: hidden;
    min-height: 0; /* Allows flexbox child to shrink */
  }
  
  .editor-container {
    height: 100%;
    width: 100%;
    min-height: 0; /* Allows flexbox child to shrink */
  }
  
  /* Ensure CodeMirror is properly contained */
  :global(.tabbed-editor .cm-editor) {
    height: 100% !important;
    max-height: 100% !important;
  }
  
  :global(.tabbed-editor .cm-scroller) {
    height: 100% !important;
    max-height: 100% !important;
    overflow-y: auto !important;
    overflow-x: auto !important;
  }
  
  /* Prevent CodeMirror from growing beyond container */
  :global(.tabbed-editor .cm-content) {
    min-height: 100% !important;
    max-height: none !important;
  }
</style>