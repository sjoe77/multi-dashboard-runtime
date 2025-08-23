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
  import { clearCache } from '../lib/dataSources.js';

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
  
  // Check if conditional should show based on input state
  function shouldShowComponent(component, inputState) {
    // Handle {#if inputs.paramName} conditionals
    if (component.conditional) {
      const condition = component.conditional;
      if (condition.startsWith('inputs.')) {
        const paramName = condition.substring(7); // Remove 'inputs.'
        return Boolean(inputState[paramName]);
      }
    }
    return true;
  }

  $: inputState = parsedStructure ? parsedStructure.inputState : {};
  $: inputComponents = parsedStructure ? parsedStructure.inputComponents : [];
  $: displayComponents = parsedStructure ? parsedStructure.displayComponents : [];
  
  // Debug logging for input state changes
  $: {
    console.log(`🔍 inputState changed:`, inputState);
    console.log(`🔍 inputState.showCharts:`, inputState.showCharts);
  }
  
  // Handle input value changes
  function updateInputState(name, value) {
    console.log(`📝 LivePreview updating inputState["${name}"] from`, inputState[name], 'to', value);
    inputState = { ...inputState, [name]: value };
    console.log(`📊 New inputState:`, inputState);
    
    // Clear cache when inputs change to force fresh data
    clearCache();
  }
</script>

<div class="dashboard-wrapper">
  {#if parseError}
    <div class="error-message">
      <h3>Parse Error:</h3>
      <p>{parseError}</p>
    </div>
  {:else if parsedStructure && (inputComponents.length > 0 || displayComponents.length > 0)}
    <!-- Render input components first -->
    {#if inputComponents.length > 0}
      <div class="controls-bar">
        {#each inputComponents as component (component.type + component.attributes.name)}
          {#if component.type === 'Toggle'}
            <Toggle 
              name={component.attributes.name || ''}
              label={component.attributes.label || component.attributes.name || 'Toggle'}
              value={component.attributes.value || false}
              on:change={(e) => {
                console.log(`📥 LivePreview received change event for "${component.attributes.name}":`, e.detail);
                updateInputState(component.attributes.name, e.detail);
              }}
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
    <div class="charts-grid">
      {#if displayComponents.length > 0}
        
        <!-- Separate Grid and non-Grid components -->
        {@const gridComponent = displayComponents.find(c => c.type === 'Grid')}
        {@const gridChildren = displayComponents.filter(c => c.insideGrid)}
        {@const standaloneComponents = displayComponents.filter(c => c.type !== 'Grid' && !c.insideGrid)}
        
        <!-- Render standalone components first -->
        {#each standaloneComponents as component (component.type + Math.random())}
          {@const resolvedAttrs = resolveAttributes(component, inputState)}
          {@const shouldShow = shouldShowComponent(component, inputState)}
          {#if shouldShow}
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
  .dashboard-wrapper {
    width: 100%;
    min-height: 100%;
  }

  .controls-bar {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
  }

  .charts-grid {
    width: 100%;
  }

  .error-message {
    background: #fee2e2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .error-message h3 {
    color: #dc2626;
    margin: 0 0 0.5rem 0;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #6b7280;
  }

  .empty-state h3 {
    color: #374151;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  .example {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1.5rem;
    margin-top: 1.5rem;
    text-align: left;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .example h4 {
    color: #1f2937;
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
  }

  .example pre {
    color: #374151;
    margin: 0;
    font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
    font-size: 0.9rem;
    line-height: 1.5;
    background: white;
    padding: 1rem;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
    overflow-x: auto;
  }

  /* Responsive design */
  @media (max-width: 1200px) {
    .charts-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .controls-bar {
      gap: 1rem;
      padding: 1rem 0;
    }
    
    .chart-item {
      padding: 1rem;
    }
    
    .charts-grid {
      gap: 1rem;
    }
  }
</style>
