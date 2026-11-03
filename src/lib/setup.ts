import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

import { startClocks } from './clock'
import { initCursor } from './cursor'
import { hasFinePointer, isCompact, prefersReducedMotion } from './env'
import { initTakeoffLinks, land } from './transition'

/** Shared by every page: motion prefs, smooth scroll, cursor, clocks and the takeoff transition. */
export function setupPage() {
  gsap.registerPlugin(ScrollTrigger)

  const reduced = prefersReducedMotion()
  const compact = isCompact()
  document.documentElement.classList.toggle('is-compact', compact)
  document.documentElement.classList.toggle('is-reduced', reduced)

  let lenis: Lenis | null = null
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.09 })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((t) => lenis!.raf(t * 1000))
    gsap.ticker.lagSmoothing(0)
  }

  document.querySelectorAll<HTMLAnchorElement>('a[data-scroll]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const target = document.querySelector<HTMLElement>(a.getAttribute('href')!)
      if (!target) return
      e.preventDefault()
      if (lenis) lenis.scrollTo(target, { duration: 2.2 })
      else target.scrollIntoView()
    }),
  )

  if (hasFinePointer()) initCursor()
  startClocks()
  document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = String(new Date().getFullYear())))
  initTakeoffLinks(reduced)
  land(reduced)

  return { reduced, compact, lenis }
}
