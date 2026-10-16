// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

/**
 * Dev-only proxy for the web app. A free ngrok backend answers browser GET requests with its
 * "visit site" warning page (ERR_NGROK_6024), and the browser may not send the header that skips it
 * (the backend's CORS rules don't allow it). So in development the web app calls
 * `<dev server>/api-proxy/...` and this forwards the request to the backend with that header.
 * Keep the fallback URL in sync with `API_URL` in src/api/config.ts.
 */
const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'https://shirt-shady-daisy.ngrok-free.dev/api').replace(/\/$/, '');
const PROXY_PREFIX = '/api-proxy';
const FORWARDED_HEADERS = ['accept', 'authorization', 'content-type'];

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function proxy(req, res) {
  try {
    const headers = { 'ngrok-skip-browser-warning': '1' };
    for (const name of FORWARDED_HEADERS) if (req.headers[name]) headers[name] = req.headers[name];
    const hasBody = !['GET', 'HEAD'].includes(req.method);
    const response = await fetch(API_URL + req.url.slice(PROXY_PREFIX.length), {
      method: req.method,
      headers,
      body: hasBody ? await readBody(req) : undefined,
    });
    res.statusCode = response.status;
    const type = response.headers.get('content-type');
    if (type) res.setHeader('Content-Type', type);
    const ngrokError = response.headers.get('ngrok-error-code');
    if (ngrokError) res.setHeader('ngrok-error-code', ngrokError);
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ detail: `Could not reach ${API_URL}: ${error.message}` }));
  }
}

const enhance = config.server?.enhanceMiddleware;
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware, server) => {
    const next = enhance ? enhance(middleware, server) : middleware;
    return (req, res, fallthrough) =>
      req.url.startsWith(`${PROXY_PREFIX}/`) ? proxy(req, res) : next(req, res, fallthrough);
  },
};

module.exports = config;
