# please-test

Shorthand helper untuk `@playwright/test` — locator ekspresif dan pesan error yang deskriptif.

`page` datang dari fixture `@playwright/test`, please-test hanya menyediakan shorthand di atasnya.

---

## Instalasi

Pastikan Node.js >= 14 sudah terinstall.

```bash
npm install please-test @playwright/test && npx playwright install
```

```js
const { test } = require('@playwright/test')
const Please = require('please-test')

test('login berhasil', async ({ page }) => {
    const please = new Please(page)

    await please.goto({ url: 'https://myapp.com/login' })
    await please.fill('Username', '#username', 'student')
    await please.fill('Password', '#password', 'secret')
    await please.click('Tombol Login', 'button=Login')
    await please.see('Pesan Sukses', 'h1', 'Dashboard')
})
```

---

## API

`please` adalah instance dari `new Please(page)`.

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

### Baca & Assert

| Method | Deskripsi |
|---|---|
| `see(label, selector, expected?, time?)` | Baca konten elemen. Jika `expected` diberikan, throw jika tidak cocok — tetap mengembalikan nilai aktual |

`see` otomatis membaca `value` untuk `input`/`textarea`/`select`, dan `innerText` untuk elemen lain.

### Tunggu

| Method | Deskripsi |
|---|---|
| `untilShow(label, selector, time?)` | Tunggu elemen muncul (default 20 detik) |
| `wait(ms?)` | Jeda eksplisit (default 2000ms) |

### Screenshot

| Method | Deskripsi |
|---|---|
| `screenshot(label?)` | Simpan screenshot ke `screenshots/label_datetime.png` |

---

## Selector

Semua method yang menerima `selector` otomatis mendeteksi tipe locator:

| Format | Contoh |
|---|---|
| `#id` | `#username` |
| `text=` | `text=Klik di sini` |
| `role=` | `role=button[name=Submit]` |
| `label=` | `label=Email` |
| `role=Name` (shorthand) | `button=Login`, `link=Masuk`, `checkbox=Setuju` |
| CSS selector | `.btn-primary`, `[data-id="x"]` |
| XPath | `//button[@type="submit"]` |
| Tag HTML | `h1`, `textarea` |

> Shorthand `role=Name` didukung untuk semua ARIA role yang valid di Playwright: `button=Login`, `link=Masuk`, `checkbox=Setuju`, `textbox=Email`, `combobox=Negara`, dst.

---

## Lisensi

MIT
