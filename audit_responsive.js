const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'https://436e8c5e.osamap2.pages.dev';
const ROUTES = ['/', '/netflix', '/shahid', '/disney', '/crunchyroll', '/player', '/search', '/favorites', '/sign-in'];
const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    for (const route of ROUTES) {
      const url = `${BASE}${route}`;
      const filename = `phase1_${vp.name}_${route.replace(/\//g, '_') || '_home'}.png`;
      console.log(`${vp.name} | ${route}`);

      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000);

        // Check for overlapping elements
        const issues = await page.evaluate(() => {
          const problems = [];
          const allEls = document.querySelectorAll('*');
          const fixedEls = [];

          for (const el of allEls) {
            const style = getComputedStyle(el);
            if (style.position === 'fixed' || style.position === 'sticky') {
              fixedEls.push({
                tag: el.tagName,
                class: el.className?.toString().slice(0, 60),
                rect: el.getBoundingClientRect(),
                zIndex: style.zIndex,
              });
            }
          }

          // Check for text overflow
          const textEls = document.querySelectorAll('h1, h2, h3, p, span, a, button');
          for (const el of textEls) {
            const rect = el.getBoundingClientRect();
            if (rect.right > window.innerWidth + 5) {
              problems.push({
                type: 'overflow-right',
                tag: el.tagName,
                text: el.textContent?.slice(0, 40),
                right: Math.round(rect.right),
                viewport: window.innerWidth,
              });
            }
            if (rect.left < -5 && rect.width > 0) {
              problems.push({
                type: 'overflow-left',
                tag: el.tagName,
                text: el.textContent?.slice(0, 40),
                left: Math.round(rect.left),
              });
            }
          }

          // Check for elements covering the entire viewport (potential modal issues)
          for (const el of fixedEls) {
            if (el.rect.width >= window.innerWidth * 0.9 && el.rect.height >= window.innerHeight * 0.5) {
              problems.push({
                type: 'full-screen-overlay',
                tag: el.tag,
                class: el.class,
                zIndex: el.zIndex,
              });
            }
          }

          return problems;
        });

        await page.screenshot({ path: path.join('screenshots', filename), fullPage: false });
        results.push({ route, viewport: vp.name, status: 'ok', issues: issues.length, details: issues });
      } catch (e) {
        results.push({ route, viewport: vp.name, status: 'error', error: e.message?.slice(0, 100) });
      }
    }
    await context.close();
  }

  // Summary
  console.log('\n=== AUDIT SUMMARY ===');
  const withIssues = results.filter(r => r.issues > 0);
  const errors = results.filter(r => r.status === 'error');
  console.log(`Total: ${results.length} tests | Issues: ${withIssues.length} | Errors: ${errors.length}`);

  for (const r of withIssues) {
    console.log(`\n${r.route} (${r.viewport}): ${r.issues} issues`);
    for (const d of r.details) {
      console.log(`  - ${d.type}: ${d.tag} "${d.text || d.class || ''}"`);
    }
  }

  for (const r of errors) {
    console.log(`\n${r.route} (${r.viewport}): ERROR - ${r.error}`);
  }

  fs.writeFileSync('audit_results.json', JSON.stringify(results, null, 2));
  await browser.close();
})();
