$ErrorActionPreference = "Stop"

# Use previous token if available, else login
$token = $env:TOKEN
if (-not $token) {
    $loginBody = @{
        email = "test@example.com"
        password = "123456"
    } | ConvertTo-Json
    $loginResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -ContentType "application/json" -Body $loginBody
    $token = $loginResponse.token
}

$headers = @{
    Authorization = "Bearer $token"
}

# 1. Create Task (should generate log)
$taskBody = @{
    title = "Task for Comments & Logs"
    status = "Todo"
} | ConvertTo-Json

$task = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/tasks" -ContentType "application/json" -Headers $headers -Body $taskBody
Write-Host "Task Created: $($task._id)"

# 2. Add Comment (should generate log "ADDED_COMMENT")
$commentBody = @{
    content = "This is a test comment"
} | ConvertTo-Json

$comment = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/tasks/$($task._id)/comments" -ContentType "application/json" -Headers $headers -Body $commentBody
Write-Host "Comment Added: $($comment.content)"

# 3. Get Comments
$comments = Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/tasks/$($task._id)/comments" -Headers $headers
Write-Host "Comments Count: $($comments.Count)"

# 4. Update Task (should generate log)
$updateBody = @{
    status = "In Progress"
} | ConvertTo-Json

$updatedTask = Invoke-RestMethod -Method Put -Uri "http://localhost:5000/api/tasks/$($task._id)" -ContentType "application/json" -Headers $headers -Body $updateBody
Write-Host "Task Updated: $($updatedTask.status)"

# 5. Get Logs (Expecting: CREATED_TASK, ADDED_COMMENT, UPDATED_TASK)
$logs = Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/tasks/$($task._id)/logs" -Headers $headers
Write-Host "Logs Count: $($logs.Count)"
foreach ($log in $logs) {
    Write-Host "Log: $($log.action) - $($log.details)"
}
