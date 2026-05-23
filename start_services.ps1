# start_services.ps1
# Script to start all IRCTC microservices in the background with output redirection to log files

$workspaceRoot = "c:\Users\Admin\SourceCode\MyTicket-Booking-System"
$mvnPath = "$workspaceRoot\maven\apache-maven-3.9.6\bin\mvn.cmd"
$logsDir = "$workspaceRoot\logs"

# 1. Create logs directory if it doesn't exist
if (-not (Test-Path -Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir | Out-Null
    Write-Host "Created logs directory: $logsDir"
}

# 2. Stop any existing processes running on the microservice ports to prevent PortAlreadyInUseException
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
# Also kill any stale java processes
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Helper to start a service in a detached cmd window
function Start-ServiceProcess {
    param(
        [string]$ServiceName,
        [string]$Folder,
        [int]$DelaySeconds
    )
    Write-Host "Starting $ServiceName..."
    $serviceDir = "$workspaceRoot\$Folder"
    $stdoutLog = "$logsDir\$ServiceName.log"

    # Use cmd /c to launch mvn in a new detached window so it survives after this script exits
    $cmdArgs = "/c title $ServiceName && `"$mvnPath`" spring-boot:run > `"$stdoutLog`" 2>&1"
    Start-Process -FilePath "cmd.exe" -ArgumentList $cmdArgs -WorkingDirectory $serviceDir -WindowStyle Minimized

    Write-Host "Waiting $DelaySeconds seconds for $ServiceName to initialize..."
    Start-Sleep -Seconds $DelaySeconds
}

# 3. Start Discovery Server (Port 8761)
Start-ServiceProcess -ServiceName "discovery-server" -Folder "discovery-server" -DelaySeconds 20

# 4. Start API Gateway (Port 8080)
Start-ServiceProcess -ServiceName "api-gateway" -Folder "api-gateway" -DelaySeconds 15

# 5. Start User Service (Port 8081)
Start-ServiceProcess -ServiceName "user-service" -Folder "user-service" -DelaySeconds 15

# 6. Start Train Service (Port 8082)
Start-ServiceProcess -ServiceName "train-service" -Folder "train-service" -DelaySeconds 15

# 7. Start Booking Service (Port 8083)
Start-ServiceProcess -ServiceName "booking-service" -Folder "booking-service" -DelaySeconds 15

# 8. Start Payment Service (Port 8084)
Start-ServiceProcess -ServiceName "payment-service" -Folder "payment-service" -DelaySeconds 35

Write-Host "All services started!"
Write-Host "Checking service ports status..."
foreach ($port in $ports) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
        Write-Host "Port $port is LISTENING (Process ID: $(($conn | Select-Object -First 1).OwningProcess))"
    } else {
        Write-Host "Port $port is NOT listening! Check logs at: $logsDir\<service>.log"
    }
}
