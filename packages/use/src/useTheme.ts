// these APIs are auto-imported from @vueuse/core
import { useColorMode, useDark, usePreferredDark } from '@vueuse/core'
import { nextTick } from 'vue'
import './styles/view-transition.css'

export function useTheme() {
  const storageKey = 'color-mode'
  const isDark = useDark({ storageKey })
  const preferredDark = usePreferredDark()
  const { store: colorMode, system: systemColorMode } = useColorMode({ emitAuto: true, storageKey })

  function toggleDark(event?: MouseEvent, effect = true) {
    const isAppearanceTransition
  = typeof document !== 'undefined'
  // @ts-expect-error: Transition API
  && document.startViewTransition
  && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    /**
     * Credit to [@hooray](https://github.com/hooray)
     * @see https://github.com/vuejs/vitepress/pull/2347
     */
    if (!isAppearanceTransition || !event || !effect) {
      isDark.value = !isDark.value
      return
    }

    const x = event.clientX
    const y = event.clientY
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    )
    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-ignore
    const transition = document.startViewTransition(async () => {
      isDark.value = !isDark.value
      await nextTick()
    })

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]
      document.documentElement.animate(
        {
          clipPath: isDark.value ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 300,
          easing: 'ease-in',
          pseudoElement: isDark.value
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        },
      )
    })
  }
  return {
    isDark,
    preferredDark,
    colorMode,
    systemColorMode,
    toggleDark,
  }
}
