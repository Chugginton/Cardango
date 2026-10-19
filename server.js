/**
 * CARDANGO Backend Server & Card Upload API
 * Uses Supabase as the single source of truth for both:
 * 1. Database table records ('cards')
 * 2. Uploaded image storage bucket ('cards')
 */

require('dotenv').config();

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

// 1. Initialize Supabase Client
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xaathyktqbysmbioxdxu.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_KEY) {
  console.error('ERROR: SUPABASE_KEY is missing from your .env file!');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const PORT = process.env.PORT || 3000;

// ==================== AUTHENTICATION & USERS ====================
const LOCAL_USERS_STORE = [];
const ACTIVE_SESSIONS = new Map();

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

// ==================== SUPABASE STORAGE HELPERS ====================

// Upload base64 image directly to Supabase Storage bucket 'cards'
async function uploadBase64ToSupabase(dataString) {
  if (!dataString || typeof dataString !== 'string') return null;
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) return null;

  const contentType = matches[1].toLowerCase();
  let ext = '.png';
  if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = '.jpg';
  else if (contentType.includes('webp')) ext = '.webp';
  else if (contentType.includes('gif')) ext = '.gif';
  else if (contentType.includes('svg')) ext = '.svg';

  const filename = `card_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
  const buffer = Buffer.from(matches[2], 'base64');

  const { error } = await supabase.storage
    .from('cards')
    .upload(filename, buffer, {
      contentType,
      upsert: false
    });

  if (error) {
    console.error('Supabase storage upload error:', error.message);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from('cards')
    .getPublicUrl(filename);

  return publicUrlData.publicUrl;
}

// Download remote image and store it in Supabase Storage bucket 'cards'
async function downloadAndUploadUrlToSupabase(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return imageUrl;
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) return imageUrl;

  return new Promise((resolve) => {
    try {
      const parsed = new URL(imageUrl);
      const client = parsed.protocol === 'https:' ? require('https') : require('http');

      const req = client.get(imageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return downloadAndUploadUrlToSupabase(res.headers.location).then(resolve);
        }
        if (res.statusCode !== 200) {
          return resolve(imageUrl);
        }

        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', async () => {
          const buffer = Buffer.concat(chunks);
          const contentType = (res.headers['content-type'] || 'image/jpeg').toLowerCase();
          let ext = '.jpg';
          if (contentType.includes('png')) ext = '.png';
          else if (contentType.includes('webp')) ext = '.webp';
          else if (contentType.includes('gif')) ext = '.gif';

          const filename = `card_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;

          const { error } = await supabase.storage
            .from('cards')
            .upload(filename, buffer, {
              contentType,
              upsert: false
            });

          if (error) {
            console.warn('Storage upload fallback:', error.message);
            return resolve(imageUrl);
          }

          const { data: publicUrlData } = supabase.storage
            .from('cards')
            .getPublicUrl(filename);

          resolve(publicUrlData.publicUrl);
        });
      });

      req.on('error', () => resolve(imageUrl));
      req.setTimeout(8000, () => { req.destroy(); resolve(imageUrl); });
    } catch (e) {
      resolve(imageUrl);
    }
  });
}

// ==================== MIME TYPES ====================
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.sql': 'text/plain'
};

