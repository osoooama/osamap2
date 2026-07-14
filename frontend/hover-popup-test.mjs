import { chromium } from 'playwright';

const SCREENSHOT_DIR = 'C:\\Users\\osama\\Documents\\osamap2\\frontend\\test-screenshots';
const BASE_URL = 'http://localhost:3099';

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

const MOCK_MOVIES = Array.from({ length: 20 }, (_, i) => ({
  tmdb_id: `${600000 + i}`,
  title: `Movie ${i + 1}`,
  poster_path: '/pB8BM7pdSp6B6Ih7QI4S2t0POoT.jpg',
  backdrop_path: '/xJHokMbljvjADYdit5fK1Dho0XF.jpg',
  vote_average: +(7 + Math.random() * 2).toFixed(1),
  vote_count: 1000 + i * 100,
  release_date: `${2020 + (i % 6)}-01-${String(1 + i).padStart(2, '0')}`,
  overview: 'A test movie description for hover popup testing. This is sample content to verify the popup positioning logic works correctly across different viewports.',
  genre: 'Action, Drama',
  genres: [{ id: 28, name: 'Action' }, { id: 18, name: 'Drama' }],
  media_type: i % 3 === 0 ? 'tv' : 'movie',
}));

async function checkOverlap(popupBox, h2Elements, page) {
  if (!popupBox) return { pass: true, overlaps: [] };

  const overlaps = [];
  for (const h2 of h2Elements) {
    const h2Box = await h2.boundingBox();
    if (!h2Box) continue;

    const h2Bottom = h2Box.y + h2Box.height;
    const h2Top = h2Box.y;
    const popupTop = popupBox.y;
    const popupBottom = popupBox.y + popupBox.height;
    const popupLeft = popupBox.x;
    const popupRight = popupBox.x + popupBox.width;

    const h2Left = h2Box.x;
    const h2Right = h2Box.x + h2Box.width;
    const hasHorizontalOverlap = popupLeft < h2Right && popupRight > h2Left;
    const hasVerticalOverlap = popupTop < h2Bottom && popupBottom > h2Top;

    if (hasHorizontalOverlap && hasVerticalOverlap) {
      const titleText = await h2.textContent();
      overlaps.push(titleText?.trim() || 'unknown');
    }
  }

  return { pass: overlaps.length === 0, overlaps };
}

