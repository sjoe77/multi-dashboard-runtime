<script>
  import { createEventDispatcher } from 'svelte';
  import BarChart from './BarChart.svelte';
  import LineChart from './LineChart.svelte';
  import PieChart from './PieChart.svelte';
  import Grid from './Grid.svelte';
  import Filter from './Filter.svelte';
  import Toggle from './Toggle.svelte';
  import Dropdown from './Dropdown.svelte';
  import { parseComponentStructure } from '../lib/svelteASTParser.js';
  import { resolveInputValues } from '../lib/inputBasedSecurity.js';

  export let code = '';
  
  const dispatch = createEventDispatcher();
  
  let parsedStructure = null;
  let parseError = null;

  // React to code changes and parse the component structure
  $: {
    try {
      parseError = null;
      if (code.trim()) {
        parsedStructure = parseComponentStructure(code);
        console.log('Parsed structure:', parsedStructure);
        
        if (parsedStructure.errors.length > 0) {
          parseError = parsedStructure.errors.join('; ');
        }
      } else {
        parsedStructure = null;
      }
    } catch (error) {
      console.error('Parsing error:', error);
      parseError = error.message;
      parsedStructure = null;
    }
  }

  // Resolve component attributes with input values
  function resolveAttributes(component, inputState) {
    const resolved = {};
    for (const [key, value] of Object.entries(component.attributes || {})) {
      resolved[key] = resolveInputValues(value, inputState);
    }
    return resolved;
  }

  $: inputState = parsedStructure ? parsedStructure.inputState : {};
  $: inputComponents = parsedStructure ? parsedStructure.inputComponents : [];
  $: displayComponents = parsedStructure ? parsedStructure.displayComponents : [];
</script>

