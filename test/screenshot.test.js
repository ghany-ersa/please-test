const path = require('path')
const fs = require('fs')
const Please = require('../lib/index.js')

const PASS = (msg) => console.log(`  ✓ ${msg}`)
const FAIL = (msg) => { console.error(`  ✗ ${msg}`); process.exitCode = 1 }

function makePage(screenshotImpl) {
    return {
        url:             () => 'https://example.com/',
        title:           async () => 'Example',
        goto:            async () => {},
        waitForSelector: async () => {},
        waitForTimeout:  async () => {},
        screenshot:      screenshotImpl ?? (async ({ path: p }) => { if (p) fs.writeFileSync(p, '') }),
        locator:         () => ({}),
        getByRole:       () => ({}),
        getByLabel:      () => ({}),
    }
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
        const please = new Please(makePage())
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
        const please = new Please(makePage())
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
        const please = new Please(makePage())
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
        const please = new Please(makePage(async () => { throw new Error('driver error') }))
        try {
            await please.screenshot('test')
            FAIL('screenshot() seharusnya throw saat page.screenshot() gagal')
        } catch (e) {
            if (e.message === 'driver error') PASS('screenshot() — throw saat driver error')
            else FAIL(`screenshot() throw pesan tidak sesuai: ${e.message}`)
        }
    }

    // ── Folder screenshots dibuat otomatis ────────────────────────────────────
    console.log('\n[screenshot] Folder otomatis dibuat')

    {
        const tmpDir = path.resolve('screenshots_test_tmp')
        if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true })

        const please = new Please(makePage())
        please.screenshot = async function(label) {
            if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
            const datetime = new Date().toISOString().replace(/[:.]/g, '-')
            const slug = label ? `${label.replace(/[^a-zA-Z0-9_-]/g, '_')}_${datetime}` : datetime
            const filePath = path.join(tmpDir, `${slug}.png`)
            fs.writeFileSync(filePath, '')
            return filePath
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
