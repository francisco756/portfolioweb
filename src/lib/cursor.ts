import { gsap } from 'gsap'

const INTERACTIVE = 'a, button, [data-cursor]'

/** Dot + ring cursor. Over anything clickable the ring widens a little and a label appears beside it. */
export function initCursor() {
  const dot = document.createElement('div')
  const ring = document.createElement('div')
  const label = document.createElement('div')
  dot.className = 'cursor-dot'
  ring.className = 'cursor-ring'
  label.className = 'cursor-label'
  document.body.append(ring, dot, label)
  document.documentElement.classList.add('has-custom-cursor', 'cursor-hidden')

  const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3' })
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3' })
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3' })
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3' })
  const labelX = gsap.quickTo(label, 'x', { duration: 0.12, ease: 'power3' })
  const labelY = gsap.quickTo(label, 'y', { duration: 0.12, ease: 'power3' })

  window.addEventListener('pointermove', (e) => {
    dotX(e.clientX)
    dotY(e.clientY)
    ringX(e.clientX)
    ringY(e.clientY)
    labelX(e.clientX)
    labelY(e.clientY)
    document.documentElement.classList.remove('cursor-hidden')
  })
  document.addEventListener('pointerleave', () => document.documentElement.classList.add('cursor-hidden'))

  document.addEventListener('pointerover', (e) => {
    const target = (e.target as Element).closest<HTMLElement>(INTERACTIVE)
    ring.classList.toggle('is-hover', !!target)
    const text = target?.dataset.cursor ?? ''
    if (text) label.textContent = text
    label.classList.toggle('is-visible', !!text)
  })
}
