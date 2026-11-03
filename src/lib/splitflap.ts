/**
 * Split-flap display (airport departures board).
 * Each character is a tile with a static top/bottom half plus two leaves
 * that fold over when the character changes.
 */

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DIGITS = '0123456789'

interface FlapOptions {
  /** ms before the first tile starts */
  delay?: number
  /** ms between consecutive tiles */
  stagger?: number
  /** random characters shown before landing on the target */
  minCycles?: number
  maxCycles?: number
  /** duration of a single flip, ms */
  flipMs?: number
  reduced?: boolean
}

interface Cell {
  root: HTMLElement
  top: HTMLElement
  bottom: HTMLElement
  leafTop: HTMLElement
  leafBottom: HTMLElement
  value: string
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function makeCell(): Cell {
  const root = document.createElement('span')
  root.className = 'flap'
  root.innerHTML =
    '<span class="flap__half flap__top"><span></span></span>' +
    '<span class="flap__half flap__bottom"><span></span></span>' +
    '<span class="flap__half flap__top flap__leaf flap__leaf--top"><span></span></span>' +
    '<span class="flap__half flap__bottom flap__leaf flap__leaf--bottom"><span></span></span>'
  const [top, bottom, leafTop, leafBottom] = Array.from(root.children) as HTMLElement[]
  return { root, top, bottom, leafTop, leafBottom, value: ' ' }
}

const setText = (el: HTMLElement, ch: string) => {
  ;(el.firstElementChild as HTMLElement).textContent = ch
}

function setCell(cell: Cell, ch: string) {
  for (const el of [cell.top, cell.bottom, cell.leafTop, cell.leafBottom]) setText(el, ch)
  cell.value = ch
}

async function flip(cell: Cell, next: string, ms: number) {
  const prev = cell.value
  setText(cell.top, next)
  setText(cell.bottom, prev)
  setText(cell.leafTop, prev)
  setText(cell.leafBottom, next)
  cell.root.classList.add('is-flipping')
  const fold = cell.leafTop.animate([{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-90deg)' }], {
    duration: ms / 2,
    easing: 'ease-in',
    fill: 'forwards',
  })
  await fold.finished
  const land = cell.leafBottom.animate([{ transform: 'rotateX(90deg)' }, { transform: 'rotateX(0deg)' }], {
    duration: ms / 2,
    easing: 'ease-out',
    fill: 'forwards',
  })
  await land.finished
  setText(cell.bottom, next)
  cell.root.classList.remove('is-flipping')
  // Leaves are hidden again, so drop the filled animations instead of letting them pile up.
  fold.cancel()
  land.cancel()
  cell.value = next
}

/**
 * Renders `text` into `el` as flap tiles and animates them into place.
 * Words are grouped so lines only wrap between words.
 * Resolves when every tile has landed.
 */
export function splitFlap(el: HTMLElement, text: string, opts: FlapOptions = {}): Promise<void> {
  const { delay = 0, stagger = 35, minCycles = 4, maxCycles = 10, flipMs = 90, reduced = false } = opts

  el.setAttribute('aria-label', text)
  el.textContent = ''
  const cells: { cell: Cell; target: string }[] = []

  const words = text.split(' ')
  words.forEach((word, wi) => {
    const group = document.createElement('span')
    group.className = 'flap-word'
    group.setAttribute('aria-hidden', 'true')
    const chars = wi < words.length - 1 ? [...word, ' '] : [...word]
    for (const ch of chars) {
      const cell = makeCell()
      if (ch === ' ') cell.root.classList.add('flap--blank')
      group.appendChild(cell.root)
      cells.push({ cell, target: ch })
    }
    el.appendChild(group)
  })

  if (reduced) {
    cells.forEach(({ cell, target }) => setCell(cell, target))
    return Promise.resolve()
  }

  cells.forEach(({ cell }) => setCell(cell, ' '))

  return Promise.all(
    cells.map(async ({ cell, target }, i) => {
      if (target === ' ') return
      await sleep(delay + i * stagger)
      const pool = DIGITS.includes(target) ? DIGITS : LETTERS
      const cycles = minCycles + Math.floor(Math.random() * (maxCycles - minCycles + 1))
      for (let c = 0; c < cycles; c++) {
        await flip(cell, pool[Math.floor(Math.random() * pool.length)], flipMs)
      }
      await flip(cell, target, flipMs)
    }),
  ).then(() => undefined)
}
