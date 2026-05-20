# please.js

**please.js** adalah Selenium WebDriver abstraction library untuk JavaScript yang menyederhanakan interaksi DOM agar automation test bisa ditulis lebih ringkas dan ekspresif.

## Filosofi

Daripada menulis boilerplate Selenium berulang kali di setiap test, please.js membungkus operasi umum (klik, input, scroll, wait, assertion) ke dalam satu objek `please` yang bisa langsung dipakai di semua spec file.

## Instalasi

```sh
npm install please.js selenium-webdriver
```

> `selenium-webdriver` adalah peer dependency — perlu diinstall di project kamu. ChromeDriver dikelola otomatis oleh `selenium-manager` bawaan Selenium 4.

## Penggunaan

### 1. Setup

Buat `app.js` sebagai entry point yang menginisialisasi browser dan mengekspos `please`:

```js
// app.js
const { Builder } = require('selenium-webdriver')
const pleaseClass = require('please.js')

const driver = new Builder().forBrowser('chrome').build()
driver.manage().window().maximize()

const please = new pleaseClass(driver)
module.exports = { please }
```

### 2. Test sederhana

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
        await please.fill('input password', '#password', 'wrongpassword')
        await please.click('button login', '//button[@type="submit"]')
        await please.checkWhere({ url: 'https://myapp.com/login', title: 'Login' })
    })
})
```

### 3. Membungkus aksi berulang ke dalam Komponen

Kalau aksi yang sama dipakai di banyak test (seperti login), bungkus ke dalam komponen:

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
const { Builder } = require('selenium-webdriver')
const pleaseClass = require('please.js')
const Auth = require('./components/auth')

const driver = new Builder().forBrowser('chrome').build()
driver.manage().window().maximize()

const please = new pleaseClass(driver)

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

### 4. Membaca dan memverifikasi nilai

```js
it('menampilkan nama user setelah login', async() => {
    await AUTH.login('user@mail.com', 'secret')

    const nama = await please.getText('nama user', '.user-display-name')
    await please.equal(nama, 'John Doe')

    const inputNama = await please.getValue('field nama', '#profile-name')
    await please.notEqual(inputNama, '')
})
```

### 5. Menjalankan test di beberapa browser sekaligus

```js
// app.js
const { Builder } = require('selenium-webdriver')
const pleaseClass = require('please.js')

const driverA = new Builder().forBrowser('chrome').build()
driverA.manage().window().maximize()

const please = new pleaseClass(driverA)
const pleaseB = new pleaseClass(await please.launchBrowser())

module.exports = { please, pleaseB }
```

```js
// feature/multiTab.spec.js
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

### 6. Struktur project yang direkomendasikan

```
my-project/
├── app.js              # Inisialisasi driver dan ekspos please & komponen
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
        "please.js": "^1.0.0",
        "selenium-webdriver": "^4.0.0"
    },
    "devDependencies": {
        "mocha": "^11.0.0",
        "dotenv": "^16.0.0"
    }
}
```

## Struktur Project

```
please.js/
├── master/
│   ├── input.js        # pleaseClass — inti dari semua aksi DOM
│   └── assert.js       # Helper assertion (equal, notEqual, fail, checkTitle)
└── example/            # Contoh implementasi lengkap
    ├── app.js
    ├── index.js
    ├── components/
    ├── feature/
    └── data/
```

## API please

`please` adalah instance dari `pleaseClass`.

### Navigasi

| Method | Deskripsi |
|---|---|
| `please.goTo({ url, title })` | Navigasi ke URL dan verifikasi title halaman |
| `please.checkWhere({ url, title })` | Verifikasi posisi halaman saat ini |

### Interaksi

| Method | Deskripsi |
|---|---|
| `please.click(label, selector, time?)` | Klik elemen dengan auto-scroll dan wait |
| `please.fill(label, selector, value)` | Isi input field |
| `please.fillAndEnter(label, selector, value)` | Isi input dan tekan Enter |
| `please.clear(label, selector)` | Kosongkan input field |
| `please.uploadFile(label, selector, path)` | Upload file |
| `please.scrollTo(label, selector)` | Scroll ke elemen |

### Baca Nilai

| Method | Deskripsi |
|---|---|
| `please.getValue(label, selector)` | Ambil value dari input field |
| `please.getText(label, selector)` | Ambil text dari elemen |

### Tunggu

| Method | Deskripsi |
|---|---|
| `please.untilShow(label, selector)` | Tunggu elemen muncul (default 20 detik) |
| `please.wait(ms)` | Jeda eksplisit (default 2000ms) |

### Assertion

| Method | Deskripsi |
|---|---|
| `please.equal(actual, expected, message?)` | Assertion equal |
| `please.notEqual(actual, expected, message?)` | Assertion not equal |
| `please.fail(message)` | Gagalkan test secara manual |

### Browser

| Method | Deskripsi |
|---|---|
| `please.launchBrowser()` | Buka browser baru dan kembalikan instance-nya |
| `please.quit()` | Tutup browser |

### Auto-detect Selector

Semua method yang menerima `selector` otomatis mendeteksi tipe locator dari format string:

| Format | Tipe | Contoh |
|---|---|---|
| Diawali `//` atau `(//` | XPath | `//button[@type="submit"]` |
| Diawali `#` | ID | `#email` |
| Diawali `.`, `[`, atau mengandung `.`, `#`, `[`, `:`, spasi, `>`, `+`, `~` | CSS | `.btn-primary`, `button.primary`, `form > button` |
| Diawali `link=` | Link Text | `link=Klik di sini` |
| Teks biasa | Name | `email` |

## Membuat Komponen

Komponen membungkus aksi yang sering dipakai ulang untuk satu fitur tertentu.

```js
// components/auth.js
class Auth {
    constructor(master) { this.please = master }

    async loginEmail(user) {
        await this.please.fill('input email', '#email', user.email)
        await this.please.fill('input password', '#password', user.password)
        await this.please.click('button login', '//button[@type="submit"]')
    }
}
module.exports = Auth
```

## Prasyarat

- Node.js >= 14.0.0
- Google Chrome (ChromeDriver dikelola otomatis)

## Lisensi

MIT
