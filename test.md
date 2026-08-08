# 多场景通用 RBAC 数据库设计方案

---

## 一、设计思路

### 1.1 核心模型

RBAC（Role-Based Access Control）基于角色的访问控制，核心是 **用户-角色-权限** 三元关系：

```
用户(User) ──多对多── 角色(Role) ──多对多── 权限(Menu)
```

在后台管理系统中，权限拆成三类：

| 权限类型 | 说明 | 控制粒度 |
|---------|------|---------|
| 菜单权限 | 控制侧边栏菜单显隐 | 路由级 |
| 按钮/操作权限 | 控制页面上按钮（增删改查、导出等）显隐 | 元素级 |
| 数据权限 | 控制用户可见的数据范围 | 数据行级 |

### 1.2 功能权限 vs 数据权限

| 维度 | 功能权限 | 数据权限 |
|------|---------|---------|
| 解决什么 | 用户**能不能**操作某功能 | 用户操作时**能看到哪些数据** |
| 控制对象 | 菜单、按钮、接口 | 数据行 |
| 实现方式 | RBAC（角色-菜单/按钮） | 组织表 + data_scope 字段 |
| 典型例子 | 张三能否看到"删除"按钮 | 张三点"用户列表"时，看到全公司还是只看到自己部门的人 |

经典 RBAC（用户-角色-权限三元组）只能解决前者，对后者无能为力。因此引入组织表 `sys_org`，用 `parent_id` 自关联成树形结构，配合角色表里的 `data_scope` 字段实现数据权限。

### 1.3 数据权限的本质

数据权限 = 拿某个业务字段做行级过滤。这个字段叫什么不重要，重要的是"用什么区分数据归属"：

| 场景 | 隔离维度 | 对应字段 | 说明 |
|------|---------|---------|------|
| 企业内部 OA | 部门 | `org_id` | 张三看本部门 |
| 多商家商城（SaaS） | 商家/租户 | `tenant_id` + `org_id` | 商家A只能看自己的订单 |
| 平台 + 多店铺 | 店铺 | `org_id` | 店长只看自己店铺 |
| 区域销售 | 区域 | `org_id` | 华东区只看华东订单 |
| 纯工具型系统 | 无 | 留空 | 所有人看一样的数据 |

### 1.4 表关系总览

```
sys_tenant (可选，多租户场景)
    │
    ├── sys_user ──── sys_user_role ──── sys_role ──── sys_role_menu ──── sys_menu (树形)
    │       │                                    │
    │       │                              sys_role_data_scope (可选)
    │       │                                    │
    │       └──────── sys_org (树形) ◄───────────┘
    │
    ├── sys_oper_log
    └── sys_login_log
```

---

## 二、建表 SQL

### 2.1 组织表 `sys_org`

部门 / 商家 / 店铺 / 区域等各类层级结构，统一用此表表达。采用 `parent_id` 自关联为树形结构。

```sql
CREATE TABLE sys_org (
  id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  parent_id   BIGINT       NOT NULL DEFAULT 0      COMMENT '父组织ID(0=根)',
  org_name    VARCHAR(50)  NOT NULL                COMMENT '组织名称',
  org_type    TINYINT      NOT NULL DEFAULT 1      COMMENT '组织类型(1集团 2公司 3部门 4小组 5店铺 6区域等，业务自行定义)',
  sort        INT          NOT NULL DEFAULT 0      COMMENT '排序',
  leader      VARCHAR(50)           DEFAULT NULL   COMMENT '负责人',
  phone       VARCHAR(20)           DEFAULT NULL   COMMENT '联系电话',
  email       VARCHAR(50)           DEFAULT NULL   COMMENT '邮箱',
  address     VARCHAR(255)          DEFAULT NULL   COMMENT '地址',
  status      TINYINT      NOT NULL DEFAULT 1      COMMENT '状态(1启用 0禁用)',
  remark      VARCHAR(255)          DEFAULT NULL   COMMENT '备注',
  create_by   VARCHAR(50)           DEFAULT NULL   COMMENT '创建人',
  create_time DATETIME              DEFAULT CURRENT_TIMESTAMP  COMMENT '创建时间',
  update_by   VARCHAR(50)           DEFAULT NULL   COMMENT '更新人',
  update_time DATETIME              DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted     TINYINT      NOT NULL DEFAULT 0      COMMENT '逻辑删除(0未删除 1已删除)',
  PRIMARY KEY (id),
  KEY idx_parent_id (parent_id),
  KEY idx_org_type (org_type),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='组织表';
```

### 2.2 用户表 `sys_user`

