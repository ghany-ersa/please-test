import { Page, Locator } from '@playwright/test'

export interface PageTarget {
    url: string
    title?: string
}

export default class Please {
    constructor(page: Page)

    // ── Locator ────────────────────────────────────────────────────────────────
    detectLocator(selector: string): string
    toLocator(selector: string): Locator

    // ── Navigasi ───────────────────────────────────────────────────────────────
    goto(target: PageTarget): Promise<void>
    verifyPage(target: PageTarget): Promise<void>
    url(): Promise<string>
    title(): Promise<string>

    // ── Tunggu & Interaksi ─────────────────────────────────────────────────────
    untilShow(label: string, selector: string, timeout?: number): Promise<void>
    wait(ms?: number): Promise<void>
    click(label: string, selector: string, delay?: number): Promise<void>
    fill(label: string, selector: string, value: string): Promise<void>
    fillAndEnter(label: string, selector: string, value: string): Promise<void>
    clear(label: string, selector: string): Promise<void>
    scrollTo(label: string, selector: string): Promise<void>
    uploadFile(label: string, selector: string, filePath: string): Promise<void>
    datepicker(label: string, selector: string, value: string): Promise<void>

    // ── Baca Nilai & Assert ────────────────────────────────────────────────────
    see(label: string, selector: string, expected?: string, timeout?: number): Promise<string>

    // ── Screenshot ─────────────────────────────────────────────────────────────
    screenshot(label?: string): Promise<string>
}
