import { HOME, caseUrl, flightNumber, projects, stopById } from '../data/projects'
import { escape } from './boardingPass'
import { splitFlap } from '../lib/splitflap'

/** "All flights": a departures board listing every project, for a quick scan without the journey. */
export function initDepartures(opts: { reduced: boolean; onOpen?: () => void; onClose?: () => void }) {
  const dialog = document.querySelector<HTMLDialogElement>('#departures')!
  const button = document.querySelector<HTMLButtonElement>('.all-flights')!

  dialog.innerHTML = `
  <div class="departures__inner">
    <header class="departures__head">
      <div>
        <p class="board-row">
          <span class="board-row__label">Departures</span>
          <span class="board-row__value">${HOME.city} · ${HOME.code}</span>
          <span class="board-row__status"><time data-clock="${HOME.timeZone}">--:--:--</time></span>
        </p>
        <h2 class="departures__title">All flights</h2>
      </div>
      <button class="departures__close" type="button" aria-label="Close" data-cursor="Close">✕</button>
    </header>
    <div class="departures__table" role="table" aria-label="Projects">
      <div class="departures__row departures__row--head" role="row">
        <span role="columnheader">Flight</span>
        <span role="columnheader">To</span>
        <span role="columnheader">Client</span>
        <span role="columnheader">Gate</span>
        <span role="columnheader">Class</span>
        <span role="columnheader">Remarks</span>
        <span role="columnheader"><span class="sr-only">Links</span></span>
      </div>
      ${projects
        .map((p) => {
          const to = stopById(p.stop)
          const cs = caseUrl(p)
          return `
      <div class="departures__row" role="row">
        <span role="cell" class="departures__fn">${flightNumber(p)}</span>
        <span role="cell" class="departures__to"><span class="flap-line" data-flap="${to.code}">${to.code}</span><small>${to.city}</small></span>
        <span role="cell" class="departures__client">${escape(p.name)}</span>
        <span role="cell">${escape(p.platform)}</span>
        <span role="cell">${escape(p.industry)}</span>
        <span role="cell" class="departures__remarks">${p.builtAtBeing ? 'Built at Being' : 'Freelance'}</span>
        <span role="cell" class="departures__links">
          ${cs ? `<a href="${cs}" data-takeoff="${flightNumber(p)}" data-cursor="Fly">Case</a>` : ''}
          <a href="${p.url}" target="_blank" rel="noopener" data-cursor="Open">Visit ↗</a>
        </span>
      </div>`
        })
        .join('')}
    </div>
  </div>`

  const close = () => dialog.close()

  button.addEventListener('click', () => {
    dialog.showModal()
    opts.onOpen?.()
    dialog.querySelectorAll<HTMLElement>('.departures__to .flap-line').forEach((el, i) =>
      splitFlap(el, el.dataset.flap!, { reduced: opts.reduced, delay: 120 + i * 90, stagger: 50, minCycles: 3, maxCycles: 7 }),
    )
  })
  dialog.querySelector('.departures__close')!.addEventListener('click', close)
  // Click on the backdrop closes it
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) close()
  })
  dialog.addEventListener('close', () => opts.onClose?.())
}
