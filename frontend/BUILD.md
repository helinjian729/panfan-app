# 前端构建配置

## 构建命令

### 开发环境构建
```bash
cd frontend
npm install
npm run dev
```

### 生产环境构建
```bash
cd frontend
npm install
npm run build  # 输出到 dist/
```

### 构建产物
- `dist/index.html` - 入口HTML
- `dist/assets/` - 静态资源（JS、CSS、图片等）

## 环境配置

### 开发环境 (.env.development)
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### 生产环境 (.env.production)
```
VITE_API_BASE_URL=https://yourdomain.com/api/v1
```

## Nginx 部署配置

将 `dist/` 目录内容复制到 `/var/www/html/`：

```bash
# 方式一：直接复制
cp -r dist/* /var/www/html/

# 方式二：挂载 volume（docker-compose 已配置）
```

## API 代理配置

如果前端独立部署，需在 Nginx 中配置 API 代理：

```nginx
location /api/ {
    proxy_pass http://backend:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

## Docker 部署

项目已配置 Docker 支持，可在 `deployment/docker/` 中找到完整配置。

前端构建后通过 volume 挂载：
```yaml
nginx:
  volumes:
    - ./html:/var/www/html:ro
```

## 静态资源缓存

建议 Nginx 配置：
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 7d;
    add_header Cache-Control "public, immutable";
}
```
