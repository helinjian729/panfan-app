# 拼饭App V.01 快速部署命令卡

## 一键部署
```bash
cd /var/www/panfan
git pull origin refactor/simplify-code
cd deployment/docker
cp .env.production .env && nano .env  # 编辑配置
docker-compose -f docker-compose.production.yml up -d
```

## 日常维护

| 操作 | 命令 |
|------|------|
| 启动服务 | `docker-compose -f docker-compose.production.yml up -d` |
| 停止服务 | `docker-compose -f docker-compose.production.yml down` |
| 重启服务 | `docker-compose -f docker-compose.production.yml restart` |
| 查看状态 | `docker-compose -f docker-compose.production.yml ps` |
| 查看日志 | `docker-compose -f docker-compose.production.yml logs -f` |
| 查看API日志 | `docker logs panfan-api -f --tail=100` |
| 重载Nginx | `docker exec panfan-nginx nginx -s reload` |

## 更新部署
```bash
cd /var/www/panfan
git pull origin refactor/simplify-code
cd deployment/docker
docker-compose -f docker-compose.production.yml up -d --build
```

## 数据库
```bash
# 连接数据库
docker exec -it panfan-db psql -U panfan -d panfan

# 备份
docker exec panfan-db pg_dump -U panfan panfan > backup_$(date +%Y%m%d).sql

# 恢复
cat backup_20260510.sql | docker exec -i panfan-db psql -U panfan panfan
```

## 监控
```bash
# 资源使用
docker stats

# 健康检查
curl http://localhost:3000/api/v1/health

# 磁盘使用
df -h
du -sh /var/lib/docker/volumes/
```

## 清理
```bash
# 清理未使用资源
docker system prune -a --volumes

# 清理日志
docker-compose -f docker-compose.production.yml logs --tail=0 > /dev/null
```

## 回滚
```bash
# 查看历史
git log --oneline -5

# 回滚代码
git checkout <commit-hash>
git push --force origin refactor/simplify-code

# 重新部署
docker-compose -f docker-compose.production.yml up -d --build
```
