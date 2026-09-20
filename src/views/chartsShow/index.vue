<template>
  <div class="app-container">
    <div class="charts-grid">
      <el-card v-for="c in charts" :key="c.name" shadow="hover" class="chart-card">
        <component :is="c.comp" :title="c.title" height="340px" />
      </el-card>
    </div>
  </div>
</template>

<script setup>
import LineChart from '@/components/statCharts/LineChart.vue';
import BarChart from '@/components/statCharts/BarChart.vue';
import PieChart from '@/components/statCharts/PieChart.vue';
import LiquidFillChart from '@/components/statCharts/LiquidFillChart.vue';
import ScatterChart from '@/components/statCharts/ScatterChart.vue';
import RadarChart from '@/components/statCharts/RadarChart.vue';

// 组件直接放入数组,不要包 shallowRef —— 嵌套对象里的 ref 不会被 :is 自动解包
const charts = [
  { name: 'line', title: '月度销售趋势', comp: LineChart },
  { name: 'bar', title: '季度营收对比', comp: BarChart },
  { name: 'pie', title: '流量来源分布', comp: PieChart },
  { name: 'liquid', title: '项目完成率', comp: LiquidFillChart },
  { name: 'scatter', title: '数据散点分布', comp: ScatterChart },
  { name: 'radar', title: '能力雷达分析', comp: RadarChart }
];
</script>

<style lang="scss" scoped>
.charts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.chart-card {
  :deep(.el-card__body) {
    padding: 10px;
  }
}

/* 小屏幕单列布局 */
@media (max-width: 992px) {
  .charts-show .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
