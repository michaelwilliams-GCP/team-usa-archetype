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

  for (const route of ['/parity', '/hubs', '/momentum']) {
    const response = await fetch(`${baseUrl}${route}`);
    if (!response.ok) throw new Error(`${route} returned ${response.status}`);
    const body = await response.text();
    if (!body.includes('<html') || body.length < 500) throw new Error(`${route} returned an invalid app shell`);
  }

  const health = await fetch(`${baseUrl}/api/health`);
  if (!health.ok) throw new Error(`Health route returned ${health.status}`);
  const healthJson = await health.json();
  if (!healthJson.ok || healthJson.googleCloudTarget !== 'cloud-run') {
    throw new Error('Health route did not return Cloud Run readiness metadata');
  }

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

  const invalidMomentum = await fetch(`${baseUrl}/api/momentum`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sport: 'Swimming' }),
  });
  if (invalidMomentum.status !== 400) {
    throw new Error(`Invalid momentum payload returned ${invalidMomentum.status}, expected 400`);
  }

  const validMomentum = await fetch(`${baseUrl}/api/momentum`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(['Swimming', 'Athletics']),
  });
  if (!validMomentum.ok) throw new Error(`Valid momentum payload returned ${validMomentum.status}`);
  const momentum = await validMomentum.json();
  if (momentum.results?.length !== 2) throw new Error('Momentum API did not return two results');
  for (const item of momentum.results) {
    if (typeof item.sport !== 'string') throw new Error('Momentum result missing sport');
    if (typeof item.momentumScore !== 'number' || item.momentumScore < 0 || item.momentumScore > 100) {
      throw new Error('Momentum result score is out of range');
    }
  }
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

      const themeToggle = await page.send('Runtime.evaluate', {
        expression: `(() => {
          if (document.documentElement.dataset.theme !== 'dark') {
            throw new Error('Default theme is not dark');
          }
          const toggle = document.querySelector('button[aria-pressed]');
          if (!toggle) throw new Error('Missing theme toggle');
          toggle.click();
          return true;
        })()`,
        returnByValue: true,
      });
      if (!themeToggle.result.value) throw new Error('Theme toggle click failed');

      for (let attempt = 0; attempt < 20; attempt += 1) {
        const lightReady = await page.send('Runtime.evaluate', {
          expression: `document.documentElement.dataset.theme === 'light'`,
          returnByValue: true,
        });
        if (lightReady.result.value) break;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

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
            archetypeCards: document.querySelectorAll('[data-testid="archetype-card"]').length,
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

      const contrast = await page.send('Runtime.evaluate', {
        expression: `(() => {
          function rgb(value) {
            const match = String(value).match(/rgba?\\(([^)]+)\\)/);
            if (!match) return null;
            const parts = match[1].split(',').map((part) => Number.parseFloat(part));
            return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
          }

          function luminance(color) {
            const channel = (value) => {
              const normalized = value / 255;
              return normalized <= 0.03928
                ? normalized / 12.92
                : Math.pow((normalized + 0.055) / 1.055, 2.4);
            };
            return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
          }

          function contrastRatio(foreground, background) {
            const first = luminance(foreground);
            const second = luminance(background);
            return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
          }

          function effectiveBackground(element) {
            for (let node = element; node; node = node.parentElement) {
              const color = rgb(getComputedStyle(node).backgroundColor);
              if (color && color.a > 0.05) return color;
            }
            return rgb(getComputedStyle(document.body).backgroundColor);
          }

          const failures = [];
          const nodes = [...document.querySelectorAll('main *')].filter((element) => {
            const rect = element.getBoundingClientRect();
            const styles = getComputedStyle(element);
            if (rect.width < 1 || rect.height < 1 || styles.visibility === 'hidden' || styles.display === 'none') {
              return false;
            }
            return [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
          });

          for (const element of nodes) {
            const styles = getComputedStyle(element);
            const foreground = rgb(styles.color);
            const background = effectiveBackground(element);
            if (!foreground || !background) continue;

            const ratio = contrastRatio(foreground, background);
            const size = Number.parseFloat(styles.fontSize);
            const weight = Number.parseFloat(styles.fontWeight) || 400;
            const largeText = size >= 24 || (size >= 18.66 && weight >= 700);
            const minimum = largeText ? 3 : 4.5;
            if (ratio < minimum) {
              failures.push({
                text: element.textContent.trim().slice(0, 60),
                ratio: Number(ratio.toFixed(2)),
                minimum,
              });
            }
          }

          return { theme: document.documentElement.dataset.theme, failures: failures.slice(0, 8), count: failures.length };
        })()`,
        returnByValue: true,
      });
      if (contrast.result.value.theme !== 'light') throw new Error('Light-mode contrast check did not run in light mode');
      if (contrast.result.value.count > 0) {
        throw new Error(`Light-mode contrast failures: ${JSON.stringify(contrast.result.value.failures)}`);
      }

      const screenshot = await page.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      fs.writeFileSync(path.join(os.tmpdir(), outputName), Buffer.from(screenshot.data, 'base64'));

      for (const route of [
        { path: '/parity', text: 'Performance Parity Board' },
        { path: '/hubs', text: 'Hometown Success Engine' },
        { path: '/momentum', text: 'Team USA Momentum Board' },
      ]) {
        await page.send('Page.navigate', { url: `${baseUrl}${route.path}` });
        let routeReady = null;
        for (let attempt = 0; attempt < 40; attempt += 1) {
          const routeState = await page.send('Runtime.evaluate', {
            expression: `(() => ({
              ready: document.body.textContent.includes(${JSON.stringify(route.text)}),
              viewport: innerWidth,
              scrollWidth: document.documentElement.scrollWidth,
              theme: document.documentElement.dataset.theme
            }))()`,
            returnByValue: true,
          });
          routeReady = routeState.result.value;
          if (routeReady.ready) break;
          await new Promise((resolve) => setTimeout(resolve, 250));
        }

        if (!routeReady?.ready) throw new Error(`${route.path} did not hydrate expected heading`);
        if (routeReady.scrollWidth > routeReady.viewport) {
          throw new Error(`Horizontal overflow on ${route.path} at ${width}px: ${routeReady.scrollWidth} > ${routeReady.viewport}`);
        }
        if (routeReady.theme !== 'light') throw new Error(`${route.path} did not preserve the selected light theme`);
      }
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

function ensureStandaloneAssets() {
  const standaloneDir = path.join(root, '.next/standalone');
  const serverFile = path.join(standaloneDir, 'server.js');
  if (!fs.existsSync(serverFile)) return null;

  fs.mkdirSync(path.join(standaloneDir, '.next'), { recursive: true });
  fs.rmSync(path.join(standaloneDir, 'public'), { recursive: true, force: true });
  fs.rmSync(path.join(standaloneDir, '.next/static'), { recursive: true, force: true });
  fs.cpSync(path.join(root, 'public'), path.join(standaloneDir, 'public'), { recursive: true });
  fs.cpSync(path.join(root, '.next/static'), path.join(standaloneDir, '.next/static'), { recursive: true });
  return serverFile;
}

async function startServer() {
  if (process.env.SMOKE_BASE_URL) {
    return {
      baseUrl: process.env.SMOKE_BASE_URL.replace(/\/$/, ''),
      server: null,
      output: () => '',
    };
  }

  const port = await getFreePort();
  const baseUrl = `http://localhost:${port}`;
  const standaloneServer = ensureStandaloneAssets();
  const command = standaloneServer ? process.execPath : path.join(root, 'node_modules/.bin/next');
  const args = standaloneServer ? ['server.js'] : ['dev', '--port', String(port)];
  const server = spawn(command, args, {
    cwd: standaloneServer ? path.dirname(standaloneServer) : root,
    env: {
      ...process.env,
      GEMINI_API_KEY: '',
      HOSTNAME: '127.0.0.1',
      PORT: String(port),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let serverOutput = '';
  server.stdout.on('data', (chunk) => {
    serverOutput += chunk.toString();
  });
  server.stderr.on('data', (chunk) => {
    serverOutput += chunk.toString();
  });

  return {
    baseUrl,
    server,
    output: () => serverOutput,
  };
}

const smokeTarget = await startServer();

try {
  await waitFor(smokeTarget.baseUrl);
  await assertHttp(smokeTarget.baseUrl);
  await runBrowserSmoke(smokeTarget.baseUrl, 1440, 1100, 'team-usa-product-smoke-desktop.png');
  await runBrowserSmoke(smokeTarget.baseUrl, 390, 1200, 'team-usa-product-smoke-mobile.png');
  console.log('Product smoke passed');
} catch (err) {
  console.error(smokeTarget.output());
  throw err;
} finally {
  smokeTarget.server?.kill('SIGTERM');
}