```sql
CREATE TABLE sys_user (
  id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  tenant_id   BIGINT                DEFAULT NULL   COMMENT '租户ID(多租户场景使用，单租户留空)',
  org_id      BIGINT                DEFAULT NULL   COMMENT '所属组织ID(关联sys_org.id)',
  username    VARCHAR(50)  NOT NULL                COMMENT '登录用户名',
  password    VARCHAR(128) NOT NULL                COMMENT '密码(BCrypt加密)',
  nickname    VARCHAR(50)           DEFAULT NULL   COMMENT '昵称',
  real_name   VARCHAR(50)           DEFAULT NULL   COMMENT '真实姓名',
  avatar      VARCHAR(255)          DEFAULT NULL   COMMENT '头像URL',
  phone       VARCHAR(20)           DEFAULT NULL   COMMENT '手机号',
  email       VARCHAR(50)           DEFAULT NULL   COMMENT '邮箱',
  gender      TINYINT               DEFAULT 0      COMMENT '性别(0未知 1男 2女)',
  status      TINYINT      NOT NULL DEFAULT 1      COMMENT '状态(1启用 0禁用)',
  last_login_ip       VARCHAR(50)   DEFAULT NULL   COMMENT '最后登录IP',
  last_login_time     DATETIME      DEFAULT NULL   COMMENT '最后登录时间',
  pwd_reset_time      DATETIME      DEFAULT NULL   COMMENT '密码最后重置时间',
  create_by   VARCHAR(50)           DEFAULT NULL   COMMENT '创建人',
  create_time DATETIME              DEFAULT CURRENT_TIMESTAMP  COMMENT '创建时间',
  update_by   VARCHAR(50)           DEFAULT NULL   COMMENT '更新人',
  update_time DATETIME              DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted     TINYINT      NOT NULL DEFAULT 0      COMMENT '逻辑删除(0未删除 1已删除)',
  PRIMARY KEY (id),
  UNIQUE KEY uk_username (username),
  KEY idx_tenant_id (tenant_id),
  KEY idx_org_id (org_id),
  KEY idx_phone (phone),
  KEY idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 2.3 角色表 `sys_role`

```sql
CREATE TABLE sys_role (
  id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  tenant_id   BIGINT                DEFAULT NULL   COMMENT '租户ID(多租户场景使用)',
  role_name   VARCHAR(50)  NOT NULL                COMMENT '角色名称',
  role_code   VARCHAR(50)  NOT NULL                COMMENT '角色编码(如 admin/editor/viewer)',
  data_scope  TINYINT      NOT NULL DEFAULT 1      COMMENT '数据范围(1全部 2本单位 3本单位及以下 4仅本人 5自定义)',
  sort        INT          NOT NULL DEFAULT 0      COMMENT '排序',
  status      TINYINT      NOT NULL DEFAULT 1      COMMENT '状态(1启用 0禁用)',
  remark      VARCHAR(255)          DEFAULT NULL   COMMENT '备注',
  create_by   VARCHAR(50)           DEFAULT NULL   COMMENT '创建人',
  create_time DATETIME              DEFAULT CURRENT_TIMESTAMP  COMMENT '创建时间',
  update_by   VARCHAR(50)           DEFAULT NULL   COMMENT '更新人',
  update_time DATETIME              DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted     TINYINT      NOT NULL DEFAULT 0      COMMENT '逻辑删除(0未删除 1已删除)',
  PRIMARY KEY (id),
  UNIQUE KEY uk_tenant_role_code (tenant_id, role_code),
  KEY idx_tenant_id (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';
```

`data_scope` 语义说明：

| 值 | 含义 | 后端 SQL 条件 |
|----|------|-------------|
| 1 | 全部 | 不加条件 |
| 2 | 本单位 | `WHERE org_id = #{当前用户org_id}` |
| 3 | 本单位及以下 | `WHERE org_id IN (当前org + 所有子org)` |
| 4 | 仅本人 | `WHERE create_by = #{当前用户}` |
| 5 | 自定义 | 搭配 `sys_role_data_scope` 表 |

### 2.4 菜单权限表 `sys_menu`

菜单、按钮统一用此表，靠 `menu_type` 区分。

```sql
CREATE TABLE sys_menu (
  id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  parent_id   BIGINT       NOT NULL DEFAULT 0      COMMENT '父菜单ID(0=根)',
  menu_name   VARCHAR(50)  NOT NULL                COMMENT '菜单名称',
  menu_type   TINYINT      NOT NULL                COMMENT '类型(1目录 2菜单 3按钮)',
  path        VARCHAR(200)          DEFAULT NULL   COMMENT '路由路径(目录/菜单用)',
  component   VARCHAR(255)          DEFAULT NULL   COMMENT '组件路径(菜单用)',
  perms       VARCHAR(100)          DEFAULT NULL   COMMENT '权限标识(按钮用，如 user:add)',
  icon        VARCHAR(50)           DEFAULT NULL   COMMENT '图标',
  sort        INT          NOT NULL DEFAULT 0      COMMENT '排序',
  visible     TINYINT      NOT NULL DEFAULT 1      COMMENT '是否可见(1显示 0隐藏)',
  status      TINYINT      NOT NULL DEFAULT 1      COMMENT '状态(1启用 0禁用)',
  create_by   VARCHAR(50)           DEFAULT NULL   COMMENT '创建人',
  create_time DATETIME              DEFAULT CURRENT_TIMESTAMP  COMMENT '创建时间',
  update_by   VARCHAR(50)           DEFAULT NULL   COMMENT '更新人',
  update_time DATETIME              DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  KEY idx_parent_id (parent_id),
  KEY idx_perms (perms)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜单权限表';
```

### 2.5 用户-角色关联表 `sys_user_role`

```sql
CREATE TABLE sys_user_role (
  user_id BIGINT NOT NULL COMMENT '用户ID',
  role_id BIGINT NOT NULL COMMENT '角色ID',
  PRIMARY KEY (user_id, role_id),
  KEY idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';
```

### 2.6 角色-菜单关联表 `sys_role_menu`

```sql
CREATE TABLE sys_role_menu (
  role_id BIGINT NOT NULL COMMENT '角色ID',
  menu_id BIGINT NOT NULL COMMENT '菜单ID',
  PRIMARY KEY (role_id, menu_id),
  KEY idx_menu_id (menu_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色菜单关联表';
```

### 2.7 自定义数据范围表 `sys_role_data_scope`（可选）

当 `sys_role.data_scope = 5`（自定义）时，此表指定角色具体可访问哪些组织。

```sql
CREATE TABLE sys_role_data_scope (
  role_id BIGINT NOT NULL COMMENT '角色ID',
  org_id  BIGINT NOT NULL COMMENT '组织ID',
  PRIMARY KEY (role_id, org_id),
  KEY idx_org_id (org_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色数据范围(自定义)';
```

### 2.8 操作日志表 `sys_oper_log`

```sql
CREATE TABLE sys_oper_log (
  id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  tenant_id   BIGINT                DEFAULT NULL   COMMENT '租户ID',
  operator    VARCHAR(50)  NOT NULL                COMMENT '操作人',
  module      VARCHAR(50)           DEFAULT NULL   COMMENT '操作模块',
  action      VARCHAR(255) NOT NULL                COMMENT '操作描述',
  oper_type   VARCHAR(20)           DEFAULT NULL   COMMENT '操作类型(create/update/delete/login/export)',
  method      VARCHAR(10)           DEFAULT NULL   COMMENT '请求方式(GET/POST/PUT/DELETE)',
  url         VARCHAR(255)          DEFAULT NULL   COMMENT '请求URL',
  params      TEXT                  DEFAULT NULL   COMMENT '请求参数',
  result      TEXT                  DEFAULT NULL   COMMENT '返回结果(截取)',
  ip          VARCHAR(50)           DEFAULT NULL   COMMENT '操作IP',
  location    VARCHAR(100)          DEFAULT NULL   COMMENT '操作地点',
  status      TINYINT      NOT NULL DEFAULT 1      COMMENT '操作状态(1成功 0失败)',
  cost_time   BIGINT                DEFAULT NULL   COMMENT '耗时(毫秒)',
  error_msg   VARCHAR(2000)         DEFAULT NULL   COMMENT '错误信息',
  create_time DATETIME              DEFAULT CURRENT_TIMESTAMP  COMMENT '创建时间',
  PRIMARY KEY (id),
  KEY idx_operator (operator),
  KEY idx_oper_type (oper_type),
  KEY idx_create_time (create_time),
  KEY idx_tenant_id (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';
```

### 2.9 登录日志表 `sys_login_log`

```sql
CREATE TABLE sys_login_log (
  id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  tenant_id   BIGINT                DEFAULT NULL   COMMENT '租户ID',
  username    VARCHAR(50)  NOT NULL                COMMENT '登录用户名',
  ipaddr      VARCHAR(50)           DEFAULT NULL   COMMENT '登录IP',
  location    VARCHAR(100)          DEFAULT NULL   COMMENT '登录地点',
  browser     VARCHAR(100)          DEFAULT NULL   COMMENT '浏览器',
  os          VARCHAR(50)           DEFAULT NULL   COMMENT '操作系统',
  status      TINYINT      NOT NULL DEFAULT 1      COMMENT '登录状态(1成功 0失败)',
  msg         VARCHAR(200)          DEFAULT NULL   COMMENT '提示消息',
  login_time  DATETIME              DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间',
  PRIMARY KEY (id),
  KEY idx_username (username),
  KEY idx_login_time (login_time),
  KEY idx_tenant_id (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='登录日志表';
```

### 2.10 租户表 `sys_tenant`（多租户场景可选）

```sql
CREATE TABLE sys_tenant (
  id            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  tenant_name   VARCHAR(100) NOT NULL                COMMENT '租户名称',
  tenant_code   VARCHAR(50)  NOT NULL                COMMENT '租户编码',
  domain        VARCHAR(100)          DEFAULT NULL   COMMENT '域名',
  status        TINYINT      NOT NULL DEFAULT 1      COMMENT '状态(1启用 0禁用)',
  expire_time   DATETIME              DEFAULT NULL   COMMENT '过期时间',
  create_by     VARCHAR(50)           DEFAULT NULL   COMMENT '创建人',
  create_time   DATETIME              DEFAULT CURRENT_TIMESTAMP  COMMENT '创建时间',
  update_by     VARCHAR(50)           DEFAULT NULL   COMMENT '更新人',
  update_time   DATETIME              DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted       TINYINT      NOT NULL DEFAULT 0      COMMENT '逻辑删除(0未删除 1已删除)',
  PRIMARY KEY (id),
  UNIQUE KEY uk_tenant_code (tenant_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='租户表';
```

---

## 三、场景适配对照

| 场景 | 组织表 `sys_org` | 租户表 `sys_tenant` | 用户表 `org_id` | `data_scope` 取值 |
|------|------------------|--------------------|----------------|-------------------|
| 企业内部 OA | 部门树 | 不需要 | 填部门 | 1全部/2本部门/3本部门及以下/4仅本人 |
| 多租户 SaaS | 商家树 | 需要 | 填商家 | 1全部/2本商家/3本商家及以下/4仅本人 |
| 自营商城+多店铺 | 店铺树 | 不需要 | 填店铺 | 1全部/2本店铺/3本店铺及以下/4仅本人 |
| 纯工具型系统 | 不需要 | 不需要 | 留空 | 只保留1全部 |

> 关键设计：`tenant_id` 和 `org_id` 都设为 `DEFAULT NULL`，**不需要的字段留空即可**，不会影响任何功能。

---

## 四、前端设计要点

### 4.1 登录与权限获取流程

```
用户输入账号密码
    ↓
POST /login → 返回 token
    ↓
GET /user/info (带 token) → 返回 { 用户信息, roles[], perms[] }
    ↓
前端把 perms 存入 store (pinia)
    ↓
根据 roles + 后端返回的菜单树，动态生成路由
    ↓
router.addRoute(...) 注入动态路由
    ↓
渲染侧边栏菜单
```

### 4.2 动态路由

- 静态路由：登录页、404、首页（不需权限）
- 动态路由：根据后端返回的菜单树（`menu_type=1/2` 的节点）拼装路由配置，通过 `router.addRoute` 动态挂载
- 按钮权限节点（`menu_type=3`）不参与路由，只取 `perms` 字段加入权限集合

### 4.3 按钮级权限控制

**方式一：自定义指令**

```js
app.directive('permission', {
  mounted(el, binding) {
    const userStore = useUserStore()
    const hasPerm = userStore.perms.includes(binding.value)
    if (!hasPerm) el.parentNode?.removeChild(el)
  }
})
// 使用：<el-button v-permission="'user:add'">新增</el-button>
```

**方式二：工具函数**

```js
function hasPermission(perm) {
  return userStore.perms.includes(perm)
}
// 使用：<el-button v-if="hasPermission('user:add')">新增</el-button>
```

### 4.4 需要开发的前端页面

| 模块 | 页面 | 核心功能 |
|------|------|---------|
| 用户管理 | 用户列表 | CRUD、分配角色（多选）、重置密码、启用/禁用、按组织筛选 |
| 角色管理 | 角色列表 | CRUD、菜单权限分配（树形勾选）、数据权限配置 |
| 菜单管理 | 菜单列表 | 树形 CRUD、配置 perms 标识、菜单类型/图标/排序 |
| 组织管理 | 组织列表 | 树形 CRUD |
| 操作日志 | 日志列表 | 查询、筛选、详情 |
| 登录日志 | 日志列表 | 查询、筛选 |

---

## 五、设计要点小结

1. **菜单和按钮统一用 `sys_menu` 表**，靠 `menu_type` 区分（1目录 2菜单 3按钮），避免两套表
2. **权限标识 `perms` 是前后端约定的契约**（如 `模块:操作`），前端指令和后端注解都用它
3. **角色数据范围 `data_scope`** 在后端实现，前端无需关心过滤逻辑，只需正常调接口即可
4. **动态路由 + 自定义指令** 是前端权限的两大支柱
5. **关联表用联合主键**，不加自增 ID，避免冗余数据
6. **所有表统一逻辑删除**（`deleted` 字段），物理删除仅在定时清理时使用
7. **`tenant_id` / `org_id` 均可为 NULL**，不需要的场景直接留空，零侵入