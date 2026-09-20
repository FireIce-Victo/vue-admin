import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart, RadarChart, ScatterChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, GridComponent, LegendComponent,
  RadarComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import 'echarts-liquidfill'

echarts.use([
  BarChart, LineChart, PieChart, RadarChart, ScatterChart,
  TitleComponent, TooltipComponent, GridComponent, LegendComponent,
  RadarComponent,
  CanvasRenderer
])

export default echarts