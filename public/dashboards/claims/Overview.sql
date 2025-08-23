-- claims_by_status
SELECT status, count(*) as count
FROM my_ducklake.main.claims 
GROUP BY status
