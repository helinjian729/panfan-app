# ============================================
# 拼饭App Makefile - 简化部署操作
# ============================================

.PHONY: help dev-build dev-up dev-down dev-logs dev-status staging-up production-up backup

# 配置
DOCKER_DIR := deployment/docker
COMPOSE := docker-compose -f $(DOCKER_DIR)/docker-compose.yml
COMPOSE_STAGING := docker-compose -f $(DOCKER_DIR)/docker-compose.staging.yml
COMPOSE_PROD := docker-compose -f $(DOCKER_DIR)/docker-compose.production.yml

# 帮助信息
help:
	@echo "=== 拼饭App 部署命令 ==="
	@echo ""
	@echo "开发环境:"
	@echo "  make dev-build    - 构建开发环境镜像"
	@echo "  make dev-up       - 启动开发环境"
	@echo "  make dev-down     - 停止开发环境"
	@echo "  make dev-logs     - 查看开发环境日志"
	@echo "  make dev-status   - 查看开发环境状态"
	@echo ""
	@echo "预发布环境:"
	@echo "  make staging-up   - 启动预发布环境"
	@echo "  make staging-down - 停止预发布环境"
	@echo ""
	@echo "生产环境:"
	@echo "  make production-up   - 启动生产环境"
	@echo "  make production-down - 停止生产环境"
	@echo ""
	@echo "其他:"
	@echo "  make backup       - 备份数据库"
	@echo "  make clean        - 清理未使用的镜像"
	@echo "  make ps           - 查看所有服务状态"

# 开发环境
dev-build:
	cd $(DOCKER_DIR) && $(COMPOSE) build

dev-up:
	cd $(DOCKER_DIR) && $(COMPOSE) up -d
	@echo "服务已启动，访问 http://localhost:80"

dev-down:
	cd $(DOCKER_DIR) && $(COMPOSE) down

dev-logs:
	cd $(DOCKER_DIR) && $(COMPOSE) logs -f

dev-status:
	cd $(DOCKER_DIR) && $(COMPOSE) ps

# 预发布环境
staging-up:
	cd $(DOCKER_DIR) && $(COMPOSE_STAGING) up -d

staging-down:
	cd $(DOCKER_DIR) && $(COMPOSE_STAGING) down

# 生产环境
production-up:
	cd $(DOCKER_DIR) && $(COMPOSE_PROD) up -d

production-down:
	cd $(DOCKER_DIR) && $(COMPOSE_PROD) down

# 备份
backup:
	bash deployment/scripts/backup.sh

# 清理
clean:
	docker system prune -f
	docker volume prune -f

# 查看所有服务
ps:
	@echo "=== 开发环境 ==="
	cd $(DOCKER_DIR) && $(COMPOSE) ps
	@echo ""
	@echo "=== 预发布环境 ==="
	cd $(DOCKER_DIR) && $(COMPOSE_STAGING) ps 2>/dev/null || echo "未运行"
	@echo ""
	@echo "=== 生产环境 ==="
	cd $(DOCKER_DIR) && $(COMPOSE_PROD) ps 2>/dev/null || echo "未运行"