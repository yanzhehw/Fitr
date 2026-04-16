/**
 * Nike size chart table parser using Playwright.
 *
 * Nike's table structure (observed April 2026):
 * - No <thead>. Everything is in <tbody>.
 * - Row 1: <th>Size</th> + <td>XXS</td><td>XS</td>... (size labels)
 * - Row 2+: <th>Chest (in)</th> + <td>35 - 37.5</td>... (measurement rows)
 * - Each <td> has a `system="IMPERIAL"` or `system="METRIC"` attribute.
 * - The cm/in toggle is inside a visually-hidden <caption> and does not
 *   respond to simple click events. We scrape inch values and convert.
 *
 * Footwear tables:
 * - Row 1: <th>US - Men</th> + <td>3.5</td><td>4</td>... (US sizes)
 * - Row "CM / JP": <th>CM / JP</th> + foot length in cm
 * - We use US sizes as labels and CM/JP values as foot_length_cm.
 */

import type { Page } from 'playwright';
import {
  parseRange,
  convertRange,
  mapMeasurementLabel,
} from './measurement-converter.js';

export interface ParsedEntry {
  sizeLabel: string;
  measurementRanges: Record<string, [number, number]>;
}

export interface TableParseResult {
  entries: ParsedEntry[];
  sourceUnit: 'in' | 'cm';
  warnings: string[];
  skippedLabels: string[];
}

/**
 * Extract all size chart tables from the current page.
 */
export async function extractTables(
  page: Page,
  slug: string,
): Promise<TableParseResult[]> {
  // Wait for table with data cells
  try {
    await page.waitForSelector('table', { timeout: 15000 });
    await page.waitForSelector('table tbody td', { timeout: 10000 });
  } catch {
    return [{
      entries: [],
      sourceUnit: 'in',
      warnings: [`No table found on page for slug: ${slug}`],
      skippedLabels: [],
    }];
  }

  // Dismiss cookie consent if present
  try {
    const acceptBtn = page.locator('button:has-text("Accept All")').first();
    if (await acceptBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await acceptBtn.click();
      await page.waitForTimeout(500);
    }
  } catch { /* ignore */ }

  const tableCount = await page.locator('table').count();
  const results: TableParseResult[] = [];

  for (let i = 0; i < tableCount; i++) {
    const table = page.locator('table').nth(i);
    const result = await parseNikeTable(table, slug);
    if (result.entries.length > 0) {
      results.push(result);
    }
  }

  return results;
}

/**
 * Parse a single Nike table. All rows are in <tbody>.
 * First row contains size labels, subsequent rows contain measurements.
 */
async function parseNikeTable(
  table: ReturnType<Page['locator']>,
  slug: string,
): Promise<TableParseResult> {
  const warnings: string[] = [];
  const skippedLabels: string[] = [];

  // Extract all rows (th + td cells per row)
  const allRows = await extractAllRows(table);
  if (allRows.length < 2) {
    return { entries: [], sourceUnit: 'in', warnings: ['Table has fewer than 2 rows'], skippedLabels: [] };
  }

  // Determine if this is a footwear table
  const firstRowLabel = allRows[0].label.toLowerCase();
  const isFootwear = firstRowLabel.includes('us') || allRows.some(r => r.label.toLowerCase().includes('cm / jp') || r.label.toLowerCase().includes('cm/jp') || r.label.toLowerCase().includes('foot length'));

  if (isFootwear) {
    return parseFootwearTable(allRows, slug, warnings, skippedLabels);
  }

  return parseClothingTable(allRows, slug, warnings, skippedLabels);
}

interface RawRow {
  label: string;
  values: string[];
}

async function extractAllRows(
  table: ReturnType<Page['locator']>,
): Promise<RawRow[]> {
  const rows: RawRow[] = [];
  const trElements = table.locator('tbody tr');
  const rowCount = await trElements.count();

  for (let r = 0; r < rowCount; r++) {
    const row = trElements.nth(r);
    const cells = row.locator('th, td');
    const cellCount = await cells.count();
    if (cellCount < 2) continue;

    const label = (await cells.nth(0).textContent())?.trim() ?? '';
    const values: string[] = [];
    for (let c = 1; c < cellCount; c++) {
      values.push((await cells.nth(c).textContent())?.trim() ?? '');
    }
    rows.push({ label, values });
  }

  return rows;
}

/**
 * Parse clothing table (tops, bottoms, etc.).
 *
 * Row 0: "Size" | XXS | XS | S | S Tall | M | ...
 * Row 1: "Chest (in)" | 28.1 - 31.5 | 31.5 - 35 | ...
 * Row 2: "Waist (in)" | 22.5 - 25.5 | 25.5 - 29 | ...
 *
 * All measurement rows are in inches. We convert to cm.
 */
