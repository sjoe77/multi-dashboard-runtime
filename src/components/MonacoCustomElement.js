/**
 * Monaco Editor Custom Element with Shadow DOM
 * Provides complete CSS isolation from Beer CSS and other global styles
 */

class MonacoEditorElement extends HTMLElement {
  constructor() {
    super();
    // console.log('🔧 Monaco Custom Element: Constructor called');
    this.attachShadow({ mode: 'open' });
    
    // Create container for Monaco
    this._container = document.createElement('div');
    this._container.style.height = '100%';
    this._container.style.width = '100%';
    this._container.style.position = 'relative';
    
    this._container.style.boxSizing = 'border-box';
    
    // Add styles for the shadow DOM
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        min-height: 100px;
        contain: layout style paint size;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
      }
      
      .monaco-container {
        width: 100%;
        height: 100%;
        min-height: inherit;
        overflow: hidden;
        font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace;
        box-sizing: border-box;
        position: relative;
      }
      
      /* Remove textarea CSS overrides - let Monaco handle it naturally */
      
      /* Ensure no elements escape the container */
      .monaco-container .monaco-editor {
        position: relative !important;
        width: 100% !important;
        height: 100% !important;
      }
      
      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        background: #1e1e1e;
        color: #d4d4d4;
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
      
      .error textarea {
        width: 100%;
        height: 200px;
        border: 1px solid #30363d;
        border-radius: 6px;
        padding: 1rem;
        font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace;
        font-size: 0.875rem;
        background: #0d1117;
        color: #e6edf3;
        resize: vertical;
      }
      
