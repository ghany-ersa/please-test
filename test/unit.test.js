const path = require('path')
const fs = require('fs')

// ── Stub playwright sebelum require Please ────────────────────────────────────
function makeMockPage(overrides = {}) {
    return {
        url:              () => 'https://example.com/',
        title:            async () => 'Example',
        goto:             async () => {},
        waitForSelector:  async () => {},
        waitForTimeout:   async () => {},
        screenshot:       async () => {},
        locator:          () => makeMockLocator(),
        on:               () => {},
        once:             () => {},
        video:            () => null,
        ...overrides,
    }
}

function makeMockLocator(overrides = {}) {
    return {
        click:                    async () => {},
        fill:                     async () => {},
        press:                    async () => {},
        clear:                    async () => {},
        innerText:                async () => 'teks elemen',
        inputValue:               async () => 'nilai input',
        scrollIntoViewIfNeeded:   async () => {},
        setInputFiles:            async () => {},
        evaluate:                 async () => 'div',
        ...overrides,
    }
}

const mockPage = makeMockPage()
const mockContext = {
    newPage:  async () => mockPage,
    close:    async () => {},
}
const mockBrowser = {
    newContext: async () => mockContext,
    close:      async () => {},
}

const mockBrowserType = { launch: async () => mockBrowser }

require.cache[require.resolve('playwright')] = {
    id: require.resolve('playwright'),
    filename: require.resolve('playwright'),
    loaded: true,
    exports: {
        chromium: mockBrowserType,
        firefox:  mockBrowserType,
        webkit:   mockBrowserType,
    }
}

const Please = require('../master/input.js')
const assert = require('../master/assert.js')
const { SoftAssert } = require('../master/softassert.js')

const PASS = (msg) => console.log(`  ✓ ${msg}`)
const FAIL = (msg) => { console.error(`  ✗ ${msg}`); process.exitCode = 1 }

function makePlease(pageOverrides = {}, { browser, context } = {}) {
    const please = new Please()
    const page = makeMockPage(pageOverrides)
    // Tunggu _init() asli selesai, lalu inject stub agar tidak ter-overwrite
    please._initPromise = please._initPromise.then(() => {
        please.page = page
        please._browser = browser ?? mockBrowser
        please._context = context ?? mockContext
    })
    please.screenshot = async (label) => `screenshots/${label}.png`
    return please
}

