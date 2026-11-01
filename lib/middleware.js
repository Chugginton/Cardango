/**
 * lib/middleware.js
 * Shared HTTP helpers: CORS headers, JSON body parser, JSON responders.
 */

/** Apply CORS headers to every response. */
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/** Read the full request body as a string, then resolve. */
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

/** Extract Bearer token from Authorization header. */
function getBearerToken(req) {
  return (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '').trim();
}

/** Send a JSON response. */
function json(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

module.exports = { setCors, readBody, getBearerToken, json };
