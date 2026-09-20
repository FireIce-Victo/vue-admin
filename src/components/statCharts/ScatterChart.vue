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
  data: {
    type: Array,
    default: () => [
      [10.0, 8.04],
      [8.0, 6.95],
      [13.0, 7.58],
      [9.0, 8.81],
      [11.0, 8.33],
      [14.0, 9.96],
      [6.0, 7.24],
      [4.0, 4.26],
      [12.0, 10.84],
      [7.0, 4.82],
      [5.0, 5.68],
      [15.0, 9.50]
    ]
  }
})

const isEmpty = computed(() => !props.data.length)

const { chartRef, update } = useEcharts(() => ({
  tooltip: {
    trigger: 'item',
    formatter: (params) => `X: ${params.value[0]}<br/>Y: ${params.value[1]}`
  },
  grid: { left: '3%', right: '7%', bottom: '8%', top: '8%' },
  xAxis: { type: 'value', name: 'X 轴' },
  yAxis: { type: 'value', name: 'Y 轴' },
  series: [
    {
      type: 'scatter',
      data: props.data,
      symbolSize: 14,
      itemStyle: {
        color: '#5470c6',
        borderColor: '#fff',
        borderWidth: 1,
        shadowBlur: 6,
        shadowColor: 'rgba(84, 112, 198, 0.4)'
      },
      emphasis: {
        scale: 1.5,
        itemStyle: { color: '#ee6666' }
      }
    }
  ]
}))

watch(() => props.data, update, { deep: true })
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