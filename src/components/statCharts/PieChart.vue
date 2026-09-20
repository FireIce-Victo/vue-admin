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
      { name: '搜索引擎', value: 1048 },
      { name: '直接访问', value: 735 },
      { name: '邮件营销', value: 580 },
      { name: '联盟广告', value: 484 },
      { name: '视频广告', value: 300 }
    ]
  }
})

const isEmpty = computed(() => !props.data.length)

const { chartRef, update } = useEcharts(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: { orient: 'vertical', right: '5%', top: 'center' },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 16, fontWeight: 'bold' }
      },
      data: props.data
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