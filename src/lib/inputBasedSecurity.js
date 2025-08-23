/**
 * Input-Based Dashboard System
 * Secure parameter handling using input components (Evidence.dev pattern)
 */

// Input component types that generate parameters
export const INPUT_COMPONENTS = {
  Toggle: {
    props: ['name', 'label', 'value'],
    generates: 'boolean',
    example: '<Toggle name="showFilters" label="Show Filters" value="true" />'
  },
  
  Dropdown: {
    props: ['name', 'label', 'options', 'value'],
    generates: 'string',
    example: '<Dropdown name="region" options="North,South,East,West" value="North" />'
  },
  
  DateRange: {
    props: ['name', 'label', 'start', 'end'],
    generates: 'object',
    example: '<DateRange name="dateRange" start="2024-01-01" end="2024-12-31" />'
  },
  
  TextInput: {
    props: ['name', 'label', 'value', 'placeholder'],
    generates: 'string',
    example: '<TextInput name="searchTerm" label="Search" placeholder="Enter keywords" />'
  },
  
  NumberInput: {
    props: ['name', 'label', 'value', 'min', 'max'],
    generates: 'number',
    example: '<NumberInput name="threshold" label="Threshold" value="100" min="0" max="1000" />'
  },
  
  RadioGroup: {
    props: ['name', 'label', 'options', 'value'],
    generates: 'string',
    example: '<RadioGroup name="chartType" options="bar,line,pie" value="bar" />'
  }
};

// Display components that consume parameters
export const DISPLAY_COMPONENTS = {
  Chart: {
    props: ['type', 'title', 'source', 'visible', 'filter'],
    consumes: ['inputs.*'],
    example: '<Chart type="bar" source="sales" visible="{inputs.showCharts}" filter="region={inputs.region}" />'
  },
  
  Grid: {
    props: ['cols', 'rows', 'visible'],
    consumes: ['inputs.*'],
    example: '<Grid cols="{inputs.columnCount || 3}" />'
  },
  
  Filter: {
    props: ['title', 'visible'],
    consumes: ['inputs.*'],
    example: '<Filter title="Filters" visible="{inputs.showFilters}" />'
  }
};

/**
 * Parse input references in component attributes
 */
export function parseInputReferences(attributeValue) {
  if (typeof attributeValue !== 'string') return { hasInputs: false, value: attributeValue };
  
  // Match {inputs.paramName} patterns
  const inputPattern = /\{inputs\.([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
  const matches = [...attributeValue.matchAll(inputPattern)];
  
  if (matches.length === 0) {
    return { hasInputs: false, value: attributeValue };
  }
  
  return {
    hasInputs: true,
    value: attributeValue,
    inputRefs: matches.map(match => ({
      fullMatch: match[0],
      paramName: match[1]
    }))
  };
}

/**
 * Resolve input values in component attributes
 */
export function resolveInputValues(attributeValue, inputState) {
  const parsed = parseInputReferences(attributeValue);
  
  if (!parsed.hasInputs) {
    return attributeValue;
  }
  
  let resolved = parsed.value;
  
  for (const ref of parsed.inputRefs) {
    const value = inputState[ref.paramName];
    
    // Handle different value types
    let replacementValue;
    if (typeof value === 'boolean') {
      replacementValue = value.toString();
    } else if (typeof value === 'object' && value !== null) {
      replacementValue = JSON.stringify(value);
    } else {
      replacementValue = String(value || '');
    }
    
    resolved = resolved.replace(ref.fullMatch, replacementValue);
  }
  
  return resolved;
}

/**
 * Validate that input references are secure
 */
export function validateInputReferences(attributeValue) {
  const violations = [];
  
  if (typeof attributeValue !== 'string') return violations;
  
  // Only allow {inputs.paramName} pattern
  const validInputPattern = /^\{inputs\.[a-zA-Z_][a-zA-Z0-9_]*\}$/;
  const invalidPatterns = [
    /\{[^}]*\beval\b[^}]*\}/i,           // eval() calls
    /\{[^}]*\bfetch\b[^}]*\}/i,         // fetch() calls
    /\{[^}]*\bdocument\b[^}]*\}/i,      // DOM access
    /\{[^}]*\bwindow\b[^}]*\}/i,        // window access
    /\{[^}]*\bprocess\b[^}]*\}/i,       // process access
  ];
  
  // Check for dangerous patterns
  for (const pattern of invalidPatterns) {
    if (pattern.test(attributeValue)) {
      violations.push(`Dangerous expression pattern detected: ${pattern.source}`);
    }
  }
  
  // Extract all {} expressions
  const expressions = attributeValue.match(/\{[^}]+\}/g) || [];
  
  for (const expr of expressions) {
    // Must be simple input reference
    if (!expr.startsWith('{inputs.') || !expr.match(/^\{inputs\.[a-zA-Z_][a-zA-Z0-9_]*\}$/)) {
      violations.push(`Invalid expression: ${expr}. Only {inputs.paramName} allowed.`);
    }
  }
  
  return violations;
}

/**
 * Safe examples of the input-based approach
 */
export const SECURE_EXAMPLES = {
  inputComponents: `
<!-- Input components generate parameters -->
<Toggle name="showFilters" label="Show Filters" value="true" />
<Dropdown name="region" options="North,South,East,West" value="North" />
<DateRange name="dateRange" start="2024-01-01" end="2024-12-31" />
<NumberInput name="threshold" label="Threshold" value="100" min="0" max="1000" />`,

  displayComponents: `
<!-- Display components consume parameters -->
<Grid cols="3" visible="{inputs.showFilters}">
  <Chart 
    type="bar" 
    title="Sales by Region"
    source="sales"
    filter="region={inputs.region} AND value >= {inputs.threshold}"
  />
  
  <Chart 
    type="line"
    title="Trends"
    source="trends"
    visible="{inputs.showTrends}"
  />
</Grid>`,

  secureFiltering: `
<!-- SQL query uses input parameters -->
SELECT date, region, sales 
FROM sales_data 
WHERE date >= '{inputs.dateRange.start}'
  AND date <= '{inputs.dateRange.end}'
  AND region = '{inputs.region}'
  AND sales >= {inputs.threshold}
ORDER BY date`,

  forbiddenExpressions: `
<!-- ❌ These would be blocked -->
<Chart visible="{eval(userCode)}" />           <!-- Code execution -->
<Chart title="{fetch('/admin')}" />           <!-- Network access -->
<Chart data="{document.body.innerHTML}" />    <!-- DOM access -->
<Chart filter="{window.adminToken}" />        <!-- Global access -->
`
};

/**
 * Initialize input state from component definitions
 */
export function initializeInputState(components) {
  const inputState = {};
  
  for (const component of components) {
    if (INPUT_COMPONENTS[component.type]) {
      const name = component.attributes.name;
      const value = component.attributes.value;
      
      if (name && value !== undefined) {
        // Parse value based on component type
        const componentDef = INPUT_COMPONENTS[component.type];
        switch (componentDef.generates) {
          case 'boolean':
            inputState[name] = value === 'true' || value === true;
            break;
          case 'number':
            inputState[name] = parseFloat(value) || 0;
            break;
          case 'object':
            try {
              inputState[name] = typeof value === 'string' ? JSON.parse(value) : value;
            } catch {
              inputState[name] = {};
            }
            break;
          default:
            inputState[name] = String(value);
        }
      }
    }
  }
  
  return inputState;
}
