import { gsap } from 'gsap'

/**
 * Takeoff / landing transition between the journey and the case pages.
 * Leaving: a board panel rises, a plane crosses it, then we navigate.
 * Arriving: the same panel (flagged in sessionStorage) drops away.
 */
const KEY = 'fds:landing'

function overlay(label: string) {
  const el = document.createElement('div')
  el.className = 'takeoff'
  el.setAttribute('aria-hidden', 'true')
  el.innerHTML = `
    <div class="takeoff__runway"></div>
    <svg class="takeoff__plane" viewBox="0 0 24 24"><path d="M21 15.5v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V8.5l-8 5v2l8-2.5V18l-2 1.5V21l3.5-1 3.5 1v-1.5L13 18v-5z" transform="rotate(90 12 12)"/></svg>
    <p class="takeoff__label">${label}</p>`
  document.body.appendChild(el)
  return el
}

export function initTakeoffLinks(reduced: boolean) {
  document.addEventListener('click', (e) => {
    const link = (e.target as Element).closest<HTMLAnchorElement>('a[data-takeoff]')
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    const href = link.href
    if (reduced) {
      location.href = href
      return
    }
    sessionStorage.setItem(KEY, link.dataset.takeoff ?? '')
    const el = overlay(`Now departing · ${link.dataset.takeoff}`)
    gsap
      .timeline({ onComplete: () => void (location.href = href) })
      .fromTo(el, { yPercent: 100 }, { yPercent: 0, duration: 0.55, ease: 'power3.inOut' })
      .fromTo(el.querySelector('.takeoff__label'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 }, '-=0.15')
      .fromTo(
        el.querySelector('.takeoff__plane'),
        { xPercent: -50, x: '-20vw', y: '8vh', rotate: 0 },
        { x: '120vw', y: '-30vh', rotate: -18, duration: 0.9, ease: 'power2.in' },
        '-=0.1',
      )
  })
}

/** Plays the landing half if we arrived through a takeoff link. */
export function land(reduced: boolean) {
  const label = sessionStorage.getItem(KEY)
  sessionStorage.removeItem(KEY)
  if (label === null || reduced) return
  const el = overlay(`Landed · ${label}`)
  gsap
    .timeline({ onComplete: () => el.remove() })
    .set(el.querySelector('.takeoff__plane'), { opacity: 0 })
    .to(el, { yPercent: -100, duration: 0.7, ease: 'power3.inOut', delay: 0.35 })
}
