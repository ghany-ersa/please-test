let please
class Auth {
    constructor(master) {
        please = master
    }

    async loginEmail(user) {
        await please.fill('input email', '#email', user.email)
        await please.fill('input password', '#password', user.password)
        await please.click('button login', '//*[@id="login-form"]/div[2]/form/div[4]/div/button')
    }

    async loginNIK(user) {
        await please.fill('input NIK', '#nik', user.nik)
        await please.fill('input PIN', '#password', user.pin)
        await please.click('button login', '//*[@id="login-form"]/div[2]/form/div[4]/div/button')
    }

    async logout() {
        await please.click('profile', '//*[@id="app"]/div/nav/ul/li/a')
        await please.click('button logout', '//*[@id="app"]/div/nav/ul/li/div/a', 500)
    }
}

module.exports = Auth
