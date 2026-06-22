const Please = require('../lib/index.js')

const PASS = (msg) => console.log(`  ✓ ${msg}`)
const FAIL = (msg) => { console.error(`  ✗ ${msg}`); process.exitCode = 1 }

// ── Mock page factory ────────────────────────────────────────────────────────

function makePage(overrides = {}) {
    return {
        url:                () => 'https://example.com/',
        title:              async () => 'Example',
        goto:               async () => {},
        waitForSelector:    async () => {},
        waitForTimeout:     async () => {},
        waitForLoadState:   async () => {},
        screenshot:         async () => {},
        locator:            (sel) => makeLocator(sel),
        getByRole:          (role, opts) => makeLocator(`role=${role}${opts?.name ? `[name=${opts.name}]` : ''}`),
        getByLabel:         (label) => makeLocator(`label=${label}`),
        getByText:          (text) => makeLocator(`text=${text}`),
        getByPlaceholder:   (ph) => makeLocator(`placeholder=${ph}`),
        getByAltText:       (alt) => makeLocator(`alt=${alt}`),
        getByTitle:         (t) => makeLocator(`title=${t}`),
        getByTestId:        (id) => makeLocator(`testid=${id}`),
        ...overrides,
    }
}

function makeLocator(sel, overrides = {}) {
    return {
        _sel:                   sel,
        click:                  async () => {},
        fill:                   async () => {},
        press:                  async () => {},
        clear:                  async () => {},
        inputValue:             async () => 'value',
        innerText:              async () => 'text',
        scrollIntoViewIfNeeded: async () => {},
        setInputFiles:          async () => {},
        waitFor:                async () => {},
        evaluate:               async (fn) => fn({ tagName: 'DIV' }),
        ...overrides,
    }
}

