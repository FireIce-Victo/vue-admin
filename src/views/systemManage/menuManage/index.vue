<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>菜单管理</span>
          <el-button type="primary" size="default">新增菜单</el-button>
        </div>
      </template>

      <el-table :data="menuList" row-key="id" default-expand-all style="width: 100%">
        <el-table-column prop="name" label="菜单名称" min-width="180" />
        <el-table-column prop="icon" label="图标" width="80" align="center">
          <template #default="{ row }">
            <SvgIcon v-if="row.icon" :icon-class="row.icon" size="1.2em" />
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" min-width="160" />
        <el-table-column prop="component" label="组件路径" min-width="200" />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="visible" label="显示" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.visible ? 'success' : 'info'" size="small">
              {{ row.visible ? '显示' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default>
            <el-button type="primary" link>编辑</el-button>
            <el-button type="primary" link>新增子菜单</el-button>
            <el-button type="danger" link>删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SvgIcon from '@/components/SvgIcon/index.vue'

const menuList = ref([
  { id: 1, parentId: 0, name: '首页', icon: 'dashboard', path: '/dashboard', component: 'views/dashboard/index', sort: 1, visible: true, status: 1 },
  { id: 2, parentId: 0, name: '用户管理', icon: 'user', path: '/user-manage', component: 'layout', sort: 2, visible: true, status: 1, children: [
    { id: 3, parentId: 2, name: '用户列表', icon: '', path: 'user-list', component: 'views/userManage/userList/index', sort: 1, visible: true, status: 1 },
    { id: 4, parentId: 2, name: '角色管理', icon: '', path: 'role-manage', component: 'views/userManage/roleManage/index', sort: 2, visible: true, status: 1 }
  ]},
  { id: 5, parentId: 0, name: '系统管理', icon: 'system', path: '/system-manage', component: 'layout', sort: 3, visible: true, status: 1, children: [
    { id: 6, parentId: 5, name: '菜单管理', icon: '', path: 'menu-manage', component: 'views/systemManage/menuManage/index', sort: 1, visible: true, status: 1 },
    { id: 7, parentId: 5, name: '操作日志', icon: '', path: 'log-manage', component: 'views/systemManage/logManage/index', sort: 2, visible: true, status: 1 },
    { id: 8, parentId: 5, name: '安全设置', icon: '', path: 'security', component: 'views/systemManage/security/index', sort: 3, visible: true, status: 1 }
  ]}
])

// TODO: 后续接入接口
// async function fetchMenuList() { menuList.value = await menuApi.fetchList() }
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>