// ==================== HTTP SERVER ====================
const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  const pathname = reqUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ==================== AUTHENTICATION API ROUTES ====================

  // POST /api/auth/register - Register new collector account
  if (req.method === 'POST' && pathname === '/api/auth/register') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const name = (payload.name || '').trim();
        const email = (payload.email || '').trim().toLowerCase();
        const password = (payload.password || '').trim();
        const avatar = payload.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80`;

        if (!name || !email || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Name, email, and password are required' }));
          return;
        }

        if (password.length < 6) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Password must be at least 6 characters' }));
          return;
        }

        const existing = LOCAL_USERS_STORE.find(u => u.email === email);
        if (existing) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'An account with this email already exists' }));
          return;
        }

        // Try Supabase auth if configured
        try {
          await supabase.auth.signUp({
            email,
            password,
            options: { data: { name, avatar, role: 'Verified Collector' } }
          });
        } catch (supaAuthErr) {
          console.warn('Supabase auth signup notice:', supaAuthErr.message);
        }

        const newUser = {
          id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name,
          email,
          password,
          role: 'Verified Collector',
          avatar,
          balanceUsd: 1500,
          balanceEth: 0.52,
          createdAt: new Date().toISOString()
        };

        LOCAL_USERS_STORE.push(newUser);
        const token = crypto.randomBytes(24).toString('hex');
        ACTIVE_SESSIONS.set(token, newUser);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, user: sanitizeUser(newUser), token }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Registration error: ' + err.message }));
      }
    });
    return;
  }

  // POST /api/auth/login - Log in collector account
  if (req.method === 'POST' && pathname === '/api/auth/login') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const email = (payload.email || '').trim().toLowerCase();
        const password = (payload.password || '').trim();

        if (!email || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Email and password are required' }));
          return;
        }

        // 1. Try Supabase Auth
        let supaUser = null;
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (!error && data && data.user) {
            supaUser = {
              id: data.user.id,
              name: data.user.user_metadata?.name || email.split('@')[0],
              email: data.user.email,
              role: data.user.user_metadata?.role || 'Verified Collector',
              avatar: data.user.user_metadata?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
              balanceUsd: 2500,
              balanceEth: 0.95
            };
          }
        } catch (supaErr) {
          // Fall back to local store
        }

        if (supaUser) {
          const token = crypto.randomBytes(24).toString('hex');
          ACTIVE_SESSIONS.set(token, supaUser);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, user: supaUser, token }));
          return;
        }

        // 2. Check Local / Demo store fallback
        const localUser = LOCAL_USERS_STORE.find(u => u.email === email && u.password === password);
        if (!localUser) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid email or password' }));
          return;
        }

        const token = crypto.randomBytes(24).toString('hex');
        ACTIVE_SESSIONS.set(token, localUser);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, user: sanitizeUser(localUser), token }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Login error: ' + err.message }));
      }
    });
    return;
  }

  // GET /api/auth/me - Verify current session
  if (req.method === 'GET' && pathname === '/api/auth/me') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (token && ACTIVE_SESSIONS.has(token)) {
      const user = ACTIVE_SESSIONS.get(token);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, user: sanitizeUser(user) }));
      return;
    }

    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized or session expired' }));
    return;
  }

  // POST /api/auth/logout - Terminate session
  if (req.method === 'POST' && pathname === '/api/auth/logout') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token) {
      ACTIVE_SESSIONS.delete(token);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // ==================== CARD & STORAGE API ROUTES ====================

  // 1. GET /api/cards - List cards with filtering from Supabase
  if (req.method === 'GET' && pathname === '/api/cards') {
    const category = reqUrl.searchParams.get('category');
    const search = (reqUrl.searchParams.get('search') || '').trim();
    const inCarousel = reqUrl.searchParams.get('carousel') === 'true';

    try {
      let query = supabase.from('cards').select('*').order('id', { ascending: true });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }
      if (inCarousel) {
        query = query.eq('is_in_carousel', true);
      }
      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data || []));
      return;
    } catch (dbErr) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Supabase error: ' + dbErr.message }));
      return;
    }
  }

  // 2. POST /api/upload-image - Upload Base64 Image to Supabase Storage
  if (req.method === 'POST' && pathname === '/api/upload-image') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const imageUrl = await uploadBase64ToSupabase(payload.data || payload.image);
        if (!imageUrl) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid or missing image data' }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, url: imageUrl }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to process image: ' + err.message }));
      }
    });
    return;
  }

  // 3. POST /api/upload-image-url - Download & Cache Remote Image into Supabase Storage
  if (req.method === 'POST' && pathname === '/api/upload-image-url') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        if (!payload.url) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing image URL' }));
          return;
        }
        const savedUrl = await downloadAndUploadUrlToSupabase(payload.url);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, url: savedUrl }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to download image: ' + err.message }));
      }
    });
    return;
  }

  // 4. POST /api/cards - Upload & Insert Card into Supabase
  if (req.method === 'POST' && pathname === '/api/cards') {
    let body = '';
    const MAX_PAYLOAD_SIZE = 10 * 1024 * 1024; // 10MB limit

    req.on('data', chunk => {
      body += chunk;
      if (body.length > MAX_PAYLOAD_SIZE) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload too large (Max 10MB)' }));
        req.destroy();
      }
    });

    req.on('error', (streamErr) => {
      console.error('Request stream error:', streamErr);
      if (!res.headersSent) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Upload stream interrupted' }));
      }
    });

    req.on('end', async () => {
      try {
        let cardData;
        try {
          cardData = JSON.parse(body);
        } catch (jsonErr) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Malformed JSON payload' }));
          return;
        }

        const validCategories = ['dev', 'pokemon', 'anime', 'cricket', 'football'];
        const rawCategory = (cardData.category || '').toLowerCase().trim();

        if (!cardData.title || !rawCategory || cardData.price_usd == null || !cardData.image_url) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing required card fields: title, category, price_usd, image_url' }));
          return;
        }

        if (!validCategories.includes(rawCategory)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` }));
          return;
        }

        const priceUsd = Number(cardData.price_usd);
        if (Number.isNaN(priceUsd) || priceUsd < 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Price (USD) must be a valid positive number' }));
          return;
        }

        const calculatedEth = cardData.price_eth 
          ? Number(cardData.price_eth) 
          : Number((priceUsd / 2800).toFixed(4));

        let finalImageUrl = cardData.image_url;
        try {
          if (finalImageUrl.startsWith('data:image/')) {
            const savedUrl = await uploadBase64ToSupabase(finalImageUrl);
            if (savedUrl) finalImageUrl = savedUrl;
          } else if (finalImageUrl.startsWith('http://') || finalImageUrl.startsWith('https://')) {
            const cachedUrl = await downloadAndUploadUrlToSupabase(finalImageUrl);
            if (cachedUrl) finalImageUrl = cachedUrl;
          }
        } catch (imgErr) {
          console.warn('Image storage error, using raw URL:', imgErr.message);
        }

        const newCard = {
          title: String(cardData.title).trim(),
          category: rawCategory,
          price_usd: priceUsd,
          price_eth: Number.isNaN(calculatedEth) ? 0 : calculatedEth,
          image_url: finalImageUrl,
          is_in_carousel: cardData.is_in_carousel === true || cardData.is_in_carousel === 'true',
          is_spotlight: cardData.is_spotlight === true || cardData.is_spotlight === 'true',
          description: String(cardData.description || 'Authentic collectible slab.').trim()
        };

        const { data, error } = await supabase
          .from('cards')
          .insert([newCard])
          .select();

        if (error) throw error;

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, card: data[0] }));
        return;
      } catch (err) {
        console.error('Unhandled POST /api/cards error:', err);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to save card: ' + err.message }));
        }
      }
    });
    return;
  }

  // 5. GET /api/export-sql - Generate SQL INSERTs directly from Supabase
  if (req.method === 'GET' && pathname === '/api/export-sql') {
    try {
      const { data: rows, error } = await supabase
        .from('cards')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      const sqlStatements = (rows || []).map(c => {
        const escape = s => String(s || '').replace(/'/g, "''");
        return `INSERT INTO cards (title, category, price_usd, price_eth, image_url, is_in_carousel, is_spotlight, description) VALUES ('${escape(c.title)}', '${escape(c.category)}', ${c.price_usd}, ${c.price_eth}, '${escape(c.image_url)}', ${c.is_in_carousel ? 'TRUE' : 'FALSE'}, ${c.is_spotlight ? 'TRUE' : 'FALSE'}, '${escape(c.description)}');`;
      }).join('\n\n');

      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(sqlStatements);
      return;
    } catch (exportErr) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Database error: ' + exportErr.message }));
      return;
    }
  }

  // ==================== STATIC FILE SERVING ====================
  if (pathname.startsWith('/.well-known/') || pathname === '/favicon.ico') {
    let checkPath = path.join(__dirname, pathname);
    if (!fs.existsSync(checkPath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
  }

  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`  Local URL:   http://localhost:${PORT}`);
});