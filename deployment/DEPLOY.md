# 拼饭App V.01 部署指南

## 目录
- [环境要求](#环境要求)
- [服务器准备](#服务器准备)
- [部署步骤](#部署步骤)
- [验证部署](#验证部署)
- [回滚方案](#回滚方案)
- [常见问题](#常见问题)

---

## 环境要求

| 组件 | 版本 | 说明 |
|------|------|------|
| Docker | 20.10+ | 容器引擎 |
| Docker Compose | 2.0+ | 容器编排 |
| PostgreSQL | 15 | 数据库 |
| Redis | 7 | 缓存 |
| Nginx | Alpine | 反向代理 |
| Node.js | 18+ | 仅构建前端时需要 |

---

## 服务器准备

### 1. 安装 Docker
```bash
# Ubuntu
curl -fsSL https://get.docker.com | sh
sudo systemctl enable docker
sudo systemctl start docker

# 添加当前用户到 docker 组
sudo usermod -aG docker $USER
```

### 2. 创建项目目录
```bash
sudo mkdir -p /var/www/panfan
cd /var/www/panfan
sudo chown -R $USER:$USER /var/www/panfan
```

### 3. 克隆代码
```bash
git clone https://github.com/helinjian729/panfan-app.git .
git checkout refactor/simplify-code
```

---

## 部署步骤

### 方式一：Docker Compose 一键部署（推荐）

```bash
cd deployment/docker

# 复制环境变量模板
cp .env.production .env

# 编辑环境变量
nano .env
```

**`.env` 关键配置：**
```env
# 数据库
POSTGRES_USER=panfan
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=panfan

# Redis
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Nginx
DOMAIN=yourdomain.com
SSL_EMAIL=your@email.com
```

```bash
# 拉取镜像并启动
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d

# 查看服务状态
docker-compose -f docker-compose.production.yml ps
```

### 方式二：手动构建部署

#### 前端构建
```bash
cd frontend

# 安装依赖
npm install

# 构建生产版本
npm run build

# 构建物在 dist/ 目录
```

#### 后端部署
```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
nano .env

# 构建并启动
npm run build
npm run start:prod
```

---

## 验证部署

### 1. 检查容器状态
```bash
docker-compose -f docker-compose.production.yml ps
```

**预期输出：**
```
NAME                STATUS          PORTS
panfan-api          Up              0.0.0.0:3000->3000/tcp
panfan-db           Up (healthy)    0.0.0.0:5432->5432/tcp
panfan-redis        Up (healthy)    0.0.0.0:6379->6379/tcp
panfan-nginx        Up              0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

### 2. 检查健康状态
```bash
curl http://localhost:3000/api/v1/health
```

**预期输出：**
```json
{"status":"ok","timestamp":"..."}
```

### 3. 检查 Nginx 日志
```bash
docker logs panfan-nginx --tail 50
docker logs panfan-api --tail 50
```

### 4. 访问前端
```
前端：http://yourdomain.com
API：http://yourdomain.com/api/v1
Swagger：http://yourdomain.com/api/docs
```

---

## 回滚方案

### 1. 查看历史版本
```bash
git log --oneline -10
```

### 2. 回滚到上一个稳定版本
```bash
git checkout HEAD^1
git pull origin refactor/simplify-code

# 重新构建并部署
cd deployment/docker
docker-compose -f docker-compose.production.yml up -d --build
```

### 3. Docker Compose 回滚
```bash
# 查看容器使用的镜像版本
docker-compose -f docker-compose.production.yml ps

# 指定旧版本镜像回滚
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d
```

### 4. 数据库回滚（如需要）
```bash
# 备份当前数据库
docker exec panfan-db pg_dump -U panfan panfan > backup_$(date +%Y%m%d).sql

# 恢复数据库
cat backup_20260510.sql | docker exec -i panfan-db psql -U panfan panfan
```

---

## 常见问题

### Q1: 容器启动失败
```bash
# 查看详细日志
docker-compose -f docker-compose.production.yml logs --tail=100

# 重启单个服务
docker-compose -f docker-compose.production.yml restart api
```

### Q2: 数据库连接失败
```bash
# 检查数据库健康状态
docker exec panfan-db pg_isready -U panfan

# 检查网络连接
docker network inspect panfan_panfan-network
```

### Q3: 前端静态文件404
```bash
# 检查 Nginx 是否正确挂载静态文件
docker exec panfan-nginx ls -la /var/www/static

# 重载 Nginx 配置
docker exec panfan-nginx nginx -s reload
```

### Q4: SSL证书问题
```bash
# 检查证书文件
ls -la deployment/docker/nginx/ssl/

# 续期 Let's Encrypt 证书
certbot renew --nginx
```

### Q5: 内存不足
```bash
# 清理未使用的 Docker 资源
docker system prune -a --volumes

# 检查容器资源使用
docker stats
```

---

## 生产检查清单

- [ ] 域名已解析到服务器IP
- [ ] SSL证书已配置
- [ ] 环境变量已设置（生产密码）
- [ ] 数据库已初始化
- [ ] 防火墙开放 80/443 端口
- [ ] 日志监控已配置
- [ ] 备份策略已设置
- [ ] 监控告警已配置

---

## 联系方式

如遇问题，请检查日志或联系运维人员。
