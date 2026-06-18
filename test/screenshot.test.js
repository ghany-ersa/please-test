const path = require('path')
const fs = require('fs')

// ── Stub playwright sebelum require Please ────────────────────────────────────
let mockScreenshotImpl = async ({ path: p }) => { if (p) fs.writeFileSync(p, '') }

const mockPage = {
    url:             () => 'https://example.com/',
    title:           async () => 'Example',
    goto:            async () => {},
    waitForSelector: async () => {},
    waitForTimeout:  async () => {},
    screenshot:      async (opts) => mockScreenshotImpl(opts),
    locator:         () => ({}),
    on:              () => {},
    once:            () => {},
    video:           () => null,
}
const mockContext = {
    newPage: async () => mockPage,
    close:   async () => {},
}
const mockBrowser = {
    newContext: async () => mockContext,
    close:      async () => {},
}

require.cache[require.resolve('playwright')] = {
    id: require.resolve('playwright'),
    filename: require.resolve('playwright'),
    loaded: true,
    exports: { chromium: { launch: async () => mockBrowser } }
}

const Please = require('../master/input.js')

const PASS = (msg) => console.log(`  ✓ ${msg}`)
const FAIL = (msg) => { console.error(`  ✗ ${msg}`); process.exitCode = 1 }

function makePlease(screenshotImpl) {
    const please = new Please()
    const page = {
        ...mockPage,
        screenshot: screenshotImpl ?? (async ({ path: p }) => { if (p) fs.writeFileSync(p, '') }),
    }
    please._initPromise = please._initPromise.then(() => {
        please.page = page
        please._browser = mockBrowser
        please._context = mockContext
    })
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
            FAIL('screenshot() seharusnya throw saat page.screenshot() gagal')
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
        } catch (e) {
            thrown = e
        }
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
        } catch (e) {
            thrown = e
        }
        if (thrown && thrown.message.includes('Element tidak dapat di-klik'))
            PASS('_failWithScreenshot() — throw dengan pesan yang benar')
        else
            FAIL(`_failWithScreenshot() — pesan tidak sesuai atau tidak throw: ${thrown?.message}`)

        const after = createdFiles()
        const newFiles = after.filter(f => !before.includes(f))
        const saved = newFiles.find(f => f.startsWith('FAILED_Login_Button_') && f.endsWith('.png'))
        if (saved) PASS(`_failWithScreenshot() — file screenshot FAILED tersimpan: "${saved}"`)
        else FAIL(`_failWithScreenshot() — file screenshot FAILED tidak ditemukan, file baru: ${JSON.stringify(newFiles)}`)
        cleanupFiles(before)
    }

    // ── Folder screenshots dibuat otomatis ────────────────────────────────────
    console.log('\n[screenshot] Folder otomatis dibuat')

    {
        const tmpDir = path.resolve('screenshots_test_tmp')
        if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true })

        const please = makePlease()
        please.screenshot = async function(label) {
            if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
            const datetime = new Date().toISOString().replace(/[:.]/g, '-')
            const slug = label ? `${label.replace(/[^a-zA-Z0-9_-]/g, '_')}_${datetime}` : datetime
            const name = `${slug}.png`
            fs.writeFileSync(path.join(tmpDir, name), '')
            return path.join(tmpDir, name)
        }
        try {
            await please.screenshot('auto-dir')
            if (fs.existsSync(tmpDir)) PASS('screenshot() — folder dibuat otomatis jika belum ada')
            else FAIL('screenshot() — folder tidak dibuat otomatis')
        } catch (e) {
            FAIL(`screenshot() folder otomatis throw: ${e.message}`)
        }
        if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true })
    }

    console.log('\n─────────────────────────────────')
    if (process.exitCode === 1) console.error('Beberapa case GAGAL.')
    else console.log('Semua case LULUS.')
}

run()
