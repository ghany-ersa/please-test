const path = require('path')
const fs = require('fs')

async function screenshot(page, label) {
    const dir = path.resolve('screenshots')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const datetime = new Date().toISOString().replace(/[:.]/g, '-')
    const slug = label
        ? `${label.replace(/[^a-zA-Z0-9_-]/g, '_')}_${datetime}`
        : datetime
    const filePath = path.join(dir, `${slug}.png`)
    await page.screenshot({ path: filePath })
    return filePath
}

module.exports = { screenshot }
