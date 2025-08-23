-- systemPerformance
SELECT timestamp, cpu_usage, memory_usage, active_requests 
FROM system_metrics 
WHERE timestamp >= NOW() - INTERVAL 24 HOUR
ORDER BY timestamp;

-- errorRates
SELECT service_name, error_count, total_requests, error_rate
FROM service_errors
WHERE date = CURRENT_DATE
ORDER BY error_rate DESC;

-- alertsSummary
SELECT alert_type, count(*) as alert_count, severity
FROM system_alerts
WHERE status = 'active'
GROUP BY alert_type, severity
ORDER BY severity DESC;
