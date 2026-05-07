# ============================================
# 拼饭App 部署文档
# ============================================

## 1. 项目概述

### 1.1 技术栈

| 组件 | 技术 | 版本 |
|-----|------|------|
| 后端框架 | NestJS (Node.js/TypeScript) | ^10.3.0 |
| 数据库 | PostgreSQL | 15 |
| 缓存 | Redis | 7 |
| 反向代理 | Nginx | alpine |
| 容器化 | Docker | Latest |
| 编排 | Docker Compose | 3.8 |
| CI/CD | GitHub Actions | - |

### 1.2 目录结构

```
panfan/
├── backend/                    # NestJS 后端源码
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── ...
├── ios/                        # iOS 应用源码
│   └── ...
├── deployment/                 # 部署配置
│   ├── docker/                 # Docker 相关配置
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.staging.yml
│   │   ├── docker-compose.production.yml
│   │   ├── nginx/
│   │   │   └── nginx.conf
│   │   ├── ssl/
│   │   ├── init-db.sql
│   │   └── .env.*
│   └── scripts/               # 部署脚本
│       ├── deploy.sh
│       ├── backup.sh
│       └── start.ps1
├── .github/
│   └── workflows/             # CI/CD 配置
│       ├── ci.yml
│       └── deploy.yml
└── ...
```

---

## 2. 本地开发环境

### 2.1 前置条件

- Docker Desktop >= 20.10
- Node.js >= 18 (仅用于本地开发)
- Git

### 2.2 快速启动

```powershell
# 进入项目目录
cd D:\AI-project\agents

# 一键启动开发环境
.\deployment\docker\start-docker.ps1 -Action start -Env dev

# 或手动启动
cd deployment\docker
.\start-docker.ps1
```

### 2.3 访问服务

| 服务 | 地址 | 说明 |
|-----|------|------|
| API | http://localhost:3000 | 后端 API |
| Nginx | http://localhost:80 | 反向代理入口 |
| API 文档 | http://localhost:3000/api/docs | Swagger 文档 |
| PostgreSQL | localhost:5432 | 数据库 |
| Redis | localhost:6379 | 缓存 |

### 2.4 常用操作

```powershell
# 查看服务状态
.\deployment\docker\start-docker.ps1 -Action status

# 查看日志
.\deployment\docker\start-docker.ps1 -Action logs

# 停止服务
.\deployment\docker\start-docker.ps1 -Action stop

# 清理环境（删除所有容器和数据）
.\deployment\docker\start-docker.ps1 -Action clean
```

---

## 3. 服务架构

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层                             │
│                   iOS App / Web                            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                    ┌─────▼─────┐
                    │   Nginx   │
                    │  (80/443) │
                    └─────┬─────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    ┌────▼────┐     ┌────▼────┐     ┌────▼────┐
    │   API   │     │   API   │     │   API   │
    │ (Node1) │     │ (Node2) │     │ (Node3) │
    └────┬────┘     └────┬────┘     └────┬────┘
         │                │                │
    ┌────▼────┐     ┌────▼────┐     ┌────▼────┐
    │Postgres │     │  Redis  │     │   共享   │
    │         │     │         │     │ 存储     │
    └─────────┘     └─────────┘     └─────────┘
```

---

## 4. 部署配置详解

### 4.1 Docker Compose 配置

#### 开发环境 (docker-compose.yml)
- 单实例 API 服务
- 端口映射：80 -> Nginx -> 3000 -> API
- 数据卷：pgdata, redisdata

#### 预发布环境 (docker-compose.staging.yml)
- 独立端口（8080, 5433, 6380）
- 测试配置
- 数据卷隔离

#### 生产环境 (docker-compose.production.yml)
- 资源限制（CPU/内存）
- 日志轮转
- 自动重启
- 健康检查

### 4.2 Nginx 配置

```nginx
# 主要功能
- 反向代理到后端 API
- WebSocket 支持 (socket.io)
- Gzip 压缩
- 速率限制
- SSL 终止（生产环境）
- 安全响应头
```

### 4.3 环境变量

| 变量 | 说明 | 示例 |
|-----|------|------|
| POSTGRES_USER | 数据库用户 | postgres |
| POSTGRES_PASSWORD | 数据库密码 | secure123 |
| POSTGRES_DB | 数据库名 | panfan |
| REDIS_PASSWORD | Redis 密码 | redis123 |
| JWT_SECRET | JWT 密钥 | min-32-chars-secret |
| JWT_EXPIRES_IN | Access Token 过期时间 | 2h |
| JWT_REFRESH_SECRET | Refresh Token 密钥 | min-32-chars-secret |
| JWT_REFRESH_EXPIRES_IN | Refresh Token 过期时间 | 7d |

---

## 5. CI/CD 流水线

### 5.1 工作流

```
Push/PR -> CI (Lint/Test/Security) -> Build Image -> Deploy to Staging -> Deploy to Production
```

### 5.2 环境说明

| 环境 | 触发条件 | 用途 |
|-----|---------|------|
| CI | 每个 PR/Push | 代码检查、测试 |
| Staging | develop 分支 / PR | 功能测试 |
| Production | main 分支 / tag v* | 正式发布 |

### 5.3 部署流程

1. **代码检查** (ci.yml)
   - ESLint 代码检查
   - TypeScript 类型检查
   - 单元测试
   - 安全扫描

2. **构建镜像** (deploy.yml)
   - 多平台构建 (amd64, arm64)
   - 缓存优化
   - 推送至 GitHub Container Registry

3. **部署服务器**
   - SSH 连接远程服务器
   - 备份数据库
   - 拉取最新镜像
   - 滚动更新服务
   - 健康检查

---

## 6. 服务器部署

### 6.1 服务器要求

| 配置 | 开发/测试 | 生产 |
|-----|----------|------|
| CPU | 2 核 | 4 核 |
| 内存 | 4 GB | 8 GB |
| 磁盘 | 50 GB | 100 GB |
| 系统 | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### 6.2 部署步骤

```bash
# 1. 安装 Docker 和 Docker Compose
curl -fsSL https://get.docker.com | sh
sudo apt install docker-compose

