$ErrorActionPreference = "Stop"

# 1. Login to get Token
$loginBody = @{
    email = "test@example.com"
    password = "123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -ContentType "application/json" -Body $loginBody
    $token = $loginResponse.token
    Write-Host "Login Successful. Token received."
} catch {
    Write-Error "Login failed: $_"
}

$headers = @{
    Authorization = "Bearer $token"
}

# 2. Create Task
$taskBody = @{
    title = "Test Task"
    description = "This is a test task"
    status = "Todo"
    priority = "High"
} | ConvertTo-Json

try {
    $task = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/tasks" -ContentType "application/json" -Headers $headers -Body $taskBody
    Write-Host "Task Created: $($task._id)"
} catch {
    Write-Error "Create Task failed: $_"
}

# 3. Get Tasks
try {
    $tasks = Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/tasks" -Headers $headers
    Write-Host "Tasks Retrieved: $($tasks.totalTasks)"
} catch {
    Write-Error "Get Tasks failed: $_"
}

# 4. Update Task
$updateBody = @{
    status = "In Progress"
} | ConvertTo-Json

try {
    $updatedTask = Invoke-RestMethod -Method Put -Uri "http://localhost:5000/api/tasks/$($task._id)" -ContentType "application/json" -Headers $headers -Body $updateBody
    Write-Host "Task Updated: $($updatedTask.status)"
} catch {
    Write-Error "Update Task failed: $_"
}

# 5. Delete Task (Soft Delete)
try {
    $deleteResponse = Invoke-RestMethod -Method Delete -Uri "http://localhost:5000/api/tasks/$($task._id)" -Headers $headers
    Write-Host "Task Deleted: $($deleteResponse.message)"
} catch {
    Write-Error "Delete Task failed: $_"
}
