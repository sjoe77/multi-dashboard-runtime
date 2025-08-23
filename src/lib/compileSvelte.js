import { validateCode, globalComponents } from './componentRegistry.js';

export async function compileSvelte(source, filename = 'Dashboard.svelte') {
  // Validate code against security constraints
  const validation = validateCode(source);
  if (!validation.valid) {
    throw new Error(`Security violation: ${validation.error}`);
  }

  // Inject global component imports at the top of script block
  const injectedSource = injectGlobalComponents(source);

  const svelte = await import('svelte/compiler');
  
  try {
    const { js, warnings } = svelte.compile(injectedSource, { 
      generate: 'client',
      filename,
      dev: true
    });
    
    return { 
      code: js.code, 
      warnings: warnings || [],
      success: true 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      code: null 
    };
  }
}

function injectGlobalComponents(source) {
  // Auto-inject global component imports so authors don't need to write them
  const imports = `import Chart from '../components/Chart.svelte';
import Grid from '../components/Grid.svelte';
import Filter from '../components/Filter.svelte';
`;
  
  // Insert imports after opening <script> tag
  return source.replace(/(<script[^>]*>)/, `$1\n${imports}`);
}
