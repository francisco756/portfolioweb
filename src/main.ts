import './styles/base.css'
import './styles/hero.css'
import './styles/journey.css'
import './styles/pass.css'
import './styles/sections.css'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { barcode } from './components/boardingPass'
import { initDepartures } from './components/departures'
import { HOME, legs, stopById } from './data/projects'
import { bearing, greatCircle } from './lib/geo'
import type { GlobeController } from './lib/globe'
import { setupPage } from './lib/setup'
import { splitFlap } from './lib/splitflap'
import { legKm } from './sections/flight'
import { renderJourney } from './sections/journey'

const { reduced, compact, lenis } = setupPage()

renderJourney(document.querySelector<HTMLElement>('#journey')!)
document.querySelectorAll<HTMLElement>('[data-barcode]').forEach((el) => (el.outerHTML = barcode(el.dataset.barcode!)))
initDepartures({ reduced, onOpen: () => lenis?.stop(), onClose: () => lenis?.start() })

// The journey is rendered client-side, so the browser can't jump to /#stop-cl by itself.
const hashTarget = location.hash ? document.querySelector<HTMLElement>(location.hash) : null
if (hashTarget) {
  requestAnimationFrame(() => {
    if (lenis) lenis.scrollTo(hashTarget, { immediate: true, force: true })
    else hashTarget.scrollIntoView()
  })
}

/* ── Hero: split-flap board ────────────────────── */
async function playHero() {
  const [name, role, ...stats] = Array.from(document.querySelectorAll<HTMLElement>('.hero [data-flap]'))
  const flap = (el: HTMLElement, o = {}) => splitFlap(el, el.dataset.flap!, { reduced, ...o })
  const nameDone = flap(name, { delay: 250, stagger: 40, maxCycles: 8 })
  const roleDone = flap(role, { delay: 900, stagger: 14, minCycles: 2, maxCycles: 6, flipMs: 70 })
  stats.forEach((el, i) => flap(el, { delay: 1500 + i * 160, minCycles: 8, maxCycles: 14, flipMs: 80 }))
  await Promise.all([nameDone, roleDone])
}

gsap.from('.hero__cta, .hero__routes, .hero__stat-label', {
  opacity: 0,
  y: 12,
  duration: 0.8,
  stagger: 0.08,
  delay: reduced ? 0 : 1.9,
})
playHero()

/* ── Globe (loaded after first paint) ──────────── */
const stage = document.querySelector<HTMLElement>('.globe-stage')!
const canvasHost = stage.querySelector<HTMLElement>('.globe-stage__canvas')!
const plane = stage.querySelector<SVGElement>('.flight-plane')!

const idle = (cb: () => void) =>
  'requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 1200 }) : setTimeout(cb, 300)

idle(async () => {
  const { createGlobe } = await import('./lib/globe')
  const globe = await createGlobe(canvasHost, { compact, reduced })
  stage.classList.add('is-ready')
  window.addEventListener('resize', () => globe.resize())
  if (!compact) setupCamera(globe)
})

/* ── Camera: follows the journey ───────────────── */
const STOP_ALT = 1.6
const ease = gsap.parseEase('power1.inOut')

