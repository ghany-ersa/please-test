# please-test

**please-test** adalah Playwright abstraction library untuk JavaScript yang menyederhanakan interaksi DOM agar automation test bisa ditulis lebih ringkas dan ekspresif.

## Filosofi

Daripada menulis boilerplate Playwright berulang kali di setiap test, please-test membungkus operasi umum (klik, input, scroll, wait, assertion) ke dalam satu objek `please` yang bisa langsung dipakai di semua spec file.

## Prasyarat

- Node.js >= 14.0.0
- Playwright browsers — jalankan sekali setelah install:

```sh
npx playwright install
```

## Instalasi

```sh
npm install please-test playwright
```

> `playwright` adalah peer dependency — perlu diinstall di project kamu.

---

## Memulai

### 1. Inisialisasi

Buat `app.js` sebagai entry point yang menginisialisasi browser dan mengekspos `please`:

```js
// app.js
const Please = require('please-test')

const please = new Please()                        // headless chromium (default)
// const please = new Please({ headed: true })     // tampilkan browser
// const please = new Please({ browser: 'firefox' }) // ganti browser

module.exports = { please }
```

### 2. Tulis test pertama

```js
// feature/login.spec.js
const { please } = require('../app')

describe('Login', () => {
    it('menampilkan halaman login', async() => {
        await please.goTo({ url: 'https://myapp.com/login', title: 'Login' })
    })

    it('login berhasil', async() => {
        await please.goTo({ url: 'https://myapp.com/login', title: 'Login' })
        await please.fill('input email', '#email', 'user@mail.com')
        await please.fill('input password', '#password', 'secret')
        await please.click('button login', 'button=Login')
        await please.checkWhere({ url: 'https://myapp.com/dashboard', title: 'Dashboard' })
    })

    it('login gagal dengan password salah', async() => {
        await please.goTo({ url: 'https://myapp.com/login', title: 'Login' })
        await please.fill('input email', '#email', 'user@mail.com')
        await please.fill('input password', '#password', 'salah')
        await please.click('button login', 'button=Login')
        await please.checkWhere({ url: 'https://myapp.com/login', title: 'Login' })
    })
})
```

### 3. Jalankan test

```sh
node index.js
```

Atau dengan mocha:

```sh
mocha --recursive --timeout 100000 index.js
```

---

## Struktur Project yang Direkomendasikan

```
my-project/
├── app.js              # Inisialisasi please dan komponen
├── index.js            # Daftar spec yang dijalankan
├── components/         # Aksi berulang per fitur
│   ├── auth.js
│   └── checkout.js
├── feature/            # Test suite per fitur
│   ├── login.spec.js
│   └── checkout.spec.js
├── data/               # URL dan data test
│   └── main.js
├── .env                # Konfigurasi environment (tidak di-commit)
└── package.json
```

```js
// index.js — aktifkan spec yang ingin dijalankan
require('./feature/login.spec')
require('./feature/checkout.spec')
```

```json
// package.json
{
    "scripts": {
        "test": "mocha --recursive --timeout 100000 index.js"
    },
    "dependencies": {
        "please-test": "^1.1.0",
        "playwright": "^1.0.0"
    },
    "devDependencies": {
        "mocha": "^11.0.0"
    }
}
```

---

## Membungkus Aksi ke dalam Komponen

Kalau aksi yang sama dipakai di banyak test (seperti login), bungkus ke dalam komponen agar test lebih ringkas dan mudah dirawat:

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
// app.js — daftarkan komponen di sini
const Please = require('please-test')
const Auth = require('./components/auth')

const please = new Please()

module.exports = {
    please,
    AUTH: new Auth(please)
}
```

```js
// feature/login.spec.js — test jadi lebih ringkas
const { please, AUTH } = require('../app')

describe('Login', () => {
    it('login berhasil', async() => {
        await please.goTo({ url: 'https://myapp.com/login', title: 'Login' })
        await AUTH.login('user@mail.com', 'secret')
        await please.checkWhere({ url: 'https://myapp.com/dashboard', title: 'Dashboard' })
        await AUTH.logout()
    })
})
```

---

## Menjalankan Dua Browser Sekaligus

Buat dua instance `Please` secara terpisah untuk skenario multi-user atau multi-browser:

```js
// app.js
const Please = require('please-test')

