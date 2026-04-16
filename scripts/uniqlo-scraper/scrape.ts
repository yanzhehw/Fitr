#!/usr/bin/env tsx
/**
 * Uniqlo Size Chart Scraper
 *
 * Scrapes body measurement data from Uniqlo product pages.
 * Uniqlo doesn't have a centralized size chart — body measurements are
 * accessed per-product via Size Guide → Body Size tab.
 *
 * Strategy: find one product per category, extract body measurement table.
 */

import { chromium, type Page, type Browser } from 'playwright';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ── Config ──────────────────────────────────────────────────

interface CategoryConfig {
  name: string;
  gender: string;
  category: string;
  listUrl: string;
  prefix: string;
}

const CATEGORIES: CategoryConfig[] = [
  // Men's
  { name: 'mens-tops', gender: 'mens', category: 'tops', listUrl: 'https://www.uniqlo.com/ca/en/men/tops/t-shirts', prefix: '' },
  { name: 'mens-bottoms', gender: 'mens', category: 'bottoms', listUrl: 'https://www.uniqlo.com/ca/en/men/bottoms/jogger-pants', prefix: '' },
  { name: 'mens-outerwear', gender: 'mens', category: 'outerwear', listUrl: 'https://www.uniqlo.com/ca/en/men/outerwear/jackets-and-coats', prefix: '' },
  // Women's
  { name: 'womens-tops', gender: 'womens', category: 'tops', listUrl: 'https://www.uniqlo.com/ca/en/women/tops/t-shirts', prefix: '' },
  { name: 'womens-bottoms', gender: 'womens', category: 'bottoms', listUrl: 'https://www.uniqlo.com/ca/en/women/bottoms/jogger-pants', prefix: '' },
  { name: 'womens-outerwear', gender: 'womens', category: 'outerwear', listUrl: 'https://www.uniqlo.com/ca/en/women/outerwear/jackets-and-coats', prefix: '' },
];

interface ParsedEntry {
  sizeLabel: string;
  measurementRanges: Record<string, [number, number]>;
}

interface SubChart {
  slug: string;
  url: string;
  genderCategory: string;
  productCategory: string;
  labelPrefix: string;
  storable: boolean;
  ageGroup: string;
  entries: ParsedEntry[];
  warnings: string[];
  skippedLabels: string[];
}

// ── Fraction parser ─────────────────────────────────────────

function parseFraction(raw: string): number | null {
  const cleaned = raw.trim();
  if (!cleaned || cleaned === '-') return null;

  // "37 3/4" → 37.75
  const mixedMatch = cleaned.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    return parseInt(mixedMatch[1]) + parseInt(mixedMatch[2]) / parseInt(mixedMatch[3]);
  }

  // "3/4" → 0.75
  const fracMatch = cleaned.match(/^(\d+)\/(\d+)$/);
  if (fracMatch) {
    return parseInt(fracMatch[1]) / parseInt(fracMatch[2]);
  }

  // Plain number
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseRangeValue(raw: string): [number, number] | null {
  const cleaned = raw.trim();
  if (!cleaned || cleaned === '-') return null;

  // Range: "34 3/4-37 3/4" or "30-33"
  // Split on dash that separates the two values (not within a fraction)
  const parts = cleaned.split(/(?<=\d)-(?=\d)/);
  if (parts.length === 2) {
    const min = parseFraction(parts[0]);
    const max = parseFraction(parts[1]);
    if (min !== null && max !== null) {
      // Convert inches to cm
      const minCm = Math.round(min * 2.54 * 10) / 10;
      const maxCm = Math.round(max * 2.54 * 10) / 10;
      return [minCm, maxCm];
    }
  }

  // Single value
  const val = parseFraction(cleaned);
  if (val !== null) {
    const cm = Math.round(val * 2.54 * 10) / 10;
    return [cm, cm];
  }

  return null;
}

// ── Label mapping ───────────────────────────────────────────

function mapLabel(label: string): string | null {
  const l = label.toLowerCase().trim();
  if (l === 'chest' || l === 'bust') return 'chest_cm';
  if (l === 'waist') return 'waist_cm';
  if (l === 'hip' || l === 'hips') return 'hip_cm';
  if (l === 'inseam') return 'inseam_cm';
  return null;
}

// ── Main scraper ────────────────────────────────────────────

