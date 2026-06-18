const { chromium, firefox, webkit } = require('playwright')
const { performance } = require('perf_hooks')
const { checkTitle, equal, notEqual, fail } = require('./assert')
const { SoftAssert } = require('./softassert')
const fs = require('fs')
const path = require('path')

class Please {
    constructor({ headed = false, video = false, browser = 'chromium' } = {}) {
        this._headed = headed
        this._video = video
        this._browserType = browser
        this._browser = null
        this._context = null
        this.page = null
        this._dialogHandler = null
        this._initPromise = this._init()
    }

    _resolveBrowserType = () => {
        const types = { chromium, firefox, webkit }
        const bt = types[this._browserType]
        if (!bt) throw new Error(`Browser "${this._browserType}" tidak didukung. Pilih: chromium, firefox, webkit.`)
        return bt
    }

    _init = async () => {
        this._browser = await this._resolveBrowserType().launch({ headless: !this._headed })
        const contextOptions = {}
        if (this._video) {
            const videoDir = path.resolve('videos')
            if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true })
            contextOptions.recordVideo = { dir: videoDir }
        }
        this._context = await this._browser.newContext(contextOptions)
        this.page = await this._context.newPage()
    }

    _ready = async () => {
        await this._initPromise
    }

    quit = async () => {
        await this._ready()
        if (this._video && this._context) {
            await this._context.close()
        }
        await this._browser.close()
    }

    url = async () => {
        await this._ready()
        return this.page.url()
    }

    title = async () => {
        await this._ready()
        return this.page.title()
    }

    goTo = async (expected) => {
        await this._ready()
        await this.page.goto(expected.url)
        const actual = {
            title: await this.page.title(),
            url: this.page.url()
        }
        await checkTitle(actual, expected)
    }

    checkWhere = async (expected) => {
        await this._ready()
        const actual = {
            url: this.page.url(),
            title: await this.page.title()
        }
        await checkTitle(actual, expected)
    }

    equal = equal
    notEqual = notEqual
    fail = fail

    soft = () => new SoftAssert()

    // ── Locator ────────────────────────────────────────────────────────────────

    // Tag HTML yang memiliki ARIA role dan mendukung shorthand tag=name
    static ARIA_SHORTHAND_TAGS = new Set(['button', 'a', 'input', 'select', 'textarea', 'checkbox', 'radio'])

    detectLocator = (selector) => {
        if (selector.startsWith('//') || selector.startsWith('(//'))
            return `xpath=${selector}`
        if (selector.startsWith('#'))
            return selector
        if (selector.startsWith('text=') || selector.startsWith('role=') || selector.startsWith('label='))
            return selector
        // shorthand: button=Submit → role=button[name=Submit]
        const shorthandMatch = selector.match(/^([a-z]+)=(.+)$/)
        if (shorthandMatch && Please.ARIA_SHORTHAND_TAGS.has(shorthandMatch[1]))
            return `role=${shorthandMatch[1]}[name=${shorthandMatch[2]}]`
        if (selector.startsWith('.') || selector.startsWith('[') || /[\s>:+~]/.test(selector) || /[.#\[:]/.test(selector))
            return selector
        if (/^(a|abbr|address|article|aside|audio|b|blockquote|body|br|button|canvas|caption|cite|code|col|colgroup|data|datalist|dd|del|details|dfn|dialog|div|dl|dt|em|embed|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|head|header|hr|html|i|iframe|img|input|ins|kbd|label|legend|li|link|main|map|mark|menu|meta|meter|nav|noscript|object|ol|optgroup|option|output|p|picture|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|span|strong|style|sub|summary|sup|table|tbody|td|template|textarea|tfoot|th|thead|time|title|tr|track|u|ul|var|video|wbr)$/.test(selector))
            return selector
        throw new Error(`Selector "${selector}" tidak dapat dikenali. Gunakan: #id, .class, tag, xpath (//), CSS, text=, role=, label=, atau shorthand button=Name.`)
    }

    toLocator = (selector) => {
        // role=button atau role=button[name=Submit]
        if (selector.startsWith('role=')) {
            const rest = selector.slice(5)
            const match = rest.match(/^([^\[]+)(?:\[name=(.+)\])?$/)
            if (match) {
                const role = match[1].trim()
                const name = match[2] ? match[2].trim() : undefined
                return name ? this.page.getByRole(role, { name }) : this.page.getByRole(role)
            }
        }
        if (selector.startsWith('label='))
            return this.page.getByLabel(selector.slice(6))
        return this.page.locator(this.detectLocator(selector))
    }

    // ── Interactions ───────────────────────────────────────────────────────────

    click = async (label, selector, time = undefined) => {
        await this._ready()
        const t0 = performance.now()
        if (time !== undefined) await this.wait(time)
        await this.untilShow(label, selector)
        await this.scrollTo(label, selector)
        try {
            await this.toLocator(selector).click()
        } catch {
            const elapsed = ((performance.now() - t0) / 1000).toFixed(2)
            await this._failWithScreenshot(label, `Element "${label}" tidak dapat di-klik setelah ${elapsed} detik`)
        }
    }

    fill = async (label, selector, value) => {
        await this._ready()
        const t0 = performance.now()
        await this.untilShow(label, selector)
        try {
            await this.toLocator(selector).fill(value)
        } catch {
            const elapsed = ((performance.now() - t0) / 1000).toFixed(2)
            await this._failWithScreenshot(label, `Element "${label}" tidak dapat menerima input setelah ${elapsed} detik`)
        }
    }

    fillAndEnter = async (label, selector, value) => {
        await this._ready()
        const t0 = performance.now()
        await this.untilShow(label, selector)
        try {
            await this.toLocator(selector).fill(value)
            await this.toLocator(selector).press('Enter')
        } catch {
            const elapsed = ((performance.now() - t0) / 1000).toFixed(2)
            await this._failWithScreenshot(label, `Element "${label}" tidak dapat menerima input setelah ${elapsed} detik`)
        }
    }

    getValue = async (label, selector, time = undefined) => {
        await this._ready()
        const t0 = performance.now()
        await this.untilShow(label, selector)
        if (time !== undefined) await this.wait(time)
        try {
            return await this.toLocator(selector).inputValue()
        } catch {
            const elapsed = ((performance.now() - t0) / 1000).toFixed(2)
            await this._failWithScreenshot(label, `Element "${label}" tidak dapat diambil nilainya setelah ${elapsed} detik`)
        }
    }

    getText = async (label, selector, time = undefined) => {
        await this._ready()
        const t0 = performance.now()
        await this.untilShow(label, selector)
        if (time !== undefined) await this.wait(time)
        try {
            return await this.toLocator(selector).innerText()
        } catch {
            const elapsed = ((performance.now() - t0) / 1000).toFixed(2)
            await this._failWithScreenshot(label, `Element "${label}" tidak dapat diambil teksnya setelah ${elapsed} detik`)
        }
    }

    see = async (label, selector, time = undefined) => {
        await this._ready()
        const t0 = performance.now()
        await this.untilShow(label, selector)
        if (time !== undefined) await this.wait(time)
        try {
            const el = this.toLocator(selector)
            const tag = await el.evaluate(node => node.tagName.toLowerCase())
            const inputTags = ['input', 'textarea', 'select']
            if (inputTags.includes(tag))
                return await el.inputValue()
            return await el.innerText()
        } catch {
            const elapsed = ((performance.now() - t0) / 1000).toFixed(2)
            await this._failWithScreenshot(label, `Element "${label}" tidak dapat dibaca setelah ${elapsed} detik`)
        }
    }

    datepicker = async (label, selector, value) => {
        await this.fillAndEnter(label, selector, value)
    }

    clear = async (label, selector) => {
        await this._ready()
        const t0 = performance.now()
        await this.untilShow(label, selector)
        try {
            await this.toLocator(selector).clear()
        } catch {
            const elapsed = ((performance.now() - t0) / 1000).toFixed(2)
            await this._failWithScreenshot(label, `Element "${label}" tidak dapat dikosongkan setelah ${elapsed} detik`)
        }
    }

    wait = async (time = 2000) => {
        await this._ready()
        await this.page.waitForTimeout(time)
    }

    uploadFile = async (label, selector, filePath) => {
        await this._ready()
        const t0 = performance.now()
        await this.wait()
        try {
            await this.toLocator(selector).setInputFiles(filePath)
            await this.wait()
        } catch {
            const elapsed = ((performance.now() - t0) / 1000).toFixed(2)
            await this._failWithScreenshot(label, `Element "${label}" tidak dapat menerima file setelah ${elapsed} detik`)
        }
    }

    scrollTo = async (label, selector) => {
        await this._ready()
        const t0 = performance.now()
        await this.untilShow(label, selector)
        try {
            await this.toLocator(selector).scrollIntoViewIfNeeded()
        } catch {
            const elapsed = ((performance.now() - t0) / 1000).toFixed(2)
            await this._failWithScreenshot(label, `Element "${label}" tidak dapat di-scroll setelah ${elapsed} detik`)
        }
    }

    untilShow = async (label, selector, time = 20000) => {
        await this._ready()
        try {
            if (selector.startsWith('role=') || selector.startsWith('label='))
                await this.toLocator(selector).waitFor({ state: 'visible', timeout: time })
            else
                await this.page.waitForSelector(this.detectLocator(selector), { timeout: time })
        } catch {
            await this._failWithScreenshot(label, `Element "${label}" tidak muncul setelah ${time / 1000} detik`)
        }
    }

    // ── Multi-tab ──────────────────────────────────────────────────────────────

    newTab = async () => {
        await this._ready()
        const tab = await this._context.newPage()
        return tab
    }

    switchTab = async (tab) => {
        await this._ready()
        this.page = tab
        await tab.bringToFront()
    }

    closeTab = async (tab) => {
        await tab.close()
    }

    // ── Dialog Handling ────────────────────────────────────────────────────────

    onDialog = async (handler) => {
        await this._ready()
        this._dialogHandler = handler
        this.page.on('dialog', handler)
    }

    acceptDialog = async (promptText = undefined) => {
        await this._ready()
        this.page.once('dialog', async dialog => {
            await dialog.accept(promptText)
        })
    }

    dismissDialog = async () => {
        await this._ready()
        this.page.once('dialog', async dialog => {
            await dialog.dismiss()
        })
    }

    // ── Screenshot & Video ─────────────────────────────────────────────────────

    setTestName = (name) => {
        this._testName = name
    }

    _resolveTestName = (label) => {
        if (label) return label
        if (this._testName) return this._testName
        if (global.__currentTest) return global.__currentTest
        return null
    }

    screenshot = async (label) => {
        await this._ready()
        const dir = path.resolve('screenshots')
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        const datetime = new Date().toISOString().replace(/[:.]/g, '-')
        const resolved = this._resolveTestName(label)
        const slug = resolved
            ? `${resolved.replace(/[^a-zA-Z0-9_-]/g, '_')}_${datetime}`
            : datetime
        const name = `${slug}.png`
        const filePath = path.join(dir, name)
        await this.page.screenshot({ path: filePath })
        return filePath
    }

    saveVideo = async (name) => {
        if (!this._video) return null
        const video = this.page.video()
        if (!video) return null
        await this._context.close()
        const savedPath = await video.path()
        if (name) {
            const dest = path.join(path.resolve('videos'), `${name.replace(/[^a-zA-Z0-9_-]/g, '_')}.webm`)
            fs.renameSync(savedPath, dest)
            return dest
        }
        return savedPath
    }

    test = async (label, fn) => {
        try {
            await fn()
            const savedPath = await this.screenshot(`PASSED_${label}`)
            console.log(`  [screenshot] ${savedPath}`)
        } catch (e) {
            throw e
        }
    }

    _failWithScreenshot = async (label, message) => {
        const savedPath = await this.screenshot(`FAILED_${label}`)
        console.error(`  [screenshot] ${savedPath}`)
        fail(message)
    }
}

module.exports = Please
