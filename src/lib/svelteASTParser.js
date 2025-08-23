/**
 * SECURE Svelte AST Parser - Input-Based Security Model
 * Parses markup-only Svelte components with input parameter system
 * NO SCRIPT BLOCKS ALLOWED
 */

import * as svelte from 'svelte/compiler';
import { validateInputReferences, initializeInputState, INPUT_COMPONENTS, DISPLAY_COMPONENTS } from './inputBasedSecurity.js';

/**
 * Parse Svelte code into a proper AST and extract component structure
 * SECURITY: NO SCRIPT BLOCKS ALLOWED
 */
export function parseComponentStructure(source) {
  try {
    // Parse the Svelte code into an AST
    const ast = svelte.parse(source);
    
    const structure = {
      inputComponents: [],
      displayComponents: [],
      inputState: {},
      errors: []
    };
    
    // SECURITY CHECK: Reject any script blocks
    if (ast.instance || ast.module) {
      structure.errors.push('Script blocks not allowed. Use input components for parameters.');
      return structure;
    }
    
    // Walk the HTML AST to find components
    if (ast.html) {
      walkAST(ast.html, structure);
    }
    
    // Initialize input state from input components
    structure.inputState = initializeInputState(structure.inputComponents);
    
    return structure;
    
  } catch (error) {
    return {
      inputComponents: [],
      displayComponents: [],
      inputState: {},
      errors: [error.message]
    };
  }
}

/**
 * Extract variables from the script block AST
 */
function extractScriptVariables(scriptNode) {
  const variables = {};
  
  // Walk through script AST to find variable declarations
  function walkScript(node) {
    if (!node) return;
    
    if (node.type === 'VariableDeclaration') {
      node.declarations?.forEach(declaration => {
        if (declaration.id?.name && declaration.init) {
          const varName = declaration.id.name;
          
          // Extract literal values
          if (declaration.init.type === 'Literal') {
            variables[varName] = declaration.init.value;
          }
          // Extract boolean values
          else if (declaration.init.type === 'Identifier') {
            if (declaration.init.name === 'true') variables[varName] = true;
            if (declaration.init.name === 'false') variables[varName] = false;
          }
        }
      });
    }
    
    // Recursively walk child nodes
    for (const key in node) {
      if (typeof node[key] === 'object' && node[key] !== null) {
        if (Array.isArray(node[key])) {
          node[key].forEach(walkScript);
        } else {
          walkScript(node[key]);
        }
      }
    }
  }
  
  walkScript(scriptNode);
  return variables;
}

/**
 * Walk the HTML AST to find input and display components
 */
function walkAST(node, structure, parentComponent = null) {
  if (!node) return;
  
  // Handle element nodes (components)
  if (node.type === 'InlineComponent' || node.type === 'Element') {
    const componentName = node.name;
    const attributes = parseAttributes(node.attributes || []);
    
    // Validate any input references in attributes
    for (const [key, value] of Object.entries(attributes)) {
      const violations = validateInputReferences(value);
      if (violations.length > 0) {
        structure.errors.push(...violations);
      }
    }
    
    const component = {
      type: componentName,
      attributes,
      parent: parentComponent,
      children: []
    };
    
    // Handle Grid specially - it's a layout component that contains others
    if (componentName === 'Grid') {
      component.isContainer = true;
      structure.displayComponents.push(component);
      
      // Parse Grid children and mark them as inside grid
      if (node.children) {
        node.children.forEach(child => {
          walkAST(child, structure, 'Grid');
        });
      }
      return; // Don't process Grid children again
    }
    
    // Categorize component
    if (INPUT_COMPONENTS[componentName]) {
      structure.inputComponents.push(component);
    } else if (DISPLAY_COMPONENTS[componentName] || ['BarChart', 'LineChart', 'PieChart'].includes(componentName)) {
      // Mark if inside Grid
      if (parentComponent === 'Grid') {
        component.insideGrid = true;
      }
      structure.displayComponents.push(component);
    } else {
      structure.errors.push(`Unknown component: ${componentName}`);
    }
    
    // Handle nested components (but not for Grid since we handled that above)
    if (componentName !== 'Grid' && node.children) {
      node.children.forEach(child => {
        walkAST(child, structure, componentName);
      });
    }
  }
  
  // Handle conditional blocks (check for input references)
  else if (node.type === 'IfBlock') {
    const condition = parseCondition(node.expression);
    
    if (condition && condition.inputRef) {
      const violations = validateInputReferences(condition.inputRef);
      structure.errors.push(...violations);
    }
    
    // Walk the conditional children
    if (node.children) {
      node.children.forEach(child => {
        walkAST(child, structure, parentComponent);
      });
    }
  }
  
  // Handle other block types and continue walking
  else if (node.children) {
    node.children.forEach(child => {
      walkAST(child, structure, parentComponent);
    });
  }
}

