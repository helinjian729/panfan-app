# 拼饭 App - 系统架构设计文档

## 1. 架构设计理念

### 1.1 设计原则

| 原则 | 说明 |
|-----|------|
| 轻量化优先 | MVP 阶段避免过度设计，采用成熟稳定的轻量级方案 |
| 移动端优先 | iOS App 为主要客户端，后端 API 支撑业务逻辑 |
| 快速迭代 | 架构支持敏捷开发，便于功能扩展 |
| 高可用 | 核心链路（拼饭团创建、支付）可靠稳定 |

### 1.2 架构模式选择

**推荐模式：单体应用 + Redis 缓存**

| 方案 | 优点 | 缺点 | 适用场景 |
|-----|------|------|---------|
| 单体应用 | 部署简单、调试方便、开发效率高 | 扩展性有限 | MVP 版本、团队小 |
| 微服务 | 扩展性强、故障隔离 | 运维复杂、团队要求高 | 用户量大、团队成熟 |
| Serverless | 无需管理服务器、按需付费 | 冷启动延迟、厂商绑定 | 突发流量、事件驱动 |

**结论**：MVP 阶段选用 **单体应用**，部署简单、迭代快速。后期用户量增长后可拆分核心模块（用户服务、拼饭团服务、订单服务）为微服务。

---

## 2. 技术栈选型

### 2.1 iOS 端

| 层级 | 技术选型 | 说明 |
|-----|---------|------|
| 编程语言 | Swift 5.0+ | 苹果官方主推语言 |
| UI 框架 | SwiftUI | 声明式 UI，开发效率高，iOS 14+ 支持 |
| 架构模式 | MVVM | 轻量、易于理解和测试 |
| 网络层 | Alamofire + Moya | 业界主流网络封装 |
| 依赖管理 | Swift Package Manager | 官方推荐 |
| 本地存储 | UserDefaults | 轻量配置存储 |
| 实时更新 | WebSocket | 拼饭团成员操作实时同步 |

### 2.2 后端

| 层级 | 技术选型 | 说明 |
|-----|---------|------|
| 编程语言 | Node.js / TypeScript | JavaScript 全栈统一语言 |
| 框架 | NestJS | 模块化、装饰器风格、企业级 |
| 数据库 | PostgreSQL | 开源关系型，功能强大 |
| 缓存 | Redis | 拼饭团状态、Session、实时数据 |
| ORM | Prisma | 类型安全、自动迁移 |
| 认证 | JWT | 无状态认证，适合移动端 |
| API 文档 | Swagger / OpenAPI | 自动生成 API 文档 |
| 实时通信 | Socket.IO | WebSocket 封装，支持房间/群组 |

### 2.3 运维与部署

| 组件 | 技术选型 | 说明 |
|-----|---------|------|
| 容器化 | Docker | 一键部署、环境隔离 |
| 容器编排 | Docker Compose | MVP 阶段单机部署 |
| Web 服务器 | Nginx | 反向代理、静态资源服务 |
| CI/CD | GitHub Actions | 代码推送自动构建 |
| 云平台 | 阿里云 ECS / 腾讯云 | 轻量应用服务器 |
| 监控 | 基础版 Prometheus + Grafana | 简单易用 |

---

## 3. 系统架构图

### 3.1 整体架构

