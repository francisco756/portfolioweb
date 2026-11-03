import { gsap } from 'gsap'

const INTERACTIVE = 'a, button, [data-cursor]'

/** Dot + ring cursor. The ring grows over anything clickable. */
export function initCursor() {
  const dot = document.createElement('div')
  const ring = document.createElement('div')
  dot.className = 'cursor-dot'
  ring.className = 'cursor-ring'
  ring.innerHTML = '<span class="cursor-label"></span>'
  document.body.append(ring, dot)
  document.documentElement.classList.add('has-custom-cursor', 'cursor-hidden')

  const label = ring.querySelector<HTMLElement>('.cursor-label')!
  const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3' })
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3' })
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3' })
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3' })

  window.addEventListener('pointermove', (e) => {
    dotX(e.clientX)
    dotY(e.clientY)
    ringX(e.clientX)
    ringY(e.clientY)
    document.documentElement.classList.remove('cursor-hidden')
  })
  document.addEventListener('pointerleave', () => document.documentElement.classList.add('cursor-hidden'))

  document.addEventListener('pointerover', (e) => {
    const target = (e.target as Element).closest<HTMLElement>(INTERACTIVE)
    ring.classList.toggle('is-hover', !!target)
    dot.classList.toggle('is-hover', !!target)
    label.textContent = target?.dataset.cursor ?? ''
  })
}
