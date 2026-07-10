import { chromium } from 'playwright-core'

const SCRATCH =
  'C:/Users/jake7/AppData/Local/Temp/claude/c--Users-jake7-Documents-GitHub-BlatsuPortfolio/b3ea3f65-c29d-4ec6-b87c-376b8c2c7520/scratchpad'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1920, height: 1000 } })

await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
await page.evaluate(() => document.querySelector('.work-showcase').scrollIntoView())
await page.waitForTimeout(1200)
await page.screenshot({ path: `${SCRATCH}/rail-smaller.png` })
const card = await page.evaluate(() =>
  Math.round(document.querySelector('.work-rail .work-item').getBoundingClientRect().width),
)

await page.goto('http://localhost:3000/gallery', { waitUntil: 'networkidle' })
await page.screenshot({ path: `${SCRATCH}/gallery-title.png` })
const align = await page.evaluate(() => {
  const h1 = document.querySelector('.page-intro h1').getBoundingClientRect()
  const grid = document.querySelector('.gallery-filter').getBoundingClientRect()
  const gapEl = document.querySelector('.page-intro').getBoundingClientRect()
  const next = document.querySelector('section.container:not(.page-intro)').getBoundingClientRect()
  return { h1Left: Math.round(h1.left), contentLeft: Math.round(grid.left), introBottom: Math.round(gapEl.bottom), nextTop: Math.round(next.top) }
})

console.log('rail card width:', card)
console.log('gallery h1 left:', align.h1Left, '| filter left:', align.contentLeft, '| gap intro→content:', align.nextTop - align.introBottom >= 0 ? 'padding inside intro' : '', '| intro bottom:', align.introBottom, 'next top:', align.nextTop)
await browser.close()
