const { Builder, Key, By, until } = require('selenium-webdriver')
    // let driver = new Builder().forBrowser('chrome').build()
    // driver.manage().window().maximize()
const { performance } = require('perf_hooks')
const { checkTitle, equal, notEqual, fail } = require('./assert')
const fs = require('fs')

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

    byId = id => {
        return this.driver.findElement(By.id(id))
    }

    byName = id => {
        return this.driver.findElement(By.name(id))
    }

    byCss = id => {
        return this.driver.findElement(By.css(id))
    }

    byXpath = id => {
        return this.driver.findElement(By.xpath(id))
    }
    byLink = id => {
        return this.driver.findElement(By.linkText(id))
    }

    toType = async(type, id) => {
        if (type = 'id')
            return this.byId(id)
        else if (type = 'css')
            return this.byCss(id)
        else if (type = 'name')
            return this.byName(id)
        else if (type = 'xpath')
            return this.byXpath(id)
        else if (type = 'link')
            return this.byLink(id)
        else
            fail(`type selector ${type} tidak dapat diterima`)
    }

    click = async(name, type, id, time = undefined) => {
        const t0 = performance.now()
        if (time !== undefined)
            await this.wait(time)
        await this.untilShow(name, type, id)
        await this.scrollTo(name, type, id)
        try {
            if (type == 'id')
                await this.byId(id).click()
            else if (type == 'name')
                await this.byName(id).click()
            else if (type == 'css')
                await this.byCss(id).click()
            else if (type == 'xpath')
                await this.byXpath(id).click()
            else if (type == 'link')
                await this.byLink(id).click()
        } catch {
            const time = ((performance.now() - t0) / 1000).toFixed(2)
            fail(`Element "${name}" tidak dapat di click, sudah terjeda ${time} detik`)
        }
    }

    fill = async(name, type, id, value) => {
        const t0 = performance.now()
        await this.untilShow(name, type, id)
        try {
            if (type == 'id')
                await this.byId(id).sendKeys(value)
            else if (type == 'name')
                await this.byName(id).sendKeys(value)
            else if (type == 'css')
                await this.byCss(id).sendKeys(value)
            else if (type == 'xpath')
                await this.byXpath(id).sendKeys(value)
            else if (type == 'link')
                await this.byLink(id).sendKeys(value)
        } catch {
            const time = ((performance.now() - t0) / 1000).toFixed(2)
            fail(`Element "${name}" tidak dapat menerima input, sudah terjeda ${time} detik`)
        }
    }
    fillAndEnter = async(name, type, id, value) => {
        const t0 = performance.now()
        await this.untilShow(name, type, id)
        try {
            if (type == 'id')
                await this.byId(id).sendKeys(value, Key.RETURN)
            else if (type == 'name')
                await this.byName(id).sendKeys(value, Key.RETURN)
            else if (type == 'css')
                await this.byCss(id).sendKeys(value, Key.RETURN)
            else if (type == 'xpath')
                await this.byXpath(id).sendKeys(value, Key.RETURN)
            else if (type == 'link')
                await this.byLink(id).sendKeys(value, Key.RETURN)
        } catch {
            const time = ((performance.now() - t0) / 1000).toFixed(2)
            fail(`Element "${name}" tidak dapat menerima input, sudah terjeda ${time} detik`)
        }
    }

    getInput = async(name, type, id, time = undefined) => {
        const t0 = performance.now()
        await this.untilShow(name, type, id)
        if (time !== undefined)
            await this.wait(time)
        try {
            if (type == 'id')
                return await this.byId(id).getAttribute("value")
            else if (type == 'name')
                return await this.byName(id).getAttribute("value")
            else if (type == 'css')
                return await this.byCss(id).getAttribute("value")
            else if (type == 'xpath')
                return await this.byXpath(id).getAttribute("value")
            else if (type == 'link')
                return await this.byLink(id).getAttribute("value")

        } catch {
            const time = ((performance.now() - t0) / 1000).toFixed(2)
            fail(`Element "${name}" tidak dapat diambil nilainya, sudah terjeda ${time} detik`)
        }
    }

    getText = async(name, type, id, time = undefined) => {
        const t0 = performance.now()
        await this.untilShow(name, type, id)
        if (time !== undefined)
            await this.wait(time)
        try {
            if (type == 'id')
                return await this.byId(id).getText()
            else if (type == 'name')
                return await this.byName(id).getText()
            else if (type == 'css')
                return await this.byCss(id).getText()
            else if (type == 'xpath')
                return await this.byXpath(id).getText()
            else if (type == 'link')
                return await this.byLink(id).getText()
        } catch (e) {
            const time = ((performance.now() - t0) / 1000).toFixed(2)
            fail(`Element "${name}" tidak dapat diambil nilainya, sudah terjeda ${time} detik`)
        }
    }

    datepicker = async(name, type, id, value) => {
        await this.fillAndEnter(name, type, id, value)
    }

    clear = async(type, id) => {
        if (type == 'id')
            await this.byId(id).clear()
        else if (type == 'name')
            await this.byName(id).clear()
        else if (type == 'css')
            await this.byCss(id).clear()
        else if (type == 'xpath')
            await this.byXpath(id).clear()
        else if (type == 'link')
            await this.byLink(id).clear()
    }

    wait = async(time = 2000) => {
        await this.driver.sleep(time)
    }

    uploadFile = async(name, type, id, value) => {
        const t0 = performance.now()
        this.wait()
        try {
            if (type == 'id')
                await this.byId(id).sendKeys(value)
            else if (type == 'name')
                await this.byName(id).sendKeys(value)
            else if (type == 'class')
                await this.byCss(id).sendKeys(value)
            else if (type == 'xpath')
                await this.byXpath(id).sendKeys(value)
            else if (type == 'link')
                await this.byLink(id).sendKeys(value)
            this.wait()
        } catch {
            const time = ((performance.now() - t0) / 1000).toFixed(2)
            fail(`Element "${name}" tidak dapat menerima input file, sudah terjeda ${time} detik`)
        }
    }

    scrollTo = async(name, type, id) => {
        const t0 = performance.now()
        await this.untilShow(name, type, id)
        try {
            if (type == 'id')
                await this.driver.executeScript("arguments[0].scrollIntoView();", this.byId(id))
            else if (type == 'name')
                await this.driver.executeScript("arguments[0].scrollIntoView();", this.byName(id))
            else if (type == 'class')
                await this.driver.executeScript("arguments[0].scrollIntoView();", this.byCss(id))
            else if (type == 'xpath')
                await this.driver.executeScript("arguments[0].scrollIntoView();", this.byXpath(id))
            else if (type == 'link')
                await this.driver.executeScript("arguments[0].scrollIntoView();", this.byLink(id))

        } catch {
            const time = ((performance.now() - t0) / 1000).toFixed(2)
            fail(`Element "${name}" tidak dapat dituju, sudah terjeda ${time} detik`)
        }
    }

    untilShow = async(name, type, id, time = 20000) => {
        try {
            if (type == 'id')
                await this.driver.wait(until.elementLocated(By.id(id)), time)
            else if (type == 'name')
                await this.driver.wait(until.elementLocated(By.name(id)), time)
            else if (type == 'class')
                await this.driver.wait(until.elementLocated(By.css(id)), time)
            else if (type == 'xpath')
                await this.driver.wait(until.elementLocated(By.xpath(id)), time)
            else if (type == 'link')
                await this.driver.wait(until.elementLocated(By.linkText(id)), time)
        } catch {
            fail(`Element "${name}" tidak dapat muncul maksimal ${time/1000} detik`)
        }
    }
}
module.exports = pleaseClass
    // module.exports = {
    //     // this.driver: this.driver,
    //     please: {
    //         newTab: async() => new Builder().forBrowser('chrome').build(),
    //         url: () => this.driver.getCurrentUrl(),
    //         title: () => this.driver.getTitle(),
    //         goTo: async expected => {
    //             await this.driver.get(expected.url)
    //             const actual = {
    //                 title: await this.driver.getTitle(),
    //                 url: await this.driver.getCurrentUrl()
    //             }
    //             await checkTitle(actual, expected)
    //         },
    //         checkWhere: async expected => {
    //             const actual = {
    //                 url: await this.driver.getCurrentUrl(),
    //                 title: await this.driver.getTitle()
    //             }
    //             await checkTitle(actual, expected)
    //         },
    //         equal: equal,
    //         notEqual: notEqual,
    //         fail: fail,
    //         byId: id => this.driver.findElement(By.id(id)),
    //         byName: id => this.driver.findElement(By.name(id)),
    //         byCss: id => this.driver.findElement(By.css(id)),
    //         byXpath: id => this.driver.findElement(By.xpath(id)),
    //         byLink: id => this.driver.findElement(By.linkText(id)),
    //         async click(name, type, id, time = undefined) {
    //             const t0 = performance.now()
    //             if (time !== undefined)
    //                 await this.wait(time)
    //             await this.untilShow(name, type, id)
    //             await this.scrollTo(name, type, id)
    //             try {
    //                 if (type == 'id')
    //                     await this.byId(id).click()
    //                 else if (type == 'name')
    //                     await this.byName(id).click()
    //                 else if (type == 'css')
    //                     await this.byCss(id).click()
    //                 else if (type == 'xpath')
    //                     await this.byXpath(id).click()
    //                 else if (type == 'link')
    //                     await this.byLink(id).click()
    //             } catch {
    //                 const time = ((performance.now() - t0) / 1000).toFixed(2)
    //                 fail(`Element "${name}" tidak dapat di click, sudah terjeda ${time} detik`)
    //             }
    //         },
    //         async setInput(name, type, id, value) {
    //             const t0 = performance.now()
    //             await this.untilShow(name, type, id)
    //             try {
    //                 if (type == 'id')
    //                     await this.byId(id).sendKeys(value)
    //                 else if (type == 'name')
    //                     await this.byName(id).sendKeys(value)
    //                 else if (type == 'css')
    //                     await this.byCss(id).sendKeys(value)
    //                 else if (type == 'xpath')
    //                     await this.byXpath(id).sendKeys(value)
    //                 else if (type == 'link')
    //                     await this.byLink(id).sendKeys(value)
    //             } catch {
    //                 const time = ((performance.now() - t0) / 1000).toFixed(2)
    //                 fail(`Element "${name}" tidak dapat menerima input, sudah terjeda ${time} detik`)
    //             }
    //         },
    //         async setInputText(name, type, id, value) {
    //             const t0 = performance.now()
    //             await this.untilShow(name, type, id)
    //             try {
    //                 if (type == 'id')
    //                     await this.byId(id).sendKeys(value, Key.RETURN)
    //                 else if (type == 'name')
    //                     await this.byName(id).sendKeys(value, Key.RETURN)
    //                 else if (type == 'css')
    //                     await this.byCss(id).sendKeys(value, Key.RETURN)
    //                 else if (type == 'xpath')
    //                     await this.byXpath(id).sendKeys(value, Key.RETURN)
    //                 else if (type == 'link')
    //                     await this.byLink(id).sendKeys(value, Key.RETURN)
    //             } catch {
    //                 const time = ((performance.now() - t0) / 1000).toFixed(2)
    //                 fail(`Element "${name}" tidak dapat menerima input, sudah terjeda ${time} detik`)
    //             }
    //         },
    //         async getInput(name, type, id, time = undefined) {
    //             const t0 = performance.now()
    //             await this.untilShow(name, type, id)
    //             if (time !== undefined)
    //                 await this.wait(time)
    //             try {
    //                 if (type == 'id')
    //                     return await this.byId(id).getAttribute("value")
    //                 else if (type == 'name')
    //                     return await this.byName(id).getAttribute("value")
    //                 else if (type == 'css')
    //                     return await this.byCss(id).getAttribute("value")
    //                 else if (type == 'xpath')
    //                     return await this.byXpath(id).getAttribute("value")
    //                 else if (type == 'link')
    //                     return await this.byLink(id).getAttribute("value")

