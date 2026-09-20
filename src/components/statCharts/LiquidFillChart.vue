<template>
  <div class="chart-container">
    <h4 class="chart-title" v-if="title">{{ title }}</h4>
    <div ref="chartRef" :style="{ width: width, height: height }"></div>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useEcharts } from '@/composables/useEcharts'

const props = defineProps({
  title: { type: String, default: '' },
  width: { type: String, default: '100%' },
  height: { type: String, default: '350px' },
  value: { type: Number, default: 0.65 },
  color: { type: Array, default: () => ['#5470c6', '#91cc75'] }
})

const { chartRef, update } = useEcharts(() => ({
  series: [
    {
      type: 'liquidFill',
      data: [props.value],
      color: props.color,
      radius: '80%',
      center: ['50%', '50%'],
      backgroundStyle: { color: '#e3f2fd' },
      label: {
        formatter: (params) => `${(params.value * 100).toFixed(0)}%`,
        fontSize: 28,
        color: '#333'
      },
      outline: {
        borderDistance: 4,
        itemStyle: { borderWidth: 3, borderColor: '#5470c6' }
      }
    }
  ]
}))

watch(() => props.value, update)
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