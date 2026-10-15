$json = '{"text":"The artificial intelligence model demonstrated remarkable performance across all benchmark evaluations.","mode":"balanced"}'
$response = Invoke-WebRequest -Uri http://localhost:4000/v1/humanize -Method POST -Body $json -ContentType 'application/json' -UseBasicParsing
$response.Content
