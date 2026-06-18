const path = require('path')
const fs = require('fs')

// ── Stub selenium-webdriver sebelum require pleaseClass ───────────────────────
let mockTakeScreenshotImpl = async () => ''

const mockDriver = {
    takeScreenshot: async () => mockTakeScreenshotImpl(),
    sleep: async () => {},
    manage: () => ({ window: () => ({ maximize: () => {} }) })
}

require.cache[require.resolve('selenium-webdriver')] = {
    id: require.resolve('selenium-webdriver'),
    filename: require.resolve('selenium-webdriver'),
    loaded: true,
    exports: {
        Builder: class {
            forBrowser() { return this }
            setChromeOptions() { return this }
            build() { return mockDriver }
        },
        Key: {},
        By: {
            xpath: (v) => ({ using: 'xpath', value: v }),
            id: (v) => ({ using: 'css selector', value: `*[id="${v}"]` }),
            linkText: (v) => ({ using: 'link text', value: v }),
            css: (v) => ({ using: 'css selector', value: v }),
            name: (v) => ({ using: 'css selector', value: `*[name="${v}"]` }),
        },
        until: { elementLocated: () => {} }
    }
}
require.cache[require.resolve('selenium-webdriver/chrome')] = {
    id: require.resolve('selenium-webdriver/chrome'),
    filename: require.resolve('selenium-webdriver/chrome'),
    loaded: true,
    exports: { Options: class { addArguments() {} } }
}

const pleaseClass = require('../master/input.js')

const PASS = (msg) => console.log(`  ✓ ${msg}`)
const FAIL = (msg) => { console.error(`  ✗ ${msg}`); process.exitCode = 1 }

function makePlease(takeScreenshotImpl) {
    const please = new pleaseClass()
    please.driver = {
        ...mockDriver,
        takeScreenshot: takeScreenshotImpl ?? (async () => ''),
    }
    return please
}

const SCREENSHOTS_DIR = path.resolve('screenshots')
function createdFiles() {
    if (!fs.existsSync(SCREENSHOTS_DIR)) return []
    return fs.readdirSync(SCREENSHOTS_DIR)
}
function cleanupFiles(before) {
    if (!fs.existsSync(SCREENSHOTS_DIR)) return
    for (const f of fs.readdirSync(SCREENSHOTS_DIR)) {
        if (!before.includes(f))
            fs.unlinkSync(path.join(SCREENSHOTS_DIR, f))
    }
}

