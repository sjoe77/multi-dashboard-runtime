/**
 * Security Validator for Dashboard Code
 * Enforces strict security policies for script blocks and imports
 */

// Whitelist of allowed variable types and patterns
const ALLOWED_VARIABLE_PATTERNS = {
  // Boolean flags for UI state
  boolean: /^(show|hide|visible|enabled|disabled|active|inactive)[A-Z][a-zA-Z]*$/,
  
  // Simple data arrays for charts
  chartData: /^[a-zA-Z]+Data$/,
  
  // Configuration objects
  config: /^[a-zA-Z]+Config$/,
  
  // Simple strings for titles/labels
  string: /^[a-zA-Z]+Title$|^[a-zA-Z]+Label$/,
  
  // Numbers for counts/values
  number: /^[a-zA-Z]+Count$|^[a-zA-Z]+Value$/
};

// Completely forbidden patterns
const FORBIDDEN_PATTERNS = [
  // Network requests
  /fetch|XMLHttpRequest|axios|request/i,
  
  // File system (Node.js)
  /require.*fs|import.*fs/i,
  
  // Code execution
  /eval|Function|setTimeout|setInterval/i,
  
  // DOM manipulation
  /document\.|window\.|localStorage|sessionStorage/i,
  
  // Process/system access
  /process\.|global\.|__dirname|__filename/i,
  
  // Dangerous imports
  /import.*child_process|import.*fs|import.*path|import.*os/i
];

// Only allow these specific imports
const ALLOWED_IMPORTS = new Set([
  // No imports allowed in dashboard code!
  // All components are auto-injected
]);

/**
 * Validate script block for security violations
 */
export function validateScriptBlock(scriptNode) {
  const violations = [];
  const allowedVariables = {};
  
  if (!scriptNode) {
    return { valid: true, violations: [], variables: {} };
  }
  
  // Convert script to string for pattern checking
  const scriptString = scriptNodeToString(scriptNode);
  
  // Check for forbidden patterns
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(scriptString)) {
      violations.push(`Forbidden pattern detected: ${pattern.source}`);
    }
  }
  
  // Check for imports (should be none)
  if (scriptString.includes('import ') || scriptString.includes('require(')) {
    violations.push('Imports not allowed in dashboard code');
  }
  
  // Validate variable declarations
  walkScriptForValidation(scriptNode, allowedVariables, violations);
  
  return {
    valid: violations.length === 0,
    violations,
    variables: allowedVariables
  };
}

/**
 * Walk script AST and validate each node
 */
function walkScriptForValidation(node, allowedVariables, violations) {
  if (!node) return;
  
  // Check variable declarations
  if (node.type === 'VariableDeclaration') {
    node.declarations?.forEach(declaration => {
      validateVariableDeclaration(declaration, allowedVariables, violations);
    });
  }
  
  // Check function declarations (not allowed)
  if (node.type === 'FunctionDeclaration') {
    violations.push('Function declarations not allowed');
  }
  
  // Check function calls
  if (node.type === 'CallExpression') {
    validateFunctionCall(node, violations);
  }
  
  // Recursively check child nodes
  for (const key in node) {
    if (typeof node[key] === 'object' && node[key] !== null) {
      if (Array.isArray(node[key])) {
        node[key].forEach(child => walkScriptForValidation(child, allowedVariables, violations));
      } else {
        walkScriptForValidation(node[key], allowedVariables, violations);
      }
    }
  }
}

/**
 * Validate individual variable declaration
 */
function validateVariableDeclaration(declaration, allowedVariables, violations) {
  if (!declaration.id?.name || !declaration.init) return;
  
  const varName = declaration.id.name;
  
  // Check if variable name matches allowed patterns
  const isAllowedName = Object.values(ALLOWED_VARIABLE_PATTERNS).some(pattern => 
    pattern.test(varName)
  );
  
  if (!isAllowedName) {
    violations.push(`Variable name '${varName}' doesn't match allowed patterns`);
    return;
  }
  
  // Validate variable value
  const varValue = extractSafeValue(declaration.init, violations);
  if (varValue !== undefined) {
    allowedVariables[varName] = varValue;
  }
}

