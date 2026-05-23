# start_and_test.ps1
# Script to start all microservices, wait for them to become healthy, run the Postman collection test suite, and print results.

$workspaceRoot = "c:\Users\Admin\SourceCode\MyTicket-Booking-System"
$mvnPath = "$workspaceRoot\maven\apache-maven-3.9.6\bin\mvn.cmd"
$logsDir = "$workspaceRoot\logs"

# 1. Create logs directory
if (-not (Test-Path -Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir | Out-Null
}

# 2. Stop any existing processes on the target ports
Write-Host "Stopping any existing microservice processes..."
$ports = 8761, 8080, 8081, 8082, 8083, 8084
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    foreach ($connection in $connections) {
        if ($connection.OwningProcess) {
            Write-Host "Stopping process $($connection.OwningProcess) on port $port"
            Stop-Process -Id $connection.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
}

# Initialize processes array
$global:processes = @()

# Helper to start a service
function Start-ServiceProcess {
    param(
        [string]$ServiceName,
        [string]$Folder,
        [int]$DelaySeconds
    )
    Write-Host "Starting $ServiceName..."
    $serviceDir = "$workspaceRoot\$Folder"
    $stdoutLog = "$logsDir\$ServiceName.log"
    $stderrLog = "$logsDir\$ServiceName-error.log"
    
    $proc = Start-Process -FilePath $mvnPath -ArgumentList "spring-boot:run" -WorkingDirectory $serviceDir -RedirectStandardOutput $stdoutLog -RedirectStandardError $stderrLog -WindowStyle Hidden -PassThru
    
    # Track process ID so we can stop it later
    $global:processes += $proc
    
    Write-Host "Waiting $DelaySeconds seconds for $ServiceName to initialize..."
    Start-Sleep -Seconds $DelaySeconds
}

# 3. Start Discovery Server (Port 8761)
Start-ServiceProcess -ServiceName "discovery-server" -Folder "discovery-server" -DelaySeconds 15

# 4. Start API Gateway (Port 8080)
Start-ServiceProcess -ServiceName "api-gateway" -Folder "api-gateway" -DelaySeconds 15

# 5. Start User Service (Port 8081)
Start-ServiceProcess -ServiceName "user-service" -Folder "user-service" -DelaySeconds 12

# 6. Start Train Service (Port 8082)
Start-ServiceProcess -ServiceName "train-service" -Folder "train-service" -DelaySeconds 12

# 7. Start Booking Service (Port 8083)
Start-ServiceProcess -ServiceName "booking-service" -Folder "booking-service" -DelaySeconds 12

# 8. Start Payment Service (Port 8084)
Start-ServiceProcess -ServiceName "payment-service" -Folder "payment-service" -DelaySeconds 30

Write-Host "All services started!"
Write-Host "Checking service ports status..."
foreach ($port in $ports) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
        Write-Host "Port $port is LISTENING (Process ID: $(($conn | Select-Object -First 1).OwningProcess))"
    } else {
        Write-Host "Port $port is NOT listening! Check error logs at: $logsDir"
    }
}

# Wait extra 45 seconds for routing tables to warm up
Write-Host "Waiting 45 seconds for Eureka registry propagation..."
Start-Sleep -Seconds 45

# 9. Execute test suite
Write-Host "========================================="
Write-Host "Running IRCTC Postman Collection Test Suite"
Write-Host "========================================="
powershell -ExecutionPolicy Bypass -File "$workspaceRoot\test_postman_collection.ps1"

# 10. Clean up all started processes
Write-Host "Cleaning up microservice processes..."
foreach ($proc in $global:processes) {
    if ($proc -and -not $proc.HasExited) {
        Write-Host "Stopping process ID $($proc.Id) ($($proc.ProcessName))"
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
}

# Clean up by ports as well to be absolutely sure
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    foreach ($connection in $connections) {
        if ($connection.OwningProcess) {
            Write-Host "Stopping residual process $($connection.OwningProcess) on port $port"
            Stop-Process -Id $connection.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
}
Write-Host "Cleanup complete."
