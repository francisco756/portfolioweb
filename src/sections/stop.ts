import { boardingPass, bindPassVideos } from '../components/boardingPass'
import { projectsAt, stopById, type StopId } from '../data/projects'

const stampDate = () =>
  new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()).toUpperCase()

function stamp(country: string, code: string, city: string) {
  const ring = `ADMITTED · ${city.toUpperCase()} · ${code} · ADMITTED · ${city.toUpperCase()} · ${code} · `
  return `
<svg class="stamp" viewBox="0 0 220 220" role="img" aria-label="Passport stamp: ${country}">
  <defs>
    <path id="ring-${code}" d="M110,110 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" />
    <filter id="ink-${code}">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.3 1.3" result="m" />
      <feComposite in="SourceGraphic" in2="m" operator="in" />
    </filter>
  </defs>
  <g filter="url(#ink-${code})">
    <circle cx="110" cy="110" r="104" class="stamp__stroke" stroke-width="5" />
    <circle cx="110" cy="110" r="70" class="stamp__stroke" stroke-width="2" />
    <text class="stamp__ring"><textPath href="#ring-${code}" textLength="510">${ring}</textPath></text>
    <text x="110" y="112" text-anchor="middle" class="stamp__country" textLength="${Math.min(118, country.length * 22)}" lengthAdjust="spacingAndGlyphs">${country.toUpperCase()}</text>
    <text x="110" y="136" text-anchor="middle" class="stamp__date">${stampDate()}</text>
  </g>
</svg>`
}

/** Fills a `[data-stop]` section with the country header, its boarding passes and the passport stamp. */
export function renderStop(section: HTMLElement) {
  const stop = stopById(section.dataset.stop as StopId)
  const items = projectsAt(stop.id)
  const home = stop.id === 'AR'
  const flights = `${items.length} ${home ? 'domestic ' : ''}${items.length === 1 ? 'flight' : 'flights'}`

  section.innerHTML = `
  <header class="stop__header">
    <p class="board-row">
      <span class="board-row__label">${home ? 'Home base' : 'Arrived'}</span>
      <span class="board-row__value">${stop.city} · ${stop.code}</span>
      <span class="board-row__status">Local time <time data-clock="${stop.timeZone}">--:--:--</time></span>
    </p>
    <h2 class="stop__country${stop.country.length > 12 ? ' stop__country--long' : ''}">${stop.country}</h2>
    <p class="stop__count">${flights} ${home ? 'out of Buenos Aires' : 'landed here'}</p>
  </header>
  <div class="stop__passes">
    ${items.map(boardingPass).join('')}
  </div>
  <div class="stop__stamp">${stamp(stop.stamp, stop.code, stop.city)}</div>`

  bindPassVideos(section)
}
