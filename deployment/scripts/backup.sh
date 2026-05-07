#!/bin/bash
# ============================================
# 拼饭App 备份脚本
# ============================================

set -e

# Configuration
BACKUP_DIR="/app/panfan/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup database
log_info "Backing up database..."
docker exec panfan-db pg_dump -U postgres panfan > "$BACKUP_FILE.sql"

# Backup Redis data (if needed)
log_info "Backing up Redis data..."
docker exec panfan-redis redis-cli -a "${REDIS_PASSWORD:-}" BGSAVE || true

# Compress backup
log_info "Compressing backup..."
tar -czf "$BACKUP_FILE.tar.gz" -C "$BACKUP_DIR" "backup_$TIMESTAMP.sql"
rm "$BACKUP_FILE.sql"

# Upload to remote storage (optional)
# rsync -avz "$BACKUP_FILE.tar.gz" user@backup-server:/path/to/backups/

# Cleanup old backups (keep last 30)
cd "$BACKUP_DIR"
ls -t | tail -n +31 | xargs -r rm

log_info "Backup completed: $BACKUP_FILE.tar.gz"

# Show backup size
ls -lh "$BACKUP_FILE.tar.gz"