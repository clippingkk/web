import { HeatmapChart, type HeatmapSeriesOption } from 'echarts/charts'
import {
  CalendarComponent,
  type CalendarComponentOption,
  // 数据集组件
  DatasetComponent,
  type DatasetComponentOption,
  GridComponent,
  type GridComponentOption,
  TitleComponent,
  // 组件类型的定义后缀都为 ComponentOption
  type TitleComponentOption,
  TooltipComponent,
  type TooltipComponentOption,
  // 内置数据转换器组件 (filter, sort)
  TransformComponent,
  VisualMapComponent,
  type VisualMapComponentOption,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

// 通过 ComposeOption 来组合出一个只有必须组件和图表的 Option 类型
export type ECOption = echarts.ComposeOption<
  | HeatmapSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | CalendarComponentOption
  | GridComponentOption
  | DatasetComponentOption
  | VisualMapComponentOption
>

// 注册必须的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  VisualMapComponent,
  CalendarComponent,
  HeatmapChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
])

export default echarts
