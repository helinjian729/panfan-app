#!/bin/bash
# ============================================
# 拼饭App 启动脚本 (Windows PowerShell)
# ============================================

# Windows-specific startup script using PowerShell

param(
    [string]$Action = "start"
)

$ErrorActionPreference = "Stop"

# Configuration
$PROJECT_ROOT = Split-Path -Parent $PSScriptRoot
$DOCKER_DIR = Join-Path $PROJECT_ROOT "deployment\docker"
$COMPOSE_FILE = Join-Path $DOCKER_DIR "docker-compose.yml"

Write-Host "=== 拼饭App 启动脚本 ===" -ForegroundColor Cyan

function Start-Services {
    Write-Host "正在启动服务..." -ForegroundColor Green

    Set-Location $DOCKER_DIR

    # Start services in detached mode
    docker-compose -f $COMPOSE_FILE up -d

    # Wait for health check
    Write-Host "等待服务就绪..." -ForegroundColor Yellow
    $maxRetries = 30
    $retry = 0

    while ($retry -lt $maxRetries) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Host "服务已就绪" -ForegroundColor Green
                break
            }
        } catch {
            Write-Host "." -NoNewline
        }
        Start-Sleep -Seconds 3
        $retry++
    }

    # Show status
    Write-Host "`n服务状态:" -ForegroundColor Cyan
    docker-compose -f $COMPOSE_FILE ps

    Write-Host "`n访问地址:" -ForegroundColor Cyan
    Write-Host "  API: http://localhost:3000"
    Write-Host "  Nginx: http://localhost:80"
    Write-Host "  API Docs: http://localhost:3000/api/docs"
}

function Stop-Services {
    Write-Host "正在停止服务..." -ForegroundColor Yellow

    Set-Location $DOCKER_DIR
    docker-compose -f $COMPOSE_FILE down

    Write-Host "服务已停止" -ForegroundColor Green
}

function Restart-Services {
    Write-Host "正在重启服务..." -ForegroundColor Yellow

    Set-Location $DOCKER_DIR
    docker-compose -f $COMPOSE_FILE restart

    Write-Host "服务已重启" -ForegroundColor Green
}

function Show-Logs {
    Write-Host "显示日志 (Ctrl+C 退出)..." -ForegroundColor Cyan

    Set-Location $DOCKER_DIR
    docker-compose -f $COMPOSE_FILE logs -f
}

function Show-Status {
    Set-Location $DOCKER_DIR
    docker-compose -f $COMPOSE_FILE ps
}

# Main
switch ($Action.ToLower()) {
    "start"  { Start-Services }
    "stop"   { Stop-Services }
    "restart"{ Restart-Services }
    "logs"   { Show-Logs }
    "status" { Show-Status }
    default  {
        Write-Host "用法: .\start.ps1 [-Action <start|stop|restart|logs|status>]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "示例:" -ForegroundColor Yellow
        Write-Host "  .\start.ps1 -Action start    # 启动服务"
        Write-Host "  .\start.ps1 -Action stop     # 停止服务"
        Write-Host "  .\start.ps1 -Action restart  # 重启服务"
        Write-Host "  .\start.ps1 -Action logs     # 查看日志"
        Write-Host "  .\start.ps1 -Action status   # 查看状态"
    }
}