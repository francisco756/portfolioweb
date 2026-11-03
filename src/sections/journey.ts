import { legs } from '../data/projects'
import { flightSection } from './flight'
import { renderStop } from './stop'

/** Builds the whole trip: home stop, then a flight + stop per leg, ending with the flight home. */
export function renderJourney(root: HTMLElement) {
  let html = '<section class="stop" id="stop-ar" data-stop="AR"></section>'
  legs.forEach((leg, i) => {
    html += flightSection(leg, i)
    if (leg.to !== 'AR') html += `<section class="stop" id="stop-${leg.to.toLowerCase()}" data-stop="${leg.to}"></section>`
  })
  root.innerHTML = html
  root.querySelectorAll<HTMLElement>('[data-stop]').forEach(renderStop)
}
