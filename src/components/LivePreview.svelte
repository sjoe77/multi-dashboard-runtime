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

  // Parse on code change
  $: {
    try {
      parseError = null;
      if (code && code.trim()) {
        parsedStructure = parseComponentStructure(code);
        if (parsedStructure.errors && parsedStructure.errors.length > 0) {
          parseError = parsedStructure.errors.join('; ');
        }
      } else {
        parsedStructure = null;
      }
    } catch (err) {
      console.error('Parsing error:', err);
      parseError = err.message;
      parsedStructure = null;
    }
  }

  // Helpers
  function resolveAttributes(component, inputState) {
    const resolved = {};
    for (const [key, value] of Object.entries(component.attributes || {})) {
      resolved[key] = resolveInputValues(value, inputState);
    }
    return resolved;
  }

  function shouldShowComponent(component, inputState) {
    if (component.conditional) {
      const c = component.conditional;
      if (typeof c === 'string' && c.startsWith('inputs.')) {
        const key = c.slice(7);
        return Boolean(inputState[key]);
      }
    }
    return true;
  }

  $: inputState = parsedStructure ? parsedStructure.inputState : {};
  $: inputComponents = parsedStructure ? parsedStructure.inputComponents : [];
  $: displayComponents = parsedStructure ? parsedStructure.displayComponents : [];

  function updateInputState(name, value) {
    inputState = { ...inputState, [name]: value };
    clearCache();
  }
</script>

<div class="preview-wrapper">
  {#if parseError}
    <div class="error-message">
      <h4>Parse Error</h4>
      <p>{parseError}</p>
    </div>
  {:else if parsedStructure && (inputComponents.length > 0 || displayComponents.length > 0)}
    {#if inputComponents.length > 0}
      <div class="controls-bar">
        {#each inputComponents as ic (ic.type + (ic.attributes?.name || ''))}
          {#if ic.type === 'Toggle'}
            <Toggle
              name={ic.attributes?.name || ''}
              label={ic.attributes?.label || ic.attributes?.name || 'Toggle'}
              value={inputState[ic.attributes?.name] ?? ic.attributes?.value ?? false}
              on:change={(e) => updateInputState(ic.attributes?.name, e.detail)}
            />
          {:else if ic.type === 'Dropdown'}
            <Dropdown
              name={ic.attributes?.name || ''}
              label={ic.attributes?.label || ic.attributes?.name || 'Dropdown'}
              options={ic.attributes?.options || 'Option 1,Option 2,Option 3'}
              value={inputState[ic.attributes?.name] ?? ic.attributes?.value ?? ''}
              on:change={(e) => updateInputState(ic.attributes?.name, e.detail)}
            />
          {/if}
        {/each}
      </div>
    {/if}

    <!-- Display components -->
    {@const gridComponent = displayComponents.find(c => c.type === 'Grid')}
    {@const gridChildren = displayComponents.filter(c => c.insideGrid)}
    {@const standaloneComponents = displayComponents.filter(c => c.type !== 'Grid' && !c.insideGrid)}

    <!-- Standalone components outside a grid -->
    <div class="standalone-grid">
      {#each standaloneComponents as c (c.type + Math.random())}
        {@const attrs = resolveAttributes(c, inputState)}
        {#if shouldShowComponent(c, inputState)}
          {#if c.type === 'BarChart'}
            <BarChart data={attrs.data || null} source={attrs.source || null} title={attrs.title || 'Bar Chart'} visible={attrs.visible !== 'false'} />
          {:else if c.type === 'LineChart'}
            <LineChart data={attrs.data || null} source={attrs.source || null} title={attrs.title || 'Line Chart'} visible={attrs.visible !== 'false'} />
          {:else if c.type === 'PieChart'}
            <PieChart data={attrs.data || null} source={attrs.source || null} title={attrs.title || 'Pie Chart'} visible={attrs.visible !== 'false'} />
          {:else if c.type === 'Filter'}
            <Filter label={attrs.title || attrs.label || 'Filter'} type={attrs.type || 'dropdown'} options={attrs.options || ['Option 1','Option 2','Option 3']} value={attrs.value || ''} />
          {/if}
        {/if}
      {/each}
    </div>

    {#if gridComponent && gridChildren.length > 0}
      {@const gattrs = resolveAttributes(gridComponent, inputState)}
      <Grid columns={parseInt(gattrs.cols || gattrs.columns || '3')}>
        {#each gridChildren as gc (gc.type + Math.random())}
          {@const attrs = resolveAttributes(gc, inputState)}
          {#if shouldShowComponent(gc, inputState)}
            {#if gc.type === 'BarChart'}
              <BarChart data={attrs.data || null} source={attrs.source || null} title={attrs.title || 'Bar Chart'} visible={attrs.visible !== 'false'} />
            {:else if gc.type === 'LineChart'}
              <LineChart data={attrs.data || null} source={attrs.source || null} title={attrs.title || 'Line Chart'} visible={attrs.visible !== 'false'} />
            {:else if gc.type === 'PieChart'}
              <PieChart data={attrs.data || null} source={attrs.source || null} title={attrs.title || 'Pie Chart'} visible={attrs.visible !== 'false'} />
            {:else if gc.type === 'Filter'}
              <Filter label={attrs.title || attrs.label || 'Filter'} type={attrs.type || 'dropdown'} options={attrs.options || ['Option 1','Option 2','Option 3']} value={attrs.value || ''} />
            {/if}
          {/if}
        {/each}
      </Grid>
    {/if}
  {:else}
    <div class="empty-state">
      <h4>Live Preview</h4>
      <p>Start typing Svelte markup for your dashboard. Inputs appear above; charts render below.</p>
    </div>
  {/if}
</div>

<style>
  .preview-wrapper { padding: 1rem; }

  .controls-bar {
    display: flex;
    gap: 0.75rem;
    padding-bottom: 0.75rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--outline-variant);
    flex-wrap: wrap;
    align-items: center;
  }

  .standalone-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 1rem;
  }

  .standalone-grid :global(> *) {
    grid-column: span 6;
  }

  @media (max-width: 1024px) {
    .standalone-grid :global(> *) { grid-column: span 12; }
  }

  .error-message {
    background: var(--error-container);
    color: var(--on-error-container);
    border: 1px solid var(--error);
    border-radius: 8px;
    padding: 1rem;
  }

  .empty-state { text-align: center; color: var(--on-surface-variant); padding: 2rem; }
</style>
