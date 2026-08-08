# RBAC 通用权限管理数据表设计方案

> 一套适配多场景（单租户后台 / 多租户 SaaS / 企业组织架构 / 微服务权限中心）的通用 RBAC 数据库设计，基于 MySQL 8.0+。

---

## 目录

- [1. 设计理念](#1-设计理念)
- [2. 整体架构](#2-整体架构)
- [3. 核心表设计（6 张）](#3-核心表设计6-张)
- [4. 扩展表设计（4 张可选）](#4-扩展表设计4-张可选)
- [5. 权限编码规范](#5-权限编码规范)
- [6. 权限解析流程](#6-权限解析流程)
- [7. 核心查询 SQL 示例](#7-核心查询-sql-示例)
- [8. 多场景适配指南](#8-多场景适配指南)
- [9. 与现有 va_* 表对照说明](#9-与现有-va_-表对照说明)

---

## 1. 设计理念

### 1.1 核心原则

| 原则 | 说明 |
|------|------|
| **身份与授权分离** | 用户表只存身份信息，绝不存 `role` 字段；授权通过关联表完成 |
| **角色是权限的集合** | 不直接给用户分配权限，通过角色间接授权（例外场景支持用户直授） |
| **RBAC + 资源级权限** | 权限定义为 `{资源} + {操作}` 对，支持模块化编码 |
| **树形层级继承** | 角色可继承父角色权限，菜单/部门支持无限级树形结构 |
| **后端强制校验** | 前端隐藏菜单/按钮仅是 UX 优化，真正的安全控制在后端中间件 |
| **数据权限独立一层** | 功能权限（能做什么操作）与数据权限（能看什么数据）分层管理 |

### 1.2 权限模型演进路径

```
Level 1: RBAC 基础        →  用户 ↔ 角色 ↔ 权限          （简单后台）
Level 2: RBAC + 角色继承  →  Level 1 + 角色 parent_id    （中大型系统）
Level 3: RBAC + 部门隔离  →  Level 2 + 部门树 + 数据范围  （企业管理系统）
Level 4: RBAC + 多租户    →  Level 3 + tenant_id 隔离     （SaaS 平台）
Level 5: RBAC + 微服务    →  Level 4 + 权限中心独立服务   （微服务架构）
```

---

## 2. 整体架构

### 2.1 ER 关系图（ASCII）

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│   sys_user   │       │    sys_role      │       │sys_permission│
│──────────────│       │──────────────────│       │──────────────│
│ id           │──┐    │ id               │   ┌───│ id           │
│ username     │  │    │ name             │   │   │ parent_id ◄──┤(自引用)
│ password     │  │    │ code (UNIQUE)    │   │   │ name         │
│ real_name    │  │    │ parent_id ◄──────┤(自引用)│ code (UK)    │
│ email        │  │    │ description      │   │   │ type         │
│ phone        │  │    │ sort             │   │   │ resource     │
│ avatar       │  │    │ status           │   │   │ action       │
│ status       │  │    │ is_system        │   │   │ path         │
│ created_at   │  │    │ created_at       │   │   │ component    │
│ updated_at   │  │    │ updated_at       │   │   │ icon         │
└──────────────┘  │    └──────────────────┘   │   │ sort         │
                  │              │             │   │ status       │
                  │              │             │   └──────────────┘
                  │              │             │          │
                  ▼              ▼             │          │
         ┌────────────────┐  ┌───────────────────────────┐
         │ sys_user_role  │  │  sys_role_permission      │
         │────────────────│  │───────────────────────────│
 ┌───────│ user_id  (FK)  │  │  role_id       (FK)       │
 │       │ role_id  (FK)  │  │  permission_id (FK)       │
 │       │ assigned_by    │  │  created_at               │
 │       │ expires_at     │  └───────────────────────────┘
 │       │ created_at     │
 │       └────────────────┘
 │
 │       ┌──────────────────────────┐
 │       │ sys_user_permission      │  ← 用户直授（例外场景）
 │       │──────────────────────────│
 └──────►│ user_id       (FK)       │
         │ permission_id (FK)       │
         │ effect    (allow/deny)   │  ← allow=白名单, deny=黑名单
         │ granted_by               │
         │ expires_at               │
         │ created_at               │
         └──────────────────────────┘


┌─────────────────┐     ┌────────────────────────┐     ┌──────────────────┐
│ sys_department  │     │ sys_user_department    │     │ sys_data_scope   │
│─────────────────│     │────────────────────────│     │──────────────────│
│ id              │     │ user_id       (FK)     │     │ id               │
│ parent_id ◄─────┤(自引用)│ dept_id       (FK)     │     │ role_id     (FK)│
│ name            │     │ is_primary             │     │ dept_id     (FK) │
│ code            │     │ created_at             │     │ scope            │
│ path      (UK)  │     └────────────────────────┘     │ custom_dept_ids  │
│ level           │                                    │ created_at       │
│ sort            │                                    └──────────────────┘
│ status          │
│ created_at      │     ┌──────────────────┐
│ updated_at      │     │sys_operation_log │
└─────────────────┘     │──────────────────│
                        │ id               │
                        │ user_id          │
                        │ username         │
                        │ module           │
                        │ action           │
                        │ target           │
                        │ target_id        │
                        │ request_method   │
                        │ request_url      │
                        │ request_params   │
                        │ request_body     │
                        │ response_status  │
                        │ ip_address       │
                        │ user_agent       │
                        │ duration_ms      │
                        │ error_message    │
                        │ created_at       │
                        └──────────────────┘
```

### 2.2 权限解析完整链路

```
用户请求
  │
  ▼
1. 认证 (JWT/Session)  →  确认 req.auth.id
  │
  ▼
2. 查用户角色 (含继承) →  sys_user_role + sys_role(parent_id 递归)
  │
  ▼
3. 角色权限聚合        →  sys_role_permission (角色权限 UNION)
  │
  ▼
4. 叠加用户直授        →  sys_user_permission (allow 追加, deny 移除)
  │
  ▼
5. 功能权限检查        →  比对请求的 resource:action 是否在权限集合中
  │
  ▼
6. 数据权限过滤        →  sys_data_scope 决定可见数据范围 (self/dept/subtree/all)
  │
  ▼
7. 记录审计日志        →  sys_operation_log
```

---

## 3. 核心表设计（6 张）

### 3.1 sys_user — 用户表

**纯身份信息，不包含任何授权字段。**

```sql
CREATE TABLE `sys_user` (
  `id`          INT UNSIGNED   NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username`    VARCHAR(50)    NOT NULL COMMENT '用户名（登录用）',
  `password`    VARCHAR(255)   NOT NULL COMMENT '密码（bcrypt/argon2 哈希）',
  `real_name`   VARCHAR(50)    DEFAULT NULL COMMENT '真实姓名',
  `email`       VARCHAR(100)   DEFAULT NULL COMMENT '邮箱',
  `phone`       VARCHAR(20)    DEFAULT NULL COMMENT '手机号',
  `avatar`      VARCHAR(500)   DEFAULT NULL COMMENT '头像URL',
  `gender`      TINYINT        DEFAULT 0 COMMENT '性别: 0-未知 1-男 2-女',
  `status`      TINYINT        NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用 1-启用',
  `last_login_time` DATETIME   DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip`   VARCHAR(50) DEFAULT NULL COMMENT '最后登录IP',
  `created_at`  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at`  DATETIME       DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `idx_status` (`status`),
  KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统用户';
```

### 3.2 sys_role — 角色表

**支持层级继承：`parent_id` 自引用，父角色的权限自动被子角色继承。**

```sql
CREATE TABLE `sys_role` (
  `id`          INT UNSIGNED   NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `name`        VARCHAR(50)    NOT NULL COMMENT '角色名称',
  `code`        VARCHAR(50)    NOT NULL COMMENT '角色编码（唯一标识，如 admin/editor/viewer）',
  `parent_id`   INT UNSIGNED   DEFAULT NULL COMMENT '父角色ID（NULL=顶级角色，继承父角色的所有权限）',
  `description` VARCHAR(500)   DEFAULT NULL COMMENT '描述',
  `sort`        INT            NOT NULL DEFAULT 0 COMMENT '排序（越小越靠前）',
  `status`      TINYINT        NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用 1-启用',
  `is_system`   TINYINT        NOT NULL DEFAULT 0 COMMENT '是否系统内置: 0-否 1-是（内置角色不可删除）',
  `created_at`  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_role_parent` FOREIGN KEY (`parent_id`) REFERENCES `sys_role` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统角色';
```

**角色继承示例：**
```
super_admin (顶级)
  ├── admin (继承 super_admin 全部权限 + 自己的权限)
  │     ├── content_admin (继承 admin + 自己的内容管理权限)
  │     └── user_admin    (继承 admin + 自己的用户管理权限)
  └── editor (继承 super_admin 部分权限)
```

### 3.3 sys_permission — 权限资源表

**核心创新：合并"菜单管理"和"权限管理"为一张表。通过 `type` 区分菜单、按钮、API 三种粒度，`parent_id` 支持无限级树形结构。**

```sql
CREATE TABLE `sys_permission` (
  `id`          INT UNSIGNED   NOT NULL AUTO_INCREMENT COMMENT '权限ID',
  `parent_id`   INT UNSIGNED   NOT NULL DEFAULT 0 COMMENT '父权限ID（0=顶级）',
  `name`        VARCHAR(100)   NOT NULL COMMENT '权限名称（菜单名/按钮名/接口名）',
  `code`        VARCHAR(200)   NOT NULL COMMENT '权限编码（唯一，格式: module:resource:action）',
  `type`        ENUM('directory','menu','button','api') NOT NULL DEFAULT 'api' COMMENT '类型: directory=目录 menu=菜单 button=按钮 api=接口',
  `resource`    VARCHAR(100)   DEFAULT NULL COMMENT '资源标识（如 user/role/article）',
  `action`      VARCHAR(50)    DEFAULT NULL COMMENT '操作标识（如 list/create/update/delete/export/import）',
  `path`        VARCHAR(200)   DEFAULT NULL COMMENT '路由路径（菜单时使用，如 /system/user）',
  `component`   VARCHAR(200)   DEFAULT NULL COMMENT '前端组件路径（菜单时使用，如 system/user/index）',
  `icon`        VARCHAR(100)   DEFAULT NULL COMMENT '图标（菜单时使用）',
  `redirect`    VARCHAR(200)   DEFAULT NULL COMMENT '重定向地址',
  `is_visible`  TINYINT        NOT NULL DEFAULT 1 COMMENT '是否在菜单中可见: 0-隐藏 1-可见（按钮/API 通常隐藏）',
  `is_cache`    TINYINT        NOT NULL DEFAULT 0 COMMENT '是否缓存页面: 0-否 1-是',
  `sort`        INT            NOT NULL DEFAULT 0 COMMENT '排序（同级内越小越靠前）',
  `status`      TINYINT        NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用 1-启用',
  `remark`      VARCHAR(500)   DEFAULT NULL COMMENT '备注',
  `created_at`  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_type` (`type`),
  KEY `idx_resource_action` (`resource`, `action`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统权限（菜单/按钮/API）';
```

**type 说明：**

| type | 用途 | path/component | code 示例 |
|------|------|----------------|-----------|
| `directory` | 目录容器（不绑定路由） | 仅 path | `system` |
| `menu` | 菜单/页面（绑定前端路由） | path + component | `system:user:page` |
| `button` | 页面内按钮（增删改查导出） | 可不填 | `system:user:create` |
| `api` | 后端 API 接口 | 可不填 | `system:user:list` |

**树形结构示例：**
```
system (directory) ─ code: system
├── system:user (directory)
│   ├── system:user:page     (menu)   → /system/user, UserList.vue
│   ├── system:user:list     (api)    → GET  /api/user/list
│   ├── system:user:create   (button) → 新增按钮 + POST /api/user
│   ├── system:user:update   (button) → 编辑按钮 + PUT  /api/user/:id
│   ├── system:user:delete   (button) → 删除按钮 + DELETE /api/user/:id
│   └── system:user:export   (button) → 导出按钮
├── system:role (directory)
│   ├── system:role:page     (menu)
│   └── system:role:assign   (api)
└── system:permission (directory)
    └── system:permission:page (menu)
```

### 3.4 sys_user_role — 用户-角色关联表

**支持临时授权（expires_at）和审计追溯（assigned_by）。**

```sql
CREATE TABLE `sys_user_role` (
  `id`          INT UNSIGNED   NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `user_id`     INT UNSIGNED   NOT NULL COMMENT '用户ID',
  `role_id`     INT UNSIGNED   NOT NULL COMMENT '角色ID',
  `assigned_by` INT UNSIGNED   DEFAULT NULL COMMENT '授权人ID',
  `expires_at`  DATETIME       DEFAULT NULL COMMENT '过期时间（NULL=永久有效）',
  `created_at`  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_role` (`user_id`, `role_id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `fk_ur_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `sys_role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户-角色关联';
```

### 3.5 sys_role_permission — 角色-权限关联表

```sql
CREATE TABLE `sys_role_permission` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `role_id`       INT UNSIGNED NOT NULL COMMENT '角色ID',
  `permission_id` INT UNSIGNED NOT NULL COMMENT '权限ID',
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_rp` (`role_id`, `permission_id`),
  KEY `idx_permission_id` (`permission_id`),
  CONSTRAINT `fk_rp_role`       FOREIGN KEY (`role_id`)       REFERENCES `sys_role` (`id`)       ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rp_permission` FOREIGN KEY (`permission_id`) REFERENCES `sys_permission` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色-权限关联';
```

### 3.6 sys_user_permission — 用户-权限直接关联表

**用于例外授权场景：给某个用户单独开通或禁止某项权限，而不变更其角色。**

```sql
CREATE TABLE `sys_user_permission` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `user_id`       INT UNSIGNED NOT NULL COMMENT '用户ID',
  `permission_id` INT UNSIGNED NOT NULL COMMENT '权限ID',
  `effect`        ENUM('allow','deny') NOT NULL DEFAULT 'allow' COMMENT '效果: allow=白名单授权 deny=黑名单禁止（优先级最高）',
  `granted_by`    INT UNSIGNED DEFAULT NULL COMMENT '授权人ID',
  `expires_at`    DATETIME     DEFAULT NULL COMMENT '过期时间（NULL=永久）',
  `reason`        VARCHAR(500) DEFAULT NULL COMMENT '授权/禁止原因',
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_up` (`user_id`, `permission_id`),
  KEY `idx_permission_id` (`permission_id`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `fk_up_user`       FOREIGN KEY (`user_id`)       REFERENCES `sys_user` (`id`)       ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_up_permission` FOREIGN KEY (`permission_id`) REFERENCES `sys_permission` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户-权限直接关联（例外授权/禁止）';
```

**优先级规则：** `deny > allow（角色） > allow（直授）`。即如果用户被设了 `effect=deny`，即使角色有该权限也不生效。

---

## 4. 扩展表设计（4 张可选）

> 以下 4 张表根据业务复杂度按需启用。

### 4.1 sys_department — 部门/组织表

**使用 `path` 物化路径避免递归 CTE 查询祖先/后代，提升大数据量下的查询性能。**

```sql
CREATE TABLE `sys_department` (
  `id`          INT UNSIGNED   NOT NULL AUTO_INCREMENT COMMENT '部门ID',
  `parent_id`   INT UNSIGNED   NOT NULL DEFAULT 0 COMMENT '父部门ID（0=顶级）',
  `name`        VARCHAR(100)   NOT NULL COMMENT '部门名称',
  `code`        VARCHAR(100)   DEFAULT NULL COMMENT '部门编码',
  `path`        VARCHAR(500)   DEFAULT NULL COMMENT '物化路径（如 /1/3/8/，便于快速查子树）',
  `level`       TINYINT        NOT NULL DEFAULT 1 COMMENT '层级（1=顶级，根节点开始）',
  `leader_id`   INT UNSIGNED   DEFAULT NULL COMMENT '负责人ID',
  `sort`        INT            NOT NULL DEFAULT 0 COMMENT '排序',
  `status`      TINYINT        NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用 1-启用',
  `created_at`  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_path` (`path`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门/组织架构';
```

**path 物化路径示例：**
```
公司 (id=1, path=/, level=1)
├── 技术部 (id=2, path=/1/, level=2)
│   ├── 前端组 (id=3, path=/1/2/, level=3)
│   └── 后端组 (id=4, path=/1/2/, level=3)
└── 市场部 (id=5, path=/1/, level=2)
```
查询"技术部及所有子部门" → `WHERE path LIKE '/1/2/%' OR id = 2`

### 4.2 sys_user_department — 用户-部门关联表

**一个用户可属于多个部门（如虚线汇报、项目组借调），`is_primary` 标记主部门。**

```sql
CREATE TABLE `sys_user_department` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `user_id`     INT UNSIGNED NOT NULL COMMENT '用户ID',
  `dept_id`     INT UNSIGNED NOT NULL COMMENT '部门ID',
  `is_primary`  TINYINT      NOT NULL DEFAULT 0 COMMENT '是否主部门: 0-否 1-是',
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ud` (`user_id`, `dept_id`),
  KEY `idx_dept_id` (`dept_id`),
  CONSTRAINT `fk_ud_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`)       ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ud_dept` FOREIGN KEY (`dept_id`) REFERENCES `sys_department` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户-部门关联';
```

### 4.3 sys_data_scope — 数据权限范围表

**定义角色的数据可见范围。配合业务代码在 SQL 查询时追加 WHERE 条件。**

```sql
CREATE TABLE `sys_data_scope` (
  `id`              INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `role_id`         INT UNSIGNED NOT NULL COMMENT '角色ID',
  `scope`           ENUM('all','dept_subtree','dept_only','self_only','custom') NOT NULL DEFAULT 'self_only' COMMENT '数据范围: all=全部 dept_subtree=本部门及子部门 dept_only=仅本部门 self_only=仅本人 custom=自定义',
  `custom_dept_ids` VARCHAR(1000) DEFAULT NULL COMMENT '自定义部门ID列表（scope=custom 时使用，JSON数组格式）',
  `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_scope` (`role_id`),
  CONSTRAINT `fk_ds_role` FOREIGN KEY (`role_id`) REFERENCES `sys_role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据权限范围';
```

**数据范围说明：**

| scope | 含义 | WHERE 条件示例 |
|-------|------|---------------|
| `all` | 全部数据 | 不追加过滤 |
| `dept_subtree` | 本部门及子部门 | `WHERE dept_id IN (子部门ID列表)` |
| `dept_only` | 仅本部门 | `WHERE dept_id = 当前用户部门ID` |
| `self_only` | 仅本人 | `WHERE user_id = 当前用户ID` |
| `custom` | 自定义部门列表 | `WHERE dept_id IN (custom_dept_ids)` |

**注意：** 当一个用户拥有多个角色时，取所有角色中**最宽泛**的数据范围作为最终范围。

### 4.4 sys_operation_log — 操作日志表

**完整的审计追踪，记录每次敏感操作。**

```sql
CREATE TABLE `sys_operation_log` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `user_id`         INT UNSIGNED    DEFAULT NULL COMMENT '操作用户ID',
  `username`        VARCHAR(50)     DEFAULT NULL COMMENT '操作用户名（冗余，防止用户被删后无法追溯）',
  `module`          VARCHAR(100)    DEFAULT NULL COMMENT '操作模块（如 system:user）',
  `action`          VARCHAR(100)    DEFAULT NULL COMMENT '操作类型（如 create/update/delete/login/logout）',
  `target`          VARCHAR(200)    DEFAULT NULL COMMENT '操作对象（如 用户-张三）',
  `target_id`       VARCHAR(100)    DEFAULT NULL COMMENT '操作对象ID',
  `request_method`  VARCHAR(10)     DEFAULT NULL COMMENT '请求方法: GET/POST/PUT/DELETE',
  `request_url`     VARCHAR(500)    DEFAULT NULL COMMENT '请求URL',
  `request_params`  TEXT            DEFAULT NULL COMMENT '请求参数（Query String）',
  `request_body`    TEXT            DEFAULT NULL COMMENT '请求体（JSON，敏感字段需脱敏）',
  `response_status` INT             DEFAULT NULL COMMENT '响应HTTP状态码',
  `ip_address`      VARCHAR(50)     DEFAULT NULL COMMENT '客户端IP',
  `user_agent`      VARCHAR(500)    DEFAULT NULL COMMENT '客户端User-Agent',
  `duration_ms`     INT UNSIGNED    DEFAULT NULL COMMENT '执行耗时（毫秒）',
  `error_message`   TEXT            DEFAULT NULL COMMENT '错误信息（成功时为空）',
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_module_action` (`module`, `action`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_response_status` (`response_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志';

-- 定期归档清理（建议保留 90 天）
-- DELETE FROM sys_operation_log WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

---

## 5. 权限编码规范

### 5.1 编码格式

```
{module}:{resource}:{action}
```

| 段 | 说明 | 示例 |
|----|------|------|
| `module` | 业务模块 | `system`、`cms`、`order`、`finance` |
| `resource` | 资源对象 | `user`、`role`、`article`、`report` |
| `action` | 操作类型 | `page`、`list`、`create`、`update`、`delete`、`export`、`import`、`audit` |

### 5.2 标准动作列表

| action | 说明 | 对应 HTTP 方法 |
|--------|------|---------------|
| `page` | 页面入口（菜单） | GET |
| `list` | 列表/查询 | GET |
| `detail` | 查看详情 | GET /:id |
| `create` | 新增 | POST |
| `update` | 修改 | PUT /:id |
| `delete` | 删除 | DELETE /:id |
| `export` | 导出 | GET/POST |
| `import` | 导入 | POST |
| `audit` | 审核 | PUT /:id/audit |
| `grant` | 授权 | PUT /:id/permission |

### 5.3 完整编码示例

```
# 系统管理模块
system:user:page           # 用户管理页面
system:user:list           # 用户列表接口
system:user:detail         # 用户详情接口
system:user:create         # 新增用户
system:user:update         # 修改用户
system:user:delete         # 删除用户
system:user:export         # 导出用户
system:user:reset_pwd      # 重置密码

system:role:page           # 角色管理页面
system:role:list           # 角色列表
system:role:create         # 新增角色
system:role:update         # 修改角色
system:role:delete         # 删除角色
system:role:grant          # 角色授权

# 内容管理模块
cms:article:page           # 文章管理页面
cms:article:list           # 文章列表
cms:article:create         # 发布文章
cms:article:update         # 编辑文章
cms:article:delete         # 删除文章
cms:article:audit          # 审核文章
```

---

## 6. 权限解析流程

### 6.1 获取用户完整权限集

```
输入: userId
输出: Set<permission_code>

步骤:
1. 查用户所有有效角色（含过期检查）:
   SELECT r.id FROM sys_role r
   INNER JOIN sys_user_role ur ON r.id = ur.role_id
   WHERE ur.user_id = :userId
     AND r.status = 1
     AND (ur.expires_at IS NULL OR ur.expires_at > NOW())

2. 递归展开角色层级（获取父角色链）:
   WITH RECURSIVE role_chain AS (
     SELECT id, parent_id FROM sys_role WHERE id IN (:userRoleIds)
     UNION ALL
     SELECT r.id, r.parent_id FROM sys_role r
     INNER JOIN role_chain rc ON r.id = rc.parent_id
   )
   SELECT DISTINCT id FROM role_chain

3. 查角色对应的权限 code:
   SELECT DISTINCT p.code FROM sys_permission p
   INNER JOIN sys_role_permission rp ON p.id = rp.permission_id
   WHERE rp.role_id IN (:allRoleIds) AND p.status = 1

4. 叠加用户直授:
   -- 追加 allow
   SELECT p.code FROM sys_permission p
   INNER JOIN sys_user_permission up ON p.id = up.permission_id
   WHERE up.user_id = :userId AND up.effect = 'allow'
     AND p.status = 1
     AND (up.expires_at IS NULL OR up.expires_at > NOW())
   -- 移除 deny
   SELECT p.code FROM sys_permission p
   INNER JOIN sys_user_permission up ON p.id = up.permission_id
   WHERE up.user_id = :userId AND up.effect = 'deny'
     AND (up.expires_at IS NULL OR up.expires_at > NOW())

5. 最终结果 = (角色权限集合 ∪ allow集合) − deny集合
```

### 6.2 获取用户菜单树

```
输入: userId
输出: 树形菜单 JSON

步骤:
1. 获取用户完整权限 code 集合（见 6.1）
2. 查询 sys_permission 中 type IN ('directory','menu') 且 code IN (:userCodes) 的记录
3. 按 parent_id + sort 递归组装树形结构
4. 过滤掉 is_visible = 0 的节点（但保留其子节点用于路由注册）
```

### 6.3 获取用户数据范围

```
输入: userId
输出: { scope: 'all'|'dept_subtree'|..., deptIds: [...] }

步骤:
1. 查用户所有有效角色 → roleIds
2. 查 sys_data_scope WHERE role_id IN (:roleIds)
3. 取最宽泛的范围:
   优先级: all > dept_subtree > dept_only > self_only
   (如果有 custom，取所有 custom 的 dept_id 并集)
4. 根据 scope 计算实际可见的部门ID列表
```

---

## 7. 核心查询 SQL 示例

### 7.1 递归展开角色层级（获取所有祖先角色）

```sql
-- MySQL 8.0+ WITH RECURSIVE
-- 输入: 子角色ID列表
WITH RECURSIVE role_ancestors AS (
  -- 起点: 用户直接拥有的角色
  SELECT id, parent_id, name, 0 AS depth
  FROM sys_role
  WHERE id IN (2, 5)  -- 替换为实际的用户角色ID列表

  UNION ALL

  -- 递归: 向上查找父角色
  SELECT r.id, r.parent_id, r.name, ra.depth + 1
  FROM sys_role r
  INNER JOIN role_ancestors ra ON r.id = ra.parent_id
)
SELECT DISTINCT id, name, depth FROM role_ancestors ORDER BY depth;
```

### 7.2 获取用户所有权限编码（一步到位）

```sql
-- 整合角色权限 + 用户直授，返回最终权限集合
SELECT code FROM (
  -- 通过角色获得的权限（含角色继承）
  SELECT DISTINCT p.code, 1 AS priority
  FROM sys_permission p
  INNER JOIN sys_role_permission rp ON p.id = rp.permission_id
  WHERE rp.role_id IN (
    WITH RECURSIVE role_chain AS (
      SELECT r.id, r.parent_id
      FROM sys_role r
      INNER JOIN sys_user_role ur ON r.id = ur.role_id
      WHERE ur.user_id = 1
        AND r.status = 1
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      UNION ALL
      SELECT r.id, r.parent_id
      FROM sys_role r
      INNER JOIN role_chain rc ON r.id = rc.parent_id
    )
    SELECT id FROM role_chain
  )
  AND p.status = 1

  UNION ALL

  -- 用户直授 allow
  SELECT DISTINCT p.code, 2 AS priority
  FROM sys_permission p
  INNER JOIN sys_user_permission up ON p.id = up.permission_id
  WHERE up.user_id = 1
    AND up.effect = 'allow'
    AND p.status = 1
    AND (up.expires_at IS NULL OR up.expires_at > NOW())
) AS all_perms
WHERE code NOT IN (
  -- 排除用户直授 deny
  SELECT p.code
  FROM sys_permission p
  INNER JOIN sys_user_permission up ON p.id = up.permission_id
  WHERE up.user_id = 1
    AND up.effect = 'deny'
    AND (up.expires_at IS NULL OR up.expires_at > NOW())
);
```

### 7.3 获取用户菜单树（用应用层递归组装）

```sql
-- 步骤1: 获取用户有权访问的所有菜单/目录节点
SELECT DISTINCT p.id, p.parent_id, p.name, p.code, p.type,
                p.path, p.component, p.icon, p.sort, p.is_visible
FROM sys_permission p
WHERE p.type IN ('directory', 'menu')
  AND p.status = 1
  AND p.code IN (
    -- 嵌套 7.2 的用户权限 code 查询
    ...
  )
ORDER BY p.parent_id, p.sort;
```

```javascript
// 步骤2: 应用层递归组装树（Node.js 示例）
function buildTree(list, parentId = 0) {
  return list
    .filter(item => item.parent_id === parentId)
    .sort((a, b) => a.sort - b.sort)
    .map(item => ({
      ...item,
      children: buildTree(list, item.id),
    }));
}

const menuTree = buildTree(menuList, 0);
```

### 7.4 权限校验中间件（Node.js/Express 示例）

```javascript
// middleware/permission.js
const { query } = require('../utils/db');

/**
 * 权限校验中间件工厂
 * @param {string} requiredCode - 需要的权限编码，如 'system:user:delete'
 */
module.exports = (requiredCode) => async (req, res, next) => {
  try {
    const userId = req.auth.id;

    // 查用户是否拥有该权限（利用缓存可大幅优化，如 Redis）
    const sql = `
      SELECT 1 FROM (
        SELECT DISTINCT p.code
        FROM sys_permission p
        INNER JOIN sys_role_permission rp ON p.id = rp.permission_id
        WHERE rp.role_id IN (
          WITH RECURSIVE role_chain AS (
            SELECT r.id, r.parent_id
            FROM sys_role r
            INNER JOIN sys_user_role ur ON r.id = ur.role_id
            WHERE ur.user_id = ? AND r.status = 1
              AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
            UNION ALL
            SELECT r.id, r.parent_id
            FROM sys_role r
            INNER JOIN role_chain rc ON r.id = rc.parent_id
          )
          SELECT id FROM role_chain
        ) AND p.status = 1
        UNION ALL
        SELECT p.code
        FROM sys_permission p
        INNER JOIN sys_user_permission up ON p.id = up.permission_id
        WHERE up.user_id = ? AND up.effect = 'allow' AND p.status = 1
          AND (up.expires_at IS NULL OR up.expires_at > NOW())
      ) AS perms
      WHERE perms.code = ?
        AND perms.code NOT IN (
          SELECT p.code FROM sys_permission p
          INNER JOIN sys_user_permission up ON p.id = up.permission_id
          WHERE up.user_id = ? AND up.effect = 'deny'
            AND (up.expires_at IS NULL OR up.expires_at > NOW())
        )
      LIMIT 1
    `;

    const result = await query(sql, [userId, userId, requiredCode, userId]);

    if (result.length === 0) {
      return res.status(403).json({ status: 403, message: '无权限访问' });
    }

    next();
  } catch (err) {
    console.error('权限校验失败:', err);
    res.status(500).json({ status: 500, message: '权限校验异常' });
  }
};
```

### 7.5 数据权限过滤 SQL 示例

```sql
-- 根据用户的数据范围，查询其可见的订单列表
-- 先查出用户的数据范围
SELECT ds.scope, ds.custom_dept_ids
FROM sys_data_scope ds
INNER JOIN sys_user_role ur ON ds.role_id = ur.role_id
WHERE ur.user_id = :userId;

-- 根据 scope 拼接 WHERE 条件
-- scope = 'all'         → 不追加条件
-- scope = 'dept_subtree'→ WHERE dept_id IN (SELECT id FROM sys_department WHERE path LIKE '/1/2/%' OR id = 2)
-- scope = 'dept_only'   → WHERE dept_id = :currentDeptId
-- scope = 'self_only'   → WHERE created_by = :userId
-- scope = 'custom'      → WHERE dept_id IN (custom_dept_ids 解析后的ID列表)
```

---

## 8. 多场景适配指南

### 8.1 场景适配矩阵

| 场景 | 使用表 | 关键策略 |
|------|--------|----------|
| **简单后台管理** | 6 张核心表 | 无部门、无数据范围、无用户直授 |
| **企业管理系统** | 核心6表 + department + user_department + data_scope | 按部门隔离数据，普通员工只看自己或本部门 |
| **SaaS 多租户** | 核心6表 + 增加 `tenant_id` 字段 | 所有业务表追加 tenant_id，权限按租户隔离 |
| **微服务架构** | 核心6表独立为权限服务 | 网关层校验 JWT + 权限；其他服务从权限中心同步 |
| **内容/协作平台** | 核心6表 + operation_log | 强调审计追踪和权限变更历史 |

### 8.2 场景一：简单后台管理

**最少使用表：** `sys_user`、`sys_role`、`sys_permission`、`sys_user_role`、`sys_role_permission`

**特点：**
- 不需要 `sys_user_permission`（无例外授权）
- 不需要部门表（无组织架构）
- 角色不设 `parent_id`（无层级继承）
- 数据范围固定为"全部"（管理员）或"本人"（普通用户）

**初始化 SQL：**
```sql
-- 创建超级管理员角色
INSERT INTO sys_role (name, code, description, sort, status, is_system) VALUES
('超级管理员', 'super_admin', '拥有系统全部权限', 0, 1, 1);

-- 创建管理员账号（密码: admin123，bcrypt 哈希）
INSERT INTO sys_user (username, password, real_name, status) VALUES
('admin', '$2b$10$...', '系统管理员', 1);

-- 关联用户和角色
INSERT INTO sys_user_role (user_id, role_id) VALUES (1, 1);

-- 可选：将 super_admin 关联所有现有权限
INSERT INTO sys_role_permission (role_id, permission_id)
SELECT 1, id FROM sys_permission WHERE status = 1;
```

### 8.3 场景二：中大型企业（含部门 + 数据权限）

**使用表：** 全部 10 张表

**关键配置：**

1. 建立部门树（`sys_department`）
2. 配置角色数据范围（`sys_data_scope`）：
   - 总经理 → `scope = 'all'`
   - 部门经理 → `scope = 'dept_subtree'`
   - 普通员工 → `scope = 'self_only'`
3. 业务表加 `dept_id` 和 `created_by` 字段用于数据过滤
4. 中间件同时校验功能权限 + 注入数据范围到 `req.dataScope`

### 8.4 场景三：SaaS 多租户

**方案：** 在核心表上加 `tenant_id`，或将权限中心完全独立。

**方案 A — 共享表 + tenant_id（推荐小团队）：**
```sql
-- 在 sys_user、sys_role、sys_permission 等表上追加
ALTER TABLE sys_user ADD COLUMN tenant_id INT UNSIGNED NOT NULL COMMENT '租户ID';
ALTER TABLE sys_role ADD COLUMN tenant_id INT UNSIGNED DEFAULT NULL COMMENT '租户ID（NULL=平台级角色）';
ALTER TABLE sys_permission ADD COLUMN tenant_id INT UNSIGNED DEFAULT NULL COMMENT '租户ID（NULL=平台级权限）';

-- 添加唯一索引（含租户）
ALTER TABLE sys_role DROP INDEX uk_code, ADD UNIQUE KEY uk_tenant_code (tenant_id, code);
```

**方案 B — 独立数据库（大客户/强隔离需求）：**
每个租户独立数据库，权限表随租户库创建。平台层建统一的 `tenant_registry` 管理租户元信息。

### 8.5 场景四：微服务权限中心

**架构：**
```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│  API Gateway │────→│  Auth Service   │────→│  RBAC DB     │
│  (JWT 校验)  │     │  (认证 + 鉴权)   │     │  (独立数据库) │
└─────────────┘     └─────────────────┘     └──────────────┘
       │                      │
       │ JWT (含 userId)      │ 权限校验结果
       ▼                      ▼
┌─────────────┐     ┌─────────────────┐
│  业务服务A   │     │  业务服务B       │
│  (含缓存权限) │     │  (含缓存权限)    │
└─────────────┘     └─────────────────┘
```

**关键策略：**
- 核心 6 张表部署在 Auth Service 中
- JWT payload 中不存完整权限（太大），只存 userId
- 业务服务本地缓存用户权限（Redis），定期从 Auth Service 同步
- 网关层做粗粒度校验（是否登录），业务服务做细粒度校验

---

## 9. 与现有 va_* 表对照说明

> 当前项目已有一套 `va_*` RBAC 表，以下为迁移对照：

| 现有表 | 新表 | 变更说明 |
|--------|------|----------|
| `va_user` (未在 schema.sql) | `sys_user` | 新增 `gender`、`deleted_at`（软删除） |
| `va_role` | `sys_role` | **新增** `parent_id`（角色继承）、`is_system`（内置标记） |
| `va_permission` | `sys_permission` | **新增** `resource`、`action` 字段；type 新增 `directory`；新增 `redirect`、`is_visible`、`is_cache`、`remark` |
| `va_user_role` | `sys_user_role` | **新增** `expires_at`（过期）、`assigned_by`（审计） |
| `va_role_permission` | `sys_role_permission` | 结构基本一致（字段名微调） |
| *不存在* | `sys_user_permission` | **新增** — 用户直授 |
| *不存在* | `sys_department` | **新增** — 部门树 |
| *不存在* | `sys_user_department` | **新增** — 用户-部门 |
| *不存在* | `sys_data_scope` | **新增** — 数据权限 |
| `va_login_log` (未在 schema.sql) | `sys_operation_log` | **扩展** — 从单一登录日志升级为通用操作日志 |

### 9.1 最小迁移路径

如果不想全量表重建，可以在现有 `va_*` 表上做增量升级：

```sql
-- 1. 角色表：增加层级继承
ALTER TABLE va_role ADD COLUMN parent_id INT UNSIGNED DEFAULT NULL COMMENT '父角色ID',
                     ADD COLUMN is_system TINYINT NOT NULL DEFAULT 0 COMMENT '系统内置',
                     ADD INDEX idx_parent_id (parent_id);

-- 2. 权限表：增加 resource/action 拆解
ALTER TABLE va_permission ADD COLUMN resource VARCHAR(100) DEFAULT NULL COMMENT '资源',
                           ADD COLUMN action VARCHAR(50) DEFAULT NULL COMMENT '操作',
                           ADD INDEX idx_resource_action (resource, action);

-- 3. 用户角色表：增加过期
ALTER TABLE va_user_role ADD COLUMN expires_at DATETIME DEFAULT NULL COMMENT '过期时间';

-- 4. 新建：用户直授表
CREATE TABLE va_user_permission LIKE sys_user_permission;
-- (参考上文 3.6 完整 DDL)

-- 5. 新建：数据范围表
CREATE TABLE va_data_scope LIKE sys_data_scope;
-- (参考上文 4.3 完整 DDL)
```

---

## 附录 A：索引策略总结

| 表 | 索引类型 | 索引字段 | 用途 |
|----|----------|----------|------|
| sys_user | UNIQUE | username, email | 登录查找、唯一性约束 |
| sys_user | INDEX | status, deleted_at | 筛选启用的未删除用户 |
| sys_role | UNIQUE | code | 编码唯一性 |
| sys_role | INDEX | parent_id | 角色层级递归 |
| sys_permission | UNIQUE | code | 权限编码唯一性 |
| sys_permission | INDEX | parent_id, type, (resource,action) | 树查询、类型筛选、权限匹配 |
| sys_user_role | UNIQUE | (user_id, role_id) | 防重复分配 |
| sys_user_role | INDEX | role_id, expires_at | 反向查用户、过期检查 |
| sys_role_permission | UNIQUE | (role_id, permission_id) | 防重复分配 |
| sys_user_permission | UNIQUE | (user_id, permission_id) | 防重复直授 |
| sys_department | INDEX | parent_id, path | 树查询、物化路径子树查找 |
| sys_operation_log | INDEX | (user_id), (module,action), (created_at) | 审计查询 |

## 附录 B：常见问题 FAQ

**Q: 为什么不按 Casbin 方案存策略规则？**
A: Casbin 灵活但缺乏参照完整性。对于大多数后台管理系统，固定的 RBAC 表结构更直观、性能更好、运维更简单。Casbin 适合规则多变的场景（如 IoT 设备权限、动态 ABAC）。

**Q: 角色继承层级多深合适？**
A: **2-3 层最佳。** 超过 5 层后性能下降明显（递归 CTE 变慢），且业务上难以维护。如果发现需要深层级，考虑是否可以用"权限分组"替代。

**Q: 权限粒度到按钮级别会不会爆炸？**
A: 会有一定膨胀。建议按模块分组的粒度控制：
- 对大多数角色，给到"模块级"即可（如 `system:user` 通配）
- 对需要精细化控制的角色，才精确到按钮级
- 区分 type 只是为了管理方便，**校验时只看 code，不关心 type**

**Q: 用户直授和角色授权冲突时怎么办？**
A: 优先级: `deny(直授) > allow(角色) > allow(直授)`。直授 deny 是最高优先级的"封禁"，即使角色有权限也不给过。

**Q: 性能优化建议？**
A:
1. 用户权限集合查一次后缓存到 Redis（TTL 5-15 分钟），角色变更时主动失效
2. 菜单树也缓存，权限变更时重建
3. 物化路径（`path` 字段）替代递归 CTE 查部门子树
4. `sys_operation_log` 按月分表或定期归档
