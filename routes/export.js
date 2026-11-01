/**
 * routes/export.js
 * Database export route:
 *   GET /api/export-sql
 */

const supabase = require('../lib/supabase');
const { json } = require('../lib/middleware');

async function handle(req, res, pathname) {
  if (req.method !== 'GET' || pathname !== '/api/export-sql') return false;

  try {
    const { data: rows, error } = await supabase
      .from('cards')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    const escape = s => String(s || '').replace(/'/g, "''");
    const sql = (rows || []).map(c =>
      `INSERT INTO cards (title, category, price_usd, price_eth, image_url, is_in_carousel, is_spotlight, description) ` +
      `VALUES ('${escape(c.title)}', '${escape(c.category)}', ${c.price_usd}, ${c.price_eth}, ` +
      `'${escape(c.image_url)}', ${c.is_in_carousel ? 'TRUE' : 'FALSE'}, ${c.is_spotlight ? 'TRUE' : 'FALSE'}, '${escape(c.description)}');`
    ).join('\n\n');

    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(sql);
  } catch (err) {
    json(res, 500, { error: 'Database error: ' + err.message });
  }
  return true;
}

module.exports = { handle };
