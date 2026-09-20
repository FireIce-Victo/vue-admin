import { ref, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import echarts from '@/utils/echarts'

/**
 * 统一管理 echarts 实例：init / setOption 更新 / ResizeObserver / dispose
 * @param {Function} getOption - 返回当前 option 的函数（每次更新重新调用）
 * @param {Object}   options   - echarts.init 参数，如 { renderer: 'canvas' }
 */
export function useEcharts(getOption, options = {}) {
  const chartRef = ref(null)
  const chartInstance = shallowRef(null)
  let observer = null

  const init = () => {
    if (!chartRef.value || chartInstance.value) return
    chartInstance.value = echarts.init(chartRef.value, undefined, options)
    chartInstance.value.setOption(getOption())
    // 容器尺寸变化自适应（覆盖侧边栏折叠等场景）
    observer = new ResizeObserver(() => chartInstance.value?.resize())
    observer.observe(chartRef.value)
    // 容器不可见时初始化为 0 尺寸，强制重排一次
    requestAnimationFrame(() => chartInstance.value?.resize())
  }

  const update = () => {
    if (!chartInstance.value) return
    // 数据更新用 setOption 而非销毁重建（保留动画）
    chartInstance.value.setOption(getOption(), { notMerge: true })
  }

  const dispose = () => {
    observer?.disconnect()
    observer = null
    chartInstance.value?.dispose()
    chartInstance.value = null
  }

  onMounted(init)
  onBeforeUnmount(dispose)

  return { chartRef, chartInstance, init, update, dispose }
}