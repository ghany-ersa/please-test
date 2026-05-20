let please
class Auth {
    constructor(master) {
        please = master
    }

    async loginEmail(user) {
        await please.fill('input email', 'id', 'email', user.email)
        await please.fill('input password', 'id', 'password', user.password)
        await please.click('button login', 'xpath', '//*[@id="login-form"]/div[2]/form/div[4]/div/button')
    }
    async loginNIK(user) {
        await please.fill('input NIK', 'id', 'nik', user.nik)
        await please.fill('input PIN', 'id', 'password', user.pin)
        await please.click('button login', 'xpath', '//*[@id="login-form"]/div[2]/form/div[4]/div/button')
    }
    async logout() {
        await please.click('profile', 'xpath', '//*[@id="app"]/div/nav/ul/li/a')
        await please.click('button logout', 'xpath', '//*[@id="app"]/div/nav/ul/li/div/a', 500)
    }
}

module.exports = Auth;