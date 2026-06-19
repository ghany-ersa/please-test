const ARIA_ROLES = new Set([
    'alert', 'alertdialog', 'application', 'article', 'banner', 'blockquote',
    'button', 'caption', 'cell', 'checkbox', 'code', 'columnheader', 'combobox',
    'complementary', 'contentinfo', 'definition', 'deletion', 'dialog', 'directory',
    'document', 'emphasis', 'feed', 'figure', 'form', 'generic', 'grid', 'gridcell',
    'group', 'heading', 'img', 'insertion', 'link', 'list', 'listbox', 'listitem',
    'log', 'main', 'marquee', 'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox',
    'menuitemradio', 'meter', 'navigation', 'none', 'note', 'option', 'paragraph',
    'presentation', 'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup',
    'rowheader', 'scrollbar', 'search', 'searchbox', 'separator', 'slider', 'spinbutton',
    'status', 'strong', 'subscript', 'superscript', 'switch', 'tab', 'table', 'tablist',
    'tabpanel', 'term', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree', 'treegrid',
    'treeitem',
])

function detectLocator(selector) {
    if (selector.startsWith('//') || selector.startsWith('(//'))
        return `xpath=${selector}`
    if (selector.startsWith('#'))
        return selector
    if (selector.startsWith('.') || selector.startsWith('[') || /[\s>:+~]/.test(selector) || /[.#\[:]/.test(selector))
        return selector
    if (/^(a|abbr|address|article|aside|audio|b|blockquote|body|br|button|canvas|caption|cite|code|col|colgroup|data|datalist|dd|del|details|dfn|dialog|div|dl|dt|em|embed|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|head|header|hr|html|i|iframe|img|input|ins|kbd|label|legend|li|link|main|map|mark|menu|meta|meter|nav|noscript|object|ol|optgroup|option|output|p|picture|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|span|strong|style|sub|summary|sup|table|tbody|td|template|textarea|tfoot|th|thead|time|title|tr|track|u|ul|var|video|wbr)$/.test(selector))
        return selector
    throw new Error(`Selector "${selector}" tidak dapat dikenali. Gunakan: #id, .class, tag, xpath (//), CSS, text=, label=, placeholder=, alt=, title=, testid=, atau shorthand button=Name.`)
}

function toLocator(page, selector) {
    const eq = selector.indexOf('=')
    if (eq !== -1) {
        const prefix = selector.slice(0, eq)
        const value = selector.slice(eq + 1)
        if (ARIA_ROLES.has(prefix))
            return page.getByRole(prefix, { name: value })
        if (prefix === 'label')       return page.getByLabel(value)
        if (prefix === 'text')        return page.getByText(value)
        if (prefix === 'placeholder') return page.getByPlaceholder(value)
        if (prefix === 'alt')         return page.getByAltText(value)
        if (prefix === 'title')       return page.getByTitle(value)
        if (prefix === 'testid')      return page.getByTestId(value)
    }
    return page.locator(detectLocator(selector))
}

module.exports = { detectLocator, toLocator }
