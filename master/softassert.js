const assert = require('assert')

class SoftAssert {
    constructor() {
        this._errors = []
    }

    equal(actual, expected, message) {
        try {
            assert.equal(actual, expected,
                message !== undefined ? message : `Nilai seharusnya "${expected}", bukan "${actual}".`)
        } catch (e) {
            this._errors.push(e.message)
        }
        return this
    }

    notEqual(actual, expected, message) {
        try {
            assert.notEqual(actual, expected,
                message !== undefined ? message : `Nilai seharusnya bukan "${expected}".`)
        } catch (e) {
            this._errors.push(e.message)
        }
        return this
    }

    // Kumpulkan semua kegagalan dan lempar sekaligus
    assert() {
        if (this._errors.length === 0) return
        const combined = this._errors.map((msg, i) => `  ${i + 1}. ${msg}`).join('\n')
        assert.fail(`Soft assertion gagal (${this._errors.length} kesalahan):\n${combined}`)
    }

    get errors() {
        return [...this._errors]
    }

    get passed() {
        return this._errors.length === 0
    }
}

module.exports = { SoftAssert }
