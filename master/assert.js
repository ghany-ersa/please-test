const assert = require('assert')

module.exports = {
    checkTitle: async(actual, expected) => {
        assert.equal(actual.url, expected.url,
            `URL seharusnya "${expected.url}", bukan "${actual.url}".`)
        assert.equal(actual.title, expected.title,
            `Judul halaman seharusnya "${expected.title}", bukan "${actual.title}".`)
    },

    equal: async(actual, expected, message) => {
        assert.equal(actual, expected,
            message !== undefined ? message : `Nilai seharusnya "${expected}", bukan "${actual}".`)
    },

    notEqual: (actual, expected, message) => {
        assert.notEqual(actual, expected,
            message !== undefined ? message : `Nilai seharusnya bukan "${expected}".`)
    },

    fail: (message) => {
        assert.fail(message !== undefined ? message : 'Test digagalkan tanpa pesan.')
    }
}
