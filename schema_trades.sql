-- ========================================================
-- CARDANGO: Peer-to-Peer Escrow Trade & Offer System Schema
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- ========================================================

CREATE TABLE IF NOT EXISTS public.trades (
    id TEXT PRIMARY KEY,
    proposer_id TEXT,
    proposer_name TEXT NOT NULL,
    proposer_email TEXT NOT NULL,
    owner_id TEXT,
    owner_name TEXT NOT NULL,
    owner_email TEXT NOT NULL,
    target_card_id BIGINT,
    target_card_title TEXT NOT NULL,
    target_card_image TEXT,
    target_card_price NUMERIC,
    offered_card_id BIGINT,
    offered_card_title TEXT NOT NULL,
    offered_card_image TEXT,
    offered_card_price NUMERIC,
    cash_sweetener NUMERIC DEFAULT 0,
    note TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'declined'
    confirmation_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security (RLS) or allow public read/write if using anon key
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read trades"
    ON public.trades FOR SELECT USING (true);

CREATE POLICY "Allow public insert trades"
    ON public.trades FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update trades"
    ON public.trades FOR UPDATE USING (true);

CREATE INDEX IF NOT EXISTS idx_trades_status ON public.trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_owner_email ON public.trades(owner_email);
CREATE INDEX IF NOT EXISTS idx_trades_proposer_email ON public.trades(proposer_email);
