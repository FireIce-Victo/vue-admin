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
  xData: { type: Array, default: () => ['1月', '2月', '3月', '4月', '5月', '6月'] },
  series: {
    type: Array,
    default: () => [
      { name: '产品A', data: [820, 932, 901, 934, 1290, 1330], color: '#5470c6' },
      { name: '产品B', data: [620, 732, 801, 834, 990, 1130], color: '#91cc75' },
      { name: '产品C', data: [420, 532, 601, 634, 790, 930], color: '#fac858' }
    ]
  }
})

const isEmpty = computed(() => !props.series.length || !props.xData.length)

const { chartRef, update } = useEcharts(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: props.series.map(s => s.name), bottom: 0 },
  grid: { left: '3%', right: '4%', bottom: '12%', top: '10%' },
  xAxis: { type: 'category', boundaryGap: false, data: props.xData },
  yAxis: { type: 'value' },
  series: props.series.map(s => ({
    name: s.name,
    type: 'line',
    data: s.data,
    smooth: true,
    itemStyle: { color: s.color },
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