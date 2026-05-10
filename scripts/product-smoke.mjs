import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const root = process.cwd();

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, () => {
      const address = server.address();
      server.close(() => {
        if (typeof address === 'object' && address?.port) resolve(address.port);
        else reject(new Error('Could not allocate a free port'));
      });
    });
  });
}

async function waitFor(url, timeoutMs = 30_000) {
  const started = Date.now();
  let lastError;
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err;
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  throw lastError ?? new Error(`Timed out waiting for ${url}`);
}

async function assertHttp(baseUrl) {
  const home = await fetch(baseUrl);
  if (!home.ok) throw new Error(`Home route returned ${home.status}`);
  const html = await home.text();
  if (!html.includes('Team USA Archetype Lab')) throw new Error('Home route did not render product title');

  const stats = await fetch(`${baseUrl}/data/team-usa-sport-stats.json`);
  if (!stats.ok) throw new Error(`Sport stats returned ${stats.status}`);
  const statsJson = await stats.json();
  if (Object.keys(statsJson).length < 20) throw new Error('Sport stats summary is unexpectedly small');

  const invalid = await fetch(`${baseUrl}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (invalid.status !== 400) throw new Error(`Invalid API payload returned ${invalid.status}, expected 400`);

  const valid = await fetch(`${baseUrl}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      heightInches: 70,
      weightLbs: 160,
      age: 25,
      gender: 'Other',
      endurance: 62,
      power: 58,
      closestSports: [
        {
          sport: 'Softball',
          score: 0.02,
          stats: statsJson.Softball,
        },
        {
          sport: 'Swimming',
          score: 0.04,
          stats: statsJson.Swimming,
        },
        {
          sport: 'Athletics',
          score: 0.05,
          stats: statsJson.Athletics,
        },
      ],
    }),
  });

  if (!valid.ok) throw new Error(`Valid API payload returned ${valid.status}`);
  const result = await valid.json();
  if (result.archetypes?.length !== 3) throw new Error('API did not return exactly 3 archetypes');
  if (!result.archetypes[2]?.paralympic) throw new Error('API third archetype is not Paralympic');
}

function chromePath() {
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ];
  return candidates.find((candidate) => fs.existsSync(candidate));
}

async function connectToPage(debugPort) {
  await waitFor(`http://127.0.0.1:${debugPort}/json/version`);
  const pages = await fetch(`http://127.0.0.1:${debugPort}/json`).then((res) => res.json());
  const page = pages.find((item) => item.type === 'page');
  if (!page) throw new Error('Could not find Chrome page target');

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  let id = 0;
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const messageId = ++id;
      const onMessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.id !== messageId) return;
        ws.removeEventListener('message', onMessage);
        if (data.error) reject(new Error(JSON.stringify(data.error)));
        else if (data.exceptionDetails) reject(new Error(data.exceptionDetails.text ?? 'Browser evaluation failed'));
        else resolve(data.result);
      };
      ws.addEventListener('message', onMessage);
      ws.send(JSON.stringify({ id: messageId, method, params }));
    });
  }

  return { send, close: () => ws.close() };
}

async function runBrowserSmoke(baseUrl, width, height, outputName) {
  const chrome = chromePath();
  if (!chrome) {
    console.warn('Chrome not found; skipping browser smoke');
    return;
  }

  const debugPort = await getFreePort();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'team-usa-smoke-chrome-'));
  const browser = spawn(chrome, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${userDataDir}`,
    `--window-size=${width},${height}`,
    'about:blank',
  ]);

  try {
    const page = await connectToPage(debugPort);
    try {
      await page.send('Runtime.enable');
      await page.send('Page.enable');
      await page.send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: width < 600,
      });
      await page.send('Page.navigate', { url: baseUrl });
      await new Promise((resolve) => setTimeout(resolve, 2500));

      const evalResult = await page.send('Runtime.evaluate', {
        expression: `(() => {
          const sampleButton = [...document.querySelectorAll('button')].find((button) => button.textContent.includes('Use sample profile'));
          if (!sampleButton) throw new Error('Missing sample profile button');
          sampleButton.click();
          return true;
        })()`,
        returnByValue: true,
      });
      if (!evalResult.result.value) throw new Error('Form fill failed');

      for (let attempt = 0; attempt < 40; attempt += 1) {
        const sampleReady = await page.send('Runtime.evaluate', {
          expression: `document.querySelector('#feet')?.value === '5' && document.querySelector('#gender')?.value === 'Other'`,
          returnByValue: true,
        });
        if (sampleReady.result.value) break;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      await page.send('Runtime.evaluate', {
        expression: `document.querySelector('button[type="submit"]').click()`,
        returnByValue: true,
      });

      let value = null;
      for (let attempt = 0; attempt < 60; attempt += 1) {
        const layout = await page.send('Runtime.evaluate', {
          expression: `(() => ({
            viewport: innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            archetypeCards: document.querySelectorAll('article').length,
            hasDemoBadge: document.body.textContent.includes('Demo mode'),
          }))()`,
          returnByValue: true,
        });
        value = layout.result.value;
        if (value.archetypeCards === 3 && value.hasDemoBadge) break;
        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      if (value.scrollWidth > value.viewport) {
        throw new Error(`Horizontal overflow at ${width}px: ${value.scrollWidth} > ${value.viewport}`);
      }
      if (value.archetypeCards !== 3) throw new Error(`Expected 3 archetype cards, found ${value.archetypeCards}`);
      if (!value.hasDemoBadge) throw new Error('Demo-mode badge missing in browser result');

      const screenshot = await page.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      fs.writeFileSync(path.join(os.tmpdir(), outputName), Buffer.from(screenshot.data, 'base64'));
    } finally {
      page.close();
    }
  } finally {
    browser.kill('SIGTERM');
    await new Promise((resolve) => {
      const timer = setTimeout(resolve, 1500);
      browser.once('exit', () => {
        clearTimeout(timer);
        resolve();
      });
    });
    fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}

const port = await getFreePort();
const baseUrl = `http://localhost:${port}`;
const nextBin = path.join(root, 'node_modules/.bin/next');
const server = spawn(nextBin, ['dev', '--port', String(port)], {
  cwd: root,
  env: { ...process.env, GEMINI_API_KEY: '' },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let serverOutput = '';
server.stdout.on('data', (chunk) => {
  serverOutput += chunk.toString();
});
server.stderr.on('data', (chunk) => {
  serverOutput += chunk.toString();
});

try {
  await waitFor(baseUrl);
  await assertHttp(baseUrl);
  await runBrowserSmoke(baseUrl, 1440, 1100, 'team-usa-product-smoke-desktop.png');
  await runBrowserSmoke(baseUrl, 390, 1200, 'team-usa-product-smoke-mobile.png');
  console.log('Product smoke passed');
} catch (err) {
  console.error(serverOutput);
  throw err;
} finally {
  server.kill('SIGTERM');
}
