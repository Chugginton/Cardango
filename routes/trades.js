/**
 * routes/trades.js
 * P2P trade routes:
 *   POST /api/trades/propose
 *   GET  /api/trades
 *   GET|POST /api/trades/accept
 *   GET|POST /api/trades/decline
 *   GET  /api/trades/listings
 *   GET  /api/trades/detail
 */

const supabase = require('../lib/supabase');
const { readBody, json } = require('../lib/middleware');
const TradesService = require('../trades_service');

async function handle(req, res, pathname, reqUrl) {
  const PORT = process.env.PORT || 3000;

  // Helper to build base URL from request headers
  const baseUrl = () => {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host     = req.headers['host'] || `localhost:${PORT}`;
    return `${protocol}://${host}`;
  };

  // ── POST /api/trades/propose ───────────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/trades/propose') {
    try {
      const payload = JSON.parse(await readBody(req) || '{}');
      const result  = await TradesService.createTradeProposal({ supabase, payload, baseUrl: baseUrl() });
      json(res, 201, {
        success: true,
        trade: result.trade,
        emailPreviews: result.emailPreviews,
        message: 'Trade proposal submitted to escrow and emails dispatched!'
      });
    } catch (err) {
      json(res, 400, { error: err.message });
    }
    return true;
  }

  // ── GET /api/trades ────────────────────────────────────────────────────────
  if (req.method === 'GET' && pathname === '/api/trades') {
    try {
      const email  = reqUrl.searchParams.get('email');
      const trades = await TradesService.listTrades({ email, supabase });
      json(res, 200, { success: true, trades });
    } catch (err) {
      json(res, 500, { error: err.message });
    }
    return true;
  }

  // ── GET|POST /api/trades/accept ────────────────────────────────────────────
  if ((req.method === 'GET' || req.method === 'POST') && pathname === '/api/trades/accept') {
    const tradeId = reqUrl.searchParams.get('id');
    const token   = reqUrl.searchParams.get('token');
    try {
      const result = await TradesService.acceptTrade({ tradeId, token, supabase, baseUrl: baseUrl() });
      if (req.method === 'GET') {
        res.writeHead(302, { Location: `/trade.html?tradeConfirmed=${encodeURIComponent(tradeId)}` });
        res.end();
        return true;
      }
      json(res, 200, result);
    } catch (err) {
      if (req.method === 'GET') {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(`<h2>Trade Error: ${err.message}</h2><p><a href="/trade.html">Return to CARDANGO</a></p>`);
        return true;
      }
      json(res, 400, { error: err.message });
    }
    return true;
  }

  // ── GET|POST /api/trades/decline ───────────────────────────────────────────
  if ((req.method === 'GET' || req.method === 'POST') && pathname === '/api/trades/decline') {
    const tradeId = reqUrl.searchParams.get('id');
    const token   = reqUrl.searchParams.get('token');
    try {
      const result = await TradesService.declineTrade({ tradeId, token, supabase });
      if (req.method === 'GET') {
        res.writeHead(302, { Location: `/trade.html?tradeDeclined=${encodeURIComponent(tradeId)}` });
        res.end();
        return true;
      }
      json(res, 200, result);
    } catch (err) {
      if (req.method === 'GET') {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(`<h2>Trade Error: ${err.message}</h2><p><a href="/trade.html">Return to CARDANGO</a></p>`);
        return true;
      }
      json(res, 400, { error: err.message });
    }
    return true;
  }

  // ── GET /api/trades/listings ───────────────────────────────────────────────
  if (req.method === 'GET' && pathname === '/api/trades/listings') {
    try {
      const listings = TradesService.getTradeListings();
      json(res, 200, { success: true, listings });
    } catch (err) {
      json(res, 500, { error: err.message });
    }
    return true;
  }

  // ── GET /api/trades/detail ─────────────────────────────────────────────────
  if (req.method === 'GET' && pathname === '/api/trades/detail') {
    const tradeId = reqUrl.searchParams.get('id');
    try {
      const trade = await TradesService.getTrade(tradeId, supabase);
      if (!trade) { json(res, 404, { error: 'Trade not found' }); return true; }
      json(res, 200, { success: true, trade });
    } catch (err) {
      json(res, 500, { error: err.message });
    }
    return true;
  }

  return false; // not handled
}

module.exports = { handle };
