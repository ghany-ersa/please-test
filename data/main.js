require('dotenv').config()

const base_url = process.env.BASE_URL
const store_slug = process.env.STORE_SLUG

module.exports = {
    URL: {
        main: {
            url: `${base_url}/dashboard`,
            title: 'Backoffice iBUS'
        },
        loginEmailPassword: {
            url: `${base_url}/login`,
            title: 'Login BACKOFFICE:POS'
        },
        loginNIKPIN: {
            url: `${base_url}/login/store/${store_slug}`,
            title: 'Login BACKOFFICE:POS'
        },
        loginNIKPINSalah: {
            url: `${base_url}/login/store/${store_slug}-salah`,
            title: 'Login BACKOFFICE:POS'
        },
    },
    ACCOUNT: {
        main: {
            email: process.env.ACCOUNT_EMAIL,
            password: process.env.ACCOUNT_PASSWORD
        },
        salahEmail: {
            email: 'invalid@email',
            password: process.env.ACCOUNT_PASSWORD
        },
        salahPassword: {
            email: process.env.ACCOUNT_EMAIL,
            password: 'wrongpassword'
        },
        kosongSemua: {
            email: '',
            password: ''
        },
        kosongPassword: {
            email: process.env.ACCOUNT_EMAIL,
            password: ''
        },
        kosongEmail: {
            email: '',
            password: process.env.ACCOUNT_PASSWORD
        },
        NIKPIN: {
            nik: process.env.ACCOUNT_NIK,
            pin: process.env.ACCOUNT_PIN
        },
        companyLain: {
            nik: '000000',
            pin: '000000'
        },
        outletLain: {
            nik: '0011',
            pin: '111111'
        },
        NIKPINKosong: {
            nik: '',
            pin: ''
        },
        nikKosong: {
            nik: '',
            pin: process.env.ACCOUNT_PIN
        },
        pinKosong: {
            nik: process.env.ACCOUNT_NIK,
            pin: ''
        }
    }
}
