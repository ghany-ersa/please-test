async function goto(page, { url, title }) {
    await page.goto(url)
    if (title) {
        const actual = await page.title()
        if (actual !== title)
            throw new Error(`Title tidak sesuai. Expected: "${title}", actual: "${actual}"`)
    }
}

async function verifyPage(page, { url, title }) {
    await page.waitForLoadState('domcontentloaded')
    if (url) {
        const actual = page.url()
        if (!actual.includes(url))
            throw new Error(`URL tidak sesuai. Expected mengandung: "${url}", actual: "${actual}"`)
    }
    if (title) {
        const actual = await page.title()
        if (actual !== title)
            throw new Error(`Title tidak sesuai. Expected: "${title}", actual: "${actual}"`)
    }
}

module.exports = { goto, verifyPage }
