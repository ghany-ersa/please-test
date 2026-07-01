const { toLocator } = require('./locator')
const { untilShow, wait } = require('./interaction')

async function see(page, label, selector, expected = undefined, time = undefined) {
    await untilShow(page, label, selector)
    if (time !== undefined) await wait(page, time)
    const el = toLocator(page, selector)
    const tag = await el.evaluate(node => node.tagName.toLowerCase())
    const actual = ['input', 'textarea', 'select'].includes(tag)
        ? await el.inputValue()
        : await el.innerText()
    if (expected !== undefined && actual !== expected)
        throw new Error(`[${label}] konten tidak sesuai\n  Expected: "${expected}"\n  Received: "${actual}"`)
    return actual
}

async function isChecked(page, label, selector, expected = undefined, time = undefined) {
    await untilShow(page, label, selector)
    if (time !== undefined) await wait(page, time)
    const actual = await toLocator(page, selector).isChecked()
    if (expected !== undefined && actual !== expected)
        throw new Error(`[${label}] status checked tidak sesuai\n  Expected: "${expected}"\n  Received: "${actual}"`)
    return actual
}

module.exports = { see, isChecked }
