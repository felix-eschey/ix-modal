// Usage: node check-modal.mjs <url>   (optional: CHROMIUM_PATH=/path/to/chrome)
// Opens the modal, clicks Cancel, and reports position, open state and console errors.
import { chromium } from 'playwright'

const url = process.argv[2] ?? 'http://localhost:4300'
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH })
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
page.on('console', (m) => m.type() === 'error' && errors.push(`console.error: ${m.text().split('\n')[0]}`))

await page.goto(url)
await page.locator('[data-test-id="open"]').click()
await page.waitForTimeout(1000)
const box = await page.locator('ix-modal dialog').first().boundingBox()
console.log(`${url}\n  modal x after open:   ${box?.x} (centered would be ${(1400 - (box?.width ?? 0)) / 2})`)

await page.locator('[data-test-id="cancel"]').click()
await page.waitForTimeout(1000)
const open = await page.evaluate(() => [...document.querySelectorAll('ix-modal')].map((m) => m.shadowRoot?.querySelector('dialog')?.open))
console.log(`  dialogs still open:   ${JSON.stringify(open)}`)
console.log(`  console errors:       ${errors.length}`)
for (const e of errors) console.log(`    ${e}`)
await browser.close()