<div class="preview-container">
  {#if parseError}
    <div class="error-message">
      <h3>Parse Error:</h3>
      <p>{parseError}</p>
    </div>
  {:else if parsedStructure && (inputComponents.length > 0 || displayComponents.length > 0)}
    <!-- Render input components first -->
    {#if inputComponents.length > 0}
      <div class="input-section">
        <h4>Parameters</h4>
        {#each inputComponents as component (component.type + component.attributes.name)}
          {#if component.type === 'Toggle'}
            <Toggle 
              name={component.attributes.name || ''}
              label={component.attributes.label || component.attributes.name || 'Toggle'}
              value={component.attributes.value || false}
            />
          {:else if component.type === 'Dropdown'}
            <Dropdown 
              name={component.attributes.name || ''}
              label={component.attributes.label || component.attributes.name || 'Dropdown'}
              options={component.attributes.options || 'Option 1,Option 2,Option 3'}
              value={component.attributes.value || ''}
            />
          {/if}
        {/each}
      </div>
    {/if}
    
    <!-- Render display components -->
    <div class="display-section">
      {#if displayComponents.length > 0}
        <h4>Dashboard</h4>
        
        <!-- Separate Grid and non-Grid components -->
        {@const gridComponent = displayComponents.find(c => c.type === 'Grid')}
        {@const gridChildren = displayComponents.filter(c => c.insideGrid)}
        {@const standaloneComponents = displayComponents.filter(c => c.type !== 'Grid' && !c.insideGrid)}
        
        <!-- Render standalone components first -->
        {#each standaloneComponents as component (component.type + Math.random())}
          {@const resolvedAttrs = resolveAttributes(component, inputState)}
          {#if component.type === 'BarChart'}
            <BarChart 
              data={resolvedAttrs.data || null}
              source={resolvedAttrs.source || null}
              title={resolvedAttrs.title || 'Bar Chart'}
              visible={resolvedAttrs.visible !== 'false'}
            />
          {:else if component.type === 'LineChart'}
            <LineChart 
              data={resolvedAttrs.data || null}
              source={resolvedAttrs.source || null}
              title={resolvedAttrs.title || 'Line Chart'}
              visible={resolvedAttrs.visible !== 'false'}
            />
          {:else if component.type === 'PieChart'}
            <PieChart 
              data={resolvedAttrs.data || null}
              source={resolvedAttrs.source || null}
              title={resolvedAttrs.title || 'Pie Chart'}
              visible={resolvedAttrs.visible !== 'false'}
            />
          {:else if component.type === 'Filter'}
            <Filter 
              label={resolvedAttrs.title || resolvedAttrs.label || 'Filter'} 
              type={resolvedAttrs.type || 'dropdown'}
              options={resolvedAttrs.options || ['Option 1', 'Option 2', 'Option 3']}
              value={resolvedAttrs.value || ''}
            />
          {/if}
        {/each}
        
        <!-- Render Grid with its children -->
        {#if gridComponent && gridChildren.length > 0}
          {@const gridAttrs = resolveAttributes(gridComponent, inputState)}
          <Grid columns={parseInt(gridAttrs.cols || gridAttrs.columns || '3')}>
            {#each gridChildren as component (component.type + Math.random())}
              {@const resolvedAttrs = resolveAttributes(component, inputState)}
              {#if component.type === 'BarChart'}
                <BarChart 
                  data={resolvedAttrs.data || null}
                  source={resolvedAttrs.source || null}
                  title={resolvedAttrs.title || 'Bar Chart'}
                  visible={resolvedAttrs.visible !== 'false'}
                />
              {:else if component.type === 'LineChart'}
                <LineChart 
                  data={resolvedAttrs.data || null}
                  source={resolvedAttrs.source || null}
                  title={resolvedAttrs.title || 'Line Chart'}
                  visible={resolvedAttrs.visible !== 'false'}
                />
              {:else if component.type === 'PieChart'}
                <PieChart 
                  data={resolvedAttrs.data || null}
                  source={resolvedAttrs.source || null}
                  title={resolvedAttrs.title || 'Pie Chart'}
                  visible={resolvedAttrs.visible !== 'false'}
                />
              {:else if component.type === 'Filter'}
                <Filter 
                  label={resolvedAttrs.title || resolvedAttrs.label || 'Filter'} 
                  type={resolvedAttrs.type || 'dropdown'}
                  options={resolvedAttrs.options || ['Option 1', 'Option 2', 'Option 3']}
                  value={resolvedAttrs.value || ''}
                />
              {/if}
            {/each}
          </Grid>
        {/if}
      {/if}
    </div>
  {:else}
    <div class="empty-state">
      <h3>Live Preview</h3>
      <p>Start typing Svelte code to see the preview...</p>
      <div class="example">
        <h4>Example - Semantic Charts:</h4>
        <pre>{`<Toggle name="showCharts" label="Show Charts" value="true" />
<Dropdown name="region" options="North,South,East,West" value="North" />

<Grid cols="3">
  <BarChart title="Sales Data" data='[{"month":"Jan","sales":100}]' />
  <LineChart title="Growth Trend" data='[{"month":"Jan","users":1000}]' />
  <PieChart title="Market Share" data='[{"name":"Product A","value":40}]' />
</Grid>`}</pre>
      </div>
    </div>
  {/if}
</div>

<style>
  .preview-container {
    height: 100%;
    padding: 1rem;
    background: #1e1e1e;
    color: #d4d4d4;
    overflow-y: auto;
  }

  .input-section, .display-section {
    margin-bottom: 2rem;
  }

  .input-section h4, .display-section h4 {
    color: #569cd6;
    margin-bottom: 1rem;
    border-bottom: 1px solid #404040;
    padding-bottom: 0.5rem;
  }

  .error-message {
    background: #3c1e1e;
    border: 1px solid #ff6b6b;
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .error-message h3 {
    color: #ff6b6b;
    margin: 0 0 0.5rem 0;
  }

  .empty-state {
    text-align: center;
    padding: 2rem;
  }

  .empty-state h3 {
    color: #569cd6;
    margin-bottom: 1rem;
  }

  .example {
    background: #2d2d30;
    border-radius: 4px;
    padding: 1rem;
    margin-top: 1rem;
    text-align: left;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  .example h4 {
    color: #4ec9b0;
    margin: 0 0 0.5rem 0;
  }

  .example pre {
    color: #d4d4d4;
    margin: 0;
    font-family: 'Fira Code', 'Courier New', monospace;
    font-size: 0.9rem;
    line-height: 1.4;
  }
</style>
