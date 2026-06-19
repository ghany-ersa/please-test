const { detectLocator, toLocator } = require('./locator')
const { goto, verifyPage } = require('./navigation')
const { untilShow, wait, click, fill, fillAndEnter, clear, scrollTo, uploadFile, datepicker } = require('./interaction')
const { see } = require('./query')
const { screenshot } = require('./screenshot')

class Please {
    constructor(page) {
        this.page = page
    }

    // ── Locator ────────────────────────────────────────────────────────────────
    detectLocator(selector)             { return detectLocator(selector) }
    toLocator(selector)                 { return toLocator(this.page, selector) }

    // ── Navigasi ───────────────────────────────────────────────────────────────
    async goto(expected)                { return goto(this.page, expected) }
    async verifyPage(expected)          { return verifyPage(this.page, expected) }
    async url()                         { return this.page.url() }
    async title()                       { return this.page.title() }

    // ── Tunggu & Interaksi ─────────────────────────────────────────────────────
    async untilShow(label, selector, time)              { return untilShow(this.page, label, selector, time) }
    async wait(ms)                                      { return wait(this.page, ms) }
    async click(label, selector, time)                  { return click(this.page, label, selector, time) }
    async fill(label, selector, value)                  { return fill(this.page, label, selector, value) }
    async fillAndEnter(label, selector, value)          { return fillAndEnter(this.page, label, selector, value) }
    async clear(label, selector)                        { return clear(this.page, label, selector) }
    async scrollTo(label, selector)                     { return scrollTo(this.page, label, selector) }
    async uploadFile(label, selector, filePath)         { return uploadFile(this.page, label, selector, filePath) }
    async datepicker(label, selector, value)            { return datepicker(this.page, label, selector, value) }

    // ── Baca Nilai & Assert ────────────────────────────────────────────────────
    async see(label, selector, expected, time)          { return see(this.page, label, selector, expected, time) }

    // ── Screenshot ─────────────────────────────────────────────────────────────
    async screenshot(label)                             { return screenshot(this.page, label) }
}

module.exports = Please
