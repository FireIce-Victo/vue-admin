<p align="center">
  <a href="#chinese">中文</a> &nbsp;|&nbsp; <a href="#english">English</a>
</p>

---

<h1 id="chinese" align="center">Vue Admin</h1>

<p align="center">基于 Vue 3 + Vite + Element Plus 的通用后台管理系统模板</p>

---

## 📖 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [页面模块](#页面模块)
- [路由配置](#路由配置)
- [API 接口](#api-接口)
- [状态管理](#状态管理)
- [配置说明](#配置说明)
- [调试模式](#调试模式)

---

## 功能特性

- ✅ **RBAC 权限管理** — 用户管理、角色管理、权限（菜单/按钮/接口）管理
- ✅ **数据可视化** — ECharts 图表展示（折线图、饼图）
- ✅ **地图集成** — OpenLayers 地图展示
- ✅ **登录鉴权** — 登录/退出、JWT（裸 token + 前端统一 Bearer）、路由守卫
- ✅ **RBAC 权限落地** — 后端返回权限码，前端过滤菜单/路由/按钮（`v-permission` 指令）
- ✅ **预览模式** — `VITE_SKIP_LOGIN` 免登录浏览全部页面（开发调试，上线前移除）
- ✅ **表格展示** — 支持筛选、分页、新增/编辑/删除
- ✅ **响应式布局** — 侧边栏折叠、面包屑导航、标签页导航
- ✅ **自动导入** — Element Plus 组件按需自动导入
- ✅ **SVG 图标** — 本地 SVG 图标管理

---

## 技术栈

| 技术 | 版本 |
|------|------|
| Vue | 3.5 |
| Vite | 7.3 |
| Vue Router | 5.0 |
| Pinia | 3.0 |
| Element Plus | 2.13 |
| ECharts | 6.0 |
| OpenLayers | 10.10 |
| Axios | 1.13 |
| SCSS | 1.97 |

---

## 项目结构

```
vue-admin
├── public/                     # 静态资源
├── src/
│   ├── api/                    # 接口请求
│   │   ├── login.js            #   登录相关
│   │   ├── user.js             #   用户管理
│   │   ├── role.js             #   角色管理
│   │   ├── permission.js       #   权限管理
│   │   └── table.js            #   表格数据
│   ├── assets/                 # 静态资源
│   │   └── icons/              #   SVG 图标
│   ├── components/             # 公共组件
│   │   ├── Pagination/         #   分页组件
│   │   ├── SvgIcon/            #   SVG 图标组件
│   │   └── statCharts/         #   图表组件（折线/柱状/饼/水球/散点/雷达）
│   ├── composables/            # 组合式函数（Vue 3 hooks）
│   │   └── useWebSocket.js     #   WebSocket 封装（创建连接/关闭连接/发送心跳）
│   ├── directives/             # 自定义指令
│   │   └── permission.js       #   v-permission 按钮级权限
│   ├── layout/                 # 布局组件
│   ├── router/                 # 路由配置
│   │   ├── index.js            #   路由入口（守卫 + 权限校验）
│   │   └── modules/            #   路由模块（meta.perms 权限声明）
│   │       ├── dashboard.js    #     首页
│   │       ├── tableShow.js    #     表格展示
│   │       ├── chartsShow.js   #     图表展示
│   │       ├── websocket.js    #     WebSocket 连接管理
│   │       ├── fileUpload.js   #     文件上传
│   │       ├── systemManage.js #     系统管理
│   │       └── mapShow.js      #     地图展示
│   ├── stores/                 # Pinia 状态管理
│   │   ├── index.js            #   入口
│   │   └── modules/            #   模块
│   │       ├── app.js          #     应用状态
│   │       ├── user.js         #     用户状态（token/权限码/loadPerms/logout）
│   │       └── tagsView.js     #     标签页状态
│   ├── styles/                 # 全局样式
│   │   ├── variables.scss      #   SCSS 变量
│   │   └── index.scss          #   全局样式入口
│   ├── utils/                  # 工具函数
│   │   ├── request.js          #   Axios 封装（token/401/错误统一处理）
│   │   ├── permission.js       #   权限工具（hasPerm/菜单过滤/预览模式）
│   │   └── echarts.js          #   echarts 按需注册入口
│   └── views/                  # 页面组件
│       ├── login/              #   登录页
│       ├── dashboard/          #   首页仪表盘
│       ├── tableShow/          #   表格展示
│       ├── chartsShow/         #   图表展示
│       ├── websocket/          #   WebSocket 连接验证台
│       ├── fileUpload/         #   文件上传
│       ├── mapShow/            #   地图展示
│       └── systemManage/       #   系统管理
│           ├── userManage/     #     用户管理
│           ├── roleManage/     #     角色管理
│           └── permissionManage/ #   权限管理
├── .env                        # 环境变量
├── .env.development            # 开发环境变量
├── .env.production             # 生产环境变量
├── vite.config.js              # Vite 配置
├── package.json
└── README.md
```

---

## 快速开始

### 环境要求

- **Node.js** >= 18
- **npm** >= 9

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

默认访问地址：`http://localhost:3000`（端口可在 `.env` 或 `.env.development` 中修改）

### 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录。

### 预览生产构建

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

---

## 页面模块

| 模块 | 路由 | 说明 |
|------|------|------|
| 登录页 | `/login` | 用户登录 |
| 首页 | `/dashboard` | 统计卡片、图表、最近新增用户 |
| 表格展示 | `/table-show` | 数据列表、筛选、分页、CRUD |
| 图表展示 | `/charts-show` | ECharts 图表演示（useEcharts 封装、按需引入） |
| 地图展示 | `/map-show` | OpenLayers 地图展示 |
| WebSocket | `/websocket` | 连接管理验证台（创建连接/关闭连接/发送心跳，含 RTT 与事件日志） |
| 文件上传 | `/file-upload` | 拖拽上传（el-upload，当前为模拟实现，可接后端 `/api/file`） |
| 用户管理 | `/system-manage/user-manage` | 用户 CRUD、分配角色（含过期）、直授权限 |
| 角色管理 | `/system-manage/role-manage` | 角色树 CRUD、分配权限（父角色继承） |
| 权限管理 | `/system-manage/permission-manage` | 目录/菜单/按钮/接口四类权限树形管理 |

---

## 路由配置

路由模块放在 `src/router/modules/` 下，通过 `import.meta.glob` 自动加载，新增文件即可自动注册：

```js
// src/router/modules/example.js
import Layout from '@/layout/index.vue'

export default {
  path: '/example',
  component: Layout,
  name: 'example',
  order: 99,
  meta: {
    title: '示例',
    icon: 'example-icon'
  },
  children: [
    {
      path: 'index',
      name: 'example-index',
      component: () => import('@/views/example/index.vue'),
      meta: { title: '示例页' }
    }
  ]
}
```

---

## API 接口

接口封装在 `src/api/` 下，按模块拆分：

```js
import { getTableList, addTableData, updateTableData, deleteTableData } from '@/api/table'
```

开发环境通过 Vite 代理转发到后端：

```js
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:3008',
    changeOrigin: true
  }
}
```

可根据需要修改 `target` 地址。

---

## 状态管理

使用 Pinia 管理全局状态，包含三个模块：

| Store | 文件 | 说明 |
|-------|------|------|
| `appStore` | `stores/modules/app.js` | 侧边栏折叠、设备类型 |
| `userStore` | `stores/modules/user.js` | 登录状态、用户信息、Token |
| `tagsViewStore` | `stores/modules/tagsView.js` | 标签页导航 |

---

## 配置说明

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_APP_PORT` | 开发服务器端口 | `3000` |
| `VITE_APP_TITLE` | 应用标题 | - |

### SCSS 变量

全局 SCSS 变量定义在 `src/styles/variables.scss`，已在 `vite.config.js` 中配置自动注入，任意 `.vue` 文件可直接使用。

---

## RBAC 权限落地

登录后前端通过 `GET /api/user/perms` 获取当前用户的权限编码集合（角色继承 + 直授 allow + deny 剔除），存入 `userStore.perms`，实现三层控制：

1. **路由守卫** — 路由模块声明 `meta.perms`，守卫校验不通过则拦截（`src/router/index.js`）；
2. **菜单过滤** — 侧边栏用 `filterRoutesByPerms()` 按权限过滤路由树（`src/utils/permission.js`）；
3. **按钮级** — `v-permission="'system:user:delete'"` 指令，无权限直接移除元素。

权限编码规范：`module:resource:action`（如 `system:user:list`），与后端 `va_permission.code` 一致。

---

## 调试模式（预览模式）

在 `.env.development` 中设置 `VITE_SKIP_LOGIN=true` 可跳过登录与权限校验，方便不启动后端直接预览全部页面：

```ini
# .env.development
VITE_SKIP_LOGIN=true
```

- 预览模式下菜单/路由/按钮全部放行（`src/utils/permission.js` 中 `isPreviewMode`）；
- **上线前必须移除**该配置（生产环境不设置即恢复正常权限逻辑）；
- 修改环境变量后需**重启** `npm run dev`（构建期常量）。

---

<br>
<br>

---

<h1 id="english" align="center">Vue Admin</h1>

<p align="center">A universal admin dashboard template built with Vue 3 + Vite + Element Plus</p>

---

## 📖 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Pages](#pages)
- [Routing](#routing)
- [API](#api)
- [State Management](#state-management)
- [Configuration](#configuration)
- [Debug Mode](#debug-mode)

---

## Features

- ✅ **RBAC Access Control** — User / Role / Permission (menu, button, API) management
- ✅ **Data Visualization** — ECharts charts (line, pie)
- ✅ **Map Integration** — OpenLayers map display
- ✅ **Authentication** — Login/logout, JWT (bare token + `Bearer` prefix on the client), route guards
- ✅ **RBAC Frontend** — permission codes drive menu/route/button filtering (`v-permission` directive)
- ✅ **Preview Mode** — browse all pages without login (`VITE_SKIP_LOGIN`, dev only, remove before release)
- ✅ **Table Display** — Search, pagination, CRUD operations
- ✅ **Responsive Layout** — Collapsible sidebar, breadcrumb, tab navigation
- ✅ **Auto Import** — On-demand Element Plus component auto-import
- ✅ **SVG Icons** — Local SVG icon management

---

## Tech Stack

| Tech | Version |
|------|---------|
| Vue | 3.5 |
| Vite | 7.3 |
| Vue Router | 5.0 |
| Pinia | 3.0 |
| Element Plus | 2.13 |
| ECharts | 6.0 |
| OpenLayers | 10.10 |
| Axios | 1.13 |
| SCSS | 1.97 |

---

## Project Structure

```
vue-admin
├── public/                     # Static assets
├── src/
│   ├── api/                    # API requests
│   │   ├── login.js            #   Login
│   │   ├── user.js             #   User management
│   │   ├── role.js             #   Role management
│   │   ├── permission.js       #   Permission management
│   │   └── table.js            #   Table data
│   ├── assets/                 # Static resources
│   │   └── icons/              #   SVG icons
│   ├── components/             # Shared components
│   │   ├── Pagination/         #   Pagination
│   │   ├── SvgIcon/            #   SVG icon component
│   │   └── statCharts/         #   Chart components (line/bar/pie/liquid/scatter/radar)
│   ├── composables/            # Vue 3 composables (hooks)
│   │   └── useWebSocket.js     #   WebSocket wrapper (create/close/heartbeat)
│   ├── directives/             # Custom directives
│   │   └── permission.js       #   v-permission button-level access control
│   ├── layout/                 # Layout components
│   ├── router/                 # Route configuration
│   │   ├── index.js            #   Router entry (guards + permission check)
│   │   └── modules/            #   Route modules (meta.perms declaration)
│   │       ├── dashboard.js    #     Dashboard
│   │       ├── tableShow.js    #     Table
│   │       ├── chartsShow.js   #     Charts
│   │       ├── websocket.js    #     WebSocket connection
│   │       ├── fileUpload.js   #     File upload
│   │       ├── systemManage.js #     System
│   │       └── mapShow.js      #     Map
│   ├── stores/                 # Pinia stores
│   │   ├── index.js            #   Entry
│   │   └── modules/            #   Modules
│   │       ├── app.js          #     App state
│   │       ├── user.js         #     User state (token/perms/loadPerms/logout)
│   │       └── tagsView.js     #     Tags view state
│   ├── styles/                 # Global styles
│   │   ├── variables.scss      #   SCSS variables
│   │   └── index.scss          #   Global style entry
│   ├── utils/                  # Utilities
│   │   ├── request.js          #   Axios wrapper (token/401/errors)
│   │   ├── permission.js       #   Permission utils (hasPerm/menu filter/preview mode)
│   │   └── echarts.js          #   echarts on-demand registration
│   └── views/                  # Page components
│       ├── login/              #   Login
│       ├── dashboard/          #   Dashboard
│       ├── tableShow/          #   Table
│       ├── chartsShow/         #   Charts
│       ├── websocket/          #   WebSocket console
│       ├── fileUpload/         #   File upload
│       ├── mapShow/            #   Map
│       └── systemManage/       #   System
│           ├── userManage/     #     User
│           ├── roleManage/     #     Role
│           └── permissionManage/ #  Permission
├── .env                        # Environment variables
├── .env.development            # Dev environment
├── .env.production             # Prod environment
├── vite.config.js              # Vite config
├── package.json
└── README.md
```

---

## Quick Start

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9

### Install Dependencies

```bash
npm install
```

### Start Dev Server

```bash
npm run dev
```

Default URL: `http://localhost:3000` (port can be changed in `.env` or `.env.development`)

### Build for Production

```bash
npm run build
```

Output in `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

## Pages

| Module | Route | Description |
|------|------|------|
| Login | `/login` | User login |
| Dashboard | `/dashboard` | Stat cards, charts, recent users |
| Table | `/table-show` | Data list, search, pagination, CRUD |
| Charts | `/charts-show` | ECharts demo (useEcharts wrapper, on-demand import) |
| Map | `/map-show` | OpenLayers map demo |
| WebSocket | `/websocket` | Connection console (create / close / heartbeat, with RTT and event log) |
| File Upload | `/file-upload` | Drag & drop upload (el-upload, mock now, backend `/api/file` ready) |
| User Mgmt | `/system-manage/user-manage` | User CRUD, role assignment (with expiry), direct permissions |
| Role Mgmt | `/system-manage/role-manage` | Role tree CRUD, permission assignment (parent inheritance) |
| Permission Mgmt | `/system-manage/permission-manage` | Directory/menu/button/API tree management |

---

## Routing

Route modules are placed in `src/router/modules/` and auto-loaded via `import.meta.glob`:

```js
// src/router/modules/example.js
import Layout from '@/layout/index.vue'

export default {
  path: '/example',
  component: Layout,
  name: 'example',
  order: 99,
  meta: {
    title: 'Example',
    icon: 'example-icon'
  },
  children: [
    {
      path: 'index',
      name: 'example-index',
      component: () => import('@/views/example/index.vue'),
      meta: { title: 'Example Page' }
    }
  ]
}
```

---

## API

API functions are organized by module under `src/api/`:

```js
import { getTableList, addTableData, updateTableData, deleteTableData } from '@/api/table'
```

Dev requests are proxied to backend via Vite:

```js
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:3008',
    changeOrigin: true
  }
}
```

Update `target` to match your backend address.

---

## State Management

Global state is managed via Pinia with three modules:

| Store | File | Description |
|-------|------|------|
| `appStore` | `stores/modules/app.js` | Sidebar collapse, device type |
| `userStore` | `stores/modules/user.js` | Login state, user info, token |
| `tagsViewStore` | `stores/modules/tagsView.js` | Tab navigation |

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|------|------|--------|
| `VITE_APP_PORT` | Dev server port | `3000` |
| `VITE_APP_TITLE` | App title | - |

### SCSS Variables

Global SCSS variables are defined in `src/styles/variables.scss` and auto-injected via `vite.config.js`, available in any `.vue` file.

---

## RBAC Implementation

After login the frontend fetches the current user's permission codes via `GET /api/user/perms` (role inheritance + direct allow, deny removed) and stores them in `userStore.perms`. Three layers of control:

1. **Route guard** — route modules declare `meta.perms`; the guard blocks access without the required code (`src/router/index.js`);
2. **Menu filter** — the sidebar filters the route tree by permissions via `filterRoutesByPerms()` (`src/utils/permission.js`);
3. **Button level** — `v-permission="'system:user:delete'"` directive removes the element when unauthorized.

Permission code format: `module:resource:action` (e.g. `system:user:list`), matching backend `va_permission.code`.

---

## Debug / Preview Mode

Set `VITE_SKIP_LOGIN=true` in `.env.development` to bypass login and permission checks, so you can preview every page without starting the backend:

```ini
# .env.development
VITE_SKIP_LOGIN=true
```

- In preview mode all menus/routes/buttons are allowed (`isPreviewMode` in `src/utils/permission.js`);
- **Remove it before release** (production without the flag restores normal permission logic);
- Restart `npm run dev` after changing env vars (they are build-time constants).

---

<p align="center">Made with ❤️ by Vue Admin Team</p>