```
                                    ┌─────────────────────────────────────┐
                                    │              客户端层               │
                                    │                                     │
                                    │   ┌─────────────┐   ┌───────────┐  │
                                    │   │  iOS App    │   │  微信开放  │  │
                                    │   │  (SwiftUI)  │   │  能力(分享) │  │
                                    │   └──────┬──────┘   └───────────┘  │
                                    └──────────┼──────────────────────────┘
                                               │ HTTPS / WebSocket
                                    ┌──────────┴──────────────────────────┐
                                    │              网关层                 │
                                    │                                     │
                                    │   ┌─────────────────────────────┐  │
                                    │   │       Nginx (反向代理)        │  │
                                    │   │   - SSL 终止                  │  │
                                    │   │   - 静态资源服务              │  │
                                    │   │   - 请求分发                  │  │
                                    │   └──────────────┬──────────────┘  │
                                    └──────────────────┼──────────────────┘
                                                       │
                                    ┌──────────────────┴──────────────────┐
                                    │              应用层                  │
                                    │                                     │
                                    │   ┌─────────────────────────────┐  │
                                    │   │      NestJS 后端服务         │  │
                                    │   │                             │  │
                                    │   │  ┌─────────────────────┐   │  │
                                    │   │  │   API Module        │   │  │
                                    │   │  │   - 用户模块        │   │  │
                                    │   │  │   - 拼饭团模块      │   │  │
                                    │   │  │   - 商家模块        │   │  │
                                    │   │  │   - 订单模块        │   │  │
                                    │   │  │   - 通知模块        │   │  │
                                    │   │  └─────────────────────┘   │  │
                                    │   │                             │  │
                                    │   │  ┌─────────────────────────┐│  │
                                    │   │  │   WebSocket Gateway    ││  │
                                    │   │  │   (Socket.IO)          ││  │
                                    │   │  │   - 拼饭团实时同步     ││  │
                                    │   │  │   - 成员操作推送       ││  │
                                    │   │  └─────────────────────────┘│  │
                                    │   └──────────────┬──────────────┘  │
                                    └──────────────────┼──────────────────┘
                                                       │
                                    ┌──────────────────┴──────────────────┐
                                    │              数据层                  │
                                    │                                     │
                         ┌──────────┴──────────┐    ┌─────────────────┐  │
                         │    PostgreSQL       │    │      Redis       │  │
                         │    (主数据库)        │    │   (缓存/会话)    │  │
                         │                     │    │                 │  │
                         │  - 用户表           │    │  - 拼饭团状态   │  │
                         │  - 拼饭团表         │    │  - Session      │  │
                         │  - 商家表           │    │  - 实时数据     │  │
                         │  - 订单表           │    │  - 限流计数     │  │
                         │  - 订单项表         │    │                 │  │
                         └─────────────────────┘    └─────────────────┘  │
                                                                    │
                                    ┌─────────────────────────────────┐
                                    │              第三方服务           │
                                    │                                  │
                                    │  ┌──────────┐  ┌───────────────┐ │
                                    │  │  微信支付 │  │  短信平台     │ │
                                    │  │  API     │  │  (通知)       │ │
                                    │  └──────────┘  └───────────────┘ │
                                    │                                  │
                                    │  ┌──────────┐  ┌───────────────┐ │
                                    │  │  极光/   │  │  商家开放API  │ │
                                    │  │  友盟推送 │  │  (模拟)       │ │
                                    │  └──────────┘  └───────────────┘ │
                                    └──────────────────────────────────┘
```

### 3.2 iOS 端架构（MVVM）

