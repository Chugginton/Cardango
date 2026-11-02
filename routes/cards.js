/**
 * routes/cards.js
 * Card catalog & image upload routes:
 *   GET    /api/cards
 *   POST   /api/upload-image
 *   POST   /api/upload-image-url
 *   POST   /api/cards
 *   DELETE /api/cards/:id
 *   POST   /api/cards/delete-by-title
 */

const supabase = require('../lib/supabase');
const { uploadBase64ToSupabase, downloadAndUploadUrlToSupabase } = require('../lib/storage');
const { readBody, json } = require('../lib/middleware');
const TradesService = require('../trades_service');

const VALID_CATEGORIES = ['dev', 'pokemon', 'anime', 'cricket', 'football'];
const MAX_PAYLOAD_SIZE = 10 * 1024 * 1024; // 10 MB

async function handle(req, res, pathname, reqUrl) {
  const PORT = process.env.PORT || 3000;

  // ── GET /api/cards ────────────────────────────────────────────────────────
  if (req.method === 'GET' && pathname === '/api/cards') {
    const category  = reqUrl.searchParams.get('category');
    const search    = (reqUrl.searchParams.get('search') || '').trim();
    const inCarousel = reqUrl.searchParams.get('carousel') === 'true';

    try {
      let query = supabase.from('cards').select('*').order('id', { ascending: true });
      if (category && category !== 'all') query = query.eq('category', category);
      if (inCarousel)                     query = query.eq('is_in_carousel', true);
      if (search)                         query = query.ilike('title', `%${search}%`);

      const { data, error } = await query;
      if (error) throw error;
      json(res, 200, data || []);
    } catch (err) {
      json(res, 500, { error: 'Supabase error: ' + err.message });
    }
    return true;
  }

  // ── POST /api/upload-image (base64) ───────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/upload-image') {
    try {
      const payload  = JSON.parse(await readBody(req));
      const imageUrl = await uploadBase64ToSupabase(payload.data || payload.image);
      if (!imageUrl) { json(res, 400, { error: 'Invalid or missing image data' }); return true; }
      json(res, 200, { success: true, url: imageUrl });
    } catch (err) {
      json(res, 500, { error: 'Failed to process image: ' + err.message });
    }
    return true;
  }

  // ── POST /api/upload-image-url (remote URL caching) ───────────────────────
  if (req.method === 'POST' && pathname === '/api/upload-image-url') {
    try {
      const payload = JSON.parse(await readBody(req));
      if (!payload.url) { json(res, 400, { error: 'Missing image URL' }); return true; }
      const savedUrl = await downloadAndUploadUrlToSupabase(payload.url);
      json(res, 200, { success: true, url: savedUrl });
    } catch (err) {
      json(res, 500, { error: 'Failed to download image: ' + err.message });
    }
    return true;
  }

  // ── POST /api/cards (create card) ─────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/cards') {
    // Stream with size limit
    let body = '';
    await new Promise((resolve, reject) => {
      req.on('data', chunk => {
        body += chunk;
        if (body.length > MAX_PAYLOAD_SIZE) {
          json(res, 413, { error: 'Payload too large (Max 10MB)' });
          req.destroy();
          resolve();
        }
      });
      req.on('end', resolve);
      req.on('error', reject);
    });

    if (res.headersSent) return true;

    try {
      let cardData;
      try {
        cardData = JSON.parse(body);
      } catch (_) {
        json(res, 400, { error: 'Malformed JSON payload' }); return true;
      }

      const rawCategory = (cardData.category || '').toLowerCase().trim();

      if (!cardData.title || !rawCategory || cardData.price_usd == null || !cardData.image_url) {
        json(res, 400, { error: 'Missing required fields: title, category, price_usd, image_url' }); return true;
      }
      if (!VALID_CATEGORIES.includes(rawCategory)) {
        json(res, 400, { error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` }); return true;
      }

      const priceUsd = Number(cardData.price_usd);
      if (Number.isNaN(priceUsd) || priceUsd < 0) {
        json(res, 400, { error: 'Price (USD) must be a valid positive number' }); return true;
      }

      const calculatedEth = cardData.price_eth
        ? Number(cardData.price_eth)
        : Number((priceUsd / (83 * 2800)).toFixed(6));

      // Persist image to Supabase Storage
      let finalImageUrl = cardData.image_url;
      try {
        if (finalImageUrl.startsWith('data:image/')) {
          const saved = await uploadBase64ToSupabase(finalImageUrl);
          if (saved) finalImageUrl = saved;
        } else if (finalImageUrl.startsWith('http://') || finalImageUrl.startsWith('https://')) {
          const cached = await downloadAndUploadUrlToSupabase(finalImageUrl);
          if (cached) finalImageUrl = cached;
        }
      } catch (imgErr) {
        console.warn('Image storage error, using raw URL:', imgErr.message);
      }

      const newCard = {
        title:         String(cardData.title).trim(),
        category:      rawCategory,
        price_usd:     priceUsd,
        price_eth:     Number.isNaN(calculatedEth) ? 0 : calculatedEth,
        image_url:     finalImageUrl,
        is_in_carousel: cardData.is_in_carousel === true || cardData.is_in_carousel === 'true',
        is_spotlight:   cardData.is_spotlight   === true || cardData.is_spotlight   === 'true',
        description:   String(cardData.description || 'Authentic collectible slab.').trim()
      };

      // Deduplicate: check if title+category already exists
      const { data: existing } = await supabase
        .from('cards').select('*')
        .ilike('title', newCard.title).eq('category', newCard.category).limit(1);

      if (existing && existing.length > 0) {
        const card = existing[0];
        _maybeCreateTradeListing(card, cardData, priceUsd, req, PORT);
        json(res, 200, { success: true, card, duplicatePrevented: true });
        return true;
      }

      const { data, error } = await supabase.from('cards').insert([newCard]).select();
      if (error) throw error;

      const savedCard = (data && data[0]) ? data[0] : newCard;
      _maybeCreateTradeListing(savedCard, cardData, priceUsd, req, PORT);
      json(res, 201, { success: true, card: savedCard });
    } catch (err) {
      console.error('POST /api/cards error:', err);
      if (!res.headersSent) json(res, 500, { error: 'Failed to save card: ' + err.message });
    }
    return true;
  }

  // ── DELETE /api/cards/:id ─────────────────────────────────────────────────
  if (req.method === 'DELETE' && pathname.startsWith('/api/cards/')) {
    const cardId = pathname.replace('/api/cards/', '').trim();
    if (!cardId) return false;
    try {
      const { error } = await supabase.from('cards').delete().eq('id', cardId);
      if (error) throw error;
      json(res, 200, { success: true, deletedId: cardId });
    } catch (err) {
      json(res, 500, { error: err.message });
    }
    return true;
  }

  // ── POST /api/cards/delete-by-title ───────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/cards/delete-by-title') {
    try {
      const { title } = JSON.parse(await readBody(req) || '{}');
      if (!title) { json(res, 400, { error: 'Title required' }); return true; }
      const { data, error } = await supabase.from('cards').delete().ilike('title', title.trim()).select();
      if (error) throw error;
      json(res, 200, { success: true, deleted: data });
    } catch (err) {
      json(res, 500, { error: err.message });
    }
    return true;
  }

  return false; // not handled
}

/** Fire-and-forget trade listing creation when is_in_trade flag is set. */
function _maybeCreateTradeListing(card, cardData, priceUsd, req, PORT) {
  if (cardData.is_in_trade !== true && cardData.is_in_trade !== 'true') return;
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host     = req.headers['host'] || `localhost:${PORT}`;
  const baseUrl  = `${protocol}://${host}`;

  const listing = TradesService.addTradeListing({
    cardId:      card.id || Date.now(),
    cardName:    card.title,
    cardPrice:   priceUsd,  // already stored as INR
    cardPriceEth: card.price_eth,
    image:       card.image_url,
    traderName:  (cardData.owner_name  || 'Verified Collector').trim(),
    traderEmail: (cardData.owner_email || 'collector@cardango.com').trim(),
    traderRole:  (cardData.owner_role  || 'Vault Verified • Uploader').trim()
  });

  TradesService.sendTradeListingEmail({ card: listing, userEmail: cardData.owner_email, baseUrl });
}

module.exports = { handle };
