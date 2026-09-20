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
  xData: { type: Array, default: () => ['Q1', 'Q2', 'Q3', 'Q4'] },
  series: {
    type: Array,
    default: () => [
      { name: '2023年', data: [320, 450, 380, 520], color: '#5470c6' },
      { name: '2024年', data: [400, 520, 460, 600], color: '#91cc75' },
      { name: '2025年', data: [480, 600, 550, 700], color: '#fac858' }
    ]
  }
})

const isEmpty = computed(() => !props.series.length || !props.xData.length)

const { chartRef, update } = useEcharts(() => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: { data: props.series.map(s => s.name), bottom: 0 },
  grid: { left: '3%', right: '4%', bottom: '12%', top: '10%' },
  xAxis: { type: 'category', data: props.xData },
  yAxis: { type: 'value' },
  series: props.series.map(s => ({
    name: s.name,
    type: 'bar',
    data: s.data,
    itemStyle: { color: s.color, borderRadius: [4, 4, 0, 0] },
    emphasis: { focus: 'series' }
  }))
}))

watch(() => [props.series, props.xData], update, { deep: true })
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