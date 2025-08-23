/**
 * Data Sources - Explicit data mapping for dashboard charts
 * This replaces hidden sample data with transparent, named datasets
 */

// Simple query cache - prevents duplicate requests
const queryCache = new Map();
const pendingQueries = new Map(); // Prevent concurrent duplicate requests

// OAuth proxy configuration
const OAUTH_PROXY_URL = 'http://localhost:4180';

/**
 * Fetch data from OAuth proxy using a SQL query
 */
export async function fetchFromSQL(query) {
  try {
    const response = await fetch(`${OAUTH_PROXY_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform the data into the format expected by charts
    const [xColumn, yColumn] = data.columns;
    const transformedData = data.results.map(row => ({
      [xColumn]: row[0],
      [yColumn.replace('()', '')]: row[1] // Remove () from count_star()
    }));
    
    return transformedData;
    
  } catch (error) {
    console.error('❌ Error fetching data from OAuth proxy:', error);
    return [];
  }
}

/**
 * Load and parse SQL file to extract named queries
 */
export async function loadSQLQueries(dashboardName) {
  try {
    const response = await fetch(`/dashboards/${dashboardName}/Overview.sql`);
    if (!response.ok) {
      throw new Error(`Failed to load SQL file: ${response.statusText}`);
    }
    
    const sqlContent = await response.text();
    return parseSQLQueries(sqlContent);
  } catch (error) {
    console.error('❌ Error loading SQL queries:', error);
    return {};
  }
}

/**
 * Parse SQL content to extract named queries
 */
function parseSQLQueries(sqlContent) {
  const queries = {};
  const lines = sqlContent.split('\n');
  let currentQuery = '';
  let currentName = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Check for query name comment: -- query_name
    if (trimmed.startsWith('--') && trimmed.length > 2) {
      // Save previous query if exists
      if (currentName && currentQuery.trim()) {
        queries[currentName] = currentQuery.trim();
      }
      // Start new query - extract name after --
      currentName = trimmed.substring(2).trim();
      currentQuery = '';
    } else if (currentName && trimmed && !trimmed.startsWith('--')) {
      // Add to current query
      currentQuery += line + '\n';
    }
  }
  
  // Save last query
  if (currentName && currentQuery.trim()) {
    queries[currentName] = currentQuery.trim();
  }
  
  return queries;
}

/**
 * Get data for a named source - either from SQL or static data
 */
export async function getDataSource(sourceName, dashboardName = null) {
  // Create cache key
  const cacheKey = dashboardName ? `${dashboardName}:${sourceName}` : sourceName;
  
  // Check cache first
  if (queryCache.has(cacheKey)) {
    console.log(`📦 Cache hit for ${cacheKey}`);
    return queryCache.get(cacheKey);
  }
  
  // Check if query is already pending
  if (pendingQueries.has(cacheKey)) {
    console.log(`⏳ Waiting for pending query ${cacheKey}`);
    return await pendingQueries.get(cacheKey);
  }
  
  // Create promise for this query
  const queryPromise = (async () => {
    try {
      // If sourceName matches a static data source, return it
      if (dataSources[sourceName]) {
        return dataSources[sourceName];
      }
      
      // Otherwise, try to load from SQL
      if (dashboardName) {
        const queries = await loadSQLQueries(dashboardName);
        
        if (queries[sourceName]) {
          console.log(`🔄 Executing SQL for ${cacheKey}`);
          return await fetchFromSQL(queries[sourceName]);
        }
      }
      
      // Fallback to empty array - no fake data
      return [];
    } finally {
      // Remove from pending queries when done
      pendingQueries.delete(cacheKey);
    }
  })();
  
  // Store the promise in pending queries
  pendingQueries.set(cacheKey, queryPromise);
  
  // Execute and cache result
  const result = await queryPromise;
  queryCache.set(cacheKey, result);
  return result;
}

export const dataSources = {
  // Sales dashboard data
  salesData: [
    { name: 'Jan', value: 820 },
    { name: 'Feb', value: 932 },
    { name: 'Mar', value: 901 },
    { name: 'Apr', value: 934 },
    { name: 'May', value: 1200 },
    { name: 'Jun', value: 1100 }
  ],

  productData: [
    { name: 'Product A', value: 120 },
    { name: 'Product B', value: 200 },
    { name: 'Product C', value: 150 },
    { name: 'Product D', value: 80 },
    { name: 'Product E', value: 90 }
  ],

  growthData: [
    { name: 'Q1', value: 150 },
    { name: 'Q2', value: 280 },
    { name: 'Q3', value: 220 },
    { name: 'Q4', value: 320 }
  ],

  marketData: [
    { name: 'Desktop', value: 1048 },
    { name: 'Mobile', value: 735 },
    { name: 'Tablet', value: 580 },
    { name: 'Other', value: 484 }
  ],

  regionData: [
    { name: 'North America', value: 450 },
    { name: 'Europe', value: 380 },
    { name: 'Asia Pacific', value: 290 },
    { name: 'Latin America', value: 120 }
  ],

  // Default fallback data
  defaultData: [
    { name: 'Sample 1', value: 100 },
    { name: 'Sample 2', value: 200 },
    { name: 'Sample 3', value: 150 }
  ]
};

/**
 * Get data for a given source name
 */
export function getSourceData(sourceName) {
  return dataSources[sourceName] || dataSources.defaultData;
}

/**
 * List all available data sources
 */
export function getAvailableSources() {
  return Object.keys(dataSources).filter(key => key !== 'defaultData');
}

/**
 * SQL Query equivalents (for documentation)
 * These show what the data sources represent in a real system
 */
export const sqlQueries = {
  salesData: `
    SELECT 
      DATE_FORMAT(date, '%b') as name,
      SUM(revenue) as value
    FROM sales_transactions 
    WHERE year = 2024 
    GROUP BY MONTH(date)
    ORDER BY date`,

  productData: `
    SELECT 
      product_name as name,
      SUM(quantity_sold) as value
    FROM product_sales 
    WHERE date >= '2024-01-01'
    GROUP BY product_name
    ORDER BY value DESC
    LIMIT 5`,

  growthData: `
    SELECT 
      CONCAT('Q', QUARTER(date)) as name,
      COUNT(DISTINCT user_id) as value
    FROM user_activity 
    WHERE year = 2024
    GROUP BY QUARTER(date)
    ORDER BY QUARTER(date)`,

  marketData: `
    SELECT 
      device_type as name,
      COUNT(*) as value
    FROM user_sessions 
    WHERE date >= '2024-01-01'
    GROUP BY device_type
    ORDER BY value DESC`
};

/**
 * Clear cache when inputs change
 */
export function clearCache(dashboardName = null) {
  if (dashboardName) {
    // Clear specific dashboard cache
    for (const [key] of queryCache) {
      if (key.startsWith(`${dashboardName}:`)) {
        queryCache.delete(key);
      }
    }
    for (const [key] of pendingQueries) {
      if (key.startsWith(`${dashboardName}:`)) {
        pendingQueries.delete(key);
      }
    }
    console.log(`🗑️ Cleared cache for ${dashboardName}`);
  } else {
    // Clear all cache
    queryCache.clear();
    pendingQueries.clear();
    console.log('🗑️ Cleared all cache');
  }
}
