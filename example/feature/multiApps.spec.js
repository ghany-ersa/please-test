const { please } = require('../app')
const pleaseClass = require('please-test')
const { URL } = require('../data/main')

describe('Coba multi apps', () => {
    it('login bo', async() => {
        await please.goTo(URL.loginEmailPassword)
        const driver = await please.launchBrowser()

        const bo = new pleaseClass(driver)
        bo.goTo(URL.loginEmailPassword)

        await please.fill('email', '#email', 'lalalala')
        await bo.fill('email', '#email', 'inputan BO')
        await bo.quit()
    });
})