async function run() {

    // ── assert.js ─────────────────────────────────────────────────────────────
    console.log('\n[assert] checkTitle, equal, notEqual, fail')

    try {
        await assert.checkTitle(
            { url: 'https://example.com/', title: 'Example' },
            { url: 'https://example.com', title: 'Example' }
        )
        PASS('checkTitle() — sukses, URL trailing slash dinormalisasi')
    } catch (e) { FAIL(`checkTitle() sukses throw: ${e.message}`) }

    try {
        await assert.checkTitle(
            { url: 'https://example.com/', title: 'Lain' },
            { url: 'https://example.com', title: 'Example' }
        )
        FAIL('checkTitle() seharusnya throw saat title berbeda')
    } catch (e) {
        if (e.message.includes('Judul')) PASS('checkTitle() — throw saat title tidak cocok')
        else FAIL(`checkTitle() pesan tidak sesuai: ${e.message}`)
    }

    try {
        await assert.checkTitle(
            { url: 'https://other.com/', title: 'Example' },
            { url: 'https://example.com', title: 'Example' }
        )
        FAIL('checkTitle() seharusnya throw saat URL berbeda')
    } catch (e) {
        if (e.message.includes('URL')) PASS('checkTitle() — throw saat URL tidak cocok')
        else FAIL(`checkTitle() URL pesan tidak sesuai: ${e.message}`)
    }

    try { await assert.equal('a', 'a'); PASS('equal() — sukses saat nilai sama') }
    catch (e) { FAIL(`equal() sukses throw: ${e.message}`) }

    try { await assert.equal('a', 'b'); FAIL('equal() seharusnya throw saat berbeda') }
    catch (e) { PASS('equal() — throw saat nilai berbeda') }

    try { await assert.equal('a', 'b', 'pesan custom'); FAIL('equal() seharusnya throw') }
    catch (e) {
        if (e.message === 'pesan custom') PASS('equal() — throw dengan pesan custom')
        else FAIL(`equal() pesan custom tidak sesuai: ${e.message}`)
    }

    try { assert.notEqual('a', 'b'); PASS('notEqual() — sukses saat nilai berbeda') }
    catch (e) { FAIL(`notEqual() sukses throw: ${e.message}`) }

    try { assert.notEqual('a', 'a'); FAIL('notEqual() seharusnya throw saat sama') }
    catch (e) { PASS('notEqual() — throw saat nilai sama') }

    try { assert.notEqual('a', 'a', 'pesan custom notEqual'); FAIL('notEqual() seharusnya throw') }
    catch (e) {
        if (e.message === 'pesan custom notEqual') PASS('notEqual() — throw dengan pesan custom')
        else FAIL(`notEqual() pesan custom tidak sesuai: ${e.message}`)
    }

    try { assert.fail('pesan gagal'); FAIL('fail() seharusnya throw') }
    catch (e) {
        if (e.message === 'pesan gagal') PASS('fail() — throw dengan pesan')
        else FAIL(`fail() pesan tidak sesuai: ${e.message}`)
    }

    try { assert.fail(); FAIL('fail() tanpa pesan seharusnya throw') }
    catch (e) {
        if (e.message.includes('tanpa pesan')) PASS('fail() — throw dengan pesan default')
        else FAIL(`fail() pesan default tidak sesuai: ${e.message}`)
    }

    // ── softassert.js ─────────────────────────────────────────────────────────
    console.log('\n[softassert] SoftAssert')

    {
        const sa = new SoftAssert()
        sa.equal('a', 'a').equal('b', 'b')
        try { sa.assert(); PASS('SoftAssert.assert() — tidak throw saat semua lulus') }
        catch (e) { FAIL(`SoftAssert.assert() throw padahal semua lulus: ${e.message}`) }
    }
    {
        const sa = new SoftAssert()
        sa.equal('a', 'b').equal('x', 'x').notEqual('c', 'c')
        try {
            sa.assert()
            FAIL('SoftAssert.assert() seharusnya throw saat ada kegagalan')
        } catch (e) {
            if (e.message.includes('2') && e.message.includes('Soft assertion'))
                PASS(`SoftAssert.assert() — throw dengan ringkasan ${sa.errors.length} kesalahan`)
            else FAIL(`SoftAssert.assert() pesan tidak sesuai: ${e.message}`)
        }
    }
    {
        const sa = new SoftAssert()
        sa.equal('a', 'b', 'pesan custom soft')
        if (sa.errors[0] === 'pesan custom soft') PASS('SoftAssert.equal() — pesan custom tersimpan')
        else FAIL(`SoftAssert pesan custom tidak sesuai: ${sa.errors[0]}`)
    }
    {
        const sa = new SoftAssert()
        if (sa.passed) PASS('SoftAssert.passed — true saat belum ada kegagalan')
        else FAIL('SoftAssert.passed seharusnya true')
        sa.equal('a', 'b')
        if (!sa.passed) PASS('SoftAssert.passed — false setelah ada kegagalan')
        else FAIL('SoftAssert.passed seharusnya false setelah kegagalan')
    }

    // ── quit, url, title ──────────────────────────────────────────────────────
    console.log('\n[input] quit, url, title')

    {
        let closeCalled = false
        const browser = { ...mockBrowser, close: async () => { closeCalled = true } }
        const p = makePlease({}, { browser })
        try {
            await p.quit()
            if (closeCalled) PASS('quit() — memanggil browser.close()')
            else FAIL('quit() — browser.close() tidak dipanggil')
        } catch (e) { FAIL(`quit() throw: ${e.message}`) }
    }
    {
        const p = makePlease({ url: () => 'https://contoh.com/' })
        try {
            const v = await p.url()
            if (v === 'https://contoh.com/') PASS('url() — mengembalikan URL saat ini')
            else FAIL(`url() tidak sesuai: ${v}`)
        } catch (e) { FAIL(`url() throw: ${e.message}`) }
    }
    {
        const p = makePlease({ title: async () => 'Judul Halaman' })
        try {
            const v = await p.title()
            if (v === 'Judul Halaman') PASS('title() — mengembalikan title saat ini')
            else FAIL(`title() tidak sesuai: ${v}`)
        } catch (e) { FAIL(`title() throw: ${e.message}`) }
    }

    // ── goTo, checkWhere ──────────────────────────────────────────────────────
    console.log('\n[input] goTo, checkWhere')

    {
        const p = makePlease({ url: () => 'https://example.com/', title: async () => 'Example' })
        try { await p.goTo({ url: 'https://example.com', title: 'Example' }); PASS('goTo() — sukses') }
        catch (e) { FAIL(`goTo() throw: ${e.message}`) }
    }
    {
        const p = makePlease({ url: () => 'https://lain.com/', title: async () => 'Example' })
        try { await p.goTo({ url: 'https://example.com', title: 'Example' }); FAIL('goTo() seharusnya throw') }
        catch (e) {
            if (e.message.includes('URL')) PASS('goTo() — throw saat URL tidak cocok')
            else FAIL(`goTo() pesan tidak sesuai: ${e.message}`)
        }
    }
    {
        const p = makePlease({ url: () => 'https://example.com/', title: async () => 'Example' })
        try { await p.checkWhere({ url: 'https://example.com', title: 'Example' }); PASS('checkWhere() — sukses') }
        catch (e) { FAIL(`checkWhere() throw: ${e.message}`) }
    }
    {
        const p = makePlease({ url: () => 'https://example.com/', title: async () => 'Berbeda' })
        try { await p.checkWhere({ url: 'https://example.com', title: 'Example' }); FAIL('checkWhere() seharusnya throw') }
        catch (e) {
            if (e.message.includes('Judul')) PASS('checkWhere() — throw saat title tidak cocok')
            else FAIL(`checkWhere() pesan tidak sesuai: ${e.message}`)
        }
    }

    // ── wait ──────────────────────────────────────────────────────────────────
    console.log('\n[input] wait')

    {
        let ms
        const p = makePlease({ waitForTimeout: async (t) => { ms = t } })
        try {
            await p.wait(1500)
            if (ms === 1500) PASS('wait(1500) — waitForTimeout(1500)')
            else FAIL(`wait() ms: ${ms}`)
        } catch (e) { FAIL(`wait() throw: ${e.message}`) }
    }
    {
        let ms
        const p = makePlease({ waitForTimeout: async (t) => { ms = t } })
        try {
            await p.wait()
            if (ms === 2000) PASS('wait() tanpa argumen — default 2000ms')
            else FAIL(`wait() default ms: ${ms}`)
        } catch (e) { FAIL(`wait() default throw: ${e.message}`) }
    }

    // ── untilShow ─────────────────────────────────────────────────────────────
    console.log('\n[input] untilShow')

    {
        const p = makePlease()
        try { await p.untilShow('Tombol', '#btn'); PASS('untilShow() — sukses saat elemen ditemukan') }
        catch (e) { FAIL(`untilShow() sukses throw: ${e.message}`) }
    }
    {
        const p = makePlease({ waitForSelector: async () => { throw new Error('timeout') } })
        let thrown
        try { await p.untilShow('Ghost', '#tidak-ada', 3000) } catch (e) { thrown = e }
        if (thrown && thrown.message.includes('Ghost') && thrown.message.includes('3'))
            PASS('untilShow() — throw dengan pesan jelas saat timeout')
        else FAIL(`untilShow() throw pesan tidak sesuai: ${thrown?.message}`)
    }
    {
        let waitForCalled = false
        const loc = makeMockLocator({ waitFor: async () => { waitForCalled = true } })
        const p = makePlease({ getByRole: () => loc })
        try {
            await p.untilShow('Submit', 'role=button')
            if (waitForCalled) PASS('untilShow("role=") — locator.waitFor() dipanggil')
            else FAIL('untilShow("role=") — locator.waitFor() tidak dipanggil')
        } catch (e) { FAIL(`untilShow("role=") throw: ${e.message}`) }
    }
    {
        let waitForCalled = false
        const loc = makeMockLocator({ waitFor: async () => { waitForCalled = true } })
        const p = makePlease({ getByLabel: () => loc })
        try {
            await p.untilShow('Email', 'label=Email')
            if (waitForCalled) PASS('untilShow("label=") — locator.waitFor() dipanggil')
            else FAIL('untilShow("label=") — locator.waitFor() tidak dipanggil')
        } catch (e) { FAIL(`untilShow("label=") throw: ${e.message}`) }
    }

    // ── scrollTo ──────────────────────────────────────────────────────────────
    console.log('\n[input] scrollTo')

    {
        let scrollCalled = false
        const loc = makeMockLocator({ scrollIntoViewIfNeeded: async () => { scrollCalled = true } })
        const p = makePlease()
        p.untilShow = async () => {}
        p.toLocator = () => loc
        try {
            await p.scrollTo('Tombol', '#btn')
            if (scrollCalled) PASS('scrollTo() — scrollIntoViewIfNeeded dipanggil')
            else FAIL('scrollTo() — scrollIntoViewIfNeeded tidak dipanggil')
        } catch (e) { FAIL(`scrollTo() throw: ${e.message}`) }
    }
    {
        const loc = makeMockLocator({ scrollIntoViewIfNeeded: async () => { throw new Error('scroll error') } })
        const p = makePlease()
        p.untilShow = async () => {}
        p.toLocator = () => loc
        let thrown
        try { await p.scrollTo('Tombol', '#btn') } catch (e) { thrown = e }
        if (thrown && thrown.message.includes('Tombol') && thrown.message.includes('scroll'))
            PASS('scrollTo() — throw dengan pesan jelas saat gagal')
        else FAIL(`scrollTo() throw pesan tidak sesuai: ${thrown?.message}`)
    }

    // ── click ─────────────────────────────────────────────────────────────────
    console.log('\n[input] click')

    {
        let clicked = false
        const loc = makeMockLocator({ click: async () => { clicked = true } })
        const p = makePlease()
        p.untilShow = async () => {}
        p.scrollTo  = async () => {}
        p.toLocator = () => loc
        try {
            await p.click('Tombol', '#btn')
            if (clicked) PASS('click() — elemen berhasil di-klik')
            else FAIL('click() — elemen tidak di-klik')
        } catch (e) { FAIL(`click() throw: ${e.message}`) }
    }
    {
        let timeoutCalled = false
        const p = makePlease({ waitForTimeout: async () => { timeoutCalled = true } })
        p.untilShow = async () => {}
        p.scrollTo  = async () => {}
        p.toLocator = () => makeMockLocator()
        try {
            await p.click('Tombol', '#btn', 500)
            if (timeoutCalled) PASS('click() dengan delay — waitForTimeout dipanggil')
            else FAIL('click() dengan delay — waitForTimeout tidak dipanggil')
        } catch (e) { FAIL(`click() dengan delay throw: ${e.message}`) }
    }
    {
        const loc = makeMockLocator({ click: async () => { throw new Error('not clickable') } })
        const p = makePlease()
        p.untilShow = async () => {}
        p.scrollTo  = async () => {}
        p.toLocator = () => loc
        let thrown
        try { await p.click('Tombol', '#btn') } catch (e) { thrown = e }
        if (thrown && thrown.message.includes('Tombol') && thrown.message.includes('klik'))
            PASS('click() — throw dengan pesan jelas saat gagal')
        else FAIL(`click() throw pesan tidak sesuai: ${thrown?.message}`)
    }

    // ── fill ──────────────────────────────────────────────────────────────────
    console.log('\n[input] fill')

    {
        let filled
        const loc = makeMockLocator({ fill: async (v) => { filled = v } })
        const p = makePlease()
        p.untilShow = async () => {}
        p.toLocator = () => loc
        try {
            await p.fill('Input', '#input', 'teks')
            if (filled === 'teks') PASS('fill() — fill dipanggil dengan value yang benar')
            else FAIL(`fill() — value tidak sesuai: ${filled}`)
        } catch (e) { FAIL(`fill() throw: ${e.message}`) }
    }
    {
        const loc = makeMockLocator({ fill: async () => { throw new Error('stale') } })
        const p = makePlease()
        p.untilShow = async () => {}
        p.toLocator = () => loc
        let thrown
        try { await p.fill('Input', '#input', 'teks') } catch (e) { thrown = e }
        if (thrown && thrown.message.includes('Input') && thrown.message.includes('input'))
            PASS('fill() — throw dengan pesan jelas saat gagal')
        else FAIL(`fill() throw pesan tidak sesuai: ${thrown?.message}`)
    }

    // ── fillAndEnter ──────────────────────────────────────────────────────────
    console.log('\n[input] fillAndEnter')

    {
        let filled, pressed
        const loc = makeMockLocator({
            fill:  async (v) => { filled = v },
            press: async (k) => { pressed = k },
        })
        const p = makePlease()
        p.untilShow = async () => {}
        p.toLocator = () => loc
        try {
            await p.fillAndEnter('Input', '#input', 'teks')
            if (filled === 'teks' && pressed === 'Enter')
                PASS('fillAndEnter() — fill + press Enter dipanggil')
            else FAIL(`fillAndEnter() — filled="${filled}" pressed="${pressed}"`)
        } catch (e) { FAIL(`fillAndEnter() throw: ${e.message}`) }
    }
    {
        const loc = makeMockLocator({ fill: async () => { throw new Error('stale') } })
        const p = makePlease()
        p.untilShow = async () => {}
        p.toLocator = () => loc
        let thrown
        try { await p.fillAndEnter('Input', '#input', 'teks') } catch (e) { thrown = e }
        if (thrown && thrown.message.includes('Input') && thrown.message.includes('input'))
            PASS('fillAndEnter() — throw dengan pesan jelas saat gagal')
        else FAIL(`fillAndEnter() throw pesan tidak sesuai: ${thrown?.message}`)
    }

    // ── getValue ──────────────────────────────────────────────────────────────
    console.log('\n[input] getValue')

    {
        const loc = makeMockLocator({ inputValue: async () => 'isinya' })
        const p = makePlease()
        p.untilShow = async () => {}
        p.toLocator = () => loc
        try {
            const v = await p.getValue('Input', '#input')
            if (v === 'isinya') PASS('getValue() — mengembalikan inputValue')
            else FAIL(`getValue() tidak sesuai: ${v}`)
        } catch (e) { FAIL(`getValue() throw: ${e.message}`) }
    }
    {
        let timeoutCalled = false
        const loc = makeMockLocator({ inputValue: async () => 'isinya' })
        const p = makePlease({ waitForTimeout: async () => { timeoutCalled = true } })
        p.untilShow = async () => {}
        p.toLocator = () => loc
        try {
            await p.getValue('Input', '#input', 500)
            if (timeoutCalled) PASS('getValue() dengan time — waitForTimeout dipanggil')
            else FAIL('getValue() dengan time — waitForTimeout tidak dipanggil')
        } catch (e) { FAIL(`getValue() dengan time throw: ${e.message}`) }
    }
    {
        const loc = makeMockLocator({ inputValue: async () => { throw new Error('stale') } })
        const p = makePlease()
        p.untilShow = async () => {}
        p.toLocator = () => loc
        let thrown
        try { await p.getValue('Input', '#input') } catch (e) { thrown = e }
        if (thrown && thrown.message.includes('Input') && thrown.message.includes('nilainya'))
            PASS('getValue() — throw dengan pesan jelas saat gagal')
        else FAIL(`getValue() throw pesan tidak sesuai: ${thrown?.message}`)
    }

    // ── getText ───────────────────────────────────────────────────────────────
    console.log('\n[input] getText')

    {
        const loc = makeMockLocator({ innerText: async () => 'teks elemen' })
        const p = makePlease()
        p.untilShow = async () => {}
        p.toLocator = () => loc
        try {
            const v = await p.getText('Heading', 'h1')
            if (v === 'teks elemen') PASS('getText() — mengembalikan innerText')
            else FAIL(`getText() tidak sesuai: ${v}`)
        } catch (e) { FAIL(`getText() throw: ${e.message}`) }
    }
    {
        let timeoutCalled = false
        const loc = makeMockLocator({ innerText: async () => 'teks' })
        const p = makePlease({ waitForTimeout: async () => { timeoutCalled = true } })
        p.untilShow = async () => {}
        p.toLocator = () => loc
        try {
            await p.getText('Heading', 'h1', 500)
            if (timeoutCalled) PASS('getText() dengan time — waitForTimeout dipanggil')
            else FAIL('getText() dengan time — waitForTimeout tidak dipanggil')
        } catch (e) { FAIL(`getText() dengan time throw: ${e.message}`) }
    }
    {
        const loc = makeMockLocator({ innerText: async () => { throw new Error('stale') } })
        const p = makePlease()
        p.untilShow = async () => {}
        p.toLocator = () => loc
        let thrown
        try { await p.getText('Heading', 'h1') } catch (e) { thrown = e }
        if (thrown && thrown.message.includes('Heading') && thrown.message.includes('teksnya'))
            PASS('getText() — throw dengan pesan jelas saat gagal')
        else FAIL(`getText() throw pesan tidak sesuai: ${thrown?.message}`)
    }

    // ── see ───────────────────────────────────────────────────────────────────
    console.log('\n[input] see')

    for (const [tag, retval, label] of [
        ['p',        'konten paragraf', 'teks'],
        ['input',    'isian input',     'input'],
        ['textarea', 'isian textarea',  'textarea'],
        ['select',   'option1',         'select'],
    ]) {
        const loc = makeMockLocator({
            evaluate:   async () => tag,
            innerText:  async () => retval,
            inputValue: async () => retval,
        })
        const p = makePlease()
        p.untilShow = async () => {}
        p.toLocator = () => loc
        try {
            const v = await p.see('El', `#${tag}`)
            if (v === retval) PASS(`see() pada ${label} — mengembalikan nilai yang benar`)
            else FAIL(`see() pada ${label} nilai tidak sesuai: ${v}`)
        } catch (e) { FAIL(`see() pada ${label} throw: ${e.message}`) }
    }

    {
        let timeoutCalled = false
        const loc = makeMockLocator({ evaluate: async () => 'p', innerText: async () => 'teks' })
        const p = makePlease({ waitForTimeout: async () => { timeoutCalled = true } })
        p.untilShow = async () => {}
        p.toLocator = () => loc
        try {
            await p.see('Paragraf', 'p', 500)
            if (timeoutCalled) PASS('see() dengan time — waitForTimeout dipanggil')
            else FAIL('see() dengan time — waitForTimeout tidak dipanggil')
        } catch (e) { FAIL(`see() dengan time throw: ${e.message}`) }
    }
    {
        const loc = makeMockLocator({ evaluate: async () => { throw new Error('stale') } })
        const p = makePlease()
        p.untilShow = async () => {}
        p.toLocator = () => loc
        let thrown
        try { await p.see('Elemen', '#el') } catch (e) { thrown = e }
        if (thrown && thrown.message.includes('Elemen') && thrown.message.includes('dibaca'))
            PASS('see() — throw dengan pesan jelas saat gagal')
        else FAIL(`see() throw pesan tidak sesuai: ${thrown?.message}`)
    }

    // ── clear ─────────────────────────────────────────────────────────────────
    console.log('\n[input] clear')

    {
        let cleared = false
        const loc = makeMockLocator({ clear: async () => { cleared = true } })
        const p = makePlease()
        p.untilShow = async () => {}
        p.toLocator = () => loc
        try {
            await p.clear('Input', '#input')
            if (cleared) PASS('clear() — locator.clear() dipanggil')
            else FAIL('clear() — locator.clear() tidak dipanggil')
        } catch (e) { FAIL(`clear() throw: ${e.message}`) }
    }
    {
        const loc = makeMockLocator({ clear: async () => { throw new Error('stale') } })
        const p = makePlease()
        p.untilShow = async () => {}
        p.toLocator = () => loc
        let thrown
        try { await p.clear('Input', '#input') } catch (e) { thrown = e }
        if (thrown && thrown.message.includes('Input') && thrown.message.includes('kosongkan'))
            PASS('clear() — throw dengan pesan jelas saat gagal')
        else FAIL(`clear() throw pesan tidak sesuai: ${thrown?.message}`)
    }

    // ── datepicker ────────────────────────────────────────────────────────────
    console.log('\n[input] datepicker')

    {
        let filled
        const loc = makeMockLocator({ fill: async (v) => { filled = v }, press: async () => {} })
        const p = makePlease()
        p.untilShow = async () => {}
        p.toLocator = () => loc
        try {
            await p.datepicker('Tanggal', '#date', '2026-01-01')
            if (filled === '2026-01-01')
                PASS('datepicker() — mendelegasikan ke fillAndEnter()')
            else FAIL(`datepicker() — value tidak sesuai: ${filled}`)
        } catch (e) { FAIL(`datepicker() throw: ${e.message}`) }
    }

    // ── uploadFile ────────────────────────────────────────────────────────────
    console.log('\n[input] uploadFile')

    {
        let fileReceived
        const loc = makeMockLocator({ setInputFiles: async (f) => { fileReceived = f } })
        const p = makePlease()
        p.untilShow = async () => {}
        p.toLocator = () => loc
        try {
            await p.uploadFile('File Input', '#file', '/path/to/file.pdf')
            if (fileReceived === '/path/to/file.pdf')
                PASS('uploadFile() — setInputFiles dipanggil dengan path file')
            else FAIL(`uploadFile() — path tidak sesuai: ${fileReceived}`)
        } catch (e) { FAIL(`uploadFile() throw: ${e.message}`) }
    }
    {
        const loc = makeMockLocator({ setInputFiles: async () => { throw new Error('stale') } })
        const p = makePlease()
        p.untilShow = async () => {}
        p.toLocator = () => loc
        let thrown
        try { await p.uploadFile('File Input', '#file', '/path/file.pdf') } catch (e) { thrown = e }
        if (thrown && thrown.message.includes('File Input') && thrown.message.includes('file'))
            PASS('uploadFile() — throw dengan pesan jelas saat gagal')
        else FAIL(`uploadFile() throw pesan tidak sesuai: ${thrown?.message}`)
    }

    // ── detectLocator ─────────────────────────────────────────────────────────
    console.log('\n[input] detectLocator')

    {
        const p = makePlease()
        const cases = [
            ['//div',                    'xpath=//div'],
            ['(//div)[1]',               'xpath=(//div)[1]'],
            ['#myId',                    '#myId'],
            ['text=Klik',                'text=Klik'],
            ['.myClass',                 '.myClass'],
            ['[data-x="y"]',             '[data-x="y"]'],
            ['div > span',               'div > span'],
            ['h1',                       'h1'],
            ['div',                      'div'],
            ['role=button',              'role=button'],
            ['role=button[name=Submit]', 'role=button[name=Submit]'],
            ['label=Email',              'label=Email'],
            ['button=Submit',            'role=button[name=Submit]'],
            ['a=Klik di sini',           'role=a[name=Klik di sini]'],
            ['select=Pilih Kota',        'role=select[name=Pilih Kota]'],
        ]
        for (const [sel, expected] of cases) {
            try {
                const result = p.detectLocator(sel)
                if (result === expected)
                    PASS(`detectLocator("${sel}") → "${result}"`)
                else
                    FAIL(`detectLocator("${sel}") expected "${expected}", got "${result}"`)
            } catch (e) { FAIL(`detectLocator("${sel}") throw: ${e.message}`) }
        }
    }
    {
        const p = makePlease()
        try {
            p.detectLocator('tidakjelasini')
            FAIL('detectLocator() seharusnya throw untuk selector tidak dikenal')
        } catch (e) {
            if (e.message.includes('tidakjelasini') && e.message.includes('tidak dapat dikenali'))
                PASS(`detectLocator() — throw untuk selector tidak dikenal: "${e.message}"`)
            else FAIL(`detectLocator() pesan tidak sesuai: ${e.message}`)
        }
    }

    // ── toLocator: role= dan label= ───────────────────────────────────────────
    console.log('\n[input] toLocator: role=, label=')

    {
        let roleUsed, nameUsed
        const p = makePlease({ getByRole: (role, opts) => { roleUsed = role; nameUsed = opts?.name; return makeMockLocator() } })
        await p._ready()
        p.toLocator('role=button')
        if (roleUsed === 'button' && nameUsed === undefined) PASS('toLocator("role=button") — getByRole("button") dipanggil')
        else FAIL(`toLocator("role=button") role="${roleUsed}" name="${nameUsed}"`)
    }
    {
        let roleUsed, nameUsed
        const p = makePlease({ getByRole: (role, opts) => { roleUsed = role; nameUsed = opts?.name; return makeMockLocator() } })
        await p._ready()
        p.toLocator('role=button[name=Submit]')
        if (roleUsed === 'button' && nameUsed === 'Submit') PASS('toLocator("role=button[name=Submit]") — getByRole("button", { name: "Submit" }) dipanggil')
        else FAIL(`toLocator("role=button[name=Submit]") role="${roleUsed}" name="${nameUsed}"`)
    }
    {
        let labelUsed
        const p = makePlease({ getByLabel: (label) => { labelUsed = label; return makeMockLocator() } })
        await p._ready()
        p.toLocator('label=Email')
        if (labelUsed === 'Email') PASS('toLocator("label=Email") — getByLabel("Email") dipanggil')
        else FAIL(`toLocator("label=Email") label="${labelUsed}"`)
    }

    // ── browser type ─────────────────────────────────────────────────────────
    console.log('\n[input] browser: chromium, firefox, webkit, invalid')

    for (const browserName of ['chromium', 'firefox', 'webkit']) {
        const p = new Please({ browser: browserName })
        p._initPromise = p._initPromise.then(() => {
            p.page = makeMockPage()
            p._browser = mockBrowser
            p._context = mockContext
        })
        try {
            await p._ready()
            PASS(`new Please({ browser: '${browserName}' }) — inisialisasi berhasil`)
        } catch (e) {
            FAIL(`new Please({ browser: '${browserName}' }) gagal: ${e.message}`)
        }
    }
    {
        const p = new Please({ browser: 'ie' })
        p._initPromise = p._initPromise.catch(() => {})
        try {
            p._resolveBrowserType()
            FAIL('_resolveBrowserType() seharusnya throw untuk browser tidak dikenal')
        } catch (e) {
            if (e.message.includes('ie') && e.message.includes('tidak didukung'))
                PASS(`_resolveBrowserType() — throw untuk browser tidak dikenal: "${e.message}"`)
            else FAIL(`_resolveBrowserType() pesan tidak sesuai: ${e.message}`)
        }
    }

    // ── multi-tab ─────────────────────────────────────────────────────────────
    console.log('\n[input] multi-tab: newTab, switchTab, closeTab')

    {
        const newPageResult = makeMockPage({ url: () => 'https://tab2.com/' })
        let newPageCalled = false
        const context = { ...mockContext, newPage: async () => { newPageCalled = true; return newPageResult } }
        const p = makePlease({}, { context })
        try {
            const tab = await p.newTab()
            if (newPageCalled && tab === newPageResult) PASS('newTab() — context.newPage() dipanggil, mengembalikan page baru')
            else FAIL('newTab() — tidak sesuai')
        } catch (e) { FAIL(`newTab() throw: ${e.message}`) }
    }
    {
        const tab = makeMockPage({ url: () => 'https://tab2.com/' })
        let bringToFrontCalled = false
        tab.bringToFront = async () => { bringToFrontCalled = true }
        const p = makePlease()
        try {
            await p.switchTab(tab)
            if (p.page === tab && bringToFrontCalled) PASS('switchTab() — page diganti dan bringToFront dipanggil')
            else FAIL('switchTab() — page atau bringToFront tidak sesuai')
        } catch (e) { FAIL(`switchTab() throw: ${e.message}`) }
    }
    {
        let closeCalled = false
        const tab = makeMockPage()
        tab.close = async () => { closeCalled = true }
        const p = makePlease()
        try {
            await p.closeTab(tab)
            if (closeCalled) PASS('closeTab() — tab.close() dipanggil')
            else FAIL('closeTab() — tab.close() tidak dipanggil')
        } catch (e) { FAIL(`closeTab() throw: ${e.message}`) }
    }

    // ── dialog handling ───────────────────────────────────────────────────────
    console.log('\n[input] dialog: acceptDialog, dismissDialog, onDialog')

    {
        let onceEvent, onceHandler
        const p = makePlease({ once: (event, handler) => { onceEvent = event; onceHandler = handler } })
        await p.acceptDialog()
        if (onceEvent === 'dialog') PASS('acceptDialog() — mendaftarkan listener dialog once')
        else FAIL(`acceptDialog() event tidak sesuai: ${onceEvent}`)

        let accepted, acceptedText
        await onceHandler({ accept: async (t) => { accepted = true; acceptedText = t }, dismiss: async () => {} })
        if (accepted && acceptedText === undefined) PASS('acceptDialog() — dialog.accept() dipanggil tanpa teks')
        else FAIL(`acceptDialog() accept tidak dipanggil atau text tidak sesuai`)
    }
    {
        let onceHandler
        const p = makePlease({ once: (event, handler) => { onceHandler = handler } })
        await p.acceptDialog('isi prompt')
        let capturedText
        await onceHandler({ accept: async (t) => { capturedText = t }, dismiss: async () => {} })
        if (capturedText === 'isi prompt') PASS('acceptDialog(text) — teks prompt diteruskan ke dialog.accept()')
        else FAIL(`acceptDialog(text) capturedText tidak sesuai: ${capturedText}`)
    }
    {
        let dismissed = false
        let onceHandler
        const p = makePlease({ once: (event, handler) => { onceHandler = handler } })
        await p.dismissDialog()
        await onceHandler({ accept: async () => {}, dismiss: async () => { dismissed = true } })
        if (dismissed) PASS('dismissDialog() — dialog.dismiss() dipanggil')
        else FAIL('dismissDialog() — dialog.dismiss() tidak dipanggil')
    }
    {
        let onEvent, onHandler
        const p = makePlease({ on: (event, handler) => { onEvent = event; onHandler = handler } })
        const customHandler = async () => {}
        await p.onDialog(customHandler)
        if (onEvent === 'dialog' && onHandler === customHandler) PASS('onDialog() — handler custom terdaftar via page.on()')
        else FAIL(`onDialog() event/handler tidak sesuai`)
    }

    console.log('\n─────────────────────────────────')
    if (process.exitCode === 1) console.error('Beberapa case GAGAL.')
    else console.log('Semua case LULUS.')
}

run()
