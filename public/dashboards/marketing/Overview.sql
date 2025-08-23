-- campaignPerformance
SELECT campaign_name, conversions, cost, roi 
FROM marketing_campaigns 
WHERE quarter = 'Q4-2024'
ORDER BY conversions DESC;

-- channelDistribution
SELECT channel, percentage, budget_allocated
FROM marketing_channels
WHERE active = true
ORDER BY percentage DESC;

-- monthlySpend
SELECT month, total_spend, total_conversions, avg_cpc
FROM marketing_monthly
WHERE year = 2024
ORDER BY month;
