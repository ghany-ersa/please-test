const ARIA_SHORTHAND_TAGS = new Set(['button', 'a', 'input', 'select', 'textarea', 'checkbox', 'radio'])

function detectLocator(selector) {
    if (selector.startsWith('//') || selector.startsWith('(//'))
        return `xpath=${selector}`
    if (selector.startsWith('#'))
        return selector
    if (selector.startsWith('text=') || selector.startsWith('role=') || selector.startsWith('label='))
        return selector
    // shorthand: button=Submit → role=button[name=Submit]
    const shorthandMatch = selector.match(/^([a-z]+)=(.+)$/)
    if (shorthandMatch && ARIA_SHORTHAND_TAGS.has(shorthandMatch[1]))
        return `role=${shorthandMatch[1]}[name=${shorthandMatch[2]}]`
    if (selector.startsWith('.') || selector.startsWith('[') || /[\s>:+~]/.test(selector) || /[.#\[:]/.test(selector))
        return selector
    if (/^(a|abbr|address|article|aside|audio|b|blockquote|body|br|button|canvas|caption|cite|code|col|colgroup|data|datalist|dd|del|details|dfn|dialog|div|dl|dt|em|embed|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|head|header|hr|html|i|iframe|img|input|ins|kbd|label|legend|li|link|main|map|mark|menu|meta|meter|nav|noscript|object|ol|optgroup|option|output|p|picture|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|span|strong|style|sub|summary|sup|table|tbody|td|template|textarea|tfoot|th|thead|time|title|tr|track|u|ul|var|video|wbr)$/.test(selector))
        return selector
    throw new Error(`Selector "${selector}" tidak dapat dikenali. Gunakan: #id, .class, tag, xpath (//), CSS, text=, role=, label=, atau shorthand button=Name.`)
}

function toLocator(page, selector) {
    if (selector.startsWith('role=')) {
        const rest = selector.slice(5)
        const match = rest.match(/^([^\[]+)(?:\[name=(.+)\])?$/)
        if (match) {
            const role = match[1].trim()
            const name = match[2] ? match[2].trim() : undefined
            return name ? page.getByRole(role, { name }) : page.getByRole(role)
        }
    }
    if (selector.startsWith('label='))
        return page.getByLabel(selector.slice(6))
    return page.locator(detectLocator(selector))
}

module.exports = { detectLocator, toLocator }
