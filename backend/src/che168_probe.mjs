import { chromium } from 'playwright';
import fs from 'fs';

const LIST_URL = 'https://www.che168.com/china/a0_0msdgscncgpi1ltocsp1exx0/';
const DETAIL_URL = 'https://www.che168.com/dealer/507024/59819768.html';

const N = Number(process.argv[2] || 12);
const targetArg = process.argv[3] || 'list'; // 'list' or 'detail'
const url = targetArg === 'detail' ? DETAIL_URL : LIST_URL;

const results = [];

function classify(html, title) {
  if (!html) return 'ERROR';
  if (html.length < 2000 && html.includes('EO_Bot_Ssid')) return 'CHALLENGE';
  if (html.length < 3000) return 'SUSPICIOUS_SMALL';
  return 'OK';
}

const browser = await chromium.launch({ headless: true });

for (let i = 1; i <= N; i++) {
  const t0 = Date.now();
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    locale: 'zh-CN',
  });
  const page = await context.newPage();
  let status = 'ERROR';
  let httpCode = null;
  let htmlLen = 0;
  let title = '';
  let err = null;
  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    httpCode = resp ? resp.status() : null;
    // Give the JS challenge (if any) time to run its setTimeout(...,1200) reload
    await page.waitForTimeout(2000);
    const html = await page.content();
    htmlLen = html.length;
    title = await page.title();
    status = classify(html, title);
    if (status === 'OK' && i === 1) {
      fs.writeFileSync(`che168_playwright_sample_${targetArg}.html`, html, 'utf8');
    }
  } catch (e) {
    err = e.message;
  }
  const dt = Date.now() - t0;
  await context.close();
  results.push({ i, status, httpCode, htmlLen, title, ms: dt, err });
  console.log(`[${targetArg}] attempt ${i}: status=${status} http=${httpCode} len=${htmlLen} title="${title}" time=${dt}ms ${err ? 'err=' + err : ''}`);
  await new Promise((r) => setTimeout(r, 1500));
}

await browser.close();

const ok = results.filter((r) => r.status === 'OK').length;
console.log(`\n=== SUMMARY (${targetArg}) ===`);
console.log(`OK: ${ok}/${N} (${((ok / N) * 100).toFixed(0)}%)`);
console.log(`avg time (ms): ${(results.reduce((s, r) => s + r.ms, 0) / N).toFixed(0)}`);
fs.writeFileSync(`che168_playwright_results_${targetArg}.json`, JSON.stringify(results, null, 2));
