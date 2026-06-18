# please-test

**please-test** adalah Selenium WebDriver abstraction library untuk JavaScript yang menyederhanakan interaksi DOM agar automation test bisa ditulis lebih ringkas dan ekspresif.

## Filosofi

Daripada menulis boilerplate Selenium berulang kali di setiap test, please-test membungkus operasi umum (klik, input, scroll, wait, assertion) ke dalam satu objek `please` yang bisa langsung dipakai di semua spec file.

## Prasyarat

- Node.js >= 14.0.0
- Google Chrome (ChromeDriver dikelola otomatis oleh `selenium-manager` bawaan Selenium 4)

## Instalasi

```sh
npm install please-test selenium-webdriver
```

> `selenium-webdriver` adalah peer dependency — perlu diinstall di project kamu.

---

## Memulai

### 1. Inisialisasi

Buat `app.js` sebagai entry point yang menginisialisasi browser dan mengekspos `please`:

```js
// app.js
const pleaseClass = require('please-test')

const please = new pleaseClass()         // headless (default)
// const please = new pleaseClass({ headed: true })  // tampilkan browser

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
        await please.click('button login', '//button[@type="submit"]')
        await please.checkWhere({ url: 'https://myapp.com/dashboard', title: 'Dashboard' })
    })

    it('login gagal dengan password salah', async() => {
        await please.goTo({ url: 'https://myapp.com/login', title: 'Login' })
        await please.fill('input email', '#email', 'user@mail.com')
        await please.fill('input password', '#password', 'salah')
        await please.click('button login', '//button[@type="submit"]')
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
        "please-test": "^1.0.0",
        "selenium-webdriver": "^4.0.0"
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
        await this.please.click('button login', '//button[@type="submit"]')
    }

    async logout() {
        await this.please.click('menu profil', '.user-menu')
        await this.please.click('button logout', 'link=Logout')
    }
}
module.exports = Auth
```

```js
// app.js — daftarkan komponen di sini
const pleaseClass = require('please-test')
const Auth = require('./components/auth')

const please = new pleaseClass()

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

Buat dua instance `pleaseClass` secara terpisah untuk skenario multi-user:

```js
// app.js
const pleaseClass = require('please-test')

const please  = new pleaseClass()
const pleaseB = new pleaseClass()

module.exports = { please, pleaseB }
```

```js
// feature/multiUser.spec.js
const { please, pleaseB } = require('../app')

describe('Multi browser', () => {
    it('dua user login bersamaan', async() => {
        await please.goTo({ url: 'https://myapp.com/login', title: 'Login' })
        await pleaseB.goTo({ url: 'https://myapp.com/login', title: 'Login' })

        await please.fill('email user A', '#email', 'userA@mail.com')
        await pleaseB.fill('email user B', '#email', 'userB@mail.com')

        await please.quit()
        await pleaseB.quit()
    })
})
```

---

## API

`please` adalah instance dari `pleaseClass`.

### Constructor

```js
new pleaseClass()                  // headless (default)
new pleaseClass({ headed: false }) // headless eksplisit
new pleaseClass({ headed: true })  // browser ditampilkan
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

### Lifecycle

| Method | Deskripsi |
|---|---|
| `quit()` | Tutup browser |

---

## Auto-detect Selector

Semua method yang menerima `selector` otomatis mendeteksi tipe locator dari format string — tidak perlu menentukan tipe secara manual:

| Format | Tipe | Contoh |
|---|---|---|
| Diawali `//` atau `(//` | XPath | `//button[@type="submit"]` |
| Diawali `#` | ID | `#email` |
| Diawali `link=` | Link Text | `link=Klik di sini` |
| Diawali `.`, `[`, atau mengandung karakter CSS (spasi, `>`, `+`, `~`, `.`, `#`, `[`, `:`) | CSS Selector | `.btn-primary`, `form > button`, `[data-id="x"]` |
| Nama tag HTML (`div`, `h1`, `span`, `input`, dst.) | CSS Tag | `h1`, `button`, `textarea` |
| Teks biasa lainnya | Name | `username`, `email` |

---

## Lisensi

MIT
