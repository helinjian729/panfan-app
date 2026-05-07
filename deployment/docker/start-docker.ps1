# ============================================
# 拼饭App 一键启动脚本 (Docker)
# ============================================

param(
    [ValidateSet("dev", "staging", "production")]
    [string]$Env = "dev",
    [ValidateSet("start", "stop", "restart", "logs", "status", "clean")]
    [string]$Action = "start"
)

$ErrorActionPreference = "Stop"
$PROJECT_ROOT = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
$DOCKER_DIR = Join-Path $PROJECT_ROOT "deployment\docker"

function Start-DevEnvironment {
    Write-Host "Starting 拼饭App 开发环境..." -ForegroundColor Cyan

    # Copy development env file
    $envFile = Join-Path $DOCKER_DIR ".env.development"
    $targetEnv = Join-Path $DOCKER_DIR ".env"

    if (Test-Path $envFile) {
        Copy-Item $envFile $targetEnv -Force
        Write-Host "环境配置已复制" -ForegroundColor Green
    }

    Set-Location $DOCKER_DIR

    # Build and start services
    Write-Host "构建Docker镜像..." -ForegroundColor Yellow
    docker-compose --env-file $targetEnv build

    Write-Host "启动服务..." -ForegroundColor Yellow
    docker-compose --env-file $targetEnv up -d

    # Wait for services
    Write-Host "等待服务就绪..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5

    # Show status
    Write-Host "`n服务状态:" -ForegroundColor Cyan
    docker-compose --env-file $targetEnv ps

    Write-Host "`n访问地址:" -ForegroundColor Cyan
    Write-Host "  开发API: http://localhost:3000"
    Write-Host "  Nginx: http://localhost:80"
    Write-Host "  API文档: http://localhost:3000/api/docs"
    Write-Host "  PostgreSQL: localhost:5432"
    Write-Host "  Redis: localhost:6379"
}

function Stop-Services {
    Set-Location $DOCKER_DIR
    docker-compose down
    Write-Host "服务已停止" -ForegroundColor Green
}

function Restart-Services {
    Set-Location $DOCKER_DIR
    docker-compose restart
    Write-Host "服务已重启" -ForegroundColor Green
}

function Show-Logs {
    Set-Location $DOCKER_DIR
    docker-compose logs -f
}

function Show-Status {
    Set-Location $DOCKER_DIR
    docker-compose ps
}

function Clean-Environment {
    Write-Host "清理Docker环境..." -ForegroundColor Yellow
    Set-Location $DOCKER_DIR

    docker-compose down -v --remove-orphans
    docker system prune -f

    Write-Host "清理完成" -ForegroundColor Green
}

# Main
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  拼饭App Docker 环境管理脚本" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

switch ($Action.ToLower()) {
    "start"  { Start-DevEnvironment }
    "stop"   { Stop-Services }
    "restart"{ Restart-Services }
    "logs"   { Show-Logs }
    "status" { Show-Status }
    "clean"  { Clean-Environment }
}

Write-Host "`n操作完成" -ForegroundColor Green