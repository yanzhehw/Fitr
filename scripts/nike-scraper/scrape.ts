#!/usr/bin/env tsx
/**
 * Nike Size Chart Scraper
 *
 * Scrapes all Nike size-fit pages using Playwright (headless Chromium),
 * parses measurement tables, and outputs:
 *   - supabase/seed/nike_size_data.json  (complete dataset)
 *   - supabase/seed/nike_scrape_report.md (summary + warnings)
 *
 * Usage:
 *   npx tsx nike-scraper/scrape.ts              # scrape all pages
 *   npx tsx nike-scraper/scrape.ts --only mens-footwear  # single page
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NIKE_PAGES, BASE_URL, type PageConfig } from './page-config.js';
import { extractTables, type ParsedEntry } from './table-parser.js';

// ── Types for output JSON ───────────────────────────────────

interface NikeSubChart {
  slug: string;
  url: string;
  scrapedAt: string;
  sourceUnit: string;
  genderCategory: string;
  productCategory: string;
  labelPrefix: string;
  storable: boolean;
  ageGroup: string;
  entries: ParsedEntry[];
  warnings: string[];
  skippedLabels: string[];
}

interface NikeSizeData {
  brand: { name: string; region: string; enabled: boolean };
  scrapedAt: string;
  totalSubCharts: number;
  totalEntries: number;
  subCharts: NikeSubChart[];
}

// ── Main ────────────────────────────────────────────────────

async function main() {
  const onlySlug = parseArgs();
  const pages = onlySlug
    ? NIKE_PAGES.filter(p => p.slug === onlySlug)
    : NIKE_PAGES;

  if (pages.length === 0) {
    console.error(`No page config found for slug: ${onlySlug}`);
    process.exit(1);
  }

  console.log(`Scraping ${pages.length} Nike size chart page(s)...\n`);

  const browser = await chromium.launch({ headless: true });
  const subCharts: NikeSubChart[] = [];

  for (const pageConfig of pages) {
    const result = await scrapePage(browser, pageConfig);
    subCharts.push(...result);
  }

  await browser.close();

  // Build output
  const totalEntries = subCharts.reduce((sum, sc) => sum + sc.entries.length, 0);
  const output: NikeSizeData = {
    brand: { name: 'Nike', region: 'NA', enabled: true },
    scrapedAt: new Date().toISOString(),
    totalSubCharts: subCharts.length,
    totalEntries,
    subCharts,
  };

  // Write JSON
  const jsonPath = resolve(import.meta.dirname, '../../supabase/seed/nike_size_data.json');
  writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\nWrote ${jsonPath}`);

  // Write report
  const reportPath = resolve(import.meta.dirname, '../../supabase/seed/nike_scrape_report.md');
  writeFileSync(reportPath, generateReport(output), 'utf-8');
  console.log(`Wrote ${reportPath}`);

  // Summary
  console.log(`\nDone. ${subCharts.length} sub-charts, ${totalEntries} total entries.`);
  const failed = subCharts.filter(sc => sc.entries.length === 0 && sc.warnings.length > 0);
  if (failed.length > 0) {
    console.log(`\nFailed pages (${failed.length}):`);
    for (const f of failed) {
      console.log(`  - ${f.slug}: ${f.warnings.join('; ')}`);
    }
  }
}

// ── Scrape a single page ────────────────────────────────────

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 3000;

async function scrapePage(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  config: PageConfig,
): Promise<NikeSubChart[]> {
  const url = `${BASE_URL}/${config.slug}`;
  console.log(`Scraping: ${url}`);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      viewport: { width: 1440, height: 900 },
    });

    const page = await context.newPage();

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Random delay to avoid rate limiting
      await page.waitForTimeout(1000 + Math.random() * 2000);

      const tableResults = await extractTables(page, config.slug);

      if (tableResults.length === 0 || tableResults.every(t => t.entries.length === 0)) {
        if (attempt < MAX_RETRIES) {
          console.log(`  Retry ${attempt}/${MAX_RETRIES} — no data found`);
          await page.close();
          await context.close();
          await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
          continue;
        }
      }

      const subCharts: NikeSubChart[] = tableResults.map((result, idx) => ({
        slug: config.slug,
        url,
        scrapedAt: new Date().toISOString(),
        sourceUnit: result.sourceUnit,
        genderCategory: config.gender,
        productCategory: config.category,
        labelPrefix: config.prefix,
        storable: config.storable,
        ageGroup: config.ageGroup,
        entries: result.entries.map(e => ({
          ...e,
          sizeLabel: config.prefix + e.sizeLabel,
        })),
        warnings: result.warnings,
        skippedLabels: result.skippedLabels,
      }));

      // If multiple tables and this is a tops+bottoms page, try to tag them
      if (subCharts.length > 1 && config.notes.includes('tops+bottoms')) {
        tagTopBottomsTables(subCharts, idx);
      }

      const entryCount = subCharts.reduce((s, c) => s + c.entries.length, 0);
      console.log(`  ✓ ${tableResults.length} table(s), ${entryCount} entries`);
      if (subCharts.some(sc => sc.warnings.length > 0)) {
        for (const sc of subCharts) {
          for (const w of sc.warnings) {
            console.log(`    ⚠ ${w}`);
          }
        }
      }

      await page.close();
      await context.close();
      return subCharts;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`  ✗ Error (attempt ${attempt}/${MAX_RETRIES}): ${message}`);

      await page.close().catch(() => {});
      await context.close().catch(() => {});

      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
        continue;
      }

      return [{
        slug: config.slug,
        url,
        scrapedAt: new Date().toISOString(),
        sourceUnit: 'unknown',
        genderCategory: config.gender,
        productCategory: config.category,
        labelPrefix: config.prefix,
        storable: config.storable,
        ageGroup: config.ageGroup,
        entries: [],
        warnings: [`Failed after ${MAX_RETRIES} attempts: ${message}`],
        skippedLabels: [],
      }];
    }
  }

  return []; // unreachable but satisfies TS
}

/**
 * For pages with multiple tables that contain both tops and bottoms data,
 * try to assign product categories based on measurement keys present.
 */