```
┌─────────────────────────────────────────────────────────────┐
│                        View 层                             │
│  (SwiftUI Views)                                           │
│                                                             │
│  - HomeView / GroupListView / CreateGroupView             │
│  - MenuView / CartView / OrderDetailView                  │
│  - ProfileView / SettingsView                              │
└─────────────────────────┬───────────────────────────────────┘
                          │ @StateObject / @ObservedObject
┌─────────────────────────▼───────────────────────────────────┐
│                    ViewModel 层                            │
│  (ObservableObject)                                        │
│                                                             │
│  - HomeViewModel                                           │
│  - GroupViewModel                                          │
│  - OrderViewModel                                          │
│  - ProfileViewModel                                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    Service 层                              │
│                                                             │
│  - APIService (网络请求)                                    │
│  - WebSocketService (实时通信)                              │
│  - AuthService (认证)                                       │
│  - NotificationService (推送)                              │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    Repository 层                            │
│  (数据抽象)                                                 │
│                                                             │
│  - UserRepository                                          │
│  - GroupRepository                                         │
│  - OrderRepository                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. 数据库设计

### 4.1 ER 图（核心实体）

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    User     │       │  Group       │       │  Restaurant  │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)     │──┐    │ id (PK)     │       │ id (PK)     │
│ phone       │  │    │ name        │       │ name         │
│ nickname    │  │    │ creatorId(FK)│───────│ address      │
│ avatarUrl   │  │    │ restaurantId│       │ rating       │
│ createdAt   │  │    │ targetCount │       │ deliveryFee  │
└──────────────┘  │    │ currentCount│       │ minOrder     │
                  │    │ status      │       │ createdAt    │
┌──────────────┐  │    │ deadline    │       └──────────────┘
│GroupMember  │  │    │ inviteCode   │              │
├──────────────┤  │    │ createdAt   │              │
│ id (PK)     │  │    └──────┬───────┘              │
│ groupId(FK) │──┘           │                      │
│ userId (FK) │──────────────┘                      │
│ items (JSON)│                                     │
│ payAmount   │       ┌──────────────┐              │
│ status      │       │Order         │              │
│ joinedAt    │       ├──────────────┤              │
└──────────────┘       │ id (PK)     │              │
                        │ groupId(FK) │──────────────┘
┌──────────────┐       │ totalAmount │
│OrderItem     │       │ discountAmt │
├──────────────┤       │ finalAmount │
│ id (PK)      │       │ status      │
│ orderId(FK)  │       │ payTime     │
│ userId(FK)   │       │ createdAt   │
│ menuItemId   │       └──────────────┘
│ name         │
│ price        │
│ quantity     │
│ remark       │
└──────────────┘
```

### 4.2 表结构详细定义

#### 4.2.1 用户表 (users)

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone           VARCHAR(20) UNIQUE NOT NULL,
    nickname        VARCHAR(50) NOT NULL,
    avatar_url      VARCHAR(500),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone);
```

#### 4.2.2 商家表 (restaurants)

```sql
CREATE TABLE restaurants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    address         VARCHAR(500),
    phone           VARCHAR(20),
    rating          DECIMAL(2,1) DEFAULT 5.0,
    delivery_fee    DECIMAL(10,2) DEFAULT 0,
    min_order       DECIMAL(10,2) DEFAULT 0,
    discount_info   JSONB,  -- 满减信息，如 {"满100减30": {"threshold": 100, "discount": 30}}
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_restaurants_active ON restaurants(is_active);
```

#### 4.2.3 菜品表 (menu_items)

```sql
CREATE TABLE menu_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id   UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    price           DECIMAL(10,2) NOT NULL,
    category        VARCHAR(100),
    image_url       VARCHAR(500),
    is_available    BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);
