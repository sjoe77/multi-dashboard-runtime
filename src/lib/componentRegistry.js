// Global component registry for dashboard authors
// Only these components are available in authored dashboards

import Chart from '../components/Chart.svelte';
import Grid from '../components/Grid.svelte';
import Filter from '../components/Filter.svelte';

export const globalComponents = {
  Chart,
  Grid,
  Filter
};

// Whitelist of allowed imports for security
export const allowedImports = [
  'Chart',
  'Grid', 
  'Filter'
];

export function validateCode(code) {
  // Check for disallowed patterns
  const disallowedPatterns = [
    /import\s+.*\s+from\s+['"][^'"]*['"]/g, // No custom imports
    /<script[^>]*src=/g, // No external scripts
    /eval\s*\(/g, // No eval
    /new\s+Function/g, // No Function constructor
    /window\./g, // No window access
    /document\./g, // No document access
  ];

  for (const pattern of disallowedPatterns) {
    if (pattern.test(code)) {
      return { valid: false, error: `Disallowed pattern found: ${pattern}` };
    }
  }

  return { valid: true };
}
