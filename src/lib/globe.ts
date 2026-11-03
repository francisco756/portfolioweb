import type { GlobeInstance } from 'globe.gl'
import { HOME, legs, stopById, stops, type Leg } from '../data/projects'
import { greatCircle, type LatLng } from './geo'

/** Countries on the journey are rendered brighter. */
const WORKED = new Set(stops.map((s) => s.iso))
const AMBER = '#ffb000'

export interface GlobeController {
  world: GlobeInstance
  /** Camera sits above the great circle from `from` to `to` at fraction `t`. */
  flyAlong(from: LatLng, to: LatLng, t: number, altitude: number): void
  lookAt(p: LatLng, altitude: number, ms?: number): void
  setRotating(on: boolean): void
  /** 'hero': spokes from Buenos Aires. 'journey': every leg. Or one leg, highlighted. */
  setRoutes(which: 'hero' | 'journey' | Leg): void
  resize(): void
}

interface Route {
  startLat: number
  startLng: number
  endLat: number
  endLng: number
}

const heroRoutes: Route[] = stops
  .filter((s) => s.id !== 'AR')
  .map((s) => ({ startLat: HOME.lat, startLng: HOME.lng, endLat: s.lat, endLng: s.lng }))

const legRoute = (leg: Leg): Route => {
  const a = stopById(leg.from)
  const b = stopById(leg.to)
  return { startLat: a.lat, startLng: a.lng, endLat: b.lat, endLng: b.lng }
}

function codeLabel(d: object) {
  const { code, home } = d as { code: string; home?: boolean }
  const el = document.createElement('div')
  el.className = `globe-label${home ? ' globe-label--home' : ''}`
  el.textContent = code
  return el
}

export async function createGlobe(
  container: HTMLElement,
  { compact, reduced }: { compact: boolean; reduced: boolean },
): Promise<GlobeController> {
  const [{ default: Globe }, { feature }, atlas] = await Promise.all([
    import('globe.gl'),
    import('topojson-client'),
    import('world-atlas/countries-110m.json'),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topo = (atlas as any).default ?? atlas
  const countries = (feature(topo, topo.objects.countries) as unknown as GeoJSON.FeatureCollection).features.filter(
    // Antarctica, plus North Korea, whose 110m outline makes h3 throw
    (f) => f.id !== '010' && f.id !== '408',
  )

  const world = new Globe(container, { animateIn: false, rendererConfig: { antialias: !compact, alpha: true } })
    .width(container.clientWidth)
    .height(container.clientHeight)
    .backgroundColor('rgba(0,0,0,0)')
    .showAtmosphere(true)
    .atmosphereColor(AMBER)
    .atmosphereAltitude(0.12)
    .hexPolygonsData(countries)
    .hexPolygonResolution(compact ? 2 : 3)
    .hexPolygonMargin(compact ? 0.45 : 0.55)
    .hexPolygonUseDots(true)
    .hexPolygonColor((f) => (WORKED.has(String((f as GeoJSON.Feature).id)) ? AMBER : 'rgba(242, 234, 216, 0.32)'))
    .ringsData([HOME])
    .ringColor(() => (t: number) => `rgba(255, 176, 0, ${1 - t})`)
    .ringMaxRadius(compact ? 3 : 4.5)
    .ringPropagationSpeed(2.4)
    .ringRepeatPeriod(reduced ? 0 : 1400)
    .pointsData([HOME, ...stops.filter((s) => s.id !== 'AR')])
    .pointColor(() => AMBER)
    .pointAltitude(0.005)
    .pointRadius(0.45)
    .arcsData(heroRoutes)
    .arcColor(() => ['rgba(255, 176, 0, 0.15)', AMBER])
    .arcStroke(compact ? 0.5 : 0.65)
    .arcAltitudeAutoScale(0.42)
    .arcDashLength(0.45)
    .arcDashGap(0.25)
    .arcDashInitialGap(() => Math.random())
    .arcDashAnimateTime(reduced ? 0 : 2600)
    .htmlElementsData([{ ...HOME, code: HOME.code, home: true }, ...stops.filter((s) => s.id !== 'AR')])
    .htmlElement(codeLabel)
    .htmlElementVisibilityModifier((el, visible) => {
      el.style.opacity = visible ? '1' : '0'
    })

  world.renderer().setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.5 : 2))

  const material = world.globeMaterial() as unknown as {
    color: { set(c: string): void }
    emissive: { set(c: string): void }
    shininess: number
  }
  material.color.set('#101012')
  material.emissive.set('#070708')
  material.shininess = 0

  const controls = world.controls()
  controls.enableZoom = false
  controls.enablePan = false
  controls.enableRotate = false
  controls.autoRotate = !reduced
  controls.autoRotateSpeed = 0.35

  // Start a little north of Buenos Aires so the arcs read clearly.
  world.pointOfView({ lat: HOME.lat + 12, lng: HOME.lng - 10, altitude: compact ? 2.3 : 2.1 })

  return {
    world,
    flyAlong(from, to, t, altitude) {
      const p = greatCircle(from, to, t)
      world.pointOfView({ ...p, altitude })
    },
    lookAt(p, altitude, ms = 0) {
      world.pointOfView({ lat: p.lat, lng: p.lng, altitude }, reduced ? 0 : ms)
    },
    setRotating(on) {
      controls.autoRotate = on && !reduced
    },
    setRoutes(which) {
      const single = typeof which === 'object'
      world.arcsData(which === 'hero' ? heroRoutes : which === 'journey' ? legs.map(legRoute) : [legRoute(which as Leg)])
      world.arcStroke(single ? 1.1 : compact ? 0.5 : 0.65)
    },
    resize() {
      world.width(container.clientWidth).height(container.clientHeight)
    },
  }
}