```

#### 4.2.4 拼饭团表 (groups)

```sql
CREATE TABLE groups (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    creator_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    restaurant_id   UUID REFERENCES restaurants(id) ON DELETE SET NULL,
    target_count    INTEGER NOT NULL DEFAULT 5,
    current_count   INTEGER DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'PENDING',
    -- PENDING: 待成团, SUCCESS: 已成团, FAILED: 成团失败, CANCELLED: 已取消
    deadline        TIMESTAMP NOT NULL,
    invite_code     VARCHAR(10) UNIQUE NOT NULL,
    total_amount    DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount    DECIMAL(10,2) DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_groups_invite_code ON groups(invite_code);
CREATE INDEX idx_groups_status ON groups(status);
CREATE INDEX idx_groups_deadline ON groups(deadline);
```

#### 4.2.5 拼饭团成员表 (group_members)

```sql
CREATE TABLE group_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id        UUID REFERENCES groups(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    items_amount    DECIMAL(10,2) DEFAULT 0,
    pay_amount      DECIMAL(10,2) DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'JOINED',
    -- JOINED: 已加入, PAID: 已支付, CANCELLED: 已退出
    joined_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
```

#### 4.2.6 拼饭团菜品表 (group_order_items)

```sql
CREATE TABLE group_order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id        UUID REFERENCES groups(id) ON DELETE CASCADE,
    member_id       UUID REFERENCES group_members(id) ON DELETE CASCADE,
    menu_item_id    UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    name            VARCHAR(200) NOT NULL,
    price           DECIMAL(10,2) NOT NULL,
    quantity        INTEGER DEFAULT 1,
    remark          VARCHAR(200),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_group_order_items_group ON group_order_items(group_id);
CREATE INDEX idx_group_order_items_member ON group_order_items(member_id);
```

#### 4.2.7 订单表 (orders)

```sql
CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id        UUID REFERENCES groups(id) ON DELETE SET NULL,
    order_no        VARCHAR(50) UNIQUE NOT NULL,
    total_amount    DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount    DECIMAL(10,2) NOT NULL,
    status          VARCHAR(20) DEFAULT 'PENDING',
    -- PENDING: 待支付, PAID: 已支付, ACCEPTED: 已接单, DELIVERING: 配送中, DELIVERED: 已送达, COMPLETED: 已完成
    pay_time        TIMESTAMP,
    delivery_time   TIMESTAMP,
    completed_time  TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_group ON orders(group_id);
CREATE INDEX idx_orders_order_no ON orders(order_no);
CREATE INDEX idx_orders_status ON orders(status);
```

#### 4.2.8 订单项表 (order_items)

```sql
CREATE TABLE order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    menu_item_id    UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    name            VARCHAR(200) NOT NULL,
    price           DECIMAL(10,2) NOT NULL,
    quantity        INTEGER DEFAULT 1,
    remark          VARCHAR(200),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
```

### 4.3 Redis 缓存设计

| Key 模式 | 类型 | 说明 | 过期时间 |
|---------|------|------|---------|
| `group:{groupId}` | Hash | 拼饭团实时状态 | 2小时 |
| `group:{groupId}:members` | Set | 拼饭团成员ID集合 | 2小时 |
| `user:{userId}:session` | String | 用户Session | 7天 |
| `group:{groupId}:cart:{userId}` | Hash | 用户购物车 | 30分钟 |
| `ratelimit:{userId}:{api}` | String | API限流计数 | 1分钟 |

---

## 5. API 接口设计

### 5.1 接口规范

#### 全局统一返回体

```typescript
// 成功响应
{
  "code": 0,
  "message": "success",
  "data": { ... }
}

// 错误响应
{
  "code": 10001,
  "message": "拼饭团已过期",
  "data": null
}
```

#### 状态码规范

| 类别 | 状态码区间 | 说明 |
|-----|-----------|------|
| 成功 | 0 | 成功 |
| 通用错误 | 10001-10099 | 参数错误、签名错误等 |
| 认证错误 | 20001-20099 | Token 失效、未登录等 |
| 业务错误 | 30001-30099 | 拼饭团已满、余额不足等 |
| 系统错误 | 50001-50099 | 数据库错误、服务不可用等 |

### 5.2 核心接口

#### 5.2.1 用户模块

| 接口 | 方法 | 说明 |
|-----|------|------|
| `/api/v1/auth/send-code` | POST | 发送验证码 |
| `/api/v1/auth/login` | POST | 登录（手机号+验证码） |
| `/api/v1/auth/refresh` | POST | 刷新Token |
| `/api/v1/users/profile` | GET | 获取个人资料 |
| `/api/v1/users/profile` | PUT | 更新个人资料 |

#### 5.2.2 商家模块

| 接口 | 方法 | 说明 |
|-----|------|------|
| `/api/v1/restaurants` | GET | 商家列表（支持分页、排序、搜索） |
| `/api/v1/restaurants/:id` | GET | 商家详情 |
| `/api/v1/restaurants/:id/menu` | GET | 菜单列表 |
| `/api/v1/restaurants/:id/discount-info` | GET | 满减信息计算 |

#### 5.2.3 拼饭团模块

| 接口 | 方法 | 说明 |
|-----|------|------|
| `/api/v1/groups` | POST | 发起拼饭团 |
| `/api/v1/groups` | GET | 拼饭团列表（我发起的/我加入的） |
| `/api/v1/groups/:id` | GET | 拼饭团详情 |
| `/api/v1/groups/join` | POST | 加入拼饭团（通过邀请码） |
| `/api/v1/groups/:id/cancel` | POST | 取消拼饭团（仅发起人） |
| `/api/v1/groups/:id/leave` | POST | 退出拼饭团（成员） |

#### 5.2.4 拼饭团操作

| 接口 | 方法 | 说明 |
|-----|------|------|
| `/api/v1/groups/:id/items` | GET | 获取拼饭团菜品清单 |
| `/api/v1/groups/:id/items` | POST | 添加菜品到拼饭团 |
| `/api/v1/groups/:id/items/:itemId` | DELETE | 删除菜品 |
| `/api/v1/groups/:id/items/calculate` | GET | 计算凑单进度 |

#### 5.2.5 订单模块

| 接口 | 方法 | 说明 |
|-----|------|------|
| `/api/v1/orders` | POST | 创建订单 |
| `/api/v1/orders/:id` | GET | 订单详情 |
| `/api/v1/orders/:id/pay` | POST | 支付订单 |
| `/api/v1/orders/:id/cancel` | POST | 取消订单 |
| `/api/v1/orders` | GET | 订单列表（历史记录） |

#### 5.2.6 实时通信（WebSocket）

| 事件 | 方向 | 说明 |
|-----|------|------|
| `join_group` | Client→Server | 加入拼饭团房间 |
| `leave_group` | Client→Server | 离开拼饭团房间 |
| `member_join` | Server→Client | 成员加入通知 |
| `member_leave` | Server→Client | 成员退出通知 |
| `item_added` | Server→Client | 菜品添加通知 |
| `item_removed` | Server→Client | 菜品删除通知 |
| `group_status_change` | Server→Client | 拼饭团状态变更 |
| `cart_update` | Server→Client | 购物车更新 |

### 5.3 认证方案

**JWT 无状态认证**

```
请求头：Authorization: Bearer <access_token>
```

| Token 类型 | 有效期 | 说明 |
|-----------|-------|------|
| access_token | 2小时 | API 访问凭证 |
| refresh_token | 7天 | 刷新 access_token |

---

## 6. 部署架构

### 6.1 环境规划

| 环境 | 用途 | 部署方式 |
|-----|------|---------|
| 开发环境 | 本地开发 | docker-compose local |
| 测试环境 | 功能测试 | 阿里云 ECS 1台 |
| 预发布环境 | 回归测试 | 阿里云 ECS 1台 |
| 生产环境 | 正式用户 | 阿里云 ECS 2台（主备） |

### 6.2 Docker 部署

#### 后端 Dockerfile

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

#### docker-compose.yml (MVP)

```yaml
version: '3.8'
services:
  api:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/panfan
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=panfan
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    restart: unless-stopped

volumes:
  pgdata:
  redisdata:
```

### 6.3 Nginx 配置

```nginx
events {
    worker_connections 1024;
}

http {
    upstream api_backend {
        server api:3000;
    }

    server {
        listen 80;
        server_name api.panfan.app;

        location / {
            proxy_pass http://api_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_cache_bypass $http_upgrade;
        }

        location /socket.io {
            proxy_pass http://api_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}
```

---

## 7. 项目目录结构

### 7.1 后端目录结构

```
backend/
├── src/
│   ├── main.ts                     # 应用入口
│   ├── app.module.ts               # 根模块
│   ├── common/
│   │   ├── filters/               # 异常过滤器
│   │   ├── interceptors/          # 拦截器
│   │   ├── guards/                 # 路由守卫
│   │   └── decorators/             # 自定义装饰器
│   ├── config/
│   │   └── configuration.ts       # 配置文件
│   ├── modules/
│   │   ├── auth/                   # 认证模块
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── strategies/
│   │   ├── user/                   # 用户模块
│   │   ├── restaurant/              # 商家模块
│   │   ├── group/                   # 拼饭团模块
│   │   ├── order/                   # 订单模块
│   │   └── notification/            # 通知模块
│   ├── entities/                   # Prisma 实体
│   ├── gateways/
│   │   └── group.gateway.ts        # WebSocket 网关
│   └── utils/
│       └── response.util.ts        # 响应工具
├── prisma/
│   └── schema.prisma               # Prisma 数据模型
├── test/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── .env.example
```

### 7.2 iOS 目录结构

```
ios/
├── project.yml                     # XcodeGen 配置
├── Podfile                         # CocoaPods 依赖（若用）
├── Package.swift                   # SPM 依赖
├── Sources/
│   ├── App/
│   │   ├── PanFanApp.swift         # 应用入口
│   │   └── AppDelegate.swift
│   ├── Views/
│   │   ├── Home/
│   │   ├── Group/
│   │   ├── Restaurant/
│   │   ├── Order/
│   │   ├── Profile/
│   │   └── Components/
│   ├── ViewModels/
│   │   ├── HomeViewModel.swift
│   │   ├── GroupViewModel.swift
│   │   ├── OrderViewModel.swift
│   │   └── ProfileViewModel.swift
│   ├── Models/
│   │   ├── User.swift
│   │   ├── Group.swift
│   │   ├── Restaurant.swift
│   │   └── Order.swift
│   ├── Services/
│   │   ├── APIService.swift
│   │   ├── WebSocketService.swift
│   │   ├── AuthService.swift
│   │   └── NotificationService.swift
│   ├── Repositories/
│   │   ├── UserRepository.swift
│   │   ├── GroupRepository.swift
│   │   └── OrderRepository.swift
│   └── Utils/
│       ├── Constants.swift
│       ├── Extensions.swift
│       └── KeychainHelper.swift
├── Resources/
│   ├── Assets.xcassets/
│   ├── LaunchScreen.storyboard
│   └── Info.plist
└── Tests/
```

---

## 8. 编码规范

### 8.1 后端规范

| 规范 | 说明 |
|-----|------|
| 命名 | 变量/函数：camelCase；类名：PascalCase；数据库：snake_case |
| 错误处理 | 统一使用 NestJS 内置异常过滤器 |
| 日志 | 使用 @nestjs/logger，区分 log/warn/error |
| 校验 | 使用 class-validator + class-transformer |
| 事务 | 关键业务使用 Prisma 事务（拼饭团成团、订单创建） |

### 8.2 iOS 规范

| 规范 | 说明 |
|-----|------|
| 命名 | 类/协议：PascalCase；函数/变量：camelCase |
| UI | SwiftUI View 命名以 View 结尾 |
| ViewModel | 命名以 ViewModel 结尾 |
| 异步 | 统一使用 async/await |
| 错误 | 使用 Result<T, Error> 类型 |
| 依赖 | 优先 Swift Package Manager |

---

## 9. 风险评估与规避

| 风险点 | 影响 | 规避方案 |
|-------|------|---------|
| 拼饭团并发修改 | 多人同时添加菜品，数据不一致 | Redis 分布式锁 + 乐观锁 |
| 支付状态不一致 | 用户支付成功但回调失败 | 支付回调+主动查询双保险 |
| 商家 API 不稳定 | MVP 阶段模拟数据 | 后期对接真实 API |
| 消息推送延迟 | 用户错过成团通知 | 多通道推送（APP+短信） |
| 数据库单点 | 主库故障导致服务不可用 | 后期做主从复制 |

---

## 10. MVP 阶段技术约束

| 项目 | 约束 | 原因 |
|-----|------|------|
| 商家数据 | 使用模拟数据 | MVP 不对接真实商家 |
| 支付 | 模拟支付成功 | 需商户号申请 |
| 短信 | 开发环境跳过 | 需短信通道申请 |
| 推送 | 极简实现 | 后期对接极光/友盟 |
| 用户量 | 单公司内测 < 100人 | 控制风险 |
| 并发 | 单拼饭团 < 20人 | 产品限制 |

---

*文档版本：V1.0*
*创建时间：2026-05-06*
*架构师：AI Agent*
