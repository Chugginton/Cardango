/**
 * routes/auth.js
 * Authentication & user-session routes:
 *   GET  /api/health
 *   POST /api/auth/register
 *   POST /api/auth/login
 *   GET  /api/auth/me
 *   POST /api/auth/logout
 *   GET  /api/user/sync
 *   POST /api/user/sync
 */

const crypto = require('crypto');
const supabase = require('../lib/supabase');
const { readBody, getBearerToken, json } = require('../lib/middleware');

// In-memory stores (survive only while the process is running)
const LOCAL_USERS_STORE = [];
const ACTIVE_SESSIONS = new Map();

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

async function handle(req, res, pathname) {
  // ── Health check ─────────────────────────────────────────────────────────
  if (req.method === 'GET' && (pathname === '/api/health' || pathname === '/health')) {
    json(res, 200, { status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
    return true;
  }

  // ── Register ──────────────────────────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/auth/register') {
    try {
      const payload = JSON.parse(await readBody(req) || '{}');
      const name     = (payload.name     || '').trim();
      const email    = (payload.email    || '').trim().toLowerCase();
      const password = (payload.password || '').trim();
      const avatar   = payload.avatar || '';

      if (!name || !email || !password) {
        json(res, 400, { error: 'Name, email, and password are required' }); return true;
      }
      if (password.length < 6) {
        json(res, 400, { error: 'Password must be at least 6 characters' }); return true;
      }
      if (LOCAL_USERS_STORE.find(u => u.email === email)) {
        json(res, 400, { error: 'An account with this email already exists' }); return true;
      }

      try {
        await supabase.auth.signUp({ email, password, options: { data: { name, avatar, role: 'Verified Collector' } } });
      } catch (e) {
        console.warn('Supabase auth signup notice:', e.message);
      }

      const newUser = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name, email, password,
        role: 'Verified Collector',
        avatar,
        balanceUsd: 1500,
        balanceEth: 0.52,
        createdAt: new Date().toISOString()
      };

      LOCAL_USERS_STORE.push(newUser);
      const token = crypto.randomBytes(24).toString('hex');
      ACTIVE_SESSIONS.set(token, newUser);
      json(res, 201, { success: true, user: sanitizeUser(newUser), token });
    } catch (err) {
      json(res, 500, { error: 'Registration error: ' + err.message });
    }
    return true;
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/auth/login') {
    try {
      const payload  = JSON.parse(await readBody(req) || '{}');
      const email    = (payload.email    || '').trim().toLowerCase();
      const password = (payload.password || '').trim();

      if (!email || !password) {
        json(res, 400, { error: 'Email and password are required' }); return true;
      }

      // 1. Try Supabase Auth
      let supaUser = null;
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data && data.user) {
          supaUser = {
            id:         data.user.id,
            name:       data.user.user_metadata?.name || email.split('@')[0],
            email:      data.user.email,
            role:       data.user.user_metadata?.role || 'Verified Collector',
            avatar:     data.user.user_metadata?.avatar || '',
            balanceUsd: 2500,
            balanceEth: 0.95
          };
        }
      } catch (_) { /* fall through to local store */ }

      if (supaUser) {
        const token = crypto.randomBytes(24).toString('hex');
        ACTIVE_SESSIONS.set(token, supaUser);
        json(res, 200, { success: true, user: supaUser, token });
        return true;
      }

      // 2. Local / demo store fallback
      const localUser = LOCAL_USERS_STORE.find(u => u.email === email && u.password === password);
      if (!localUser) {
        json(res, 401, { error: 'Invalid email or password' }); return true;
      }
      const token = crypto.randomBytes(24).toString('hex');
      ACTIVE_SESSIONS.set(token, localUser);
      json(res, 200, { success: true, user: sanitizeUser(localUser), token });
    } catch (err) {
      json(res, 500, { error: 'Login error: ' + err.message });
    }
    return true;
  }

  // ── Session check ─────────────────────────────────────────────────────────
  if (req.method === 'GET' && pathname === '/api/auth/me') {
    const token = getBearerToken(req);
    if (token && ACTIVE_SESSIONS.has(token)) {
      json(res, 200, { success: true, user: sanitizeUser(ACTIVE_SESSIONS.get(token)) });
    } else {
      json(res, 401, { error: 'Unauthorized or session expired' });
    }
    return true;
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/auth/logout') {
    const token = getBearerToken(req);
    if (token) ACTIVE_SESSIONS.delete(token);
    json(res, 200, { success: true });
    return true;
  }

  // ── User sync GET ─────────────────────────────────────────────────────────
  if (req.method === 'GET' && pathname === '/api/user/sync') {
    const token = getBearerToken(req);
    if (token && ACTIVE_SESSIONS.has(token)) {
      const user = ACTIVE_SESSIONS.get(token);
      json(res, 200, { success: true, cart: user.cart || [], collection: user.collection || [], orders: user.orders || [] });
    } else {
      json(res, 401, { error: 'Unauthorized' });
    }
    return true;
  }

  // ── User sync POST ────────────────────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/user/sync') {
    const token = getBearerToken(req);
    if (!token || !ACTIVE_SESSIONS.has(token)) {
      json(res, 401, { error: 'Unauthorized' }); return true;
    }
    try {
      const payload = JSON.parse(await readBody(req) || '{}');
      const user = ACTIVE_SESSIONS.get(token);
      if (Array.isArray(payload.cart))       user.cart       = payload.cart;
      if (Array.isArray(payload.collection)) user.collection = payload.collection;
      if (Array.isArray(payload.orders))     user.orders     = payload.orders;
      json(res, 200, { success: true });
    } catch (e) {
      json(res, 400, { error: 'Invalid JSON payload' });
    }
    return true;
  }

  return false; // not handled by this router
}

module.exports = { handle };