/**
 * Extract value only if it's a safe literal
 */
function extractSafeValue(initNode, violations) {
  // Only allow literal values
  if (initNode.type === 'Literal') {
    const value = initNode.value;
    
    // Check value constraints
    if (typeof value === 'string' && value.length > 100) {
      violations.push('String values must be under 100 characters');
      return undefined;
    }
    
    if (typeof value === 'number' && (value < -1000000 || value > 1000000)) {
      violations.push('Number values must be reasonable (-1M to 1M)');
      return undefined;
    }
    
    return value;
  }
  
  // Allow simple boolean identifiers
  if (initNode.type === 'Identifier') {
    if (initNode.name === 'true') return true;
    if (initNode.name === 'false') return false;
  }
  
  // Allow simple arrays with literal values
  if (initNode.type === 'ArrayExpression') {
    if (initNode.elements.length > 100) {
      violations.push('Arrays must have fewer than 100 elements');
      return undefined;
    }
    
    const arrayValues = [];
    for (const element of initNode.elements) {
      const elementValue = extractSafeValue(element, violations);
      if (elementValue === undefined && element !== null) {
        violations.push('Array contains non-literal values');
        return undefined;
      }
      arrayValues.push(elementValue);
    }
    return arrayValues;
  }
  
  // Allow simple objects with literal properties
  if (initNode.type === 'ObjectExpression') {
    if (initNode.properties.length > 20) {
      violations.push('Objects must have fewer than 20 properties');
      return undefined;
    }
    
    const obj = {};
    for (const prop of initNode.properties) {
      if (prop.type !== 'Property' || !prop.key || !prop.value) {
        violations.push('Complex object structures not allowed');
        return undefined;
      }
      
      const key = prop.key.name || prop.key.value;
      const value = extractSafeValue(prop.value, violations);
      
      if (value === undefined) {
        violations.push('Object contains non-literal values');
        return undefined;
      }
      
      obj[key] = value;
    }
    return obj;
  }
  
  violations.push(`Variable initialization type '${initNode.type}' not allowed`);
  return undefined;
}

/**
 * Validate function calls (very restrictive)
 */
function validateFunctionCall(callNode, violations) {
  // Only allow a very limited set of safe function calls
  const allowedFunctions = new Set([
    // Math functions
    'Math.round', 'Math.floor', 'Math.ceil', 'Math.max', 'Math.min'
  ]);
  
  const functionName = getFunctionName(callNode);
  if (!allowedFunctions.has(functionName)) {
    violations.push(`Function call '${functionName}' not allowed`);
  }
}

/**
 * Get function name from call expression
 */
function getFunctionName(callNode) {
  if (callNode.callee.type === 'Identifier') {
    return callNode.callee.name;
  }
  
  if (callNode.callee.type === 'MemberExpression') {
    const object = callNode.callee.object.name || 'unknown';
    const property = callNode.callee.property.name || 'unknown';
    return `${object}.${property}`;
  }
  
  return 'unknown';
}

/**
 * Convert script node to string for pattern matching
 */
function scriptNodeToString(node) {
  // This is a simplified conversion - in practice you'd want
  // a proper AST-to-string converter
  return JSON.stringify(node);
}

/**
 * Safe examples that would pass validation
 */
export const SAFE_EXAMPLES = {
  allowedVariables: `
<script>
  let showFilters = true;
  let chartData = [
    { name: 'Jan', value: 120 },
    { name: 'Feb', value: 200 }
  ];
  let salesTitle = 'Monthly Sales';
  let maxCount = 100;
</script>`,

  forbiddenCode: `
<script>
  // ❌ Network request
  fetch('/api/admin');
  
  // ❌ Code execution  
  eval(userCode);
  
  // ❌ DOM manipulation
  document.body.innerHTML = html;
  
  // ❌ Imports
  import fs from 'fs';
  
  // ❌ Bad variable names
  let hackTheSystem = true;
</script>`
};