function parseClothingTable(
  allRows: RawRow[],
  slug: string,
  warnings: string[],
  skippedLabels: string[],
): TableParseResult {
  // Row 0 should be size labels
  const sizeRow = allRows[0];
  const sizeLabels = sizeRow.values;

  if (sizeLabels.length === 0) {
    warnings.push(`No size labels found in first row of ${slug}`);
    return { entries: [], sourceUnit: 'in', warnings, skippedLabels };
  }

  // Initialize entries
  const entryMap = new Map<string, Record<string, [number, number]>>();
  for (const label of sizeLabels) {
    if (label) entryMap.set(label, {});
  }

  // Process measurement rows (row 1+)
  for (let r = 1; r < allRows.length; r++) {
    const row = allRows[r];
    const fitrKey = mapMeasurementLabel(row.label);
    if (!fitrKey) {
      skippedLabels.push(row.label);
      continue;
    }

    for (let i = 0; i < sizeLabels.length && i < row.values.length; i++) {
      const sizeLabel = sizeLabels[i];
      if (!sizeLabel) continue;

      const parsed = parseRange(row.values[i]);
      if (!parsed) continue;

      // Nike clothing tables default to inches
      const converted = convertRange(parsed, 'in');
      const entry = entryMap.get(sizeLabel);
      if (entry) {
        entry[fitrKey] = converted;
      }
    }
  }

  const entries: ParsedEntry[] = [];
  for (const [sizeLabel, ranges] of entryMap) {
    if (Object.keys(ranges).length > 0) {
      entries.push({ sizeLabel, measurementRanges: ranges });
    }
  }

  return { entries, sourceUnit: 'in', warnings, skippedLabels };
}

/**
 * Parse footwear table.
 *
 * Row 0: "US - Men" | 3.5 | 4 | 4.5 | 5 | ...
 * Row "US - Women": optional women's US sizes
 * Row "CM / JP": | 22.5 | 23 | 23.5 | ...  (foot length in cm)
 * Row "Foot Length (in)": | 8 1/2 | 8 11/16 | ...
 *
 * Strategy: use first row (US sizes) as labels, CM/JP row as foot_length_cm.
 * If no CM/JP row, use Foot Length (in) and convert.
 */
function parseFootwearTable(
  allRows: RawRow[],
  slug: string,
  warnings: string[],
  skippedLabels: string[],
): TableParseResult {
  // Find the US size row (use first row)
  const sizeRow = allRows[0];
  const sizePrefix = determineSizePrefix(sizeRow.label);

  // Find CM/JP row or Foot Length row
  const cmRow = allRows.find(r => {
    const l = r.label.toLowerCase();
    return l.includes('cm') || l.includes('jp');
  });
  const footLengthInchRow = allRows.find(r =>
    r.label.toLowerCase().includes('foot length'),
  );

  if (!cmRow && !footLengthInchRow) {
    warnings.push(`No foot length data found for ${slug}`);
    // Still skip the non-measurement rows
    for (const row of allRows) {
      skippedLabels.push(row.label);
    }
    return { entries: [], sourceUnit: 'cm', warnings, skippedLabels };
  }

  const entries: ParsedEntry[] = [];
  const dataRow = cmRow ?? footLengthInchRow!;
  const isCm = !!cmRow;

  for (let i = 0; i < sizeRow.values.length && i < dataRow.values.length; i++) {
    const usSize = sizeRow.values[i]?.trim();
    if (!usSize) continue;

    const footValue = parseFootwearValue(dataRow.values[i]);
    if (footValue === null) continue;

    const footLengthCm = isCm ? footValue : footValue * 2.54;
    const rounded = Math.round(footLengthCm * 10) / 10;

    entries.push({
      sizeLabel: `${sizePrefix}${usSize}`,
      measurementRanges: {
        foot_length_cm: [rounded, rounded],
      },
    });
  }

  // Log skipped rows
  for (const row of allRows) {
    if (row !== sizeRow && row !== dataRow) {
      const l = row.label.toLowerCase();
      if (!l.includes('us') && !l.includes('uk') && !l.includes('eu')) {
        skippedLabels.push(row.label);
      }
    }
  }

  return { entries, sourceUnit: isCm ? 'cm' : 'in', warnings, skippedLabels };
}

/**
 * Determine a prefix for footwear size labels based on the row header.
 * "US - Men" → "US M ", "US - Women" → "US W "
 */
function determineSizePrefix(rowLabel: string): string {
  const lower = rowLabel.toLowerCase();
  if (lower.includes('women') || lower.includes('wmns')) return 'US W';
  if (lower.includes('men')) return 'US M';
  if (lower.includes('kid') || lower.includes('child')) return 'US K';
  return 'US ';
}

/**
 * Parse a footwear value which may be:
 * - A decimal: "22.5", "28"
 * - A fraction: "8 1/2", "8 11/16"
 */
function parseFootwearValue(raw: string): number | null {
  const cleaned = raw.trim();
  if (!cleaned) return null;

  // Simple decimal
  const decimal = parseFloat(cleaned);
  if (!isNaN(decimal) && !cleaned.includes('/')) return decimal;

  // Mixed fraction: "8 1/2" or "10 11/16"
  const fractionMatch = cleaned.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const whole = parseInt(fractionMatch[1], 10);
    const num = parseInt(fractionMatch[2], 10);
    const den = parseInt(fractionMatch[3], 10);
    if (den !== 0) return whole + num / den;
  }

  // Simple fraction: "1/2"
  const simpleFrac = cleaned.match(/^(\d+)\/(\d+)$/);
  if (simpleFrac) {
    const num = parseInt(simpleFrac[1], 10);
    const den = parseInt(simpleFrac[2], 10);
    if (den !== 0) return num / den;
  }

  return null;
}
