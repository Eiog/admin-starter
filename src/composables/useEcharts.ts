import type {
  BarSeriesOption,
  LineSeriesOption,
  PieSeriesOption,
} from 'echarts/charts'
import type {
  DatasetComponentOption,
  GridComponentOption,
  LegendComponentOption,
  TitleComponentOption,
  ToolboxComponentOption,
  TooltipComponentOption,
} from 'echarts/components'
import type { ComputedRef, Ref } from 'vue'
import { useElementSize } from '@vueuse/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  TransformComponent,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'

export type ECOption = echarts.ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | PieSeriesOption
  | TitleComponentOption
  | LegendComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | ToolboxComponentOption
  | DatasetComponentOption
>

echarts.use([
  TitleComponent,
  LegendComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  ToolboxComponent,
  BarChart,
  LineChart,
  PieChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
])

/**
 * Echarts hooks函数
 * @param options - 图表配置
 * @param darkMode - 暗黑模式
 * @param renderFun - 图表函数(例如：图表监听函数)
 */
export default function useEcharts(
  options: Ref<ECOption> | ComputedRef<ECOption>,
  darkMode?: ComputedRef<boolean>,
  renderFun?: (chartInstance: echarts.ECharts) => void,
) {
  let chart: echarts.ECharts | null = null
  const domRef = ref<HTMLElement | null>(null)
  const initialSize = { width: 0, height: 0 }
  const { width, height } = useElementSize(domRef, initialSize)

  function canRender() {
    return initialSize.width > 0 && initialSize.height > 0
  }

  function isRendered() {
    return Boolean(domRef.value && chart)
  }

  function update(updateOptions: ECOption) {
    if (isRendered())
      chart!.setOption({ ...updateOptions, backgroundColor: 'transparent' })
  }

  async function render() {
    if (domRef.value) {
      const theme = darkMode?.value ? 'dark' : 'light'
      await nextTick()
      chart = echarts.init(domRef.value, theme)
      if (renderFun)
        renderFun(chart)

      update(options.value)
    }
  }

  function resize() {
    chart?.resize()
  }

  function destroy() {
    chart?.dispose()
  }

  function updateTheme() {
    destroy()
    render()
  }

  watch([width, height], ([newWidth, newHeight]) => {
    initialSize.width = newWidth
    initialSize.height = newHeight
    if (canRender()) {
      if (!isRendered())
        render()
      else
        resize()
    }
  })

  watch(options, (newValue) => {
    update(newValue)
  })

  watch(darkMode || computed(() => false), () => {
    updateTheme()
  })

  onUnmounted(() => {
    destroy()
  })

  return {
    domRef,
  }
}