async function testViewport(browser, viewport) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${viewport.name} (${viewport.width}x${viewport.height})`);
  console.log('='.repeat(60));

  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
  });
  const page = await context.newPage();

  const results = {
    viewport: viewport.name,
    screenshots: [],
    passed: null,
    message: '',
    authNeeded: false,
  };

  try {
    // First navigate to root to set localStorage
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);

    // Inject fake auth token
    await page.evaluate(() => {
      localStorage.setItem('osk_token', 'test-token-for-playwright');
      localStorage.setItem('osk_user', JSON.stringify({ id: 'test-user', username: 'testuser' }));
    });
    console.log('Injected fake auth token');

    // Intercept API calls to return mock movie data
    await page.route('**/api/movies/**', async (route) => {
      const url = route.request().url();
      console.log(`Intercepted: ${url}`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_MOVIES),
      });
    });
    console.log('Set up API route interception');

    // Navigate to netflix page
    await page.goto(`${BASE_URL}/netflix`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Check if we're on sign-in page
    const url = page.url();
    if (url.includes('sign-in')) {
      console.log('Auth bypass failed');
      const ssPath = `${SCREENSHOT_DIR}/${viewport.name}-auth-needed.png`;
      await page.screenshot({ path: ssPath, fullPage: false });
      results.screenshots.push(ssPath);
      results.authNeeded = true;
      results.message = 'Auth bypass failed';
      await context.close();
      return results;
    }

    console.log('On netflix page, waiting for movie cards...');

    // Wait for movie cards to render
    await page.waitForTimeout(5000);

    // Find MovieCard elements
    let cards = await page.$$('div[class*="cursor-pointer"][class*="flex-shrink-0"]');
    console.log(`Found ${cards.length} movie cards`);

    // Get all h2 section titles
    const h2Elements = await page.$$('h2');
    console.log(`Found ${h2Elements.length} h2 section titles`);

    // Debug screenshot
    const debugPath = `${SCREENSHOT_DIR}/${viewport.name}-debug.png`;
    await page.screenshot({ path: debugPath, fullPage: false });
    results.screenshots.push(debugPath);

    // If no cards, check page content and try scrolling
    if (cards.length === 0) {
      console.log('No cards found, trying to scroll down...');
      await page.evaluate(() => window.scrollTo(0, 400));
      await page.waitForTimeout(2000);
      cards = await page.$$('div[class*="cursor-pointer"][class*="flex-shrink-0"]');
      console.log(`After scroll: Found ${cards.length} movie cards`);
    }

    // Scroll to first h2 (first movie row)
    const firstH2 = await page.$('h2');
    if (firstH2) {
      await firstH2.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    }

    // Baseline screenshot
    const baselinePath = `${SCREENSHOT_DIR}/${viewport.name}-baseline.png`;
    await page.screenshot({ path: baselinePath, fullPage: false });
    results.screenshots.push(baselinePath);
    console.log(`Baseline screenshot saved`);

    if (cards.length > 0) {
      // --- Test 1: First card hover ---
      const firstCard = cards[0];
      const firstCardBox = await firstCard.boundingBox();
      console.log(`First card at: x=${firstCardBox?.x}, y=${firstCardBox?.y}`);

      if (firstCardBox && (firstCardBox.y < 0 || firstCardBox.y > viewport.height)) {
        await firstCard.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
      }

      await firstCard.hover();
      console.log('Hovering on first card...');
      await page.waitForTimeout(1200);

      const afterHover1 = `${SCREENSHOT_DIR}/${viewport.name}-after-hover-first.png`;
      await page.screenshot({ path: afterHover1, fullPage: false });
      results.screenshots.push(afterHover1);
      console.log(`After hover (first) screenshot saved`);

      // Check popup
      let popup = await page.$('div[style*="position: fixed"][style*="z-index: 60"]');
      if (!popup) popup = await page.$('div[style*="z-index: 60"]');

      if (popup) {
        const popupBox = await popup.boundingBox();
        console.log(`Popup at: x=${popupBox?.x}, y=${popupBox?.y}, w=${popupBox?.width}, h=${popupBox?.height}`);

        const overlap = await checkOverlap(popupBox, h2Elements, page);
        results.passed = overlap.pass;
        results.message = overlap.pass ? 'No overlap detected' : `Overlap: ${overlap.overlaps.join(', ')}`;
        console.log(overlap.pass ? 'PASS: No overlap' : `FAIL: Overlaps ${overlap.overlaps.join(', ')}`);
      } else {
        console.log('Popup not found');
        results.passed = false;
        results.message = 'Popup not found after hover';
      }

      // Move mouse away
      await page.mouse.move(0, 0);
      await page.waitForTimeout(600);

      // --- Test 2: Last card in first row ---
      const firstRow = await page.$('div[class*="mb-5"], div[class*="mb-8"]');
      if (firstRow) {
        const rowCards = await firstRow.$$('div[class*="flex-shrink-0"][class*="cursor-pointer"]');
        console.log(`Cards in first row: ${rowCards.length}`);

        if (rowCards.length > 1) {
          const lastCard = rowCards[rowCards.length - 1];
          const lastCardBox = await lastCard.boundingBox();

          if (lastCardBox) {
            if (lastCardBox.y < 0 || lastCardBox.y > viewport.height) {
              await lastCard.scrollIntoViewIfNeeded();
              await page.waitForTimeout(300);
            }

            // Scroll row to end
            const scrollContainer = await firstRow.$('div[class*="overflow-x-auto"]');
            if (scrollContainer) {
              await scrollContainer.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
              await page.waitForTimeout(500);
            }

            await lastCard.hover();
            console.log('Hovering on last card of first row...');
            await page.waitForTimeout(1200);

            const afterHover2 = `${SCREENSHOT_DIR}/${viewport.name}-after-hover-last.png`;
            await page.screenshot({ path: afterHover2, fullPage: false });
            results.screenshots.push(afterHover2);
            console.log(`After hover (last) screenshot saved`);

            let popup2 = await page.$('div[style*="position: fixed"][style*="z-index: 60"]');
            if (!popup2) popup2 = await page.$('div[style*="z-index: 60"]');
            if (popup2) {
              const popup2Box = await popup2.boundingBox();
              console.log(`Last card popup at: x=${popup2Box?.x}, y=${popup2Box?.y}`);
              const overlap2 = await checkOverlap(popup2Box, h2Elements, page);
              if (!overlap2.pass) {
                console.log(`FAIL: Last card overlaps: ${overlap2.overlaps.join(', ')}`);
                results.passed = false;
                results.message = `Last card overlap: ${overlap2.overlaps.join(', ')}`;
              } else {
                console.log('PASS: No overlap (last card)');
              }
            }
          }
        }
      }
    } else {
      console.log('No movie cards found on page');
      results.passed = false;
      results.message = 'No movie cards found';

      // Full page debug screenshot
      const fullDebug = `${SCREENSHOT_DIR}/${viewport.name}-fullpage-debug.png`;
      await page.screenshot({ path: fullDebug, fullPage: true });
      results.screenshots.push(fullDebug);
    }

  } catch (error) {
    console.error(`Error testing ${viewport.name}:`, error.message);
    const errorPath = `${SCREENSHOT_DIR}/${viewport.name}-error.png`;
    await page.screenshot({ path: errorPath, fullPage: false }).catch(() => {});
    results.screenshots.push(errorPath);
    results.passed = false;
    results.message = `Error: ${error.message}`;
  }

  await context.close();
  return results;
}

async function main() {
  console.log('Hover Popup Verification Test');
  console.log(`Screenshots: ${SCREENSHOT_DIR}\n`);

  const browser = await chromium.launch({ headless: true });

  const allResults = [];
  for (const viewport of VIEWPORTS) {
    const result = await testViewport(browser, viewport);
    allResults.push(result);
  }

  await browser.close();

  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));

  for (const r of allResults) {
    const status = r.authNeeded ? 'AUTH NEEDED' : (r.passed ? 'PASS' : 'FAIL');
    console.log(`${r.viewport.padEnd(10)} ${status.padEnd(12)} ${r.message}`);
    for (const ss of r.screenshots) {
      console.log(`           ${ss}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  const allPassed = allResults.every(r => r.passed === true);
  if (allPassed) {
    console.log('RESULT: ALL TESTS PASSED');
  } else {
    const failed = allResults.filter(r => r.passed === false);
    console.log(`RESULT: ${failed.length}/${allResults.length} TESTS FAILED`);
    for (const f of failed) {
      console.log(`  ${f.viewport}: ${f.message}`);
    }
  }
  console.log('='.repeat(60));
}

main().catch(console.error);
