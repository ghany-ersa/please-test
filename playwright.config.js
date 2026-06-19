const { defineConfig } = require('@playwright/test')

module.exports = defineConfig({
    testDir: './test',
    timeout: 30000,
    use: {
        headless: true,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
})