/**
 * Parse Grid component attributes
 */
function parseGridComponent(node) {
  const attributes = parseAttributes(node.attributes || []);
  
  let columns = 2; // default
  
  // Look for columns or cols attribute
  if (attributes.columns !== undefined) {
    columns = parseInt(attributes.columns) || 2;
  } else if (attributes.cols !== undefined) {
    columns = parseInt(attributes.cols) || 2;
  }
  
  return { columns };
}

/**
 * Parse component attributes from AST
 */
function parseAttributes(attributeNodes) {
  const attributes = {};
  
  attributeNodes.forEach(attr => {
    const name = attr.name;
    
    if (attr.value === true) {
      // Boolean attribute
      attributes[name] = true;
    } else if (attr.value && attr.value.length > 0) {
      const value = attr.value[0];
      
      if (value.type === 'Text') {
        // String value
        attributes[name] = value.data;
      } else if (value.type === 'MustacheTag') {
        // Expression value - handle different types
        const expr = value.expression;
        
        if (expr.type === 'Literal') {
          attributes[name] = expr.value;
        } else if (expr.type === 'Identifier') {
          attributes[name] = expr.name;
        } else if (expr.type === 'ArrayExpression') {
          // Handle array data like [{month:"Jan", sales:100}]
          console.log('Parsing ArrayExpression for', name);
          attributes[name] = parseArrayExpression(expr);
        } else if (expr.type === 'ObjectExpression') {
          // Handle object data
          console.log('Parsing ObjectExpression for', name);
          attributes[name] = parseObjectExpression(expr);
        } else {
          console.log('Unhandled expression type:', expr.type, 'for attribute', name);
          attributes[name] = null;
        }
      }
    }
  });
  
  return attributes;
}

/**
 * Parse array expression from AST into actual JavaScript array
 */
function parseArrayExpression(expr) {
  return expr.elements.map(element => {
    if (element.type === 'ObjectExpression') {
      return parseObjectExpression(element);
    } else if (element.type === 'Literal') {
      return element.value;
    } else {
      console.log('Unhandled array element type:', element.type);
      return null;
    }
  });
}

/**
 * Parse object expression from AST into actual JavaScript object
 */
function parseObjectExpression(expr) {
  const obj = {};
  expr.properties.forEach(prop => {
    if (prop.type === 'Property') {
      const key = prop.key.type === 'Identifier' ? prop.key.name : prop.key.value;
      if (prop.value.type === 'Literal') {
        obj[key] = prop.value.value;
      } else if (prop.value.type === 'Identifier') {
        obj[key] = prop.value.name;
      } else {
        console.log('Unhandled object property value type:', prop.value.type);
        obj[key] = null;
      }
    }
  });
  return obj;
}

/**
 * Parse conditional expression
 */
function parseCondition(expression) {
  if (!expression) return null;
  
  if (expression.type === 'Identifier') {
    return {
      type: 'variable',
      name: expression.name
    };
  }
  
  return {
    type: 'expression',
    raw: expression
  };
}

/**
 * Render components based on parsed structure
 */
export function renderParsedStructure(structure) {
  // Apply variable conditions
  const visibleComponents = structure.components.filter(component => {
    if (!component.conditional) return true;
    
    if (component.conditional.type === 'variable') {
      const varName = component.conditional.name;
      const varValue = structure.variables[varName];
      return varValue !== false; // Show by default unless explicitly false
    }
    
    return true;
  });
  
  // Separate grid and non-grid components
  const gridComponents = visibleComponents.filter(c => c.position === 'inside-grid');
  const outsideComponents = visibleComponents.filter(c => c.position === 'outside-grid');
  
  return {
    gridColumns: structure.gridColumns,
    gridComponents,
    outsideComponents,
    hasGrid: gridComponents.length > 0,
    variables: structure.variables,
    errors: structure.errors
  };
}
