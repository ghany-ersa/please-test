const { toLocator } = require('./locator')

async function untilShow(page, label, selector, time = 20000) {
    try {
        await toLocator(page, selector).waitFor({ state: 'visible', timeout: time })
    } catch {
        const err = new Error(`"${label}" tidak muncul setelah ${time / 1000} detik`)
        err.stack = err.message
        throw err
    }
}

async function wait(page, ms = 2000) {
    await page.waitForTimeout(ms)
}

async function click(page, label, selector, time = undefined) {
    if (time !== undefined) await wait(page, time)
    await untilShow(page, label, selector)
    await toLocator(page, selector).scrollIntoViewIfNeeded()
    await toLocator(page, selector).click()
}

async function fill(page, label, selector, value) {
    await untilShow(page, label, selector)
    await toLocator(page, selector).fill(value)
}

async function fillAndEnter(page, label, selector, value) {
    await untilShow(page, label, selector)
    const el = toLocator(page, selector)
    await el.fill(value)
    await el.press('Enter')
}

async function clear(page, label, selector) {
    await untilShow(page, label, selector)
    await toLocator(page, selector).clear()
}

async function scrollTo(page, label, selector) {
    await untilShow(page, label, selector)
    await toLocator(page, selector).scrollIntoViewIfNeeded()
}

async function uploadFile(page, label, selector, filePath) {
    await untilShow(page, label, selector)
    await toLocator(page, selector).setInputFiles(filePath)
}

async function datepicker(page, label, selector, value) {
    await fillAndEnter(page, label, selector, value)
}

module.exports = { untilShow, wait, click, fill, fillAndEnter, clear, scrollTo, uploadFile, datepicker }
