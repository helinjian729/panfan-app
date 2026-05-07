# 拼饭 App 后端服务

## 快速启动

### 开发环境

```bash
# 安装依赖
npm install

# 生成 Prisma 客户端
npx prisma generate

# 启动开发服务器
npm run start:dev
```

### 数据库

```bash
# 推送 schema 到数据库
npx prisma db push

# 打开 Prisma Studio
npx prisma studio
```

### 环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

### API 文档

启动服务后访问：http://localhost:3000/api/docs

## 接口列表

### 认证模块
- `POST /api/v1/auth/send-code` - 发送验证码
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/refresh` - 刷新Token

### 用户模块
- `GET /api/v1/users/profile` - 获取个人资料
- `PUT /api/v1/users/profile` - 更新个人资料

### 商家模块
- `GET /api/v1/restaurants` - 商家列表
- `GET /api/v1/restaurants/:id` - 商家详情
- `GET /api/v1/restaurants/:id/menu` - 商家菜单
- `GET /api/v1/restaurants/:id/discount-info` - 满减信息

### 拼饭团模块
- `POST /api/v1/groups` - 发起拼饭团
- `GET /api/v1/groups` - 拼饭团列表
- `GET /api/v1/groups/nearby` - 附近拼饭团
- `GET /api/v1/groups/:id` - 拼饭团详情
- `POST /api/v1/groups/join` - 加入拼饭团
- `POST /api/v1/groups/:id/cancel` - 取消拼饭团
- `POST /api/v1/groups/:id/leave` - 退出拼饭团
- `GET /api/v1/groups/:id/items` - 获取菜品清单
- `POST /api/v1/groups/:id/items` - 添加菜品
- `DELETE /api/v1/groups/:id/items/:itemId` - 删除菜品
- `GET /api/v1/groups/:id/calculate` - 计算凑单

### 订单模块
- `POST /api/v1/orders` - 创建订单
- `GET /api/v1/orders` - 订单列表
- `GET /api/v1/orders/:id` - 订单详情
- `POST /api/v1/orders/:id/pay` - 支付订单
- `POST /api/v1/orders/:id/cancel` - 取消订单

### WebSocket

连接地址：`ws://localhost:3000/groups`

事件：
- `auth` - 用户认证
- `join_group` - 加入拼饭团房间
- `leave_group` - 离开拼饭团房间
- `item_added` - 菜品添加通知
- `item_removed` - 菜品删除通知
- `group_status_change` - 拼饭团状态变更
- `cart_update` - 购物车更新

## 测试账号

开发环境可使用任意手机号和验证码 `123456` 登录。
