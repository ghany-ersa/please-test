# please.js

**please.js** adalah automation testing tool buatan sendiri berbasis Selenium WebDriver dan JavaScript. Dibangun di atas layer abstraksi `pleaseClass` yang menyederhanakan interaksi DOM agar test case bisa ditulis lebih ringkas dan ekspresif.

## Filosofi

Daripada menulis boilerplate Selenium berulang kali di setiap test, please.js membungkus operasi umum (klik, input, scroll, wait, assertion) ke dalam satu objek `please` yang bisa langsung dipakai di semua spec file.

## Struktur Project

```
please.js/
├── app.js              # Entry point — inisialisasi driver dan ekspos please & komponen
├── index.js            # Daftar spec yang dijalankan
├── master/
│   ├── input.js        # pleaseClass — inti dari semua aksi DOM
│   ├── assert.js       # Helper assertion (equal, notEqual, fail, checkTitle)
│   └── driver.js       # Inisialisasi Selenium WebDriver
├── components/
│   └── auth.js         # Komponen login (email/password & NIK/PIN)
├── feature/
│   ├── auth.spec.js    # Test suite autentikasi
│   └── multiApps.spec.js
├── data/
│   └── main.js         # URL dan data akun test
└── report/             # Output laporan mochawesome
```

## API please

`please` adalah instance dari `pleaseClass` — objek utama untuk berinteraksi dengan browser.

| Method | Deskripsi |
|---|---|
| `please.goTo({ url, title })` | Navigasi ke URL dan verifikasi title halaman |
| `please.checkWhere({ url, title })` | Cek posisi halaman saat ini |
| `please.click(name, type, id)` | Klik elemen dengan auto-scroll dan wait |
| `please.setInput(name, type, id, value)` | Isi input field |
| `please.setInputText(name, type, id, value)` | Isi input dan tekan Enter |
| `please.getInput(name, type, id)` | Ambil value dari input field |
| `please.getText(name, type, id)` | Ambil text dari elemen |
| `please.clear(type, id)` | Kosongkan input field |
| `please.uploadFile(name, type, id, path)` | Upload file |
| `please.scrollTo(name, type, id)` | Scroll ke elemen |
| `please.untilShow(name, type, id)` | Tunggu elemen muncul (default 20 detik) |
| `please.wait(ms)` | Jeda eksplisit (default 2000ms) |
| `please.equal(type, actual, expected)` | Assertion equal |
| `please.notEqual(type, actual, expected)` | Assertion not equal |
| `please.fail(message)` | Gagalkan test secara manual |
| `please.newTab()` | Buka browser baru |
| `please.quit()` | Tutup browser |

**Selector yang didukung:** `id`, `name`, `css`, `xpath`, `link`

## Membuat Komponen

Komponen membungkus aksi-aksi yang sering dipakai ulang untuk satu fitur tertentu.

```js
// components/auth.js
class Auth {
    constructor(master) { this.please = master }

    async loginEmail(user) {
        await this.please.setInput('input email', 'id', 'email', user.email)
        await this.please.setInput('input password', 'id', 'password', user.password)
        await this.please.click('button login', 'xpath', '//button[@type="submit"]')
    }
}
module.exports = Auth
```

## Menulis Test

```js
// feature/auth.spec.js
const { please, AUTH } = require('../app')
const { URL, ACCOUNT } = require('../data/main')

describe('Login', () => {
    it('login berhasil', async () => {
        await please.goTo(URL.loginEmailPassword)
        await AUTH.loginEmail(ACCOUNT.main)
        await please.checkWhere(URL.main)
    })
})
```

## Setup

Pastikan [Node.js](https://nodejs.org) sudah terinstall, lalu install dependencies menggunakan Yarn atau npm:

```sh
# menggunakan Yarn
yarn install

# menggunakan npm
npm install
```

Salin `.env.example` menjadi `.env` dan isi dengan nilai yang sesuai:

```sh
cp .env.example .env
```

```env
BASE_URL=http://your-app-url.com

ACCOUNT_EMAIL=your@email.com
ACCOUNT_PASSWORD=yourpassword

ACCOUNT_NIK=your_nik
ACCOUNT_PIN=your_pin

STORE_SLUG=your_store_slug
```

> File `.env` tidak boleh di-commit — sudah masuk `.gitignore`.

Pastikan versi ChromeDriver sesuai dengan versi Google Chrome yang terinstall.

## Menjalankan Test

```sh
# Jalankan semua test
yarn test
# atau
npm test

# Jalankan test dengan laporan HTML (output di report/v2/index.html)
yarn report
# atau
npm run report
```

## Prasyarat

- Node.js >= 8.0.0
- Yarn >= 1.0.0 atau npm >= 6.0.0
- Google Chrome + ChromeDriver
