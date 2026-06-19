# please-test

**please-test** adalah shorthand helper untuk `@playwright/test` yang membuat automation test lebih ringkas dan ekspresif.

please-test **tidak** mengelola browser — `page` datang dari fixture `@playwright/test`. please-test hanya menyediakan shorthand untuk operasi umum seperti klik, input, scroll, wait, dan screenshot, dengan pesan error yang lebih deskriptif.

## Prasyarat

- Node.js >= 14.0.0
- `@playwright/test` — jalankan sekali setelah install:

```sh
npx playwright install
```

## Instalasi

```sh
npm install please-test @playwright/test
```

> `@playwright/test` adalah peer dependency — perlu diinstall di project kamu.

---

## Memulai

```js
// feature/login.spec.js
const { test, expect } = require('@playwright/test')
const Please = require('please-test')

test('login berhasil', async ({ page }) => {
    const please = new Please(page)

    await please.goto({ url: 'https://myapp.com/login', title: 'Login' })
    await please.fill('input email', '#email', 'user@mail.com')
    await please.fill('input password', '#password', 'secret')
    await please.click('button login', 'button=Login')
    await please.verifyPage({ url: 'https://myapp.com/dashboard', title: 'Dashboard' })
    await please.see('Pesan Selamat Datang', 'h1', 'Selamat datang!')
})
```

### Jalankan test

```sh
npx playwright test
```

---

## Struktur Project yang Direkomendasikan

```
my-project/
├── playwright.config.js
├── components/         # Aksi berulang per fitur
│   ├── auth.js
│   └── checkout.js
├── tests/              # Test suite per fitur
│   ├── login.spec.js
│   └── checkout.spec.js
└── package.json
```

```js
// playwright.config.js
const { defineConfig } = require('@playwright/test')

module.exports = defineConfig({
    testDir: './tests',
    timeout: 30000,
    use: {
        headless: true,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
})
```

---

## Membungkus Aksi ke dalam Komponen

```js
// components/auth.js
class Auth {
    constructor(please) { this.please = please }

    async login(email, password) {
        await this.please.fill('input email', '#email', email)
        await this.please.fill('input password', '#password', password)
        await this.please.click('button login', 'button=Login')
    }

    async logout() {
        await this.please.click('menu profil', '.user-menu')
        await this.please.click('button logout', 'text=Logout')
    }
}
module.exports = Auth
```

```js
// tests/login.spec.js
const { test, expect } = require('@playwright/test')
const Please = require('please-test')
const Auth = require('../components/auth')

test('login berhasil', async ({ page }) => {
    const please = new Please(page)
    const auth = new Auth(please)

    await please.goto({ url: 'https://myapp.com/login', title: 'Login' })
    await auth.login('user@mail.com', 'secret')
    await please.verifyPage({ url: 'https://myapp.com/dashboard', title: 'Dashboard' })
})
```

---

## API

`please` adalah instance dari `Please(page)`.

### Constructor

```js
const please = new Please(page)   // page dari fixture @playwright/test
```

### Navigasi

| Method | Deskripsi |
|---|---|
| `goto({ url, title? })` | Navigasi ke URL; jika `title` diberikan, validasi title halaman |
| `verifyPage({ url?, title? })` | Verifikasi URL dan/atau title halaman saat ini |
| `url()` | Ambil URL halaman saat ini |
| `title()` | Ambil title halaman saat ini |

### Interaksi

| Method | Deskripsi |
|---|---|
| `click(label, selector, time?)` | Klik elemen; `time` (ms) menunda klik setelah jeda |
| `fill(label, selector, value)` | Isi input field |
| `fillAndEnter(label, selector, value)` | Isi input dan tekan Enter |
| `clear(label, selector)` | Kosongkan input field |
| `scrollTo(label, selector)` | Scroll ke elemen |
| `uploadFile(label, selector, path)` | Upload file via `input[type=file]` |
| `datepicker(label, selector, value)` | Isi input datepicker |

### Baca Nilai

| Method | Deskripsi |
|---|---|
| `see(label, selector, expected?, time?)` | Baca konten elemen — otomatis ambil `value` untuk input/textarea/select, `innerText` untuk elemen lain. Jika `expected` diberikan, throw jika tidak cocok (tetap mengembalikan nilai aktual) |

### Tunggu

| Method | Deskripsi |
|---|---|
| `untilShow(label, selector, time?)` | Tunggu elemen muncul (default 20 detik); throw dengan pesan `label` jika gagal |
| `wait(ms?)` | Jeda eksplisit (default 2000ms) |

### Screenshot

| Method | Deskripsi |
|---|---|
| `screenshot(label?)` | Ambil screenshot, simpan ke folder `screenshots/` dengan nama `label_datetime.png` |

> Untuk screenshot otomatis saat failure dan video recording, gunakan konfigurasi bawaan `@playwright/test` di `playwright.config.js`.

---

## Auto-detect Selector

Semua method yang menerima `selector` otomatis mendeteksi tipe locator dari format string:

| Format | Tipe | Contoh |
|---|---|---|
| Diawali `//` atau `(//` | XPath | `//button[@type="submit"]` |
| Diawali `#` | ID | `#email` |
| Diawali `text=` | Text content | `text=Klik di sini` |
| Diawali `role=` | ARIA role | `role=button`, `role=button[name=Submit]` |
| Diawali `label=` | Label asosiasi | `label=Email` |
| `tag=Name` (shorthand) | ARIA role + name | `button=Submit`, `a=Masuk`, `select=Kota` |
| Diawali `.`, `[`, atau mengandung karakter CSS | CSS Selector | `.btn-primary`, `form > button`, `[data-id="x"]` |
| Nama tag HTML (`div`, `h1`, `input`, dst.) | CSS Tag | `h1`, `textarea` |

> Shorthand `tag=Name` didukung untuk: `button`, `a`, `input`, `select`, `textarea`, `checkbox`, `radio`.

---

## Lisensi

MIT
