const { test } = require('@playwright/test')
const Please = require('../master/index.js')

const URL = 'https://practicetestautomation.com/practice-test-login/'

test.describe('Login — practicetestautomation.com', () => {

    test('login berhasil dengan kredensial valid', async ({ page }) => {
        const please = new Please(page)

        await please.goto({ url: URL, title: 'Test Login | Practice Test Automation' })

        await please.fill('Username', '#username', 'student')
        await please.fill('Password', '#password', 'Password123')
        await please.click('Login Button', '#submit')

        await please.verifyPage({ url: '/logged-in-successfully/' })
        await please.see('Pesan Sukses', 'h1', 'Logged In Successfully')
        await please.screenshot('login-berhasil')
    })

    test('login gagal — username salah', async ({ page }) => {
        const please = new Please(page)

        await please.goto({ url: URL, title: 'Test Login | Practice Test Automation' })

        await please.fill('Username', '#username', 'wronguser')
        await please.fill('Password', '#password', 'Password123')
        await please.click('Login Button', '#submit')

        await please.see('Pesan Error', '#error', 'Your username is invalid!')
        await please.screenshot('login-gagal-username')
    })

    test('login gagal — password salah', async ({ page }) => {
        const please = new Please(page)

        await please.goto({ url: URL, title: 'Test Login | Practice Test Automation' })

        await please.fill('Username', '#username', 'student')
        await please.fill('Password', '#password', 'wrongpassword')
        await please.click('Login Button', '#submit')

        await please.see('Pesan Error', '#error', 'Your password is invalid!')
        await please.screenshot('login-gagal-password')
    })

    test('logout setelah login berhasil', async ({ page }) => {
        const please = new Please(page)

        await please.goto({ url: URL, title: 'Test Login | Practice Test Automation' })

        await please.fill('Username', '#username', 'student')
        await please.fill('Password', '#password', 'Password123')
        await please.click('Login Button', '#submit')

        await please.verifyPage({ url: '/logged-in-successfully/' })
        await please.click('Log Out Button', 'text=Log out')

        await please.verifyPage({ url: URL })
        await please.screenshot('setelah-logout')
    })

})
