<template>
  <div class="dashboard-container app-container">
    <!-- 统计卡片区域 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :lg="6" v-for="card in statCards" :key="card.key">
        <el-card class="stat-card" :body-style="{ padding: '20px' }" shadow="hover">
          <div class="stat-card-inner">
            <div class="stat-info">
              <span class="stat-label">{{ card.label }}</span>
              <span class="stat-value">{{ card.value }}</span>
              <span class="stat-trend" :class="card.trend > 0 ? 'up' : 'down'">
                <span class="trend-icon">{{ card.trend > 0 ? '↑' : '↓' }}</span>
                较昨日 {{ Math.abs(card.trend) }}%
              </span>
            </div>
            <div class="stat-icon-wrapper" :style="{ background: card.bg }">
              <el-icon :size="28">
                <component :is="card.icon" />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover">
          <template #header>
            <span class="chart-title">访问趋势</span>
          </template>
          <div ref="lineChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover">
          <template #header>
            <span class="chart-title">角色分布</span>
          </template>
          <div ref="pieChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近用户表格 -->
    <el-row :gutter="20" class="table-row">
      <el-col :xs="24">
        <el-card shadow="hover">
          <template #header>
            <div class="table-header">
              <span class="chart-title">最近新增用户</span>
              <el-button text type="primary">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentUsers" style="width: 100%">
            <el-table-column prop="username" label="用户名" min-width="120" />
            <el-table-column prop="role" label="角色" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ ROLES[row.role] }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="email" label="邮箱" min-width="180" />
            <el-table-column prop="phone" label="手机号" width="140" />
            <el-table-column prop="createTime" label="注册时间" width="180" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { User, DataLine, UserFilled, Coin } from '@element-plus/icons-vue'
import * as echarts from 'echarts/core'
import { LineChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([LineChart, PieChart, GridComponent, TooltipComponent, TitleComponent, LegendComponent, CanvasRenderer])

const ROLES = { admin: '管理员', editor: '编辑者', viewer: '普通用户' }

// ========== 统计卡片 ==========
const statCards = [
  { key: 'users', label: '用户总数', value: 1256, trend: 12, icon: User, bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { key: 'online', label: '在线用户', value: 38, trend: -5, icon: UserFilled, bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { key: 'today', label: '今日新增', value: 24, trend: 8, icon: DataLine, bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { key: 'roles', label: '角色数量', value: 6, trend: 0, icon: Coin, bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }
]

// ========== 图表 ==========
const lineChartRef = ref(null)
const pieChartRef = ref(null)
let lineChart = null
let pieChart = null

function renderLineChart() {
  if (!lineChartRef.value) return
  lineChart = echarts.init(lineChartRef.value)
  lineChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, textStyle: { color: '#666' } },
    grid: { left: '3%', right: '4%', top: '8%', bottom: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: { lineStyle: { color: '#ddd' } },
      axisLabel: { color: '#666' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f0f0f0' } },
      axisLabel: { color: '#666' }
    },
    series: [
      {
        name: '页面访问',
        type: 'line',
        smooth: true,
        data: [820, 932, 901, 1290, 1330, 1520, 1456],
        itemStyle: { color: '#667eea' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(102,126,234,0.3)' },
            { offset: 1, color: 'rgba(102,126,234,0.05)' }
          ])
        }
      },
      {
        name: '用户活跃',
        type: 'line',
        smooth: true,
        data: [320, 432, 501, 634, 790, 830, 920],
        itemStyle: { color: '#43e97b' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(67,233,123,0.3)' },
            { offset: 1, color: 'rgba(67,233,123,0.05)' }
          ])
        }
      }
    ]
  })
}

function renderPieChart() {
  if (!pieChartRef.value) return
  pieChart = echarts.init(pieChartRef.value)
  pieChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, textStyle: { color: '#666' } },
    series: [
      {
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
        data: [
          { value: 2, name: '管理员', itemStyle: { color: '#f56c6c' } },
          { value: 5, name: '编辑者', itemStyle: { color: '#e6a23c' } },
          { value: 35, name: '普通用户', itemStyle: { color: '#409eff' } }
        ]
      }
    ]
  })
}

// ========== 最近用户 ==========
const recentUsers = ref([
  { username: 'admin', role: 'admin', email: 'admin@example.com', phone: '13800138000', createTime: '2026-05-25 09:30:00' },
  { username: 'zhangsan', role: 'editor', email: 'zhangsan@example.com', phone: '13800138001', createTime: '2026-05-24 14:20:00' },
  { username: 'lisi', role: 'viewer', email: 'lisi@example.com', phone: '13800138002', createTime: '2026-05-24 10:15:00' },
  { username: 'wangwu', role: 'viewer', email: 'wangwu@example.com', phone: '13800138003', createTime: '2026-05-23 16:45:00' },
  { username: 'zhaoliu', role: 'editor', email: 'zhaoliu@example.com', phone: '13800138004', createTime: '2026-05-23 11:00:00' }
])

onMounted(async () => {
  await nextTick()
  renderLineChart()
  renderPieChart()
})

onUnmounted(() => {
  lineChart?.dispose()
  pieChart?.dispose()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  .stats-row {
    margin-bottom: 20px;
  }

  .stat-card {
    border-radius: 8px;
    overflow: hidden;

    .stat-card-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .stat-label {
      font-size: 13px;
      color: #999;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #333;
      line-height: 1.2;
    }

    .stat-trend {
      font-size: 12px;

      &.up { color: #67c23a; }
      &.down { color: #f56c6c; }

      .trend-icon {
        margin-right: 2px;
      }
    }

    .stat-icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      flex-shrink: 0;
    }
  }

  .chart-row {
    margin-bottom: 20px;
  }

  .chart-title {
    font-weight: 600;
    color: #333;
  }

  .chart-box {
    width: 100%;
    height: 320px;
  }

  .table-row {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>