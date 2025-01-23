import type { Directive, DirectiveBinding } from 'vue'
import { is } from '@eiog/utils'

type TargetElement = HTMLElement & {
}
interface WatermarkOptions {
  text?: string
  textColor?: string
  font?: string
  fontSize?: number
  rotate?: number
}
type BindingValue = string | WatermarkOptions

function generateWatermark(options?: WatermarkOptions) {
  const { text = '', textColor = 'rgba(0, 0, 0, 0.3)', font = 'Microsoft JhengHei', fontSize = 16, rotate = -20 } = options ?? {}
  const dpr = window.devicePixelRatio || 2
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(200, text.length * fontSize + 50) * dpr
  canvas.height = Math.max(150, text.length * fontSize + 30) * dpr
  canvas.style.display = 'none'
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  ctx.scale(dpr, dpr)
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate(rotate * (Math.PI / 180))
  ctx.font = `${fontSize}px ${font}`
  ctx.fillStyle = textColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 0, 0)
  return canvas.toDataURL('image/png')
}
export const watermark: Directive = {
  mounted(target: TargetElement, binding: DirectiveBinding<BindingValue>) {
    const options = is.isObject(binding.value) ? binding.value : { text: binding.value }
    target.style.backgroundImage = `url(${generateWatermark(options)})`
  },
  updated(target: TargetElement, binding: DirectiveBinding<BindingValue>) {
    const options = is.isObject(binding.value) ? binding.value : { text: binding.value }
    target.style.backgroundImage = `url(${generateWatermark(options)})`
  },
}