async function main() {
  const browser = await chromium.launch({ headless: true });
  const subCharts: SubChart[] = [];

  for (const config of CATEGORIES) {
    console.log(`\n=== ${config.name} ===`);
    const result = await scrapeCategory(browser, config);
    if (result) subCharts.push(result);
  }

  await browser.close();

  // Write output
  const output = {
    brand: { name: 'Uniqlo', region: 'NA', enabled: true },
    scrapedAt: new Date().toISOString(),
    sources: ['https://www.uniqlo.com/ca/en/ (product page Size Guide → Body Size)'],
    totalSubCharts: subCharts.length,
    totalEntries: subCharts.reduce((s, sc) => s + sc.entries.length, 0),
    subCharts,
  };

  const jsonPath = resolve(import.meta.dirname, '../../supabase/seed/uniqlo_size_data.json');
  writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\nWrote ${jsonPath}`);
  console.log(`${subCharts.length} sub-charts, ${output.totalEntries} total entries`);
}

async function scrapeCategory(browser: Browser, config: CategoryConfig): Promise<SubChart | null> {
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  try {
    // Step 1: Find a product URL from the category listing
    console.log(`  Finding product from ${config.listUrl}...`);
    await page.goto(config.listUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(5000);

    const productUrls = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a'))
        .filter(a => a.href.includes('/products/') && a.href.includes('uniqlo.com'))
        .map(a => a.href)
        .slice(0, 3);
    });

    if (productUrls.length === 0) {
      console.log('  ✗ No products found');
      await context.close();
      return null;
    }

    // Step 2: Navigate to product and extract body size data
    for (const productUrl of productUrls) {
      console.log(`  Trying ${productUrl}...`);
      await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(4000);

      // Dismiss cookie consent + sticky header
      await page.evaluate(() => {
        const banner = document.getElementById('onetrust-consent-sdk');
        if (banner) banner.remove();
        const sticky = document.querySelector('.template-base-sticky-container');
        if (sticky) (sticky as HTMLElement).style.display = 'none';
      });

      // Click Size Guide
      await page.evaluate(() => {
        const els = Array.from(document.querySelectorAll('div, button, a, span'));
        const sg = els.find(el => el.textContent?.trim() === 'Size Guide');
        if (sg) sg.click();
      });
      await page.waitForTimeout(2000);

      // Click Body Size tab
      await page.evaluate(() => {
        const els = Array.from(document.querySelectorAll('div, button, a, span'));
        const bs = els.find(el => el.textContent?.trim() === 'Body Size');
        if (bs) bs.click();
      });
      await page.waitForTimeout(2000);

      // Extract the body size table
      const entries = await extractBodySizeTable(page);
      if (entries.length > 0) {
        console.log(`  ✓ ${entries.length} entries from ${productUrl}`);
        await context.close();
        return {
          slug: config.name,
          url: productUrl,
          genderCategory: config.gender,
          productCategory: config.category,
          labelPrefix: config.prefix,
          storable: true,
          ageGroup: 'adult',
          entries,
          warnings: [],
          skippedLabels: [],
        };
      }
    }

    console.log('  ✗ No body size data found in any product');
    await context.close();
    return null;
  } catch (err) {
    console.log(`  ✗ Error: ${err instanceof Error ? err.message : err}`);
    await context.close();
    return null;
  }
}

async function extractBodySizeTable(page: Page): Promise<ParsedEntry[]> {
  const tables = page.locator('table');
  const count = await tables.count();

  for (let i = count - 1; i >= 0; i--) {
    const table = tables.nth(i);
    const rows = await table.locator('tr').all();
    if (rows.length < 2) continue;

    // Check if this table has body measurement headers (Chest, Waist, Hip)
    const headerCells = await rows[0].locator('th, td').all();
    const headers: string[] = [];
    for (const cell of headerCells) {
      headers.push((await cell.textContent())?.trim() ?? '');
    }

    const mappedHeaders = headers.map(h => mapLabel(h));
    const hasMeasurements = mappedHeaders.some(h => h !== null);
    if (!hasMeasurements) continue;

    // Parse data rows
    const entries: ParsedEntry[] = [];
    for (let r = 1; r < rows.length; r++) {
      const cells = await rows[r].locator('th, td').all();
      const values: string[] = [];
      for (const cell of cells) {
        values.push((await cell.textContent())?.trim() ?? '');
      }

      if (values.length < 2) continue;
      const sizeLabel = values[0];
      if (!sizeLabel) continue;

      const measurementRanges: Record<string, [number, number]> = {};
      for (let c = 1; c < values.length && c < headers.length; c++) {
        const key = mappedHeaders[c];
        if (!key) continue;
        const range = parseRangeValue(values[c]);
        if (range) measurementRanges[key] = range;
      }

      if (Object.keys(measurementRanges).length > 0) {
        entries.push({ sizeLabel, measurementRanges });
      }
    }

    if (entries.length > 0) return entries;
  }

  return [];
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
