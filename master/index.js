const { detectLocator, toLocator } = require('./locator')
const { goto, verifyPage } = require('./navigation')
const { untilShow, wait, click, fill, fillAndEnter, clear, scrollTo, uploadFile, datepicker } = require('./interaction')
const { see } = require('./query')
const { screenshot } = require('./screenshot')

/** @typedef {{ url: string, title?: string }} PageInfo */

class Please {
    /** @param {import('@playwright/test').Page} page */
    constructor(page) {
        this.page = page
    }

    // ── Locator ────────────────────────────────────────────────────────────────
    /** @param {string} selector */
    detectLocator(selector)             { return detectLocator(selector) }
    /** @param {string} selector */
    toLocator(selector)                 { return toLocator(this.page, selector) }

    // ── Navigasi ───────────────────────────────────────────────────────────────
    /** @param {PageInfo} expected */
    async goto(expected)                { return goto(this.page, expected) }
    /** @param {PageInfo} expected */
    async verifyPage(expected)          { return verifyPage(this.page, expected) }
    async url()                         { return this.page.url() }
    async title()                       { return this.page.title() }

    // ── Tunggu & Interaksi ─────────────────────────────────────────────────────
    /** @param {string} label @param {string} selector @param {number} [time] */
    async untilShow(label, selector, time)              { return untilShow(this.page, label, selector, time) }
    /** @param {number} [ms] */
    async wait(ms)                                      { return wait(this.page, ms) }
    /** @param {string} label @param {string} selector @param {number} [time] */
    async click(label, selector, time)                  { return click(this.page, label, selector, time) }
    /** @param {string} label @param {string} selector @param {string} value */
    async fill(label, selector, value)                  { return fill(this.page, label, selector, value) }
    /** @param {string} label @param {string} selector @param {string} value */
    async fillAndEnter(label, selector, value)          { return fillAndEnter(this.page, label, selector, value) }
    /** @param {string} label @param {string} selector */
    async clear(label, selector)                        { return clear(this.page, label, selector) }
    /** @param {string} label @param {string} selector */
    async scrollTo(label, selector)                     { return scrollTo(this.page, label, selector) }
    /** @param {string} label @param {string} selector @param {string} filePath */
    async uploadFile(label, selector, filePath)         { return uploadFile(this.page, label, selector, filePath) }
    /** @param {string} label @param {string} selector @param {string} value */
    async datepicker(label, selector, value)            { return datepicker(this.page, label, selector, value) }

    // ── Baca Nilai & Assert ────────────────────────────────────────────────────
    /** @param {string} label @param {string} selector @param {string} [expected] @param {number} [time] */
    async see(label, selector, expected, time)          { return see(this.page, label, selector, expected, time) }

    // ── Screenshot ─────────────────────────────────────────────────────────────
    /** @param {string} [label] */
    async screenshot(label)                             { return screenshot(this.page, label) }
}

module.exports = Please
