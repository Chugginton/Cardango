/**
 * lib/storage.js
 * Supabase Storage helpers: upload base64 images and cache remote image URLs.
 */

const supabase = require('./supabase');

/**
 * Upload a base64-encoded data URL to Supabase Storage bucket 'cards'.
 * Returns the public URL of the uploaded file, or null on failure.
 */
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
    .upload(filename, buffer, { contentType, upsert: false });

  if (error) {
    console.error('Supabase storage upload error:', error.message);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage.from('cards').getPublicUrl(filename);
  return publicUrlData.publicUrl;
}

/**
 * Download a remote image and store it in Supabase Storage bucket 'cards'.
 * Falls back to returning the original URL on any error.
 */
function downloadAndUploadUrlToSupabase(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return Promise.resolve(imageUrl);
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) return Promise.resolve(imageUrl);

  return new Promise((resolve) => {
    try {
      const parsed = new URL(imageUrl);
      const client = parsed.protocol === 'https:' ? require('https') : require('http');

      const req = client.get(imageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return downloadAndUploadUrlToSupabase(res.headers.location).then(resolve);
        }
        if (res.statusCode !== 200) return resolve(imageUrl);

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
            .upload(filename, buffer, { contentType, upsert: false });

          if (error) {
            console.warn('Storage upload fallback:', error.message);
            return resolve(imageUrl);
          }

          const { data: publicUrlData } = supabase.storage.from('cards').getPublicUrl(filename);
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

module.exports = { uploadBase64ToSupabase, downloadAndUploadUrlToSupabase };
