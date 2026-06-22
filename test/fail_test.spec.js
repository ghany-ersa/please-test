const { test } = require('@playwright/test')
const Please = require('../master/index.js')

test.describe('Login Test', () => {
  test('login gagal assertion', async ({ page }) => {
    const please = new Please(page)
    await please.goto({ url: 'https://practicetestautomation.com/practice-test-login/' })
    await please.fill('Username', '#username', 'student')
    await please.fill('Password', '#password', 'Password123')
    await please.click('Submit', '#submit')
    await please.see('pesan sukses', 'h1', 'Wrong text here')
  })
})