const please        = new Please({ browser: 'chromium' })
const pleaseFirefox = new Please({ browser: 'firefox' })

module.exports = { please, pleaseFirefox }
```

```js
// feature/multiUser.spec.js
const { please, pleaseFirefox } = require('../app')

describe('Multi browser', () => {
    it('dua user login dari browser berbeda', async() => {
        await please.goTo({ url: 'https://myapp.com/login', title: 'Login' })
        await pleaseFirefox.goTo({ url: 'https://myapp.com/login', title: 'Login' })

        await please.fill('email user A', '#email', 'userA@mail.com')
        await pleaseFirefox.fill('email user B', '#email', 'userB@mail.com')

        await please.quit()
        await pleaseFirefox.quit()
    })
})
```

---

## API

`please` adalah instance dari `Please`.

### Constructor

```js
new Please()                           // headless chromium (default)
new Please({ headed: true })           // browser ditampilkan
new Please({ browser: 'firefox' })     // pilih browser: chromium | firefox | webkit
new Please({ video: true })            // rekam video sesi
new Please({ headed: true, browser: 'webkit', video: true }) // kombinasi
```

### Navigasi

| Method | Deskripsi |
|---|---|
| `goTo({ url, title })` | Navigasi ke URL dan verifikasi title halaman |
| `checkWhere({ url, title })` | Verifikasi URL dan title halaman saat ini |
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
| `uploadFile(label, selector, path)` | Upload file via input[type=file] |
| `datepicker(label, selector, value)` | Isi input datepicker |

### Baca Nilai

| Method | Deskripsi |
|---|---|
| `see(label, selector, time?)` | Baca konten elemen — otomatis ambil `value` untuk input/textarea/select, `text` untuk elemen lain |
| `getValue(label, selector, time?)` | Ambil `value` dari input field |
| `getText(label, selector, time?)` | Ambil teks dari elemen |

### Tunggu

| Method | Deskripsi |
|---|---|
| `untilShow(label, selector, time?)` | Tunggu elemen muncul (default 20 detik) |
| `wait(ms?)` | Jeda eksplisit (default 2000ms) |

### Assertion

| Method | Deskripsi |
|---|---|
| `equal(actual, expected, message?)` | Gagal jika `actual !== expected` |
| `notEqual(actual, expected, message?)` | Gagal jika `actual === expected` |
| `fail(message?)` | Gagalkan test secara manual |
| `soft()` | Kembalikan `SoftAssert` — kumpulkan kegagalan, baru throw di akhir via `.assert()` |

### Multi-tab

| Method | Deskripsi |
|---|---|
| `newTab()` | Buka tab baru, kembalikan page object |
| `switchTab(tab)` | Pindah active page ke tab yang dipilih |
| `closeTab(tab)` | Tutup tab tertentu |

### Dialog

| Method | Deskripsi |
|---|---|
| `acceptDialog(text?)` | Accept alert/confirm/prompt berikutnya; `text` untuk prompt |
| `dismissDialog()` | Dismiss dialog berikutnya |
| `onDialog(handler)` | Daftarkan handler permanen untuk semua dialog |

### Screenshot & Video

| Method | Deskripsi |
|---|---|
| `screenshot(label?)` | Ambil screenshot, simpan ke folder `screenshots/` |
| `saveVideo(name?)` | Simpan video sesi ke folder `videos/` (perlu `video: true`) |
| `setTestName(name)` | Set nama test untuk prefix screenshot otomatis |

### Lifecycle

| Method | Deskripsi |
|---|---|
| `quit()` | Tutup browser |

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

## Soft Assertion

Gunakan `soft()` untuk mengumpulkan semua kegagalan sebelum throw — berguna saat ingin memvalidasi banyak field sekaligus:

```js
const sa = please.soft()
sa.equal(namaUser, 'Admin')
sa.equal(roleUser, 'superuser')
sa.notEqual(statusAkun, 'nonaktif')
sa.assert() // throw sekaligus dengan semua kegagalan
```

---

## Lisensi

MIT
