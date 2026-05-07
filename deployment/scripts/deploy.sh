#!/bin/bash
# ============================================
# 拼饭App 后端部署脚本
# ============================================

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="panfan"
PROJECT_DIR="/app/panfan"
BACKUP_DIR="/app/panfan/backups"
DOCKER_COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env.production"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root or with sudo
check_permission() {
    if [ "$EUID" -ne 0 ]; then
        log_warn "Not running as root. Some operations may fail."
    fi
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    command -v docker >/dev/null 2>&1 || { log_error "Docker is required but not installed."; exit 1; }
    command -v docker-compose >/dev/null 2>&1 || { log_error "Docker Compose is required but not installed."; exit 1; }

    log_info "Prerequisites check passed"
}

# Backup database
backup_database() {
    log_info "Backing up database..."

    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
    fi

    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

    docker exec panfan-db pg_dump -U postgres panfan > "$BACKUP_FILE" || {
        log_error "Database backup failed"
        exit 1
    }

    # Keep only last 7 backups
    cd "$BACKUP_DIR"
    ls -t | tail -n +8 | xargs -r rm

    log_info "Database backed up to $BACKUP_FILE"
}

# Pull latest images
pull_images() {
    log_info "Pulling latest images..."

    docker-compose -f "$DOCKER_COMPOSE_FILE" pull

    log_info "Images pulled successfully"
}

# Build custom images
build_images() {
    log_info "Building custom images..."

    docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache

    log_info "Images built successfully"
}

# Stop services
stop_services() {
    log_info "Stopping services..."

    docker-compose -f "$DOCKER_COMPOSE_FILE" down

    log_info "Services stopped"
}

# Start services
start_services() {
    log_info "Starting services..."

    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d

    log_info "Services started"
}

# Health check
health_check() {
    log_info "Performing health check..."

    MAX_RETRIES=30
    RETRY_INTERVAL=5
    COUNTER=0

    while [ $COUNTER -lt $MAX_RETRIES ]; do
        if curl -sf http://localhost:3000/api/v1/health > /dev/null 2>&1; then
            log_info "Health check passed"
            return 0
        fi

        COUNTER=$((COUNTER + 1))
        log_info "Waiting for service to be ready... ($COUNTER/$MAX_RETRIES)"
        sleep $RETRY_INTERVAL
    done

    log_error "Health check failed"
    return 1
}

# Show logs
show_logs() {
    log_info "Showing logs..."

    docker-compose -f "$DOCKER_COMPOSE_FILE" logs -f --tail=100
}

# Show status
show_status() {
    log_info "Showing service status..."

    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
}

# Cleanup
cleanup() {
    log_info "Cleaning up unused images and volumes..."

    docker image prune -f
    docker volume prune -f

    log_info "Cleanup completed"
}

# Deploy function
deploy() {
    check_permission
    check_prerequisites

    cd "$PROJECT_DIR"

    log_info "Starting deployment..."

    backup_database
    pull_images

    log_info "Restarting services..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d

    if health_check; then
        log_info "Deployment completed successfully"
    else
        log_error "Deployment failed - health check did not pass"
        show_logs
        exit 1
    fi
}

# Rollback function
rollback() {
    check_permission

    cd "$PROJECT_DIR"

    log_info "Rolling back..."

    # Get the last backup
    LAST_BACKUP=$(ls -t "$BACKUP_DIR"/*.sql 2>/dev/null | head -1)

    if [ -z "$LAST_BACKUP" ]; then
        log_error "No backup found to rollback to"
        exit 1
    fi

    log_info "Rolling back to: $LAST_BACKUP"

    docker-compose -f "$DOCKER_COMPOSE_FILE" down

    # Restore database
    cat "$LAST_BACKUP" | docker exec -i panfan-db psql -U postgres panfan

    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d

    if health_check; then
        log_info "Rollback completed successfully"
    else
        log_error "Rollback failed"
        exit 1
    fi
}

# Restart services
restart() {
    check_permission

    cd "$PROJECT_DIR"

    log_info "Restarting services..."

    docker-compose -f "$DOCKER_COMPOSE_FILE" restart

    if health_check; then
        log_info "Restart completed successfully"
    else
        log_error "Restart failed"
        exit 1
    fi
}

# Show help
show_help() {
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  deploy    - Deploy the application (backup, pull, restart)"
    echo "  rollback  - Rollback to the last backup"
    echo "  restart   - Restart services without backup"
    echo "  stop      - Stop all services"
    echo "  start     - Start all services"
    echo "  logs      - Show logs"
    echo "  status    - Show service status"
    echo "  backup    - Backup database only"
    echo "  cleanup   - Clean up unused images and volumes"
    echo "  help      - Show this help message"
    echo ""
}

# Main
case "${1:-help}" in
    deploy)
        deploy
        ;;
    rollback)
        rollback
        ;;
    restart)
        restart
        ;;
    stop)
        cd "$PROJECT_DIR"
        docker-compose -f "$DOCKER_COMPOSE_FILE" down
        ;;
    start)
        cd "$PROJECT_DIR"
        docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
        ;;
    logs)
        cd "$PROJECT_DIR"
        show_logs
        ;;
    status)
        cd "$PROJECT_DIR"
        show_status
        ;;
    backup)
        backup_database
        ;;
    cleanup)
        cleanup
        ;;
    help)
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac