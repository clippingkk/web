import * as echarts from 'echarts/core';
import {
  HeatmapChart,
  HeatmapSeriesOption
} from 'echarts/charts';
import {
  TitleComponent,
  VisualMapComponent,
  VisualMapComponentOption,
  CalendarComponent,
  CalendarComponentOption,
  // 组件类型的定义后缀都为 ComponentOption
  TitleComponentOption,
  TooltipComponent,
  TooltipComponentOption,
  GridComponent,
  GridComponentOption,
  // 数据集组件
  DatasetComponent,
  DatasetComponentOption,
  // 内置数据转换器组件 (filter, sort)
  TransformComponent
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

// 通过 ComposeOption 来组合出一个只有必须组件和图表的 Option 类型
export type ECOption = echarts.ComposeOption<
  | HeatmapSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | CalendarComponentOption
  | GridComponentOption
  | DatasetComponentOption
  | VisualMapComponentOption
>;

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
  CanvasRenderer
]);

export default echarts