function tagTopBottomsTables(subCharts: NikeSubChart[], _idx: number) {
  for (const sc of subCharts) {
    const hasChest = sc.entries.some(e => 'chest_cm' in e.measurementRanges);
    const hasInseam = sc.entries.some(e => 'inseam_cm' in e.measurementRanges);
    const hasHipOnly = sc.entries.some(e =>
      'hip_cm' in e.measurementRanges && !('chest_cm' in e.measurementRanges)
    );

    if (hasChest && !hasInseam) {
      sc.productCategory = 'tops';
    } else if (hasInseam || hasHipOnly) {
      sc.productCategory = 'bottoms';
    }
  }
}

// ── Report generation ───────────────────────────────────────

function generateReport(data: NikeSizeData): string {
  const lines: string[] = [
    '# Nike Size Chart Scrape Report',
    '',
    `**Scraped at:** ${data.scrapedAt}`,
    `**Total sub-charts:** ${data.totalSubCharts}`,
    `**Total entries:** ${data.totalEntries}`,
    '',
    '## Per-Page Results',
    '',
    '| Slug | Gender | Category | Tables | Entries | Unit | Storable | Warnings |',
    '|------|--------|----------|--------|---------|------|----------|----------|',
  ];

  for (const sc of data.subCharts) {
    const warnStr = sc.warnings.length > 0 ? sc.warnings.join('; ') : '—';
    lines.push(
      `| ${sc.slug} | ${sc.genderCategory} | ${sc.productCategory} | 1 | ${sc.entries.length} | ${sc.sourceUnit} | ${sc.storable ? '✓' : '✗'} | ${warnStr} |`,
    );
  }

  // Skipped labels summary
  const allSkipped = new Set(data.subCharts.flatMap(sc => sc.skippedLabels));
  if (allSkipped.size > 0) {
    lines.push('', '## Skipped Measurement Labels', '');
    lines.push('These row/column labels were not recognized and were skipped:', '');
    for (const label of allSkipped) {
      lines.push(`- \`${label}\``);
    }
  }

  // Failed pages
  const failed = data.subCharts.filter(sc => sc.entries.length === 0 && sc.warnings.length > 0);
  if (failed.length > 0) {
    lines.push('', '## Failed Pages', '');
    for (const f of failed) {
      lines.push(`- **${f.slug}** (${f.url}): ${f.warnings.join('; ')}`);
    }
  }

  // Storable summary
  const storable = data.subCharts.filter(sc => sc.storable);
  const storableEntries = storable.reduce((s, sc) => s + sc.entries.length, 0);
  lines.push('', '## Database Summary', '');
  lines.push(`- Storable sub-charts: ${storable.length}`);
  lines.push(`- Storable entries: ${storableEntries}`);
  lines.push(`- Non-storable (kids/accessories): ${data.subCharts.length - storable.length}`);

  return lines.join('\n') + '\n';
}

// ── CLI arg parsing ─────────────────────────────────────────

function parseArgs(): string | null {
  const args = process.argv.slice(2);
  const onlyIdx = args.indexOf('--only');
  if (onlyIdx !== -1 && args[onlyIdx + 1]) {
    return args[onlyIdx + 1];
  }
  return null;
}

// ── Run ─────────────────────────────────────────────────────

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