//             } catch {
//                 const time = ((performance.now() - t0) / 1000).toFixed(2)
//                 fail(`Element "${name}" tidak dapat diambil nilainya, sudah terjeda ${time} detik`)
//             }
//         },
//         async getText(name, type, id, time = undefined) {
//             const t0 = performance.now()
//             await this.untilShow(name, type, id)
//             if (time !== undefined)
//                 await this.wait(time)
//             try {
//                 if (type == 'id')
//                     return await this.byId(id).getText()
//                 else if (type == 'name')
//                     return await this.byName(id).getText()
//                 else if (type == 'css')
//                     return await this.byCss(id).getText()
//                 else if (type == 'xpath')
//                     return await this.byXpath(id).getText()
//                 else if (type == 'link')
//                     return await this.byLink(id).getText()
//             } catch (e) {
//                 const time = ((performance.now() - t0) / 1000).toFixed(2)
//                 fail(`Element "${name}" tidak dapat diambil nilainya, sudah terjeda ${time} detik`)
//             }
//         },
//         async datepicker(name, type, id, value) {
//             await this.fillAndEnter(name, type, id, value)
//         },
//         async clear(type, id) {
//             if (type == 'id')
//                 await this.byId(id).clear()
//             else if (type == 'name')
//                 await this.byName(id).clear()
//             else if (type == 'css')
//                 await this.byCss(id).clear()
//             else if (type == 'xpath')
//                 await this.byXpath(id).clear()
//             else if (type == 'link')
//                 await this.byLink(id).clear()
//         },
//         async wait(time = 2000) {
//             await this.driver.sleep(time)
//         },
//         async uploadFile(name, type, id, value) {
//             const t0 = performance.now()
//             this.wait()
//             try {
//                 if (type == 'id')
//                     await this.byId(id).sendKeys(value)
//                 else if (type == 'name')
//                     await this.byName(id).sendKeys(value)
//                 else if (type == 'class')
//                     await this.byCss(id).sendKeys(value)
//                 else if (type == 'xpath')
//                     await this.byXpath(id).sendKeys(value)
//                 else if (type == 'link')
//                     await this.byLink(id).sendKeys(value)
//                 this.wait()
//             } catch {
//                 const time = ((performance.now() - t0) / 1000).toFixed(2)
//                 fail(`Element "${name}" tidak dapat menerima input file, sudah terjeda ${time} detik`)
//             }
//         },
//         async scrollTo(name, type, id) {
//             const t0 = performance.now()
//             await this.untilShow(name, type, id)
//             try {
//                 if (type == 'id')
//                     await this.driver.executeScript("arguments[0].scrollIntoView();", this.byId(id))
//                 else if (type == 'name')
//                     await this.driver.executeScript("arguments[0].scrollIntoView();", this.byName(id))
//                 else if (type == 'class')
//                     await this.driver.executeScript("arguments[0].scrollIntoView();", this.byCss(id))
//                 else if (type == 'xpath')
//                     await this.driver.executeScript("arguments[0].scrollIntoView();", this.byXpath(id))
//                 else if (type == 'link')
//                     await this.driver.executeScript("arguments[0].scrollIntoView();", this.byLink(id))

//             } catch {
//                 const time = ((performance.now() - t0) / 1000).toFixed(2)
//                 fail(`Element "${name}" tidak dapat dituju, sudah terjeda ${time} detik`)
//             }
//         },
//         async untilShow(name, type, id, time = 20000) {
//             try {
//                 if (type == 'id')
//                     await this.driver.wait(until.elementLocated(By.id(id)), time)
//                 else if (type == 'name')
//                     await this.driver.wait(until.elementLocated(By.name(id)), time)
//                 else if (type == 'class')
//                     await this.driver.wait(until.elementLocated(By.css(id)), time)
//                 else if (type == 'xpath')
//                     await this.driver.wait(until.elementLocated(By.xpath(id)), time)
//                 else if (type == 'link')
//                     await this.driver.wait(until.elementLocated(By.linkText(id)), time)
//             } catch {
//                 fail(`Element "${name}" tidak dapat muncul maksimal ${time/1000} detik`)
//             }
//         }
//     }
// };