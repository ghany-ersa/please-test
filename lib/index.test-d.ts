import { expectType, expectError } from 'tsd'
import { Page, Locator } from '@playwright/test'
import Please from './index'

declare const page: Page
const please = new Please(page)

// ── Locator ────────────────────────────────────────────────────────────────────
expectType<string>(please.detectLocator('#id'))
expectType<Locator>(please.toLocator('#id'))

// ── Navigasi ───────────────────────────────────────────────────────────────────
expectType<Promise<void>>(please.goto('/login'))
expectType<Promise<void>>(please.goto('/login', 'Login'))
expectType<Promise<void>>(please.verifyPage('/login'))
expectType<Promise<void>>(please.verifyPage('/login', 'Login'))
expectType<Promise<string>>(please.url())
expectType<Promise<string>>(please.title())

// ── Tunggu & Interaksi ─────────────────────────────────────────────────────────
expectType<Promise<void>>(please.untilShow('label', '#el'))
expectType<Promise<void>>(please.untilShow('label', '#el', 5000))
expectType<Promise<void>>(please.wait())
expectType<Promise<void>>(please.wait(1000))
expectType<Promise<void>>(please.click('label', '#el'))
expectType<Promise<void>>(please.click('label', '#el', 500))
expectType<Promise<void>>(please.fill('label', '#el', 'value'))
expectType<Promise<void>>(please.fillAndEnter('label', '#el', 'value'))
expectType<Promise<void>>(please.clear('label', '#el'))
expectType<Promise<void>>(please.scrollTo('label', '#el'))
expectType<Promise<void>>(please.uploadFile('label', '#el', '/path/file.png'))
expectType<Promise<void>>(please.datepicker('label', '#el', '2024-01-01'))

// ── Baca Nilai & Assert ────────────────────────────────────────────────────────
expectType<Promise<string>>(please.see('label', '#el'))
expectType<Promise<string>>(please.see('label', '#el', 'expected'))
expectType<Promise<string>>(please.see('label', '#el', 'expected', 3000))

// ── Screenshot ─────────────────────────────────────────────────────────────────
expectType<Promise<string>>(please.screenshot())
expectType<Promise<string>>(please.screenshot('nama-screenshot'))

// ── Error cases ────────────────────────────────────────────────────────────────
expectError(new Please())
expectError(please.goto(123))
expectError(please.fill(123, '#el', 'value'))
expectError(please.see('label', '#el', 123))
