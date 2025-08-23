-- monthlySales
SELECT month, sales, target 
FROM sales_data 
WHERE year = 2024
ORDER BY month;

-- userGrowth  
SELECT month, users, new_users
FROM user_metrics
WHERE date >= '2024-01-01'
ORDER BY month;

-- marketShare
SELECT name, value, percentage
FROM market_analysis
WHERE quarter = 'Q4'
ORDER BY value DESC;
