/**
 * Records each project's site and saves to /public/media/<id>/:
 *   desktop.webp  — 1440×900 above-the-fold screenshot
 *   mobile.webp   — 390×844 @2x screenshot
 *   scroll.mp4    — ~8s smooth scroll, 960px wide, muted (plays on boarding-pass hover)
 *   full.webp     — tall page capture, only for projects with a case study
 *
 * Usage:
 *   npm run capture                       # every project
 *   npm run capture -- multiphone-chile   # only the listed ids
 *
 * First run needs the browser: npx playwright install chromium
 */
import { chromium } from 'playwright'
import ffmpegPath from 'ffmpeg-static'
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { projects } from '../src/data/projects.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const tmp = join(root, 'scripts', '.tmp')
const SCROLL_SECONDS = 8
const FULL_TILES = 5

const only = process.argv.slice(2)
const list = only.length ? projects.filter((p) => only.includes(p.id)) : projects

const ffmpeg = (...args) => execFileSync(ffmpegPath, ['-y', '-loglevel', 'error', ...args])

async function open(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 })
  } catch {
    await page.goto(url, { waitUntil: 'load', timeout: 60_000 })
  }
  await page.waitForTimeout(1800)
}

async function screenshot(browser, url, out, { width, height, scale, mobile, full }) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: scale,
    isMobile: mobile,
    hasTouch: mobile,
  })
  const page = await ctx.newPage()
  await open(page, url)
  const png = join(tmp, 'shot.png')
  await page.screenshot({ path: png })
  if (full) {
    // Tall capture for case study pages, stitched from viewport shots taken while scrolling,
    // so scroll-triggered reveals and lazy images have fired in each tile.
    const tiles = []
    for (let i = 0; i < FULL_TILES; i++) {
      const y = await page.evaluate((top) => {
        scrollTo({ top, behavior: 'instant' })
        return scrollY
      }, i * height)
      if (i > 0 && y < i * height) break // reached the bottom
      await page.waitForTimeout(1100)
      if (i === 1) {
        // Fixed headers and chat bubbles would repeat in every tile
        await page.evaluate(() =>
          document.querySelectorAll('body *').forEach((el) => {
            const pos = getComputedStyle(el).position
            if (pos === 'fixed' || pos === 'sticky') el.style.visibility = 'hidden'
          }),
        )
      }
      const tile = join(tmp, `tile-${i}.png`)
      await page.screenshot({ path: tile })
      tiles.push(tile)
    }
    const inputs = tiles.flatMap((t) => ['-i', t])
    const stack = tiles.length > 1 ? `${tiles.map((_, i) => `[${i}]`).join('')}vstack=inputs=${tiles.length},` : ''
    ffmpeg(...inputs, '-filter_complex', `${stack}scale=1200:-2`, '-quality', '72', full)
  }
  await ctx.close()
  ffmpeg('-i', png, '-vf', `scale=${mobile ? 780 : 1440}:-2`, '-quality', '78', out)
}

async function scrollVideo(browser, url, out) {
  const started = Date.now()
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: tmp, size: { width: 1280, height: 800 } },
  })
  const page = await ctx.newPage()
  await open(page, url)
  const offset = (Date.now() - started) / 1000

  await page.evaluate(async (seconds) => {
    const max = Math.min(document.documentElement.scrollHeight - innerHeight, innerHeight * 5)
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
    await new Promise((done) => {
      const t0 = performance.now()
      const step = (now) => {
        const t = Math.min(1, (now - t0) / (seconds * 1000))
        // 'instant' overrides `scroll-behavior: smooth`, which would cancel itself every frame
        scrollTo({ top: max * ease(t), behavior: 'instant' })
        t < 1 ? requestAnimationFrame(step) : done()
      }
      requestAnimationFrame(step)
    })
  }, SCROLL_SECONDS)
  await page.waitForTimeout(400)

  const video = page.video()
  await ctx.close()
  const webm = await video.path()
  ffmpeg(
    '-ss', offset.toFixed(2), '-i', webm, '-t', String(SCROLL_SECONDS + 0.4),
    '-vf', 'scale=960:-2,fps=30', '-c:v', 'libx264', '-crf', '28', '-preset', 'slow',
    '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', out,
  )
}

mkdirSync(tmp, { recursive: true })
const browser = await chromium.launch()

for (const p of list) {
  const dir = join(root, 'public', 'media', p.id)
  mkdirSync(dir, { recursive: true })
  process.stdout.write(`→ ${p.id} (${p.url})\n`)
  try {
    await screenshot(browser, p.url, join(dir, 'desktop.webp'), {
      width: 1440, height: 900, scale: 1, mobile: false,
      full: p.caseStudy ? join(dir, 'full.webp') : undefined,
    })
    await screenshot(browser, p.url, join(dir, 'mobile.webp'), { width: 390, height: 844, scale: 2, mobile: true })
    await scrollVideo(browser, p.url, join(dir, 'scroll.mp4'))
    process.stdout.write('  ✓ desktop.webp, mobile.webp, scroll.mp4\n')
  } catch (err) {
    process.stdout.write(`  ✗ ${err.message.split('\n')[0]}\n`)
  }
}

await browser.close()
rmSync(tmp, { recursive: true, force: true })
