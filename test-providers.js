const { chromium } = require('playwright');

const PROVIDERS = [
  { name: 'VidSrc', url: 'https://vidsrc.xyz/embed/movie/550' },
  { name: 'StreameX', url: 'https://play.xpass.top/e/movie/550' },
  { name: 'vidlink', url: 'https://vidlink.pro/movie/550' },
  { name: 'apiplayer', url: 'https://apiplayer.ru/embed/movie/550' },
  { name: 'screenscape', url: 'https://screenscape.me/embed?tmdb=550&type=movie' },
  { name: 'VidPlus', url: 'https://player.vidplus.to/embed/movie/550' },
  { name: 'VidFast', url: 'https://vidfast.vc/movie/550?autoPlay=true' },
  { name: 'VidCore', url: 'https://www.vidcore.org/embed/movie/550' },
  { name: 'vidplays', url: 'https://vidplays.fun/embed/movie/550' },
  { name: '2embed', url: 'https://www.2embed.stream/embed/movie/550' },
  { name: 'Frembed', url: 'https://frembed.hair/embed/movie/550' },
  { name: 'VidPhantom', url: 'https://vidphantom.com/movie/550' },
  { name: 'VidKing', url: 'https://www.vidking.net/embed/movie/550?autoPlay=true' },
  { name: 'VidNest', url: 'https://vidnest.fun/movie/550' },
  { name: 'VidRift', url: 'https://vidrift.in/embed/movie/550' },
  { name: 'VidLove', url: 'https://player.vidlove.cc/embed/movie/550' },
  { name: 'MegaPlay', url: 'https://megaplay.buzz/stream/ani/21/1/sub' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 },
  });

  const results = [];

  for (const provider of PROVIDERS) {
    const page = await context.newPage();
    let status = 'UNKNOWN';
    let statusCode = 0;
    let error = '';
    let hasIframe = false;
    let hasVideo = false;
    let pageTitle = '';

    try {
      const response = await page.goto(provider.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      statusCode = response?.status() || 0;
      
      // Wait a bit for content to load
      await page.waitForTimeout(3000);
      
      // Check for video/iframe elements
      hasIframe = await page.locator('iframe').count() > 0;
      hasVideo = await page.locator('video').count() > 0;
      pageTitle = await page.title();
      
      // Check for Cloudflare challenge
      const content = await page.content();
      const isCloudflare = content.includes('Just a moment') || content.includes('cf-browser-verification');
      
      if (isCloudflare) {
        status = 'CLOUDFLARE_BLOCKED';
      } else if (statusCode >= 400) {
        status = 'HTTP_ERROR';
      } else if (hasVideo || hasIframe) {
        status = 'WORKING';
      } else if (content.includes('404') || content.includes('not found')) {
        status = 'NOT_FOUND';
      } else {
        status = 'LOADED_NO_PLAYER';
      }
    } catch (e) {
      error = e.message?.slice(0, 100);
      if (error.includes('Timeout') || error.includes('timeout')) {
        status = 'TIMEOUT';
      } else if (error.includes('ERR_NAME_NOT_RESOLVED')) {
        status = 'DNS_FAIL';
      } else if (error.includes('ERR_CONNECTION')) {
        status = 'CONNECTION_FAIL';
      } else {
        status = 'ERROR';
      }
    }

    const result = { name: provider.name, status, statusCode, hasIframe, hasVideo, pageTitle: pageTitle?.slice(0, 50), error };
    results.push(result);
    
    const icon = status === 'WORKING' ? '✅' : status === 'CLOUDFLARE_BLOCKED' ? '🛡️' : '❌';
    console.log(`${icon} ${provider.name.padEnd(15)} | ${status.padEnd(20)} | HTTP ${statusCode} | iframe:${hasIframe} video:${hasVideo}`);
    
    await page.close();
  }

  console.log('\n--- SUMMARY ---');
  const working = results.filter(r => r.status === 'WORKING');
  const blocked = results.filter(r => r.status === 'CLOUDFLARE_BLOCKED');
  const broken = results.filter(r => !['WORKING', 'CLOUDFLARE_BLOCKED'].includes(r.status));
  
  console.log(`✅ Working: ${working.map(r => r.name).join(', ') || 'NONE'}`);
  console.log(`🛡️ Cloudflare Blocked: ${blocked.map(r => r.name).join(', ') || 'NONE'}`);
  console.log(`❌ Broken: ${broken.map(r => `${r.name}(${r.status})`).join(', ') || 'NONE'}`);

  await browser.close();
})();
