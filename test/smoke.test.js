const Please = require('../master/input.js')

const PASS = (msg) => console.log(`  ✓ ${msg}`)
const FAIL = (msg) => { console.error(`  ✗ ${msg}`); process.exitCode = 1 }

process.on('uncaughtException', (e) => {
    if (e.message && e.message.includes('ECONNREFUSED')) return
    console.error('Uncaught:', e.message)
    process.exit(1)
})

async function run() {

    // ── Constructor ─────────────────────────────────────────────────────────
    console.log('\n[Constructor] Inisialisasi Please')
    let please
    try {
        please = new Please()
        await please._ready()
        PASS('new Please() — tanpa parameter, default headless')
    } catch (e) {
        FAIL(`new Please() gagal: ${e.message}`)
        return
    }
    try {
        const p = new Please({})
        await p._ready()
        PASS('new Please({}) — objek kosong')
        await p.quit()
    } catch (e) {
        FAIL(`new Please({}) gagal: ${e.message}`)
    }
    try {
        const p = new Please({ headed: false })
        await p._ready()
        PASS('new Please({ headed: false }) — eksplisit headless')
        await p.quit()
    } catch (e) {
        FAIL(`new Please({ headed: false }) gagal: ${e.message}`)
    }

    // ── Constructor headed ──────────────────────────────────────────────────
    console.log('\n[Constructor] headed: true')
    try {
        const p = new Please({ headed: true })
        await p.goTo({ url: 'https://example.com', title: 'Example Domain' })
        const t = await p.title()
        if (t === 'Example Domain') PASS('new Please({ headed: true }) — browser berjalan dan dapat navigasi')
        else FAIL(`headed: true — title tidak sesuai: "${t}"`)
        await p.quit()
    } catch (e) {
        FAIL(`new Please({ headed: true }) gagal: ${e.message}`)
    }

    // ── Navigasi ────────────────────────────────────────────────────────────
    console.log('\n[Navigasi] goTo, url, title, checkWhere')
    try {
        await please.goTo({ url: 'https://example.com', title: 'Example Domain' })
        PASS('goTo() — navigasi dan validasi url + title')
    } catch (e) {
        FAIL(`goTo() gagal: ${e.message}`)
    }
    try {
        const currentUrl = await please.url()
        if (currentUrl.includes('example.com')) PASS(`url() — mengembalikan url saat ini: ${currentUrl}`)
        else FAIL(`url() nilai tidak sesuai: ${currentUrl}`)
    } catch (e) {
        FAIL(`url() gagal: ${e.message}`)
    }
    try {
        const currentTitle = await please.title()
        if (currentTitle === 'Example Domain') PASS(`title() — mengembalikan title saat ini: "${currentTitle}"`)
        else FAIL(`title() nilai tidak sesuai: "${currentTitle}"`)
    } catch (e) {
        FAIL(`title() gagal: ${e.message}`)
    }
    try {
        const u = await please.url()
        const t = await please.title()
        await please.checkWhere({ url: u, title: t })
        PASS('checkWhere() — validasi url + title saat ini')
    } catch (e) {
        FAIL(`checkWhere() gagal: ${e.message}`)
    }

    // ── detectLocator ───────────────────────────────────────────────────────
    console.log('\n[detectLocator] Semua tipe selector')
    const selectorCases = [
        ['//div',           'xpath=//div'],
        ['(//div)[1]',      'xpath=(//div)[1]'],
        ['#myId',           '#myId'],
        ['text=Click here', 'text=Click here'],
        ['.myClass',        '.myClass'],
        ['[data-test="x"]', '[data-test="x"]'],
        ['div > span',      'div > span'],
        ['h1',              'h1'],
    ]
    for (const [selector, expected] of selectorCases) {
        try {
            const result = please.detectLocator(selector)
            if (result === expected)
                PASS(`"${selector}" → "${result}"`)
            else
                FAIL(`"${selector}" → expected "${expected}", got "${result}"`)
        } catch (e) {
            FAIL(`detectLocator("${selector}") throw: ${e.message}`)
        }
    }

    // ── Baca elemen ─────────────────────────────────────────────────────────
    console.log('\n[Baca Elemen] getText, see, untilShow')
    try {
        const text = await please.getText('Heading', 'h1')
        if (text === 'Example Domain') PASS(`getText() — teks elemen: "${text}"`)
        else FAIL(`getText() nilai tidak sesuai: "${text}"`)
    } catch (e) {
        FAIL(`getText() gagal: ${e.message}`)
    }
    try {
        const text = await please.see('Heading', 'h1')
        if (text === 'Example Domain') PASS(`see() pada elemen teks — mengembalikan: "${text}"`)
        else FAIL(`see() nilai tidak sesuai: "${text}"`)
    } catch (e) {
        FAIL(`see() gagal: ${e.message}`)
    }
    try {
        await please.untilShow('Heading', 'h1')
        PASS('untilShow() — elemen ditemukan dalam batas waktu')
    } catch (e) {
        FAIL(`untilShow() gagal: ${e.message}`)
    }
    try {
        await please.untilShow('Ghost Element', '#tidak-ada-sama-sekali', 3000)
        FAIL('untilShow() seharusnya throw saat elemen tidak ada')
    } catch (e) {
        if (e.message.includes('Ghost Element')) PASS(`untilShow() — throw dengan pesan jelas saat elemen tidak ada: "${e.message}"`)
        else FAIL(`untilShow() throw tapi pesan tidak sesuai: ${e.message}`)
    }

    // ── Interaksi form ──────────────────────────────────────────────────────
    console.log('\n[Interaksi Form] fill, getValue, clear, see pada input, fillAndEnter, click, click dengan delay, wait')

    await please.page.goto('https://the-internet.herokuapp.com/login')

    try {
        await please.fill('Username', '#username', 'tomsmith')
        PASS('fill() — mengisi input berhasil')
    } catch (e) {
        FAIL(`fill() gagal: ${e.message}`)
    }

    try {
        const val = await please.getValue('Username', '#username')
        if (val === 'tomsmith') PASS(`getValue() — membaca value input: "${val}"`)
        else FAIL(`getValue() nilai tidak sesuai: "${val}"`)
    } catch (e) {
        FAIL(`getValue() gagal: ${e.message}`)
    }

    try {
        const val = await please.see('Username', '#username')
        if (val === 'tomsmith') PASS(`see() pada elemen input — membaca value: "${val}"`)
        else FAIL(`see() pada input nilai tidak sesuai: "${val}"`)
    } catch (e) {
        FAIL(`see() pada input gagal: ${e.message}`)
    }

    try {
        await please.clear('Username', '#username')
        const val = await please.getValue('Username', '#username')
        if (val === '') PASS('clear() — input berhasil dikosongkan')
        else FAIL(`clear() input tidak kosong, masih: "${val}"`)
    } catch (e) {
        FAIL(`clear() gagal: ${e.message}`)
    }

    try {
        await please.fill('Password', '#password', 'SuperSecretPassword!')
        await please.fillAndEnter('Username', '#username', 'tomsmith')
        await please.wait(1000)
        const url = await please.url()
        if (url.includes('/secure')) PASS('fillAndEnter() — submit form dengan Enter berhasil, redirect ke /secure')
        else FAIL(`fillAndEnter() submit tidak redirect ke /secure, url: ${url}`)
    } catch (e) {
        FAIL(`fillAndEnter() gagal: ${e.message}`)
    }

    try {
        const p3 = new Please()
        await p3.goTo({ url: 'https://the-internet.herokuapp.com/login', title: 'The Internet' })
        await p3.fill('Username', '#username', 'tomsmith')
        await p3.fill('Password', '#password', 'SuperSecretPassword!')
        await p3.click('Login Button', 'button[type="submit"]')
        await p3.wait(1000)
        const url = await p3.url()
        await p3.quit()
        if (url.includes('/secure')) PASS('click() — klik button submit berhasil, redirect ke /secure')
        else FAIL(`click() tidak redirect ke /secure, url: ${url}`)
    } catch (e) {
        FAIL(`click() gagal: ${e.message}`)
    }

    try {
        const p2 = new Please()
        await p2.goTo({ url: 'https://the-internet.herokuapp.com/login', title: 'The Internet' })
        await p2.fill('Username', '#username', 'tomsmith')
        await p2.fill('Password', '#password', 'SuperSecretPassword!')
        await p2.click('Login Button', 'button[type="submit"]', 500)
        await p2.wait(1000)
        const url = await p2.url()
        await p2.quit()
        if (url.includes('/secure')) PASS('click() dengan delay — klik setelah jeda berhasil')
        else FAIL(`click() dengan delay tidak redirect ke /secure, url: ${url}`)
    } catch (e) {
        FAIL(`click() dengan delay gagal: ${e.message}`)
    }

    try {
        const t0 = Date.now()
        await please.wait(1500)
        const elapsed = Date.now() - t0
        if (elapsed >= 1500) PASS(`wait() — menunggu ${elapsed}ms (minimal 1500ms)`)
        else FAIL(`wait() selesai terlalu cepat: ${elapsed}ms`)
    } catch (e) {
        FAIL(`wait() gagal: ${e.message}`)
    }

    // ── Interaksi form (google) ─────────────────────────────────────────────
    console.log('\n[Interaksi Form] fill, click — google.com')
    try {
        await please.goTo({ url: 'https://www.google.com', title: 'Google' })
        await please.fill('Search Box', 'textarea[name="q"]', 'please-test npm')
        PASS('fill() — mengisi textarea berhasil')
        await please.click('Search Box', 'textarea[name="q"]')
        PASS('click() — mengklik textarea berhasil')
    } catch (e) {
        FAIL(`fill()/click() google gagal: ${e.message}`)
    }

    // ── Assertions ──────────────────────────────────────────────────────────
    console.log('\n[Assertions] equal, notEqual, fail')
    try {
        await please.equal('sama', 'sama')
        PASS('equal() — sukses saat nilai sama')
    } catch (e) {
        FAIL(`equal() gagal padahal nilai sama: ${e.message}`)
    }
    try {
        await please.equal('a', 'b')
        FAIL('equal() seharusnya throw saat nilai berbeda')
    } catch (e) {
        PASS('equal() — throw saat nilai berbeda')
    }
    try {
        please.notEqual('a', 'b')
        PASS('notEqual() — sukses saat nilai berbeda')
    } catch (e) {
        FAIL(`notEqual() gagal padahal nilai berbeda: ${e.message}`)
    }
    try {
        please.notEqual('sama', 'sama')
        FAIL('notEqual() seharusnya throw saat nilai sama')
    } catch (e) {
        PASS('notEqual() — throw saat nilai sama')
    }
    try {
        please.fail('Pesan gagal manual')
        FAIL('fail() seharusnya throw')
    } catch (e) {
        if (e.message.includes('Pesan gagal manual')) PASS(`fail() — throw dengan pesan: "${e.message}"`)
        else FAIL(`fail() throw tapi pesan tidak sesuai: ${e.message}`)
    }

    // ── Soft Assertions ─────────────────────────────────────────────────────
    console.log('\n[Soft Assertions] please.soft()')
    try {
        const sa = please.soft()
        sa.equal('sama', 'sama').notEqual('a', 'b')
        sa.assert()
        PASS('soft() — assert() tidak throw saat semua lulus')
    } catch (e) {
        FAIL(`soft() assert gagal: ${e.message}`)
    }
    try {
        const sa = please.soft()
        sa.equal('a', 'b').equal('x', 'x').notEqual('c', 'c')
        sa.assert()
        FAIL('soft() — assert() seharusnya throw saat ada kegagalan')
    } catch (e) {
        if (e.message.includes('Soft assertion') && e.message.includes('2'))
            PASS(`soft() — assert() throw dengan ringkasan kegagalan`)
        else FAIL(`soft() assert pesan tidak sesuai: ${e.message}`)
    }

    // ── Multi-tab ────────────────────────────────────────────────────────────
    console.log('\n[Multi-tab] newTab, switchTab, closeTab')
    try {
        const tab2 = await please.newTab()
        PASS('newTab() — tab baru berhasil dibuka')

        await tab2.goto('https://example.com')
        const originalUrl = await please.url()

        await please.switchTab(tab2)
        PASS('switchTab() — berpindah ke tab baru')

        const tab2Url = await please.url()
        if (tab2Url.includes('example.com')) PASS(`switchTab() — URL tab baru: ${tab2Url}`)
        else FAIL(`switchTab() URL tidak sesuai: ${tab2Url}`)

        await please.closeTab(tab2)
        PASS('closeTab() — tab berhasil ditutup')

        const mainTab = please._context.pages ? please._context.pages()[0] : null
        if (mainTab) {
            await please.switchTab(mainTab)
            PASS('switchTab() — kembali ke tab utama')
        }
    } catch (e) {
        FAIL(`multi-tab gagal: ${e.message}`)
    }

    // ── Dialog Handling ──────────────────────────────────────────────────────
    console.log('\n[Dialog] acceptDialog, dismissDialog')
    try {
        await please.page.goto('https://the-internet.herokuapp.com/javascript_alerts')

        please.acceptDialog()
        await please.click('JS Alert', "button[onclick='jsAlert()']")
        await please.wait(500)
        const result1 = await please.getText('Result', '#result')
        if (result1.includes('You successfully clicked an alert'))
            PASS(`acceptDialog() — alert diterima, result: "${result1}"`)
        else FAIL(`acceptDialog() result tidak sesuai: "${result1}"`)
    } catch (e) {
        FAIL(`acceptDialog() gagal: ${e.message}`)
    }
    try {
        please.dismissDialog()
        await please.click('JS Confirm', "button[onclick='jsConfirm()']")
        await please.wait(500)
        const result2 = await please.getText('Result', '#result')
        if (result2.includes('You clicked: Cancel'))
            PASS(`dismissDialog() — confirm ditolak, result: "${result2}"`)
        else FAIL(`dismissDialog() result tidak sesuai: "${result2}"`)
    } catch (e) {
        FAIL(`dismissDialog() gagal: ${e.message}`)
    }

    // ── Video Recording ──────────────────────────────────────────────────────
    console.log('\n[Video] video: true')
    try {
        const pv = new Please({ video: true })
        await pv.goTo({ url: 'https://example.com', title: 'Example Domain' })
        await pv.wait(500)
        const videoPath = await pv.saveVideo('smoke_video_test')
        if (videoPath) PASS(`saveVideo() — video tersimpan: ${videoPath}`)
        else FAIL('saveVideo() — path tidak dikembalikan')
    } catch (e) {
        FAIL(`video recording gagal: ${e.message}`)
    }

    // ── quit ────────────────────────────────────────────────────────────────
    console.log('\n[Lifecycle] quit')
    try {
        await please.quit()
        PASS('quit() — browser ditutup')
    } catch (e) {
        FAIL(`quit() gagal: ${e.message}`)
    }

    console.log('\n─────────────────────────────────')
    if (process.exitCode === 1) console.error('Beberapa case GAGAL.')
    else console.log('Semua case LULUS.')
}

run()
