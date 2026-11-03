import './styles/base.css'
import './styles/pass.css'
import './styles/sections.css'
import './styles/case.css'

import { gsap } from 'gsap'

import { escape } from './components/boardingPass'
import { caseBySlug, cases } from './data/cases'
import { HOME, CONTACT, flightNumber, mediaPath, projectById, stopById } from './data/projects'
import { setupPage } from './lib/setup'

const study = caseBySlug(document.body.dataset.case!)
const p = projectById(study.project)
const dest = stopById(p.stop)
const host = new URL(p.url).host.replace(/^www\./, '')
const next = cases[(cases.indexOf(study) + 1) % cases.length]
const nextProject = projectById(next.project)

const section = (n: string, title: string, body: string) => `
  <section class="case-block">
    <p class="case-block__n">${n}</p>
    <h2 class="case-block__title">${title}</h2>
    <div class="case-block__body">${body}</div>
  </section>`

document.querySelector<HTMLElement>('#case')!.innerHTML = `
<header class="topbar">
  <a class="topbar__mark" href="/#stop-${p.stop.toLowerCase()}" data-takeoff="Return to ${dest.code}" data-cursor="Back">
    <span class="topbar__logo">FDS</span>
    <span class="topbar__terminal">← Back to the journey</span>
  </a>
  <div class="topbar__meta">
    <span>${dest.city}</span>
    <span class="topbar__clock" data-clock="${dest.timeZone}">--:--:--</span>
  </div>
</header>

<article class="case">
  <header class="case-hero">
    <p class="board-row">
      <span class="board-row__label">Case file</span>
      <span class="board-row__value">${flightNumber(p)} · ${HOME.code} → ${dest.code}</span>
      ${p.builtAtBeing ? '<span class="board-row__status">Built at Being</span>' : ''}
    </p>
    <h1 class="case-hero__title">${escape(p.name)}</h1>
    <p class="case-hero__headline">${escape(study.headline)}</p>
    <dl class="case-hero__meta">
      <div><dt>Gate</dt><dd>${escape(p.platform)}</dd></div>
      <div><dt>Class</dt><dd>${escape(p.industry)}</dd></div>
      <div><dt>Destination</dt><dd>${dest.city}, ${dest.country}</dd></div>
      <div><dt>Live at</dt><dd><a href="${p.url}" target="_blank" rel="noopener" data-cursor="Open">${host} ↗</a></dd></div>
    </dl>
  </header>

  <figure class="case-shots">
    <div class="case-shots__desktop">
      <span class="case-shots__bar"><i></i><i></i><i></i><span>${host}</span></span>
      <img src="${mediaPath(p, 'desktop.webp')}" alt="${escape(p.name)} website on desktop" width="1440" height="900" />
    </div>
    <div class="case-shots__mobile">
      <img src="${mediaPath(p, 'mobile.webp')}" alt="${escape(p.name)} website on mobile" width="780" height="1688" loading="lazy" />
    </div>
  </figure>

  <p class="case-intro">${escape(study.intro)}</p>

  <div class="case-grid">
    ${section('01', 'The challenge', `<p>${escape(study.challenge)}</p>`)}
    ${section('02', 'What I did', `<ul class="case-list">${study.did.map((d) => `<li>${escape(d)}</li>`).join('')}</ul>`)}
    ${section('03', 'Stack', `<ul class="case-tags">${study.stack.map((s) => `<li>${escape(s)}</li>`).join('')}</ul>`)}
    ${section('04', 'The result', `<p>${escape(study.result)}</p><a class="btn btn--amber" href="${p.url}" target="_blank" rel="noopener">Visit ${host} ↗</a>`)}
  </div>

  <figure class="case-full">
    <figcaption class="case-full__caption">
      <span class="board-row__label">Full page</span>
      <span>Scroll inside the frame</span>
    </figcaption>
    <div class="case-full__frame" data-lenis-prevent>
      <img src="${mediaPath(p, 'full.webp')}" alt="Full-page capture of ${escape(p.name)}" loading="lazy" width="1200" />
    </div>
  </figure>

  <nav class="case-next">
    <a href="/cases/${next.slug}.html" data-takeoff="${flightNumber(nextProject)}" data-cursor="Fly">
      <span class="case-next__label">Next flight · ${flightNumber(nextProject)}</span>
      <span class="case-next__name">${escape(nextProject.name)} →</span>
    </a>
  </nav>

  <footer class="site-footer">
    <span><a href="mailto:${CONTACT.email}">${CONTACT.email}</a></span>
    <span><a href="${CONTACT.phoneHref}">${CONTACT.phone}</a> · <a href="${CONTACT.linkedin}" target="_blank" rel="noopener">LinkedIn</a> · <a href="${CONTACT.cv}" download>CV</a></span>
  </footer>
</article>`

const { reduced } = setupPage()

if (!reduced) {
  gsap.from('.case-hero > *', { y: 30, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', delay: 0.5 })
  gsap.from('.case-shots > *', { y: 60, opacity: 0, duration: 1.1, stagger: 0.15, ease: 'power3.out', delay: 0.8 })
  gsap.utils.toArray<HTMLElement>('.case-block, .case-full, .case-intro').forEach((el) =>
    gsap.from(el, { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }),
  )
}
