import { HOME, caseUrl, flightNumber, mediaPath, stopById, type Project } from '../data/projects'

export const escape =(s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/** Deterministic barcode from the project id, so it never changes between builds. */
export function barcode(seed: string) {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  const rand = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507)) >>> 0) / 4294967296
  let x = 0
  let bars = ''
  while (x < 116) {
    const w = 1 + Math.floor(rand() * 3)
    bars += `<rect x="${x}" width="${w}" height="40"/>`
    x += w + 1 + Math.floor(rand() * 3)
  }
  return `<svg class="pass__barcode" viewBox="0 0 120 40" preserveAspectRatio="none" aria-hidden="true">${bars}</svg>`
}

const planeIcon =
  '<svg class="pass__plane" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15.5v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V8.5l-8 5v2l8-2.5V18l-2 1.5V21l3.5-1 3.5 1v-1.5L13 18v-5z" transform="rotate(90 12 12)"/></svg>'

export function boardingPass(p: Project): string {
  const dest = stopById(p.stop)
  const domestic = dest.code === HOME.code
  const host = new URL(p.url).host.replace(/^www\./, '')
  const fn = flightNumber(p)
  const caseLink = caseUrl(p)

  return `
<article class="pass${p.featured ? ' pass--featured' : ''}" data-pass="${p.id}">
  <div class="pass__main">
    <header class="pass__head">
      <span class="pass__airline">FDS Air · Boarding pass</span>
      <span class="pass__tags">
        ${p.featured ? '<span class="pass__tag pass__tag--priority">Priority</span>' : ''}
        ${p.builtAtBeing ? '<span class="pass__tag">Built at Being</span>' : ''}
      </span>
    </header>

    <div class="pass__passenger">
      <span class="pass__label">Passenger</span>
      <h3 class="pass__name">${escape(p.name)}</h3>
    </div>

    <div class="pass__route">
      <div class="pass__city">
        <span class="pass__code">${HOME.code}</span>
        <span class="pass__cityname">${HOME.city}</span>
      </div>
      <div class="pass__path">${planeIcon}${domestic ? '<span class="pass__domestic">Domestic flight</span>' : ''}</div>
      <div class="pass__city pass__city--to">
        <span class="pass__code">${dest.code}</span>
        <span class="pass__cityname">${dest.city}</span>
      </div>
    </div>

    <dl class="pass__fields">
      <div><dt>Flight</dt><dd>${fn}</dd></div>
      <div><dt>Gate</dt><dd>${escape(p.platform)}</dd></div>
      <div><dt>Class</dt><dd>${escape(p.industry)}</dd></div>
    </dl>

    <p class="pass__summary">${escape(p.summary)}</p>

    <div class="pass__actions">
      <a class="pass__visit" href="${p.url}" target="_blank" rel="noopener" data-cursor="Open">
        Visit site <span aria-hidden="true">→</span><span class="pass__host">${escape(host)}</span>
      </a>
      ${
        caseLink
          ? `<a class="pass__case" href="${caseLink}" data-takeoff="${fn}" data-cursor="Fly">Case study <span aria-hidden="true">↗</span></a>`
          : ''
      }
    </div>
  </div>

  <a class="pass__preview" href="${p.url}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true" data-cursor="Visit">
    <img src="${mediaPath(p, 'desktop.webp')}" alt="" loading="lazy" decoding="async" width="1440" height="900"
         onerror="this.closest('.pass__preview').classList.add('is-missing')" />
    <video muted loop playsinline preload="none" data-src="${mediaPath(p, 'scroll.mp4')}"></video>
    <span class="pass__window-label">${escape(host)}</span>
  </a>

  <aside class="pass__stub">
    <span class="pass__label">Flight</span>
    <span class="pass__stub-fn">${fn}</span>
    <span class="pass__stub-route">${HOME.code} → ${dest.code}</span>
    <span class="pass__label">Seat</span>
    <span class="pass__stub-seat">${String(p.number).padStart(2, '0')}A</span>
    ${barcode(p.id)}
  </aside>
</article>`
}

/** Plays the recorded scroll video while the pass is hovered. Video src is only set on first hover. */
export function bindPassVideos(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('.pass').forEach((pass) => {
    const video = pass.querySelector('video')!
    const preview = pass.querySelector<HTMLElement>('.pass__preview')!
    pass.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return
      if (!video.src) {
        video.src = video.dataset.src!
        video.addEventListener('error', () => preview.classList.add('no-video'), { once: true })
      }
      video.currentTime = 0
      video.play().then(() => preview.classList.add('is-playing'), () => {})
    })
    pass.addEventListener('pointerleave', () => {
      preview.classList.remove('is-playing')
      video.pause()
    })
  })
}
