#!/usr/bin/env tsx
import { chromium } from 'playwright';

async function main() {
  const url = process.argv[2] || 'https://www.newbalance.ca/en_ca/size-chart.html';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Dismiss cookie/popup if present
  for (const sel of ['button:has-text("Accept")', '[aria-label="Close"]', '.close-button']) {
    try {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(500);
      }
    } catch {}
  }

  // Screenshot
  await page.screenshot({ path: '/tmp/nb-debug.png', fullPage: true });
  console.log('Screenshot: /tmp/nb-debug.png');

  // Check for tables
  const tableCount = await page.locator('table').count();
  console.log(`\nFound ${tableCount} <table> elements`);

  // Check for links to size charts
  const links = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a'));
    return anchors
      .filter(a => {
        const href = a.href.toLowerCase();
        const text = (a.textContent || '').toLowerCase();
        return href.includes('size') || text.includes('size') || text.includes('chart') || text.includes('guide');
      })
      .map(a => ({ href: a.href, text: (a.textContent || '').trim().substring(0, 80) }));
  });
  console.log('\nSize-related links:');
  for (const l of links) {
    console.log(`  ${l.text} → ${l.href}`);
  }

  // Check for tabs/accordions that might reveal size charts
  const tabCount = await page.locator('[role="tab"], .tab, .accordion-header, .size-chart-tab').count();
  console.log(`\nTab/accordion elements: ${tabCount}`);

  // Dump main content text (first 3000 chars)
  const text = await page.locator('main, #main-content, .page-content, body').first().textContent();
  console.log('\n--- Page text (first 3000 chars) ---');
  console.log((text || '').substring(0, 3000));

  await browser.close();
}

main().catch(console.error);