      .hidden {
        display: none;
      }
    `;
    
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(this._container);
    
    // Initialize state
    this._editor = null;
    this._monaco = null;
    this._loadingState = 'initializing';
    this._errorMessage = '';
    this._themeObserver = null;
    
    // Show initial loading state
    this._showLoading();
  }
  
  _showLoading() {
    this._container.innerHTML = '<div class="loading">Loading Monaco Editor...</div>';
  }
  
  _showError(message) {
    console.error('🚨 Monaco Custom Element Error:', message);
    this._container.innerHTML = `
      <div class="error">
        <p>Monaco Editor failed to load: ${message}</p>
        <p>Please refresh the page to try again.</p>
      </div>
    `;
  }
  
  async connectedCallback() {
    console.log('📍 Monaco Custom Element: connectedCallback called');
    console.log('📏 Element dimensions:', { 
      width: this.offsetWidth, 
      height: this.offsetHeight,
      clientWidth: this.clientWidth,
      clientHeight: this.clientHeight,
      parent: this.parentElement?.tagName,
      parentDimensions: this.parentElement ? {
        width: this.parentElement.offsetWidth,
        height: this.parentElement.offsetHeight
      } : null
    });
    
    // Prevent multiple initializations
    if (this._editor || this._loadingState === 'importing' || this._loadingState === 'creating-editor') {
      console.log('⚠️ Monaco Custom Element: Already initializing or initialized, skipping...');
      return;
    }
    
    // Wait for element to be properly positioned
    await new Promise(resolve => setTimeout(resolve, 0));
    
    try {
      console.log('🚀 Monaco Custom Element: Starting initialization...');
      this._loadingState = 'importing';
      
      // Only initialize if we have proper dimensions
      if (this.offsetWidth === 0 || this.offsetHeight === 0) {
        console.log('Monaco Custom Element: Waiting for proper dimensions...');
        // Wait a bit more for layout
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Configure Monaco environment for Vite
      if (!window.MonacoEnvironment) {
        window.MonacoEnvironment = {
          getWorker: function (moduleId, label) {
            // Disable workers to avoid worker loading issues in development
            return null;
          }
        };
      }
      
      // Import Monaco
      this._monaco = await import('monaco-editor');
      console.log('Monaco Custom Element: Successfully imported monaco-editor');
      
      this._loadingState = 'creating-editor';
      this._container.innerHTML = '<div class="loading">Creating Editor...</div>';
      
      // Clear container and add Monaco container
      this._container.innerHTML = '';
      const editorDiv = document.createElement('div');
      editorDiv.className = 'monaco-container';
      
      // Explicitly set dimensions
      const containerWidth = this.offsetWidth || 800;
      const containerHeight = this.offsetHeight || 400;
      
      console.log('🎯 Setting explicit container dimensions:', {
        containerWidth,
        containerHeight,
        elementWidth: this.offsetWidth,
        elementHeight: this.offsetHeight
      });
      
      editorDiv.style.width = containerWidth + 'px';
      editorDiv.style.height = containerHeight + 'px';
      editorDiv.style.position = 'relative';
      
      this._container.appendChild(editorDiv);
      
      // Define professional themes
      this._defineThemes();
      
      // Get initial theme
      const theme = this._getCurrentTheme();
      
      console.log('🎯 Creating Monaco editor with dimensions:', {
        containerWidth: editorDiv.offsetWidth,
        containerHeight: editorDiv.offsetHeight,
        elementWidth: this.offsetWidth,
        elementHeight: this.offsetHeight
      });
      
      // Create editor with all the same options as the original
      this._editor = this._monaco.editor.create(editorDiv, {
        value: this.getAttribute('value') || '',
        language: this._getLanguage(),
        theme: theme,
        automaticLayout: false,
        minimap: { enabled: false },
        fontSize: 13,
        lineHeight: 20,
        letterSpacing: 0.5,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace",
        fontLigatures: true,
        lineNumbers: 'on',
        lineNumbersMinChars: 3,
        glyphMargin: true,
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
      
      console.log('Monaco Custom Element: Editor created successfully');
      
      // Force Monaco to recalculate layout and ensure it's properly initialized
      setTimeout(() => {
        if (this._editor) {
          console.log('🔧 Forcing Monaco layout and focus...');
          
          // Ensure editor is not readonly
          this._editor.updateOptions({ readOnly: false });
          
          // Force layout recalculation
          this._editor.layout();
          
          // Focus the editor
          this._editor.focus();
          
          // Force a second layout after a brief delay
          setTimeout(() => {
            if (this._editor) {
              console.log('🔧 Second Monaco layout recalculation...');
              this._editor.layout();
              
              // Set cursor position to make it active
              this._editor.setPosition({ lineNumber: 1, column: 1 });
            }
          }, 100);
        }
      }, 0);
      
      this._loadingState = 'ready';
      
      // Listen for content changes
      this._editor.onDidChangeModelContent(() => {
        const newValue = this._editor.getValue();
        this.setAttribute('value', newValue);
        
        // Dispatch custom event for external listeners
        this.dispatchEvent(new CustomEvent('monaco-change', {
          detail: { value: newValue },
          bubbles: true
        }));
      });
      
      // Set up theme observer
      this._setupThemeObserver();
      
      // Set up resize observer to handle dimension changes
      this._setupResizeObserver();
      
    } catch (error) {
      console.error('Monaco Custom Element: Failed to initialize:', error);
      this._errorMessage = `Monaco failed: ${error.message}`;
      this._loadingState = 'error';
      this._showError(this._errorMessage);
    }
  }
  
  _defineThemes() {
    // Professional dark theme
    this._monaco.editor.defineTheme('professional-dark', {
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
        'editor.foreground': '#ffffff',
        'editorLineNumber.foreground': '#ffffff',
        'editorLineNumber.activeForeground': '#ffffff',
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
    
    // Professional light theme
    this._monaco.editor.defineTheme('professional-light', {
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
  }
  
  _getCurrentTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
                   document.documentElement.classList.contains('dark');
    return isDark ? 'professional-dark' : 'professional-light';
  }
  
  _getLanguage() {
    const lang = this.getAttribute('language') || 'javascript';
    return lang === 'svelte' ? 'html' : lang;
  }
  
  _setupThemeObserver() {
    this._themeObserver = new MutationObserver(() => {
      if (this._editor && this._monaco) {
        const newTheme = this._getCurrentTheme();
        this._monaco.editor.setTheme(newTheme);
      }
    });
    
    this._themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class']
    });
  }
  
  _setupResizeObserver() {
    if (window.ResizeObserver) {
      this._resizeObserver = new ResizeObserver((entries) => {
        if (this._editor) {
          console.log('🔄 Monaco resize detected, forcing layout...');
          this._editor.layout();
        }
      });
      
      this._resizeObserver.observe(this);
    }
  }
  
  disconnectedCallback() {
    if (this._editor) {
      this._editor.dispose();
      this._editor = null;
    }
    
    if (this._themeObserver) {
      this._themeObserver.disconnect();
      this._themeObserver = null;
    }
    
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  }
  
  // Attribute change handling
  static get observedAttributes() {
    return ['value', 'language', 'theme'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (!this._editor || oldValue === newValue) return;
    
    switch (name) {
      case 'value':
        if (this._editor.getValue() !== newValue) {
          this._editor.setValue(newValue || '');
        }
        break;
      case 'language':
        const model = this._editor.getModel();
        if (model) {
          const newLang = newValue === 'svelte' ? 'html' : newValue;
          this._monaco.editor.setModelLanguage(model, newLang);
        }
        break;
      case 'theme':
        if (this._monaco) {
          this._monaco.editor.setTheme(newValue);
        }
        break;
    }
  }
  
  // Public API
  get value() {
    return this._editor?.getValue() ?? '';
  }
  
  set value(val) {
    if (this._editor && this._editor.getValue() !== val) {
      this._editor.setValue(val || '');
    }
    this.setAttribute('value', val || '');
  }
  
  get editor() {
    return this._editor;
  }
  
  focus() {
    if (this._editor) {
      this._editor.focus();
    }
  }
  
  layout() {
    if (this._editor) {
      console.log('🔧 Manual Monaco layout() called');
      this._editor.layout();
      
      // Also force dimension recalculation
      setTimeout(() => {
        if (this._editor) {
          this._editor.layout();
        }
      }, 10);
    }
  }
}

// Register the custom element
customElements.define('monaco-editor', MonacoEditorElement);

export default MonacoEditorElement;