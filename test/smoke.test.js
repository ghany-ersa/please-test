// Smoke test menggunakan @playwright/test
// Jalankan: npx playwright test test/smoke.test.js

const { test, expect } = require('@playwright/test')
const Please = require('../lib/index.js')

test.describe('Navigasi', () => {
    test('goto dan verifyPage', async ({ page }) => {
        const please = new Please(page)
        await please.goto({ url: 'https://example.com', title: 'Example Domain' })
        await please.verifyPage({ url: 'example.com', title: 'Example Domain' })
    })

    test('url() dan title()', async ({ page }) => {
        const please = new Please(page)
        await please.goto({ url: 'https://example.com', title: 'Example Domain' })
        expect(await please.url()).toContain('example.com')
        expect(await please.title()).toBe('Example Domain')
    })
})

test.describe('detectLocator', () => {
    const cases = [
        ['//div',           'xpath=//div'],
        ['(//div)[1]',      'xpath=(//div)[1]'],
        ['#myId',           '#myId'],
        ['text=Click here', 'text=Click here'],
        ['.myClass',        '.myClass'],
        ['[data-test="x"]', '[data-test="x"]'],
        ['div > span',      'div > span'],
        ['h1',              'h1'],
        ['button=Submit',   'role=button[name=Submit]'],
    ]
    for (const [selector, expected] of cases) {
        test(`"${selector}" → "${expected}"`, async ({ page }) => {
            const please = new Please(page)
            expect(please.detectLocator(selector)).toBe(expected)
        })
    }
})

test.describe('Baca Elemen', () => {
    test('see', async ({ page }) => {
        const please = new Please(page)
        await please.goto({ url: 'https://example.com', title: 'Example Domain' })
        expect(await please.see('Heading', 'h1')).toBe('Example Domain')
    })

    test('untilShow — elemen ada', async ({ page }) => {
        const please = new Please(page)
        await please.goto({ url: 'https://example.com', title: 'Example Domain' })
        await please.untilShow('Heading', 'h1')
    })

    test('untilShow — elemen tidak ada dalam batas waktu', async ({ page }) => {
        const please = new Please(page)
        await please.goto({ url: 'https://example.com', title: 'Example Domain' })
        await expect(please.untilShow('Ghost', '#tidak-ada', 3000)).rejects.toThrow('Ghost')
    })
})

test.describe('Interaksi Form', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://the-internet.herokuapp.com/login')
    })

    test('fill dan see', async ({ page }) => {
        const please = new Please(page)
        await please.fill('Username', '#username', 'tomsmith')
        expect(await please.see('Username', '#username')).toBe('tomsmith')
    })

    test('clear', async ({ page }) => {
        const please = new Please(page)
        await please.fill('Username', '#username', 'tomsmith')
        await please.clear('Username', '#username')
        expect(await please.see('Username', '#username')).toBe('')
    })

    test('fillAndEnter — submit form', async ({ page }) => {
        const please = new Please(page)
        await please.fill('Password', '#password', 'SuperSecretPassword!')
        await please.fillAndEnter('Username', '#username', 'tomsmith')
        await please.wait(1000)
        expect(await please.url()).toContain('/secure')
    })

    test('click — submit button', async ({ page }) => {
        const please = new Please(page)
        await please.fill('Username', '#username', 'tomsmith')
        await please.fill('Password', '#password', 'SuperSecretPassword!')
        await please.click('Login Button', 'button[type="submit"]')
        await please.wait(1000)
        expect(await please.url()).toContain('/secure')
    })

    test('click dengan delay', async ({ page }) => {
        const please = new Please(page)
        await please.fill('Username', '#username', 'tomsmith')
        await please.fill('Password', '#password', 'SuperSecretPassword!')
        await please.click('Login Button', 'button[type="submit"]', 500)
        await please.wait(1000)
        expect(await please.url()).toContain('/secure')
    })

    test('wait', async ({ page }) => {
        const please = new Please(page)
        const t0 = Date.now()
        await please.wait(1500)
        expect(Date.now() - t0).toBeGreaterThanOrEqual(1500)
    })
})

test.describe('Interaksi Form — Google', () => {
    test('fill dan click textarea', async ({ page }) => {
        const please = new Please(page)
        await please.goto({ url: 'https://www.google.com', title: 'Google' })
        await please.fill('Search Box', 'textarea[name="q"]', 'please-test npm')
        await please.click('Search Box', 'textarea[name="q"]')
    })
})

test.describe('Dialog', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://the-internet.herokuapp.com/javascript_alerts')
    })

    test('acceptDialog', async ({ page }) => {
        const please = new Please(page)
        page.once('dialog', dialog => dialog.accept())
        await please.click('JS Alert', "button[onclick='jsAlert()']")
        await please.wait(500)
        const result = await please.see('Result', '#result')
        expect(result).toContain('You successfully clicked an alert')
    })

    test('dismissDialog', async ({ page }) => {
        const please = new Please(page)
        page.once('dialog', dialog => dialog.dismiss())
        await please.click('JS Confirm', "button[onclick='jsConfirm()']")
        await please.wait(500)
        const result = await please.see('Result', '#result')
        expect(result).toContain('You clicked: Cancel')
    })
})

test.describe('Assert', () => {
    test('assertSee, assertUrl, assertTitle', async ({ page }) => {
        const please = new Please(page)
        await please.goto({ url: 'https://the-internet.herokuapp.com/login', title: 'The Internet' })

        await please.fill('Username', '#username', 'tomsmith')
        await please.see('Username', '#username', 'tomsmith')
        await please.see('Heading', 'h2', 'Login Page')
        await please.verifyPage({ url: '/login', title: 'The Internet' })
    })

    test('see — throw dengan pesan jelas saat gagal', async ({ page }) => {
        const please = new Please(page)
        await please.goto({ url: 'https://the-internet.herokuapp.com/login', title: 'The Internet' })
        await please.fill('Username', '#username', 'tomsmith')
        await expect(please.see('Username', '#username', 'admin')).rejects.toThrow('[Username]')
    })

    test('verifyPage — throw saat URL tidak cocok', async ({ page }) => {
        const please = new Please(page)
        await please.goto({ url: 'https://the-internet.herokuapp.com/login', title: 'The Internet' })
        await expect(please.verifyPage({ url: '/secure' })).rejects.toThrow('URL tidak sesuai')
    })
})

test.describe('Screenshot', () => {
    test('screenshot() menyimpan file', async ({ page }) => {
        const fs = require('fs')
        const path = require('path')
        const please = new Please(page)
        await please.goto({ url: 'https://example.com', title: 'Example Domain' })
        const filePath = await please.screenshot('smoke test')
        expect(fs.existsSync(filePath)).toBe(true)
        const name = path.basename(filePath)
        expect(name).toMatch(/^smoke_test_.*\.png$/)
        fs.unlinkSync(filePath)
    })
})
