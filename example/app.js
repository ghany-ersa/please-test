const { Builder } = require('selenium-webdriver')
const pleaseClass = require('please.js')
const AuthComponent = require('./components/auth')

const driver = new Builder().forBrowser('chrome').build()
driver.manage().window().maximize()

const please = new pleaseClass(driver)

module.exports = {
    please,
    AUTH: new AuthComponent(please)
}
