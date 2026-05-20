# please.js

**please.js** adalah automation testing tool buatan sendiri berbasis Selenium WebDriver dan JavaScript. Dibangun di atas layer abstraksi `pleaseClass` yang menyederhanakan interaksi DOM agar test case bisa ditulis lebih ringkas dan ekspresif.

## Filosofi

Daripada menulis boilerplate Selenium berulang kali di setiap test, please.js membungkus operasi umum (klik, input, scroll, wait, assertion) ke dalam satu objek `please` yang bisa langsung dipakai di semua spec file.

## Prasyarat

- Node.js >= 8.0.0
- Yarn >= 1.0.0 atau npm >= 6.0.0
- Google Chrome + ChromeDriver (versi harus sesuai dengan Chrome yang terinstall)

## Setup

Pastikan [Node.js](https://nodejs.org) sudah terinstall, lalu install dependencies:

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

## Struktur Project

```
please.js/
├── app.js              # Entry point — inisialisasi driver dan ekspos please & komponen
├── index.js            # Daftar spec yang dijalankan — tambahkan require() spec baru di sini
├── master/
│   ├── input.js        # pleaseClass — inti dari semua aksi DOM
│   └── assert.js       # Helper assertion (equal, notEqual, fail, checkTitle)
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

Semua method yang menerima `selector` akan otomatis mendeteksi tipe locator berdasarkan format string:

| Format | Tipe | Contoh |
|---|---|---|
| Diawali `//` atau `(//` | XPath | `//button[@type="submit"]` |
| Diawali `#` | ID | `#email` |
| Diawali `.`, `[`, atau mengandung spasi/`>`/`:` | CSS | `.btn-primary`, `form > button` |
| Diawali `link=` | Link Text | `link=Klik di sini` |
| Teks biasa | Name | `email` |

## Membuat Komponen

Komponen membungkus aksi-aksi yang sering dipakai ulang untuk satu fitur tertentu.

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

Daftarkan spec yang ingin dijalankan di `index.js`:

```js
// index.js
require('./feature/auth.spec')
require('./feature/multiApps.spec')
```

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
