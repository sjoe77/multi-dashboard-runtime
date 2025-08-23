/**
 * True Runtime Svelte Compilation System
 * Compiles Svelte code and creates executable components in the browser
 */

import { validateCode } from './componentRegistry.js';
import Chart from '../components/Chart.svelte';
import Grid from '../components/Grid.svelte';
import Filter from '../components/Filter.svelte';

// Component registry for runtime injection
const componentRegistry = {
  Chart,
  Grid,
  Filter
};

/**
 * Advanced preprocessor that injects imports and prepares code for runtime execution
 */
function preprocessSvelteCode(source) {
  // Extract script content to inject imports
  const scriptMatch = source.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  const scriptContent = scriptMatch ? scriptMatch[1] : '';
  
  // Build component imports
  const componentImports = Object.keys(componentRegistry)
    .map(name => `import ${name} from '${name}';`)
    .join('\n');
  
  // Inject imports at the beginning of script block
  const enhancedScript = `
${componentImports}

${scriptContent}
`;

  // Replace or add script block
  if (scriptMatch) {
    return source.replace(scriptMatch[0], `<script>\n${enhancedScript}\n</script>`);
  } else {
    return `<script>\n${enhancedScript}\n</script>\n${source}`;
  }
}

/**
 * Create a runtime module that can be executed in the browser
 */
function createRuntimeModule(compiledCode) {
  // Wrap the compiled code in a module factory
  const moduleFactory = new Function(
    'require',
    'exports', 
    'module',
    ...Object.keys(componentRegistry),
    `
    ${compiledCode}
    return module.exports;
    `
  );
  
  // Create mock module system
  const module = { exports: {} };
  const exports = module.exports;
  const require = (name) => {
    // Handle component imports
    if (componentRegistry[name]) {
      return componentRegistry[name];
    }
    throw new Error(`Module not found: ${name}`);
  };
  
  // Execute the module with injected components
  try {
    return moduleFactory(
      require, 
      exports, 
      module, 
      ...Object.values(componentRegistry)
    );
  } catch (error) {
    console.error('Runtime module execution failed:', error);
    throw error;
  }
}

/**
 * Compile Svelte code and return an executable component
 */
export async function compileToRuntimeComponent(source, filename = 'Dashboard.svelte') {
  // Validate security constraints
  const validation = validateCode(source);
  if (!validation.valid) {
    throw new Error(`Security violation: ${validation.error}`);
  }

  // Preprocess code to inject imports
  const preprocessedSource = preprocessSvelteCode(source);
  
  // Import Svelte compiler
  const svelte = await import('svelte/compiler');
  
  try {
    // Compile to JavaScript
    const { js, warnings } = svelte.compile(preprocessedSource, {
      generate: 'client',
      filename,
      dev: true
    });
    
    // Create executable runtime component
    const RuntimeComponent = createRuntimeModule(js.code);
    
    return {
      success: true,
      component: RuntimeComponent,
      warnings: warnings || [],
      preprocessedSource
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      component: null
    };
  }
}

/**
 * Fallback: Extract component properties for manual rendering
 */
export function parseComponentProps(source) {
  const props = {};
  
  // Parse Grid columns
  const gridMatch = source.match(/<Grid[^>]*columns={?(\d+)}?[^>]*>/);
  if (gridMatch) {
    props.gridColumns = parseInt(gridMatch[1]);
  }
  
  // Parse Chart components
  const chartMatches = source.match(/<Chart[^>]*>/g) || [];
  props.chartCount = chartMatches.length;
  
  // Parse Filter visibility
  const filterVisible = source.includes('<Filter') && !source.includes('{#if showFilters}false');
  props.showFilters = filterVisible;
  
  // Parse variables
  const showFiltersMatch = source.match(/showFilters\s*=\s*(true|false)/);
  if (showFiltersMatch) {
    props.showFilters = showFiltersMatch[1] === 'true';
  }
  
  return props;
}
