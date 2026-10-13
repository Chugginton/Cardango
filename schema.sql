-- ==========================================================
-- CARDANGO Collectibles - PostgreSQL Database Schema
-- Run this script in pgAdmin, Supabase, Neon, or psql CLI
-- ==========================================================

-- 1. Create Cards Table
CREATE TABLE IF NOT EXISTS cards (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('dev', 'pokemon', 'anime', 'cricket', 'football')),
    grade VARCHAR(50) DEFAULT 'PSA 10 Gem Mint',
    price_usd NUMERIC(10, 2) NOT NULL,
    price_eth NUMERIC(8, 4) DEFAULT 0.0000,
    image_url TEXT NOT NULL,
    is_in_carousel BOOLEAN DEFAULT FALSE,
    is_spotlight BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fast lookup indexes for category filtering, carousel display, and search
CREATE INDEX IF NOT EXISTS idx_cards_category ON cards(category);
CREATE INDEX IF NOT EXISTS idx_cards_carousel ON cards(is_in_carousel);
CREATE INDEX IF NOT EXISTS idx_cards_created ON cards(created_at DESC);

-- ==========================================================
-- 2. Initial Batch Upload (Complete 25 Trading Cards)
-- ==========================================================
INSERT INTO cards (title, category, grade, price_usd, price_eth, image_url, is_in_carousel, is_spotlight, description)
VALUES
(
    'Ho-oh ex Ultra Rare Holo #260', 
    'pokemon', 
    'PSA 10 Gem Mint', 
    2450.00, 
    0.8800, 
    'uploads/card_1791720108934_dbyhqy.jpg', 
    TRUE, 
    TRUE, 
    'Paradox Rift Special Illustration Rare Ho-oh ex in pristine gem mint condition with radiant rainbow holographic foil.'
),
(
    'Charizard 1st Edition Shadowless Holo #004', 
    'pokemon', 
    'BGS 9.5 Gem Mint', 
    3450.00, 
    1.2500, 
    'https://i.pinimg.com/736x/35/ca/32/35ca32abb63da8220873970a391d6876.jpg', 
    TRUE, 
    TRUE, 
    'Legendary 1999 Base Set 1st Edition Shadowless Charizard with sparkling holo foil background.'
),
(
    'Rayquaza Gold Star Ultra Rare Holo #107', 
    'pokemon', 
    'PSA 10 Gem Mint', 
    2890.00, 
    1.0200, 
    'https://i.pinimg.com/736x/49/41/8d/49418d6198c0ead91eb561b62d936ee0.jpg', 
    TRUE, 
    FALSE, 
    'Shadowless edge preservation, vaulted in climate-controlled optical scan hub.'
),
(
    'Gengar VMAX Alternate Art Secret #271', 
    'pokemon', 
    'PSA 10 Gem Mint', 
    680.00, 
    0.2400, 
    'https://i.pinimg.com/1200x/ae/bb/a2/aebba27862a3df2176d06c34c0de2d9a.jpg', 
    TRUE, 
    FALSE, 
    'Fusion Strike alternate art secret rare slab featuring Gengar swallowing buildings.'
),
(
    'Umbreon VMAX Moonbreon Alt Art #215', 
    'pokemon', 
    'PSA 10 Gem Mint', 
    1100.00, 
    0.3900, 
    'https://i.pinimg.com/736x/28/83/a8/2883a8ea732d85a3e2c14b1fdf5afb17.jpg', 
    TRUE, 
    FALSE, 
    'The iconic Moonbreon alternate art secret rare from Evolving Skies in immaculate gem mint condition.'
),
(
    'Mewtwo GX Secret Rare Shining Legends #78', 
    'pokemon', 
    'BGS 10 Pristine', 
    950.00, 
    0.3400, 
    'https://i.pinimg.com/1200x/7c/32/67/7c32670bc75b5b3f6eb3a5fdc9740164.jpg', 
    TRUE, 
    FALSE, 
    'Mewtwo test tube rainbow secret illustration rare with perfect subgrade alignment.'
),
(
    'Pikachu Illustrator Commemorative Holo #01', 
    'pokemon', 
    'PSA 10 Gem Mint', 
    4200.00, 
    1.5000, 
    'https://i.pinimg.com/1200x/0a/7b/7b/0a7b7b1322c6c170bebd94efca62dc75.jpg', 
    TRUE, 
    TRUE, 
    'Pristine commemorative print of the world famous Pikachu Illustrator card.'
),
(
    'Monkey D. Luffy Gear 5 Manga Secret #01', 
    'anime', 
    'BGS 10 Pristine', 
    1950.00, 
    0.6900, 
    'https://i.pinimg.com/1200x/8a/6f/20/8a6f2091122f67b8813a9849b742b60a.jpg', 
    TRUE, 
    TRUE, 
    'One Piece Japanese special illustration rare with flawless holographic foil stamp.'
),
(
    'Naruto Uzumaki Sage Mode Foil Slab', 
    'anime', 
    'PSA 10 Gem Mint', 
    1680.00, 
    0.5900, 
    'https://i.pinimg.com/1200x/6b/9b/1d/6b9b1d82363e47e3f8cd0fb25a41871e.jpg', 
    TRUE, 
    FALSE, 
    'Limited release anime trading card slab authenticated by Beckett.'
),
(
    'Roronoa Zoro Manga Parallel Secret Foil', 
    'anime', 
    'PSA 10 Gem Mint', 
    1450.00, 
    0.5100, 
    'https://i.pinimg.com/1200x/60/18/39/6018396436f97c3de5ae3f9a9ff44f08.jpg', 
    TRUE, 
    FALSE, 
    'Three sword style Enma activation parallel foil in Beckett optical encasement.'
),
(
    'Goku Ultra Instinct Secret Rare DBS Foil', 
    'anime', 
    'BGS 10 Pristine', 
    2100.00, 
    0.7500, 
    'https://i.pinimg.com/736x/d6/3a/74/d63a7450e6aea6186bb4db0e418a8976.jpg', 
    FALSE, 
    FALSE, 
    'Silver hair Ultra Instinct form with reflective silver chrome border and subgrade 10.'
),
(
    'Gojo Satoru Unlimited Void Holographic Slab', 
    'anime', 
    'PSA 10 Gem Mint', 
    1850.00, 
    0.6500, 
    'https://i.pinimg.com/736x/35/1f/c5/351fc51d72cd1b4528c95125d1b90ea1.jpg', 
    FALSE, 
    FALSE, 
    'Jujutsu Kaisen special edition slab featuring Gojo unmasked with six eyes reflection.'
),
(
    'Lionel Messi 2022 World Cup Golden Ball Refractor Slab', 
    'football', 
    'PSA 10 Gem Mint', 
    4800.00, 
    1.7000, 
    'https://i.pinimg.com/736x/da/6f/2c/da6f2c6782704e4120fc689f5da89482.jpg', 
    TRUE, 
    TRUE, 
    'Historic tournament commemorative gold refractor trading card in gem mint condition.'
),
(
    'Cristiano Ronaldo CR7 Manchester United Rookie Card Slab', 
    'football', 
    'BGS 9.5 Gem Mint', 
    4200.00, 
    1.5000, 
    'https://i.pinimg.com/736x/12/ce/23/12ce236055ea444ce30780afda629a5d.jpg', 
    TRUE, 
    FALSE, 
    'Portuguese legend commemorative trading card encased with tamper-proof sonic weld.'
),
(
    'Erling Haaland Dortmund Rookie Gold Refractor', 
    'football', 
    'PSA 10 Gem Mint', 
    2600.00, 
    0.9200, 
    'https://i.pinimg.com/736x/a9/78/19/a97819aa814cf2614b9b8ce97a71248e.jpg', 
    FALSE, 
    FALSE, 
    'Goal scoring sensation debut year chrome rookie card in flawless gem mint casing.'
),
(
    'Sachin Tendulkar 1999 Century Master Relic Slab', 
    'cricket', 
    'BGS 9.5 Gem Mint', 
    4100.00, 
    1.4500, 
    'https://i.pinimg.com/736x/42/e3/1a/42e31a89a861c1bf09dd484ceb6babac.jpg', 
    TRUE, 
    TRUE, 
    'Includes game-used jersey patch embed with certified provenance serial.'
),
(
    'Rust Kernel Hacker #08', 
    'dev', 
    'BGS 9.5 Gem Mint', 
    2200.00, 
    0.7800, 
    'https://i.pinimg.com/1200x/52/c9/06/52c9067bd5e9c4188f8241857fca1597.jpg', 
    TRUE, 
    FALSE, 
    'Rare low-latency systems developer series card in immaculate acrylic slab.'
)
-- ==========================================================
-- 3. Frontend Production Queries
-- ==========================================================

-- Query 1: Filter by category (or all)
-- SELECT * FROM cards WHERE ($1 = 'all' OR category = $1) ORDER BY id DESC;

-- Query 2: Get items for 3D Orbit Cylinder Carousel
-- SELECT image_url, title FROM cards WHERE is_in_carousel = TRUE LIMIT 10;

-- Query 3: Live title and grade search
-- SELECT * FROM cards WHERE title ILIKE '%' || $1 || '%' OR grade ILIKE '%' || $1 || '%';

-- Uploaded Card: car
INSERT INTO cards (title, category, grade, price_usd, price_eth, image_url, is_in_carousel, is_spotlight, description)
VALUES ('car', 'football', 'PSA 10 Gem Mint', 2.57, 0.0009, 'uploads/card_1791725702181_ryw9th.jpg', FALSE, FALSE, 'Graded authentic collectible slab.');