function setupCamera(globe: GlobeController) {
  // Hero → Argentina: stop spinning and settle over Buenos Aires.
  let departure: { lat: number; lng: number; altitude: number } | null = null
  ScrollTrigger.create({
    trigger: '#stop-ar',
    start: 'top bottom',
    end: 'top 25%',
    scrub: reduced ? false : 0.6,
    onUpdate(self) {
      if (self.progress === 0) return
      if (!departure) {
        departure = globe.world.pointOfView()
        globe.setRotating(false)
        globe.setRoutes('journey')
      }
      const q = ease(self.progress)
      globe.flyAlong(departure, HOME, q, departure.altitude + (STOP_ALT - departure.altitude) * q)
    },
    onLeaveBack() {
      departure = null
      globe.setRoutes('hero')
      globe.setRotating(true)
    },
  })

  // Each leg: the camera rides the great circle, higher on long hauls.
  document.querySelectorAll<HTMLElement>('[data-leg]').forEach((section) => {
    const leg = legs[Number(section.dataset.leg)]
    const from = stopById(leg.from)
    const to = stopById(leg.to)
    const km = legKm(leg)
    const peak = Math.min(1.4, km / 7000)
    const progressBar = section.querySelector<HTMLElement>('.flight__progress')!
    const kmEl = section.querySelector<HTMLElement>('.flight__km')!

    ScrollTrigger.create({
      trigger: section,
      start: 'top 60%',
      end: 'bottom bottom',
      scrub: reduced ? false : 0.6,
      onToggle(self) {
        globe.setRoutes(self.isActive ? leg : 'journey')
        if (!self.isActive) gsap.set(plane, { opacity: 0 })
      },
      onUpdate(self) {
        const q = ease(self.progress)
        globe.flyAlong(from, to, q, STOP_ALT + Math.sin(Math.PI * q) * peak)
        const here = greatCircle(from, to, q)
        gsap.set(plane, { opacity: self.progress > 0.02 && self.progress < 0.98 ? 1 : 0, rotate: bearing(here, to) })
        progressBar.style.transform = `scaleX(${self.progress})`
        kmEl.textContent = Math.round(self.progress * km).toLocaleString('en-US')
      },
    })
  })

  // Contact: pull back and show the whole network spinning again.
  ScrollTrigger.create({
    trigger: '#contact',
    start: 'top 70%',
    onEnter() {
      globe.setRoutes('journey')
      globe.lookAt(HOME, 2.6, 1600)
      setTimeout(() => globe.setRotating(true), 1600)
    },
    onLeaveBack() {
      globe.setRotating(false)
      globe.lookAt(HOME, STOP_ALT, 800)
    },
  })
}

// Without the scroll-driven flights, show each leg as already flown.
if (compact) {
  document.querySelectorAll<HTMLElement>('[data-leg]').forEach((section) => {
    section.querySelector('.flight__km')!.textContent = legKm(legs[Number(section.dataset.leg)]).toLocaleString('en-US')
  })
}

/* ── Stops: passes slide in, stamp lands ───────── */
document.querySelectorAll<HTMLElement>('.stop').forEach((stop) => {
  gsap.from(stop.querySelector('.stop__country'), {
    yPercent: 60,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: { trigger: stop, start: 'top 70%' },
  })

  stop.querySelectorAll<HTMLElement>('.pass').forEach((pass, i) => {
    gsap.from(pass, {
      x: compact || reduced ? 0 : -160,
      y: compact && !reduced ? 40 : 0,
      rotate: compact || reduced ? 0 : -3 + i * 2,
      opacity: 0,
      duration: reduced ? 0.01 : 1.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: pass, start: 'top 85%' },
    })
  })

  const stampEl = stop.querySelector<SVGElement>('.stamp')!
  const stampTl = gsap.timeline({ paused: true })
  if (reduced) {
    stampTl.fromTo(stampEl, { opacity: 0 }, { opacity: 0.92, duration: 0.3 })
  } else {
    stampTl
      .fromTo(stampEl, { scale: 2.6, opacity: 0, rotate: -28 }, { scale: 1, opacity: 0.92, rotate: -12, duration: 0.32, ease: 'power4.in' })
      .to(stop.querySelector('.stop__passes'), { x: 3, y: 2, duration: 0.05, yoyo: true, repeat: 3, ease: 'none' })
  }
  ScrollTrigger.create({
    trigger: stop.querySelector('.stop__stamp'),
    start: 'top 80%',
    onEnter: () => stampTl.play(),
    onLeaveBack: () => stampTl.reverse(),
  })
})

/* ── What I do: arrivals board flips in ────────── */
ScrollTrigger.create({
  trigger: '.services__board',
  start: 'top 75%',
  once: true,
  onEnter() {
    document.querySelectorAll<HTMLElement>('.svc__name').forEach((el, i) =>
      splitFlap(el, el.dataset.flap!, { reduced, delay: i * 220, stagger: 22, minCycles: 2, maxCycles: 6, flipMs: 70 }),
    )
  },
})

gsap.from('.contact__title', {
  yPercent: 40,
  opacity: 0,
  duration: 1.1,
  ease: 'power3.out',
  scrollTrigger: { trigger: '#contact', start: 'top 70%' },
})
gsap.from('.pass--contact', {
  y: 80,
  rotate: reduced ? 0 : 2,
  opacity: 0,
  duration: reduced ? 0.01 : 1.1,
  ease: 'power3.out',
  scrollTrigger: { trigger: '.pass--contact', start: 'top 90%' },
})
