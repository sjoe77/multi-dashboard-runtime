/**
 * Data Sources - Explicit data mapping for dashboard charts
 * This replaces hidden sample data with transparent, named datasets
 */

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
