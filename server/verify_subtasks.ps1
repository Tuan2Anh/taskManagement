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

# 1. Create Task first
$taskBody = @{
    title = "Task for Subtask"
    status = "Todo"
} | ConvertTo-Json

$task = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/tasks" -ContentType "application/json" -Headers $headers -Body $taskBody
Write-Host "Task Created: $($task._id)"

# 2. Create Subtask
$subtaskBody = @{
    title = "Subtask 1"
    status = "Todo"
} | ConvertTo-Json

$subtask = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/tasks/$($task._id)/subtasks" -ContentType "application/json" -Headers $headers -Body $subtaskBody
Write-Host "Subtask Created: $($subtask.title)"

# 3. Get Subtasks
$subtasks = Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/tasks/$($task._id)/subtasks" -Headers $headers
Write-Host "Subtasks Count: $($subtasks.Count)"

# 4. Update Subtask (Direct Route)
$updateBody = @{
    status = "Done"
} | ConvertTo-Json

$updatedSubtask = Invoke-RestMethod -Method Put -Uri "http://localhost:5000/api/subtasks/$($subtask._id)" -ContentType "application/json" -Headers $headers -Body $updateBody
Write-Host "Subtask Updated Status: $($updatedSubtask.status)"

# 5. Delete Subtask (Direct Route)
$deleteMsg = Invoke-RestMethod -Method Delete -Uri "http://localhost:5000/api/subtasks/$($subtask._id)" -Headers $headers
Write-Host "Subtask Deleted: $($deleteMsg.message)"