# 2. 创建项目目录
sudo mkdir -p /app/panfan
sudo chown -R $USER:$USER /app/panfan

# 3. 拉取代码
cd /app/panfan
git clone <repo-url> .

# 4. 配置环境变量
cp deployment/docker/.env.production .env
nano .env  # 修改密码和密钥

# 5. 启动服务
cd deployment/docker
docker-compose -f docker-compose.production.yml up -d

# 6. 查看状态
docker-compose -f docker-compose.production.yml ps
```

### 6.3 使用部署脚本

```bash
# 进入脚本目录
cd /app/panfan/deployment/scripts

# 部署
./deploy.sh deploy

# 查看日志
./deploy.sh logs

# 停止
./deploy.sh stop

# 回滚
./deploy.sh rollback
```

---

## 7. 监控与日志

### 7.1 查看日志

```bash
# 查看所有服务日志
docker-compose -f docker-compose.production.yml logs -f

# 查看特定服务
docker-compose -f docker-compose.production.yml logs -f api
docker-compose -f docker-compose.production.yml logs -f db

# 查看最近 100 行
docker-compose -f docker-compose.production.yml logs --tail=100
```

### 7.2 健康检查

```bash
# API 健康检查
curl http://localhost:3000/api/v1/health

# Nginx 健康检查
curl http://localhost/health

# 容器健康状态
docker inspect --format='{{.State.Health.Status}}' panfan-api
```

### 7.3 资源监控

```bash
# 查看容器资源使用
docker stats

# 查看磁盘使用
docker system df

# 查看容器日志大小
ls -lh /var/lib/docker/containers/*/*-json.log
```

---

## 8. 备份与恢复

### 8.1 自动备份

部署脚本会在每次部署前自动备份数据库。

### 8.2 手动备份

```bash
# 备份数据库
docker exec panfan-db pg_dump -U postgres panfan > backup_$(date +%Y%m%d).sql

# 备份 Redis
docker exec panfan-redis redis-cli -a <password> SAVE
```

### 8.3 恢复数据

```bash
# 恢复数据库
cat backup_20240101.sql | docker exec -i panfan-db psql -U postgres panfan
```

---

## 9. 故障排查

### 9.1 常见问题

| 问题 | 解决方案 |
|-----|---------|
| 服务启动失败 | 检查 `.env` 配置是否正确 |
| 数据库连接失败 | 检查 `DATABASE_URL` 和网络连通性 |
| API 返回 502 | 检查 API 容器是否正常运行 |
| WebSocket 连接失败 | 检查 Nginx WebSocket 配置 |
| 端口冲突 | 检查是否有其他服务占用 80/443 端口 |

### 9.2 调试命令

```bash
# 查看容器状态
docker ps -a

# 查看容器详细信息
docker inspect panfan-api

# 进入容器
docker exec -it panfan-api sh

# 查看网络
docker network ls
docker network inspect panfan_panfan-network

# 测试数据库连接
docker exec -it panfan-db psql -U postgres -d panfan

# 测试 Redis 连接
docker exec -it panfan-redis redis-cli -a <password>
```

---

## 10. 安全配置

### 10.1 生产环境检查清单

- [ ] 修改所有默认密码
- [ ] 使用强 JWT 密钥 (32字符以上)
- [ ] 配置 SSL 证书
- [ ] 开启防火墙 (仅开放 80/443)
- [ ] 定期更新 Docker 镜像
- [ ] 启用日志轮转
- [ ] 配置资源限制

### 10.2 SSL 证书

生产环境建议使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com
```

---

## 11. 更新与升级

### 11.1 更新后端

```bash
# 拉取最新代码
git pull

# 重新构建
cd deployment/docker
docker-compose -f docker-compose.production.yml build

# 重启服务
docker-compose -f docker-compose.production.yml up -d
```

### 11.2 更新基础设施

```bash
# 更新基础镜像
docker-compose -f docker-compose.production.yml pull

# 重启服务
docker-compose -f docker-compose.production.yml up -d
```

---

*文档版本：V1.0*
*创建时间：2026-05-07*
*维护者：运维工程师*