<template>
  <div class="chart-container">
    <h4 class="chart-title" v-if="title">{{ title }}</h4>
    <div ref="chartRef" :style="{ width: width, height: height }"></div>
    <el-empty v-if="isEmpty" description="暂无数据" :image-size="60" />
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useEcharts } from '@/composables/useEcharts'

const props = defineProps({
  title: { type: String, default: '' },
  width: { type: String, default: '100%' },
  height: { type: String, default: '350px' },
  indicator: {
    type: Array,
    default: () => [
      { name: '销售', max: 100 },
      { name: '管理', max: 100 },
      { name: '技术', max: 100 },
      { name: '客服', max: 100 },
      { name: '研发', max: 100 },
      { name: '市场', max: 100 }
    ]
  },
  series: {
    type: Array,
    default: () => [
      { name: '预算分配', data: [80, 70, 90, 60, 85, 75] },
      { name: '实际开销', data: [70, 65, 85, 55, 78, 68] }
    ]
  }
})

const isEmpty = computed(() => !props.series.length || !props.indicator.length)

const { chartRef, update } = useEcharts(() => ({
  tooltip: {},
  legend: { data: props.series.map(s => s.name), bottom: 0 },
  radar: {
    center: ['50%', '45%'],
    radius: '65%',
    indicator: props.indicator
  },
  series: [
    {
      type: 'radar',
      data: props.series.map(s => ({
        name: s.name,
        value: s.data
      })),
      areaStyle: { opacity: 0.15 },
      emphasis: { focus: 'series' }
    }
  ]
}))

watch(() => [props.series, props.indicator], update, { deep: true })
</script>

<style lang="scss" scoped>
.chart-container {
  .chart-title {
    text-align: center;
    margin: 0 0 10px 0;
    font-size: 15px;
    color: #333;
  }
}
</style>