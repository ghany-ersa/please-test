const { please, AUTH } = require('../app')
const { URL, ACCOUNT } = require('../data/main')

describe('Login Email & Password', () => {
    it('Menampilkan halaman login', async() => {
        await please.goTo(URL.loginEmailPassword)
    })

    it('Login gagal (email salah)', async() => {
        await please.goTo(URL.loginEmailPassword)
        await AUTH.loginEmail(ACCOUNT.salahEmail)
        await please.checkWhere(URL.loginEmailPassword)
    })
    it('Login gagal (password salah)', async() => {
        await please.goTo(URL.loginEmailPassword)
        await AUTH.loginEmail(ACCOUNT.salahPassword)
        await please.checkWhere(URL.loginEmailPassword)
    })
    it('Login gagal (email dan password dikosongkan)', async() => {
        await please.goTo(URL.loginEmailPassword)
        await AUTH.loginEmail(ACCOUNT.kosongSemua)
        await please.checkWhere(URL.loginEmailPassword)
    })
    it('Login gagal (email di isi dan password dikosongkan)', async() => {
        await please.goTo(URL.loginEmailPassword)
        await AUTH.loginEmail(ACCOUNT.kosongPassword)
        await please.checkWhere(URL.loginEmailPassword)
    })
    it('Login gagal (email dikosongkan dan password di isi)', async() => {
        await please.goTo(URL.loginEmailPassword)
        await AUTH.loginEmail(ACCOUNT.kosongEmail)
        await please.checkWhere(URL.loginEmailPassword)
    })

    it('Login berhasil', async() => {
        await please.goTo(URL.loginEmailPassword)
        await AUTH.loginEmail(ACCOUNT.main)
        await please.checkWhere(URL.main)
        await AUTH.logout()
    })
})

describe('Login NIK & PIN', () => {
    it('login url salah', async() => {
        await please.goTo(URL.loginNIKPINSalah)
        please.notEqual(please.title(), URL.main.title, 'Harusnya alamat url nik pin salah')
    })
    it('nik pin company lain', async() => {
        await please.goTo(URL.loginNIKPIN)
        await AUTH.loginNIK(ACCOUNT.companyLain)
        await please.checkWhere(URL.loginNIKPIN)
    });
    it('acount outlet lain', async() => {
        await please.goTo(URL.loginNIKPIN)
        await AUTH.loginNIK(ACCOUNT.outletLain)
        await please.checkWhere(URL.loginNIKPIN)
    });
    it('nik & pin kosong', async() => {
        await please.goTo(URL.loginNIKPIN)
        await AUTH.loginNIK(ACCOUNT.NIKPINKosong)
        await please.checkWhere(URL.loginNIKPIN)
    });
    it('nik kosong', async() => {
        await please.goTo(URL.loginNIKPIN)
        await AUTH.loginNIK(ACCOUNT.nikKosong)
        await please.checkWhere(URL.loginNIKPIN)
    });
    it('pin kosong', async() => {
        await please.goTo(URL.loginNIKPIN)
        await AUTH.loginNIK(ACCOUNT.pinKosong)
        await please.checkWhere(URL.loginNIKPIN)
    });
    it('Login berhasil', async() => {
        await please.goTo(URL.loginNIKPIN)
        await AUTH.loginNIK(ACCOUNT.NIKPIN)
        await please.checkWhere(URL.main)
    })
})