const { Builder, Key, By, until } = require('selenium-webdriver')
const { performance } = require('perf_hooks')
const { checkTitle, equal, notEqual, fail } = require('./assert')

class pleaseClass {
    constructor(driver) {
        this.driver = driver
    }

    launchBrowser = async() => {
        const driver = new Builder().forBrowser('chrome').build()
        await driver.manage().window().maximize()
        return driver
    }

    quit = async() => {
        this.driver.quit()
    }

    url = async() => {
        return this.driver.getCurrentUrl()
    }

    title = async() => {
        await this.driver.getTitle()
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
        if (selector.startsWith('.') || selector.startsWith('[') || /[\s>:+~]/.test(selector))
            return By.css(selector)
        if (selector.startsWith('link='))
            return By.linkText(selector.slice(5))
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
            fail(`Element "${label}" tidak dapat di-klik setelah ${elapsed} detik`)
        }
    }

    fill = async(label, selector, value) => {
        const t0 = performance.now()
        await this.untilShow(label, selector)
        try {
            await this.toElement(selector).sendKeys(value)
        } catch {
            const elapsed = ((performance.now() - t0) / 1000).toFixed(2)
            fail(`Element "${label}" tidak dapat menerima input setelah ${elapsed} detik`)
        }
    }

    fillAndEnter = async(label, selector, value) => {
        const t0 = performance.now()
        await this.untilShow(label, selector)
        try {
            await this.toElement(selector).sendKeys(value, Key.RETURN)
        } catch {
            const elapsed = ((performance.now() - t0) / 1000).toFixed(2)
            fail(`Element "${label}" tidak dapat menerima input setelah ${elapsed} detik`)
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
            fail(`Element "${label}" tidak dapat diambil nilainya setelah ${elapsed} detik`)
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
            fail(`Element "${label}" tidak dapat diambil teksnya setelah ${elapsed} detik`)
        }
    }

    datepicker = async(label, selector, value) => {
        await this.fillAndEnter(label, selector, value)
    }

    clear = async(label, selector) => {
        await this.toElement(selector).clear()
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
            fail(`Element "${label}" tidak dapat menerima file setelah ${elapsed} detik`)
        }
    }

    scrollTo = async(label, selector) => {
        const t0 = performance.now()
        await this.untilShow(label, selector)
        try {
            await this.driver.executeScript("arguments[0].scrollIntoView();", this.toElement(selector))
        } catch {
            const elapsed = ((performance.now() - t0) / 1000).toFixed(2)
            fail(`Element "${label}" tidak dapat di-scroll setelah ${elapsed} detik`)
        }
    }

    untilShow = async(label, selector, time = 20000) => {
        try {
            await this.driver.wait(until.elementLocated(this.detectLocator(selector)), time)
        } catch {
            fail(`Element "${label}" tidak muncul setelah ${time / 1000} detik`)
        }
    }
}
module.exports = pleaseClass
