import type { Directive, DirectiveBinding } from 'vue'
import { is } from '@eiog/utils'

type BindingValue = (target: Element) => void
type TargetElement = HTMLElement & {
  _into_view_callBack: BindingValue
  _into_view_observer: IntersectionObserver
}
function setValue(target: TargetElement, binding: DirectiveBinding<BindingValue>) {
  target._into_view_callBack = binding.value
}
export const intoView: Directive = {
  mounted(target: TargetElement, binding: DirectiveBinding<BindingValue>) {
    if (!is.isFunction(binding.value)) {
      return console.warn('IntoView: value is not a function')
    }
    setValue(target, binding)
    const once = binding.modifiers.once ?? false
    target._into_view_observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          target._into_view_callBack(entry.target)
          if (once) {
            target._into_view_observer.unobserve(target)
            target._into_view_observer.disconnect()
          }
        }
      })
    }, { threshold: 1 })
    target._into_view_observer.observe(target)
  },
  updated(target: TargetElement, binding: DirectiveBinding<BindingValue>) {
    setValue(target, binding)
  },
  unmounted(target: TargetElement) {
    target._into_view_observer.unobserve(target)
    target._into_view_observer.disconnect()
  },
}