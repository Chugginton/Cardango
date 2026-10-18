/**
 * CARDANGO Backend Server & Card Upload API
 * Works standalone with zero configuration, and connects seamlessly to PostgreSQL (Supabase/Neon/Local).
 * 
 * Usage:
 *   node server.js
 * (Optional for PostgreSQL: set DATABASE_URL=postgres://user:pass@host:5432/dbname)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '#Keval123',
    database: process.env.DB_NAME || 'CARDANGO',
    waitForConnections: true,
    connectionLimit: 10
});
const PORT = process.env.PORT || 3000;

// NOTE: No JSON/file storage. MySQL (CARDANGO.cards) is the ONLY data store.
// All data lives in schema.sql seed + live MySQL rows.

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function saveBase64Image(dataString) {
  if (!dataString || typeof dataString !== 'string') return null;
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) return null;

  const mime = matches[1].toLowerCase();
  let ext = '.png';
  if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
  else if (mime.includes('webp')) ext = '.webp';
  else if (mime.includes('gif')) ext = '.gif';
  else if (mime.includes('svg')) ext = '.svg';

  const filename = `card_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
  const filePath = path.join(UPLOADS_DIR, filename);
  const buffer = Buffer.from(matches[2], 'base64');
  fs.writeFileSync(filePath, buffer);
  return `uploads/${filename}`;
}

function downloadAndSaveImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return Promise.resolve(imageUrl);
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) return Promise.resolve(imageUrl);
  
  return new Promise((resolve) => {
    try {
      const parsed = new URL(imageUrl);
      const client = parsed.protocol === 'https:' ? require('https') : require('http');
      const req = client.get(imageUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return downloadAndSaveImageUrl(res.headers.location).then(resolve);
        }
        if (res.statusCode !== 200) {
          return resolve(imageUrl);
        }
        const contentType = (res.headers['content-type'] || '').toLowerCase();
        let ext = '.jpg';
        if (contentType.includes('png')) ext = '.png';
        else if (contentType.includes('webp')) ext = '.webp';
        else if (contentType.includes('gif')) ext = '.gif';
        
        const filename = `card_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
        const filePath = path.join(UPLOADS_DIR, filename);
        const fileStream = fs.createWriteStream(filePath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(`uploads/${filename}`);
        });
        fileStream.on('error', () => resolve(imageUrl));
      });
      req.on('error', () => resolve(imageUrl));
      req.setTimeout(8000, () => { req.destroy(); resolve(imageUrl); });
    } catch (e) {
      resolve(imageUrl);
    }
  });
}

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

// Create HTTP server
const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  const pathname = reqUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ==================== API ROUTES ====================

  // 1. GET /api/cards - List cards with filtering
  if (req.method === 'GET' && pathname === '/api/cards') {
    const category = reqUrl.searchParams.get('category');
    const search = (reqUrl.searchParams.get('search') || '').toLowerCase();
    const inCarousel = reqUrl.searchParams.get('carousel') === 'true';

    try {
      // MySQL ONLY - SQL is single source of truth
      let query = 'SELECT * FROM cards WHERE 1=1';
      const params = [];
      if (category && category !== 'all') {
        params.push(category);
        query += ' AND category = ?';
      }
      if (inCarousel) {
        query += ' AND is_in_carousel = 1';
      }
        if (search) {
          params.push(`%${search}%`);
          query += ' AND (title LIKE ? OR grade LIKE ?)';
        }
        query += ' ORDER BY id ASC';
        const [rows] = await db.query(query, params);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(rows));
        return;
    } catch (dbErr) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Database error: ' + dbErr.message }));
      return;
    }
  }

  // 2. POST /api/upload-image - Upload Local Image File
  if (req.method === 'POST' && pathname === '/api/upload-image') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const imageUrl = saveBase64Image(payload.data || payload.image);
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

  // 3. POST /api/upload-image-url - Download & Cache Remote Image URL
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
        const savedUrl = await downloadAndSaveImageUrl(payload.url);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, url: savedUrl }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to download image: ' + err.message }));
      }
    });
    return;
  }

 // 4. POST /api/cards - Upload & Insert New Card
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

      // 1. Validate Required Fields
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

      // 2. Process Image (Local Cache or Base64)
      let finalImageUrl = cardData.image_url;
      try {
        if (finalImageUrl.startsWith('data:image/')) {
          const savedUrl = saveBase64Image(finalImageUrl);
          if (savedUrl) finalImageUrl = savedUrl;
        } else if (finalImageUrl.startsWith('http://') || finalImageUrl.startsWith('https://')) {
          const cachedUrl = await downloadAndSaveImageUrl(finalImageUrl);
          if (cachedUrl) finalImageUrl = cachedUrl;
        }
      } catch (imgErr) {
        console.warn('Image caching/storage error, falling back to original URL:', imgErr.message);
      }

      // 3. Prepare Normalized Entity
      const newCard = {
        title: String(cardData.title).trim(),
        category: rawCategory,
        grade: String(cardData.grade || 'PSA 10 Gem Mint').trim(),
        price_usd: priceUsd,
        price_eth: Number.isNaN(calculatedEth) ? 0 : calculatedEth,
        image_url: finalImageUrl,
        is_in_carousel: cardData.is_in_carousel === true || cardData.is_in_carousel === 'true',
        is_spotlight: cardData.is_spotlight === true || cardData.is_spotlight === 'true',
        description: String(cardData.description || 'Graded authentic collectible slab.').trim()
      };

      // 4. INSERT into MySQL ONLY (SQL is single source of truth)
        const insertQuery = `
          INSERT INTO cards (
            title, category, grade, price_usd, price_eth, 
            image_url, is_in_carousel, is_spotlight, description
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const values = [
          newCard.title, newCard.category, newCard.grade,
          newCard.price_usd, newCard.price_eth, newCard.image_url,
          newCard.is_in_carousel ? 1 : 0, newCard.is_spotlight ? 1 : 0, newCard.description
        ];

        const [insertResult] = await db.query(insertQuery, values);
        const [createdRows] = await db.query('SELECT * FROM cards WHERE id = ?', [insertResult.insertId]);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, card: createdRows[0] }));
        return;
    } catch (err) {
      console.error('Unhandled POST /api/cards error:', err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to save card: ' + err.message }));
      }
    }
  }
);
}


  // 5. GET /api/export-sql - Generate SQL INSERTs FROM MySQL (no local data)
  if (req.method === 'GET' && pathname === '/api/export-sql') {
    try {
      const [rows] = await db.query('SELECT * FROM cards ORDER BY id ASC');
    const sqlStatements = rows.map(c => {
      const escape = s => String(s || '').replace(/'/g, "''");
      return `INSERT INTO cards (title, category, grade, price_usd, price_eth, image_url, is_in_carousel, is_spotlight, description) VALUES ('${escape(c.title)}', '${escape(c.category)}', '${escape(c.grade)}', ${c.price_usd}, ${c.price_eth}, '${escape(c.image_url)}', ${c.is_in_carousel ? 'TRUE' : 'FALSE'}, ${c.is_spotlight ? 'TRUE' : 'FALSE'}, '${escape(c.description)}');`;
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
