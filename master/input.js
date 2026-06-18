const { Builder, Key, By, until } = require('selenium-webdriver')
const { Options } = require('selenium-webdriver/chrome')
const { performance } = require('perf_hooks')
const { checkTitle, equal, notEqual, fail } = require('./assert')
const fs = require('fs')
const path = require('path')

class pleaseClass {
    constructor({ headed = false } = {}) {
        const options = new Options()
        if (!headed) options.addArguments('--headless=new')
        this.driver = new Builder().forBrowser('chrome').setChromeOptions(options).build()
        this.driver.manage().window().maximize()
    }

    quit = async() => {
        await this.driver.quit()
    }

    url = async() => {
        return this.driver.getCurrentUrl()
    }

    title = async() => {
        return this.driver.getTitle()
    }

    goTo = async expected => {
        await this.driver.get(expected.url)
        const actual = {
            title: await this.driver.getTitle(),
            url: await this.driver.getCurrentUrl()
        }
        await checkTitle(actual, expected)
    }

    checkWhere = async expected => {
        const actual = {
            url: await this.driver.getCurrentUrl(),
            title: await this.driver.getTitle()
        }
        await checkTitle(actual, expected)
    }

    equal = equal

    notEqual = notEqual

    fail = fail

    detectLocator = (selector) => {
        if (selector.startsWith('//') || selector.startsWith('(//'))
            return By.xpath(selector)
        if (selector.startsWith('#'))
            return By.id(selector.slice(1))
        if (selector.startsWith('link='))
            return By.linkText(selector.slice(5))
        if (selector.startsWith('.') || selector.startsWith('[') || /[\s>:+~]/.test(selector) || /[.#\[:]/.test(selector))
            return By.css(selector)
        if (/^(a|abbr|address|article|aside|audio|b|blockquote|body|br|button|canvas|caption|cite|code|col|colgroup|data|datalist|dd|del|details|dfn|dialog|div|dl|dt|em|embed|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|head|header|hr|html|i|iframe|img|input|ins|kbd|label|legend|li|link|main|map|mark|menu|meta|meter|nav|noscript|object|ol|optgroup|option|output|p|picture|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|span|strong|style|sub|summary|sup|table|tbody|td|template|textarea|tfoot|th|thead|time|title|tr|track|u|ul|var|video|wbr)$/.test(selector))
            return By.css(selector)
        return By.name(selector)
    }

    toElement = (selector) => {
        return this.driver.findElement(this.detectLocator(selector))
    }

    click = async(label, selector, time = undefined) => {
        const t0 = performance.now()
        if (time !== undefined)
            await this.wait(time)
        await this.untilShow(label, selector)
        await this.scrollTo(label, selector)
        try {
            await this.toElement(selector).click()
        } catch {
            const elapsed = ((performance.now() - t0) / 1000).toFixed(2)
            await this._failWithScreenshot(label, `Element "${label}" tidak dapat di-klik setelah ${elapsed} detik`)
        }
    }

    fill = async(label, selector, value) => {
        const t0 = performance.now()
        await this.untilShow(label, selector)
        try {
            await this.toElement(selector).sendKeys(value)
        } catch {
            const elapsed = ((performance.now() - t0) / 1000).toFixed(2)
            await this._failWithScreenshot(label, `Element "${label}" tidak dapat menerima input setelah ${elapsed} detik`)
        }
    }

    fillAndEnter = async(label, selector, value) => {
        const t0 = performance.now()
        await this.untilShow(label, selector)
        try {
            await this.toElement(selector).sendKeys(value, Key.RETURN)
        } catch {
            const elapsed = ((performance.now() - t0) / 1000).toFixed(2)
            await this._failWithScreenshot(label, `Element "${label}" tidak dapat menerima input setelah ${elapsed} detik`)
        }
    }

    getValue = async(label, selector, time = undefined) => {
        const t0 = performance.now()
        await this.untilShow(label, selector)
        if (time !== undefined)
            await this.wait(time)
        try {
            return await this.toElement(selector).getAttribute("value")
        } catch {
            const elapsed = ((performance.now() - t0) / 1000).toFixed(2)
            await this._failWithScreenshot(label, `Element "${label}" tidak dapat diambil nilainya setelah ${elapsed} detik`)
        }
    }

    getText = async(label, selector, time = undefined) => {
        const t0 = performance.now()
        await this.untilShow(label, selector)
        if (time !== undefined)
            await this.wait(time)
        try {
            return await this.toElement(selector).getText()
        } catch {
            const elapsed = ((performance.now() - t0) / 1000).toFixed(2)
            await this._failWithScreenshot(label, `Element "${label}" tidak dapat diambil teksnya setelah ${elapsed} detik`)
        }
    }

    see = async(label, selector, time = undefined) => {
        const t0 = performance.now()
        await this.untilShow(label, selector)
        if (time !== undefined)
            await this.wait(time)
        try {
            const el = await this.toElement(selector)
            const tag = await el.getTagName()
            const inputTags = ['input', 'textarea', 'select']
            if (inputTags.includes(tag.toLowerCase()))
                return await el.getAttribute("value")
            return await el.getText()
        } catch {
            const elapsed = ((performance.now() - t0) / 1000).toFixed(2)
            await this._failWithScreenshot(label, `Element "${label}" tidak dapat dibaca setelah ${elapsed} detik`)
        }
    }

    datepicker = async(label, selector, value) => {
        await this.fillAndEnter(label, selector, value)
    }

    clear = async(label, selector) => {
        const t0 = performance.now()
        await this.untilShow(label, selector)
        try {
            await this.toElement(selector).clear()
        } catch {
            const elapsed = ((performance.now() - t0) / 1000).toFixed(2)
            await this._failWithScreenshot(label, `Element "${label}" tidak dapat dikosongkan setelah ${elapsed} detik`)
        }
    }

    wait = async(time = 2000) => {
        await this.driver.sleep(time)
    }

    uploadFile = async(label, selector, path) => {
        const t0 = performance.now()
        await this.wait()
        try {
            await this.toElement(selector).sendKeys(path)
            await this.wait()
        } catch {
            const elapsed = ((performance.now() - t0) / 1000).toFixed(2)
            await this._failWithScreenshot(label, `Element "${label}" tidak dapat menerima file setelah ${elapsed} detik`)
        }
    }

    scrollTo = async(label, selector) => {
        const t0 = performance.now()
        await this.untilShow(label, selector)
        try {
            await this.driver.executeScript("arguments[0].scrollIntoView();", this.toElement(selector))
        } catch {
            const elapsed = ((performance.now() - t0) / 1000).toFixed(2)
            await this._failWithScreenshot(label, `Element "${label}" tidak dapat di-scroll setelah ${elapsed} detik`)
        }
    }

    untilShow = async(label, selector, time = 20000) => {
        try {
            await this.driver.wait(until.elementLocated(this.detectLocator(selector)), time)
        } catch {
            await this._failWithScreenshot(label, `Element "${label}" tidak muncul setelah ${time / 1000} detik`)
        }
    }

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
        const dir = path.resolve('screenshots')
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        const datetime = new Date().toISOString().replace(/[:.]/g, '-')
        const resolved = this._resolveTestName(label)
        const slug = resolved
            ? `${resolved.replace(/[^a-zA-Z0-9_-]/g, '_')}_${datetime}`
            : datetime
        const name = `${slug}.png`
        const img = await this.driver.takeScreenshot()
        fs.writeFileSync(path.join(dir, name), img, 'base64')
        return path.join(dir, name)
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
module.exports = pleaseClass