async function run() {

    // ── screenshot() ─────────────────────────────────────────────────────────
    console.log('\n[screenshot] Nama file dan isi')

    {
        const before = createdFiles()
        const please = makePlease()
        let result
        try {
            result = await please.screenshot('login berhasil')
            PASS(`screenshot() — mengembalikan path: ${result}`)
        } catch (e) {
            FAIL(`screenshot() throw: ${e.message}`)
        }
        try {
            if (result && fs.existsSync(result)) PASS('screenshot() — file PNG tersimpan di disk')
            else FAIL('screenshot() — file PNG tidak ditemukan di disk')
        } catch (e) {
            FAIL(`screenshot() cek file throw: ${e.message}`)
        }
        try {
            const name = path.basename(result)
            if (name.startsWith('login_berhasil_') && name.endsWith('.png'))
                PASS(`screenshot() — nama file mengandung label + datetime: "${name}"`)
            else
                FAIL(`screenshot() — format nama file tidak sesuai: "${name}"`)
        } catch (e) {
            FAIL(`screenshot() cek nama file throw: ${e.message}`)
        }
        cleanupFiles(before)
    }

    {
        const before = createdFiles()
        const please = makePlease()
        let result
        try {
            result = await please.screenshot()
            const name = path.basename(result)
            if (/^\d{4}-\d{2}-\d{2}T/.test(name) && name.endsWith('.png'))
                PASS(`screenshot() tanpa label — nama file berupa datetime: "${name}"`)
            else
                FAIL(`screenshot() tanpa label — format tidak sesuai: "${name}"`)
        } catch (e) {
            FAIL(`screenshot() tanpa label throw: ${e.message}`)
        }
        cleanupFiles(before)
    }

    {
        const before = createdFiles()
        const please = makePlease()
        let result
        try {
            result = await please.screenshot('login/gagal & retry!')
            const name = path.basename(result)
            if (!/[/&!]/.test(name)) PASS(`screenshot() — karakter spesial di label diganti _: "${name}"`)
            else FAIL(`screenshot() — nama file masih mengandung karakter spesial: "${name}"`)
        } catch (e) {
            FAIL(`screenshot() karakter spesial throw: ${e.message}`)
        }
        cleanupFiles(before)
    }

    {
        const please = makePlease(async () => { throw new Error('driver error') })
        try {
            await please.screenshot('test')
            FAIL('screenshot() seharusnya throw saat driver.takeScreenshot() gagal')
        } catch (e) {
            if (e.message === 'driver error') PASS('screenshot() — throw saat driver error')
            else FAIL(`screenshot() throw pesan tidak sesuai: ${e.message}`)
        }
    }

    // ── test() ───────────────────────────────────────────────────────────────
    console.log('\n[test] Wrapper sukses dan gagal')

    {
        const before = createdFiles()
        const please = makePlease()
        try {
            await please.test('Cek Homepage', async () => {})
            const after = createdFiles()
            const newFiles = after.filter(f => !before.includes(f))
            const saved = newFiles.find(f => f.startsWith('PASSED_Cek_Homepage_') && f.endsWith('.png'))
            if (saved) PASS(`test() sukses — file screenshot PASSED tersimpan: "${saved}"`)
            else FAIL(`test() sukses — file screenshot PASSED tidak ditemukan, file baru: ${JSON.stringify(newFiles)}`)
        } catch (e) {
            FAIL(`test() sukses throw: ${e.message}`)
        }
        cleanupFiles(before)
    }

    {
        const please = makePlease()
        const error = new Error('element tidak ditemukan')
        let thrown
        try {
            await please.test('Cek Login', async () => { throw error })
            FAIL('test() seharusnya throw saat fn gagal')
        } catch (e) { thrown = e }
        if (thrown === error) PASS('test() gagal — error dari fn diteruskan keluar')
        else if (thrown) FAIL(`test() gagal — error yang diteruskan tidak sama: ${thrown.message}`)
    }

    {
        const please = makePlease()
        let screenshotCalled = false
        please.screenshot = async () => { screenshotCalled = true; return 'dummy.png' }
        try {
            await please.test('Cek Form', async () => { throw new Error('gagal') })
        } catch {}
        if (!screenshotCalled) PASS('test() gagal — screenshot PASSED tidak diambil saat fn throw')
        else FAIL('test() gagal — screenshot PASSED seharusnya tidak diambil saat fn throw')
    }

    // ── _failWithScreenshot() ─────────────────────────────────────────────────
    console.log('\n[_failWithScreenshot] Screenshot + throw')

    {
        const before = createdFiles()
        const please = makePlease()
        let thrown
        try {
            await please._failWithScreenshot('Login Button', 'Element tidak dapat di-klik')
        } catch (e) { thrown = e }

        if (thrown && thrown.message.includes('Element tidak dapat di-klik'))
            PASS('_failWithScreenshot() — throw dengan pesan yang benar')
        else
            FAIL(`_failWithScreenshot() — pesan tidak sesuai atau tidak throw: ${thrown?.message}`)

        const after = createdFiles()
        const newFiles = after.filter(f => !before.includes(f))
        const saved = newFiles.find(f => f.startsWith('FAILED_Login_Button_') && f.endsWith('.png'))
        if (saved) PASS(`_failWithScreenshot() — file screenshot FAILED tersimpan: "${saved}"`)
        else FAIL(`_failWithScreenshot() — file FAILED tidak ditemukan, file baru: ${JSON.stringify(newFiles)}`)
        cleanupFiles(before)
    }

    console.log('\n─────────────────────────────────')
    if (process.exitCode === 1) console.error('Beberapa case GAGAL.')
    else console.log('Semua case LULUS.')
}

run()