async function run() {

    // ── goto ────────────────────────────────────────────────────────────────
    console.log('\n[goto]')
    {
        const page = makePage({ title: async () => 'My App' })
        const p = new Please(page)
        try {
            await p.goto({ url: 'https://example.com', title: 'My App' })
            PASS('goto() — sukses saat title cocok')
        } catch (e) { FAIL(`goto() throw: ${e.message}`) }
    }
    {
        const page = makePage({ title: async () => 'Wrong Title' })
        const p = new Please(page)
        try {
            await p.goto({ url: 'https://example.com', title: 'My App' })
            FAIL('goto() seharusnya throw saat title tidak cocok')
        } catch (e) {
            if (e.message.includes('Title tidak sesuai')) PASS('goto() — throw saat title tidak cocok')
            else FAIL(`goto() pesan tidak sesuai: ${e.message}`)
        }
    }
    {
        const page = makePage({ title: async () => 'Any' })
        const p = new Please(page)
        try {
            await p.goto({ url: 'https://example.com' })
            PASS('goto() — sukses tanpa title validation')
        } catch (e) { FAIL(`goto() tanpa title throw: ${e.message}`) }
    }

    // ── verifyPage ──────────────────────────────────────────────────────────
    console.log('\n[verifyPage]')
    {
        const page = makePage({ url: () => 'https://example.com/page', title: async () => 'Page' })
        const p = new Please(page)
        try {
            await p.verifyPage({ url: 'example.com', title: 'Page' })
            PASS('verifyPage() — sukses saat url + title cocok')
        } catch (e) { FAIL(`verifyPage() throw: ${e.message}`) }
    }
    {
        const page = makePage({ url: () => 'https://other.com/' })
        const p = new Please(page)
        try {
            await p.verifyPage({ url: 'example.com' })
            FAIL('verifyPage() seharusnya throw saat url tidak cocok')
        } catch (e) {
            if (e.message.includes('URL tidak sesuai')) PASS('verifyPage() — throw saat url tidak cocok')
            else FAIL(`verifyPage() pesan tidak sesuai: ${e.message}`)
        }
    }

    // ── url / title ─────────────────────────────────────────────────────────
    console.log('\n[url / title]')
    {
        const page = makePage({ url: () => 'https://example.com/', title: async () => 'Example' })
        const p = new Please(page)
        const u = await p.url()
        const t = await p.title()
        if (u === 'https://example.com/') PASS(`url() — mengembalikan: ${u}`)
        else FAIL(`url() salah: ${u}`)
        if (t === 'Example') PASS(`title() — mengembalikan: ${t}`)
        else FAIL(`title() salah: ${t}`)
    }

    // ── untilShow ───────────────────────────────────────────────────────────
    console.log('\n[untilShow]')
    {
        let waitForCalled = false
        const locator = makeLocator('h1', { waitFor: async () => { waitForCalled = true } })
        const page = makePage({ locator: () => locator })
        const p = new Please(page)
        try {
            await p.untilShow('Heading', 'h1')
            if (waitForCalled) PASS('untilShow() — memanggil locator.waitFor()')
            else FAIL('untilShow() tidak memanggil locator.waitFor()')
        } catch (e) { FAIL(`untilShow() throw: ${e.message}`) }
    }
    {
        const locator = makeLocator('#tidak-ada', { waitFor: async () => { throw new Error('timeout') } })
        const page = makePage({ locator: () => locator })
        const p = new Please(page)
        try {
            await p.untilShow('Ghost', '#tidak-ada', 3000)
            FAIL('untilShow() seharusnya throw saat timeout')
        } catch (e) {
            if (e.message.includes('Ghost')) PASS('untilShow() — throw dengan label yang jelas')
            else FAIL(`untilShow() pesan tidak sesuai: ${e.message}`)
        }
    }
    {
        let waitForCalled = false
        const locator = makeLocator('role=button', { waitFor: async () => { waitForCalled = true } })
        const page = makePage({ getByRole: () => locator })
        const p = new Please(page)
        await p.untilShow('Button', 'role=button')
        if (waitForCalled) PASS('untilShow() — role= memanggil locator.waitFor()')
        else FAIL('untilShow() role= tidak memanggil waitFor()')
    }
    {
        let waitForCalled = false
        const locator = makeLocator('label=Email', { waitFor: async () => { waitForCalled = true } })
        const page = makePage({ getByLabel: () => locator })
        const p = new Please(page)
        await p.untilShow('Email', 'label=Email')
        if (waitForCalled) PASS('untilShow() — label= memanggil locator.waitFor()')
        else FAIL('untilShow() label= tidak memanggil waitFor()')
    }

    // ── wait ────────────────────────────────────────────────────────────────
    console.log('\n[wait]')
    {
        let called = false
        const page = makePage({ waitForTimeout: async () => { called = true } })
        const p = new Please(page)
        await p.wait(500)
        if (called) PASS('wait() — memanggil page.waitForTimeout()')
        else FAIL('wait() tidak memanggil waitForTimeout()')
    }

    // ── click ───────────────────────────────────────────────────────────────
    console.log('\n[click]')
    {
        let clicked = false
        const locator = makeLocator('#btn', { click: async () => { clicked = true } })
        const page = makePage({ locator: () => locator, waitForSelector: async () => {} })
        const p = new Please(page)
        await p.click('Button', '#btn')
        if (clicked) PASS('click() — memanggil locator.click()')
        else FAIL('click() tidak memanggil click()')
    }
    {
        let waitCalled = false
        const page = makePage({
            waitForTimeout: async () => { waitCalled = true },
            waitForSelector: async () => {},
            locator: () => makeLocator('#btn'),
        })
        const p = new Please(page)
        await p.click('Button', '#btn', 100)
        if (waitCalled) PASS('click() dengan delay — memanggil wait()')
        else FAIL('click() dengan delay tidak memanggil wait()')
    }

    // ── fill ────────────────────────────────────────────────────────────────
    console.log('\n[fill]')
    {
        let filledWith
        const locator = makeLocator('#input', { fill: async (v) => { filledWith = v } })
        const page = makePage({ locator: () => locator, waitForSelector: async () => {} })
        const p = new Please(page)
        await p.fill('Field', '#input', 'hello')
        if (filledWith === 'hello') PASS('fill() — memanggil locator.fill() dengan nilai yang benar')
        else FAIL(`fill() nilai tidak sesuai: ${filledWith}`)
    }

    // ── fillAndEnter ────────────────────────────────────────────────────────
    console.log('\n[fillAndEnter]')
    {
        let pressed
        const locator = makeLocator('#input', { press: async (k) => { pressed = k } })
        const page = makePage({ locator: () => locator, waitForSelector: async () => {} })
        const p = new Please(page)
        await p.fillAndEnter('Field', '#input', 'hello')
        if (pressed === 'Enter') PASS('fillAndEnter() — menekan Enter setelah fill')
        else FAIL(`fillAndEnter() key tidak sesuai: ${pressed}`)
    }

    // ── clear ───────────────────────────────────────────────────────────────
    console.log('\n[clear]')
    {
        let cleared = false
        const locator = makeLocator('#input', { clear: async () => { cleared = true } })
        const page = makePage({ locator: () => locator, waitForSelector: async () => {} })
        const p = new Please(page)
        await p.clear('Field', '#input')
        if (cleared) PASS('clear() — memanggil locator.clear()')
        else FAIL('clear() tidak memanggil clear()')
    }

    // ── see ─────────────────────────────────────────────────────────────────
    console.log('\n[see]')
    {
        const locator = makeLocator('#input', {
            evaluate: async (fn) => fn({ tagName: 'INPUT' }),
            inputValue: async () => 'typed',
        })
        const page = makePage({ locator: () => locator, waitForSelector: async () => {} })
        const p = new Please(page)
        const val = await p.see('Field', '#input')
        if (val === 'typed') PASS('see() pada input — mengembalikan inputValue')
        else FAIL(`see() input nilai tidak sesuai: ${val}`)
    }
    {
        const locator = makeLocator('p', {
            evaluate: async (fn) => fn({ tagName: 'P' }),
            innerText: async () => 'paragraph text',
        })
        const page = makePage({ locator: () => locator, waitForSelector: async () => {} })
        const p = new Please(page)
        const val = await p.see('Para', 'p')
        if (val === 'paragraph text') PASS('see() pada elemen teks — mengembalikan innerText')
        else FAIL(`see() teks nilai tidak sesuai: ${val}`)
    }
    {
        const locator = makeLocator('#input', {
            evaluate: async (fn) => fn({ tagName: 'INPUT' }),
            inputValue: async () => 'tomsmith',
        })
        const page = makePage({ locator: () => locator, waitForSelector: async () => {} })
        const p = new Please(page)
        try {
            const val = await p.see('Username', '#input', 'tomsmith')
            if (val === 'tomsmith') PASS('see() dengan expected — assert lulus dan mengembalikan nilai')
            else FAIL(`see() dengan expected — nilai tidak sesuai: ${val}`)
        } catch (e) { FAIL(`see() dengan expected throw: ${e.message}`) }
    }
    {
        const locator = makeLocator('#input', {
            evaluate: async (fn) => fn({ tagName: 'INPUT' }),
            inputValue: async () => 'tomsmith',
        })
        const page = makePage({ locator: () => locator, waitForSelector: async () => {} })
        const p = new Please(page)
        try {
            await p.see('Username', '#input', 'admin')
            FAIL('see() dengan expected seharusnya throw saat tidak cocok')
        } catch (e) {
            if (e.message.includes('[Username]') && e.message.includes('admin') && e.message.includes('tomsmith'))
                PASS('see() dengan expected — throw dengan label + expected + received')
            else FAIL(`see() dengan expected pesan tidak sesuai: ${e.message}`)
        }
    }

    // ── scrollTo ────────────────────────────────────────────────────────────
    console.log('\n[scrollTo]')
    {
        let scrolled = false
        const locator = makeLocator('#el', { scrollIntoViewIfNeeded: async () => { scrolled = true } })
        const page = makePage({ locator: () => locator, waitForSelector: async () => {} })
        const p = new Please(page)
        await p.scrollTo('El', '#el')
        if (scrolled) PASS('scrollTo() — memanggil scrollIntoViewIfNeeded()')
        else FAIL('scrollTo() tidak memanggil scrollIntoViewIfNeeded()')
    }

    // ── uploadFile ──────────────────────────────────────────────────────────
    console.log('\n[uploadFile]')
    {
        let uploadedPath
        const locator = makeLocator('input[type=file]', { setInputFiles: async (p) => { uploadedPath = p } })
        const page = makePage({ locator: () => locator, waitForSelector: async () => {} })
        const p = new Please(page)
        await p.uploadFile('File Input', 'input[type=file]', '/tmp/file.txt')
        if (uploadedPath === '/tmp/file.txt') PASS('uploadFile() — memanggil setInputFiles() dengan path yang benar')
        else FAIL(`uploadFile() path tidak sesuai: ${uploadedPath}`)
    }

    // ── detectLocator ───────────────────────────────────────────────────────
    console.log('\n[detectLocator]')
    const cases = [
        ['//div',             'xpath=//div'],
        ['(//div)[1]',        'xpath=(//div)[1]'],
        ['#myId',             '#myId'],
        ['.myClass',          '.myClass'],
        ['[data-test="x"]',   '[data-test="x"]'],
        ['div > span',        'div > span'],
        ['h1',                'h1'],
        ['input',             'input'],
        ['form input.email',  'form input.email'],
    ]
    const p0 = new Please(makePage())
    for (const [selector, expected] of cases) {
        try {
            const result = p0.detectLocator(selector)
            if (result === expected) PASS(`detectLocator("${selector}") → "${result}"`)
            else FAIL(`detectLocator("${selector}") expected "${expected}", got "${result}"`)
        } catch (e) {
            FAIL(`detectLocator("${selector}") throw: ${e.message}`)
        }
    }
    {
        try {
            p0.detectLocator('tidakdikenal')
            FAIL('detectLocator() seharusnya throw untuk selector tidak dikenal')
        } catch (e) {
            if (e.message.includes('tidak dapat dikenali')) PASS('detectLocator() — throw untuk selector tidak dikenal')
            else FAIL(`detectLocator() pesan tidak sesuai: ${e.message}`)
        }
    }

    // ── toLocator ───────────────────────────────────────────────────────────
    console.log('\n[toLocator]')
    {
        let calledRole, calledOpts
        const page = makePage({ getByRole: (r, o) => { calledRole = r; calledOpts = o; return makeLocator('') } })
        const p = new Please(page)
        p.toLocator('role=button[name=Submit]')
        if (calledRole === 'button' && calledOpts?.name === 'Submit')
            PASS('toLocator() — role=button[name=Submit] memanggil getByRole("button", { name: "Submit" })')
        else FAIL(`toLocator() role+name salah: role=${calledRole}, name=${calledOpts?.name}`)
    }
    {
        let calledLabel
        const page = makePage({ getByLabel: (l) => { calledLabel = l; return makeLocator('') } })
        const p = new Please(page)
        p.toLocator('label=Email')
        if (calledLabel === 'Email') PASS('toLocator() — label=Email memanggil getByLabel("Email")')
        else FAIL(`toLocator() label salah: ${calledLabel}`)
    }
    {
        let calledSel
        const page = makePage({ locator: (s) => { calledSel = s; return makeLocator(s) } })
        const p = new Please(page)
        p.toLocator('#id')
        if (calledSel === '#id') PASS('toLocator() — #id memanggil page.locator("#id")')
        else FAIL(`toLocator() selector salah: ${calledSel}`)
    }
    {
        let calledRole, calledOpts
        const page = makePage({ getByRole: (r, o) => { calledRole = r; calledOpts = o; return makeLocator('') } })
        const p = new Please(page)
        p.toLocator('role=button')
        if (calledRole === 'button' && calledOpts === undefined)
            PASS('toLocator() — role=button memanggil getByRole("button") tanpa name')
        else FAIL(`toLocator() role tanpa name salah: role=${calledRole}, opts=${JSON.stringify(calledOpts)}`)
    }
    {
        let calledRole, calledOpts
        const page = makePage({ getByRole: (r, o) => { calledRole = r; calledOpts = o; return makeLocator('') } })
        const p = new Please(page)
        p.toLocator('button=Submit')
        if (calledRole === 'button' && calledOpts?.name === 'Submit')
            PASS('toLocator() — button=Submit memanggil getByRole("button", { name: "Submit" })')
        else FAIL(`toLocator() shorthand salah: role=${calledRole}, name=${calledOpts?.name}`)
    }
    {
        let calledRole, calledOpts
        const page = makePage({ getByRole: (r, o) => { calledRole = r; calledOpts = o; return makeLocator('') } })
        const p = new Please(page)
        p.toLocator('link=Masuk')
        if (calledRole === 'link' && calledOpts?.name === 'Masuk')
            PASS('toLocator() — link=Masuk memanggil getByRole("link", { name: "Masuk" })')
        else FAIL(`toLocator() link= shorthand salah: role=${calledRole}, name=${calledOpts?.name}`)
    }

    // ── screenshot ──────────────────────────────────────────────────────────
    console.log('\n[screenshot]')
    {
        const fs = require('fs')
        const path = require('path')
        const page = makePage({ screenshot: async ({ path: p }) => { if (p) fs.writeFileSync(p, '') } })
        const pl = new Please(page)
        const result = await pl.screenshot('login berhasil')
        const name = path.basename(result)
        if (name.startsWith('login_berhasil_') && name.endsWith('.png'))
            PASS(`screenshot() — nama file: "${name}"`)
        else FAIL(`screenshot() format nama tidak sesuai: "${name}"`)
        if (fs.existsSync(result)) { PASS('screenshot() — file tersimpan di disk'); fs.unlinkSync(result) }
        else FAIL('screenshot() — file tidak ditemukan di disk')
    }
    {
        const fs = require('fs')
        const path = require('path')
        const page = makePage({ screenshot: async ({ path: p }) => { if (p) fs.writeFileSync(p, '') } })
        const pl = new Please(page)
        const result = await pl.screenshot()
        const name = path.basename(result)
        if (/^\d{4}-\d{2}-\d{2}T/.test(name) && name.endsWith('.png'))
            PASS(`screenshot() tanpa label — nama berupa datetime: "${name}"`)
        else FAIL(`screenshot() tanpa label format tidak sesuai: "${name}"`)
        if (fs.existsSync(result)) fs.unlinkSync(result)
    }
    {
        const fs = require('fs')
        const path = require('path')
        const page = makePage({ screenshot: async ({ path: p }) => { if (p) fs.writeFileSync(p, '') } })
        const pl = new Please(page)
        const result = await pl.screenshot('login/gagal & retry!')
        const name = path.basename(result)
        if (!/[/&!]/.test(name)) PASS(`screenshot() — karakter spesial diganti _: "${name}"`)
        else FAIL(`screenshot() masih ada karakter spesial: "${name}"`)
        if (fs.existsSync(result)) fs.unlinkSync(result)
    }
    {
        const page = makePage({ screenshot: async () => { throw new Error('driver error') } })
        const p = new Please(page)
        try {
            await p.screenshot('test')
            FAIL('screenshot() seharusnya throw saat page.screenshot() gagal')
        } catch (e) {
            if (e.message === 'driver error') PASS('screenshot() — throw diteruskan dari driver')
            else FAIL(`screenshot() pesan tidak sesuai: ${e.message}`)
        }
    }

    console.log('\n─────────────────────────────────')
    if (process.exitCode === 1) console.error('Beberapa case GAGAL.')
    else console.log('Semua case LULUS.')
}

run()
