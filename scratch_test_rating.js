const { spawn } = require('child_process');
const http = require('http');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Starting headless Chrome...');
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    'http://localhost:6006/'
  ]);

  chrome.on('error', (err) => {
    console.error('Failed to start Chrome:', err);
  });

  // Wait for Chrome to boot
  await delay(3000);

  let targets;
  try {
    targets = await getJson('http://127.0.0.1:9222/json/list');
  } catch (err) {
    console.error('Could not connect to Chrome debugging port:', err.message);
    chrome.kill();
    process.exit(1);
  }

  // Find the page target for Storybook
  const pageTarget = targets.find(t => t.type === 'page');
  if (!pageTarget) {
    console.error('No page target found!');
    chrome.kill();
    process.exit(1);
  }

  console.log('Connecting to page WebSocket:', pageTarget.webSocketDebuggerUrl);
  // We need to use ws or we can write a simple node script that opens WebSocket.
  // Wait, does Node.js have built-in WebSocket support?
  // In Node 21+, yes, but in Node 18 or 20 it might not. We can install ws or just use a helper.
  // Wait, the previous test script used standard WebSocket (which is available in newer Node or they had it globally?).
  // Actually, standard global WebSocket exists in Node.js 22+.
  // Let's write a simple script that uses Node's global WebSocket, or we can check if it works.
  // Let's see if we can use global WebSocket or write the WebSocket client using a small client.
  // Let's write the WebSocket part.
}
main();
