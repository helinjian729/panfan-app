# 拼饭 App iOS 客户端

## 项目概述

拼饭是一款帮助白领上班族中午一起拼单点外卖的iOS应用，让你和同事一起凑满减，更划算！

## 技术栈

- **UI框架**: SwiftUI
- **架构模式**: MVVM
- **网络请求**: Alamofire
- **WebSocket**: Socket.IO
- **安全存储**: KeychainAccess
- **布局**: SnapKit (部分视图)

## 项目结构

```
ios/
├── Sources/
│   ├── App/                  # 应用入口
│   │   └── PanFanApp.swift
│   ├── Models/               # 数据模型
│   │   ├── User.swift
│   │   ├── Restaurant.swift
│   │   ├── Group.swift
│   │   └── Order.swift
│   ├── Services/             # 服务层
│   │   ├── APIService.swift
│   │   ├── AuthService.swift
│   │   └── WebSocketService.swift
│   ├── ViewModels/           # ViewModel层
│   │   ├── AuthViewModel.swift
│   │   ├── HomeViewModel.swift
│   │   ├── GroupViewModel.swift
│   │   ├── RestaurantViewModel.swift
│   │   └── OrderViewModel.swift
│   ├── Views/                # 视图层
│   │   ├── LoginView.swift
│   │   ├── MainTabView.swift
│   │   ├── HomeView.swift
│   │   ├── CreateGroupView.swift
│   │   ├── JoinGroupView.swift
│   │   ├── GroupDetailView.swift
│   │   ├── RestaurantMenuView.swift
│   │   ├── CartView.swift
│   │   ├── OrderListView.swift
│   │   ├── OrderDetailView.swift
│   │   └── ProfileView.swift
│   └── Utils/                # 工具类
│       └── KeychainHelper.swift
└── Resources/
    └── Info.plist
```

## 依赖安装

本项目使用 Swift Package Manager 管理依赖，无需手动安装。

## 运行项目

1. 使用 XcodeGen 生成项目文件：
   ```bash
   xcodegen generate
   ```

2. 使用 Xcode 打开 `Sources.xcodeproj`

3. 选择目标设备（iPhone模拟器）

4. 按 Cmd+R 运行

## 主要功能

### 1. 用户认证
- 手机号 + 验证码登录
- Token 安全存储

### 2. 发起拼饭
- 选择商家
- 添加菜品到购物车
- 设置拼饭团信息（名称、人数、截止时间）
- 生成邀请码分享给同事

### 3. 加入拼饭
- 输入邀请码加入已有拼饭团
- 添加自己的菜品

### 4. 凑单计算
- 实时计算满减进度
- 显示距离满减门槛还需多少

### 5. 订单管理
- 查看订单列表
- 订单详情
- 模拟支付

### 6. WebSocket 实时同步
- 成员加入/退出通知
- 菜品变更实时同步
- 拼饭团状态变更通知

## API 配置

默认配置连接本地后端服务：
```
http://localhost:3000/api/v1
```

如需修改，编辑 `Sources/Services/APIService.swift` 中的 `APIConfig.baseURL`。

## 测试账号

开发环境可使用任意手机号和验证码 `123456` 登录。
