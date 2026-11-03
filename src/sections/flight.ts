import { legs, stopById, type Leg } from '../data/projects'
import { distanceKm } from '../lib/geo'

export const legKm = (leg: Leg) => Math.round(distanceKm(stopById(leg.from), stopById(leg.to)))

/** Sticky flight board shown while the camera flies a leg. */
export function flightSection(leg: Leg, index: number): string {
  const from = stopById(leg.from)
  const to = stopById(leg.to)
  const last = index === legs.length - 1
  const km = legKm(leg).toLocaleString('en-US')

  return `
<section class="flight" id="flight-${to.id.toLowerCase()}${last ? '-home' : ''}" data-leg="${index}">
  <div class="flight__sticky">
    <div class="flight__board">
      <p class="board-row">
        <span class="board-row__label">${last ? 'Final call' : 'Now boarding'}</span>
        <span class="board-row__value">Leg ${String(index + 1).padStart(2, '0')} / ${String(legs.length).padStart(2, '0')}${last ? ' · Return' : ''}</span>
      </p>
      <div class="flight__route">
        <span class="flight__code">${from.code}</span>
        <span class="flight__track"><span class="flight__progress"></span></span>
        <span class="flight__code">${to.code}</span>
      </div>
      <dl class="flight__facts">
        <div><dt>From</dt><dd>${from.city}</dd></div>
        <div><dt>To</dt><dd>${to.city}</dd></div>
        <div><dt>Distance</dt><dd><span class="flight__km">0</span> / ${km} km</dd></div>
        <div><dt>Over the</dt><dd>${leg.over}</dd></div>
      </dl>
    </div>
  </div>
</section>`
}
