const { detectLocator, toLocator } = require('./locator')
const { goto, verifyPage } = require('./navigation')
const { untilShow, wait, click, fill, fillAndEnter, clear, scrollTo, uploadFile, datepicker } = require('./interaction')
const { see } = require('./query')
const { screenshot } = require('./screenshot')

class Please {
    /**
     * @param {import('@playwright/test').Page} page
     * @param {import('@playwright/test').TestType<any,any>} [test]
     */
    constructor(page, test) {
        this.page = page
        this._step = test ? (name, fn) => test.step(name, fn) : (name, fn) => fn()
    }

    // ── Locator ────────────────────────────────────────────────────────────────
    /** @param {string} selector */
    detectLocator(selector)             { return detectLocator(selector) }
    /** @param {string} selector */
    toLocator(selector)                 { return toLocator(this.page, selector) }

    // ── Navigasi ───────────────────────────────────────────────────────────────
    /** @param {string} url @param {string} [title] */
    async goto(url, title)              { return this._step(`Go to "${url}"`, () => goto(this.page, url, title)) }
    /** @param {string} url @param {string} [title] */
    async verifyPage(url, title)        { return this._step(`Verify page "${url}"`, () => verifyPage(this.page, url, title)) }
    async url()                         { return this.page.url() }
    async title()                       { return this.page.title() }

    // ── Tunggu & Interaksi ─────────────────────────────────────────────────────
    /** @param {string} label @param {string} selector @param {number} [time] */
    async untilShow(label, selector, time)              { return this._step(`Wait "${label}"`, () => untilShow(this.page, label, selector, time)) }
    /** @param {number} [ms] */
    async wait(ms)                                      { return wait(this.page, ms) }
    /** @param {string} label @param {string} selector @param {number} [time] */
    async click(label, selector, time)                  { return this._step(`Click "${label}"`, () => click(this.page, label, selector, time)) }
    /** @param {string} label @param {string} selector @param {string} value */
    async fill(label, selector, value)                  { return this._step(`Fill "${label}"`, () => fill(this.page, label, selector, value)) }
    /** @param {string} label @param {string} selector @param {string} value */
    async fillAndEnter(label, selector, value)          { return this._step(`Fill and enter "${label}"`, () => fillAndEnter(this.page, label, selector, value)) }
    /** @param {string} label @param {string} selector */
    async clear(label, selector)                        { return this._step(`Clear "${label}"`, () => clear(this.page, label, selector)) }
    /** @param {string} label @param {string} selector */
    async scrollTo(label, selector)                     { return this._step(`Scroll to "${label}"`, () => scrollTo(this.page, label, selector)) }
    /** @param {string} label @param {string} selector @param {string} filePath */
    async uploadFile(label, selector, filePath)         { return this._step(`Upload "${label}"`, () => uploadFile(this.page, label, selector, filePath)) }
    /** @param {string} label @param {string} selector @param {string} value */
    async datepicker(label, selector, value)            { return this._step(`Datepicker "${label}"`, () => datepicker(this.page, label, selector, value)) }

    // ── Baca Nilai & Assert ────────────────────────────────────────────────────
    /** @param {string} label @param {string} selector @param {string} [expected] @param {number} [time] */
    async see(label, selector, expected, time)          { return this._step(`See "${label}"`, () => see(this.page, label, selector, expected, time)) }

    // ── Screenshot ─────────────────────────────────────────────────────────────
    /** @param {string} [label] */
    async screenshot(label)                             { return screenshot(this.page, label) }
}

module.exports = Please
