/**
 * lib/supabase.js
 * Singleton Supabase client shared across all route modules.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xaathyktqbysmbioxdxu.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_KEY) {
  console.error('ERROR: SUPABASE_KEY is missing from your .env file!');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;
