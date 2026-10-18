-- ==========================================================
-- CARDANGO Collectibles - MySQL Database (SINGLE SOURCE OF TRUTH)
-- All card data lives ONLY here. app.js and server.js contain NO data.
-- Run:  mysql -u root -p < schema.sql
-- Or:   source schema.sql  (inside mysql shell)
-- ==========================================================
CREATE DATABASE IF NOT EXISTS CARDANGO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE CARDANGO;

DROP TABLE IF EXISTS cards;
CREATE TABLE cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(20) NOT NULL,
    category_label VARCHAR(50) NOT NULL DEFAULT '',
    rarity VARCHAR(50) NOT NULL DEFAULT 'Mythic Rare',
    edition VARCHAR(50) NOT NULL DEFAULT '1st Edition',
    grade VARCHAR(50) NOT NULL DEFAULT 'PSA 10 Gem Mint',
    price_usd DECIMAL(10,2) NOT NULL,
    price_eth DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
    image_url TEXT NOT NULL,
    badge_color VARCHAR(100) NOT NULL DEFAULT '',
    card_accent VARCHAR(50) NOT NULL DEFAULT '',
    is_in_carousel TINYINT(1) NOT NULL DEFAULT 0,
    is_spotlight TINYINT(1) NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_cards_category CHECK (category IN ('dev','pokemon','anime','cricket','football')),
    FULLTEXT INDEX ft_cards_title_desc (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_cards_category ON cards(category);
CREATE INDEX idx_cards_carousel ON cards(is_in_carousel);
CREATE INDEX idx_cards_created ON cards(created_at);

-- ==========================================================
-- Seed data (17 trading cards). ONLY place where data exists.
-- ==========================================================
INSERT INTO cards (title, category, category_label, rarity, edition, grade, price_usd, price_eth, image_url, badge_color, card_accent, is_in_carousel, is_spotlight, description)
VALUES
('Ho-oh ex Ultra Rare Holo #260', 'pokemon', 'POKEMON CARD', 'Mythic Rare', '1st Edition', 'PSA 10 Gem Mint', 2450.00, 0.8800, 'uploads/card_1791720108934_dbyhqy.jpg', 'bg-amber-100 text-amber-800 border-amber-300', 'border-amber-500', TRUE, TRUE, 'Paradox Rift Special Illustration Rare Ho-oh ex in pristine gem mint condition with radiant rainbow holographic foil.'),
('Charizard 1st Edition Shadowless Holo #004', 'pokemon', 'POKEMON CARD', 'Mythic Rare', '1st Edition', 'BGS 9.5 Gem Mint', 3450.00, 1.2500, 'https://i.pinimg.com/736x/35/ca/32/35ca32abb63da8220873970a391d6876.jpg', 'bg-amber-100 text-amber-800 border-amber-300', 'border-amber-500', TRUE, TRUE, 'Legendary 1999 Base Set 1st Edition Shadowless Charizard with sparkling holo foil background.'),
('Rayquaza Gold Star Ultra Rare Holo #107', 'pokemon', 'POKEMON CARD', 'Mythic Rare', '1st Edition', 'PSA 10 Gem Mint', 2890.00, 1.0200, 'https://i.pinimg.com/736x/49/41/8d/49418d6198c0ead91eb561b62d936ee0.jpg', 'bg-amber-100 text-amber-800 border-amber-300', 'border-amber-500', TRUE, FALSE, 'Shadowless edge preservation, vaulted in climate-controlled optical scan hub.'),
('Gengar VMAX Alternate Art Secret #271', 'pokemon', 'POKEMON CARD', 'Mythic Rare', '1st Edition', 'PSA 10 Gem Mint', 680.00, 0.2400, 'https://i.pinimg.com/1200x/ae/bb/a2/aebba27862a3df2176d06c34c0de2d9a.jpg', 'bg-amber-100 text-amber-800 border-amber-300', 'border-amber-500', TRUE, FALSE, 'Fusion Strike alternate art secret rare slab featuring Gengar swallowing buildings.'),
('Umbreon VMAX Moonbreon Alt Art #215', 'pokemon', 'POKEMON CARD', 'Mythic Rare', '1st Edition', 'PSA 10 Gem Mint', 1100.00, 0.3900, 'https://i.pinimg.com/736x/28/83/a8/2883a8ea732d85a3e2c14b1fdf5afb17.jpg', 'bg-amber-100 text-amber-800 border-amber-300', 'border-amber-500', TRUE, FALSE, 'The iconic Moonbreon alternate art secret rare from Evolving Skies in immaculate gem mint condition.'),
('Mewtwo GX Secret Rare Shining Legends #78', 'pokemon', 'POKEMON CARD', 'Mythic Rare', '1st Edition', 'BGS 10 Pristine', 950.00, 0.3400, 'https://i.pinimg.com/1200x/7c/32/67/7c32670bc75b5b3f6eb3a5fdc9740164.jpg', 'bg-amber-100 text-amber-800 border-amber-300', 'border-amber-500', TRUE, FALSE, 'Mewtwo test tube rainbow secret illustration rare with perfect subgrade alignment.'),
('Pikachu Illustrator Commemorative Holo #01', 'pokemon', 'POKEMON CARD', 'Mythic Rare', '1st Edition', 'PSA 10 Gem Mint', 4200.00, 1.5000, 'https://i.pinimg.com/1200x/0a/7b/7b/0a7b7b1322c6c170bebd94efca62dc75.jpg', 'bg-amber-100 text-amber-800 border-amber-300', 'border-amber-500', TRUE, FALSE, 'Pristine commemorative print of the world famous Pikachu Illustrator card.'),
('Monkey D. Luffy Gear 5 Manga Secret #01', 'anime', 'ANIME CARD', 'Mythic Rare', '1st Edition', 'BGS 10 Pristine', 1950.00, 0.6900, 'https://i.pinimg.com/1200x/8a/6f/20/8a6f2091122f67b8813a9849b742b60a.jpg', 'bg-purple-100 text-purple-800 border-purple-300', 'border-purple-500', TRUE, FALSE, 'One Piece Japanese special illustration rare with flawless holographic foil stamp.'),
('Naruto Uzumaki Sage Mode Foil Slab', 'anime', 'ANIME CARD', 'Mythic Rare', '1st Edition', 'PSA 10 Gem Mint', 1680.00, 0.5900, 'https://i.pinimg.com/1200x/6b/9b/1d/6b9b1d82363e47e3f8cd0fb25a41871e.jpg', 'bg-purple-100 text-purple-800 border-purple-300', 'border-purple-500', TRUE, FALSE, 'Limited release anime trading card slab authenticated by Beckett.'),
('Roronoa Zoro Manga Parallel Secret Foil', 'anime', 'ANIME CARD', 'Mythic Rare', '1st Edition', 'PSA 10 Gem Mint', 1450.00, 0.5100, 'https://i.pinimg.com/1200x/60/18/39/6018396436f97c3de5ae3f9a9ff44f08.jpg', 'bg-purple-100 text-purple-800 border-purple-300', 'border-purple-500', TRUE, FALSE, 'Three sword style Enma activation parallel foil in Beckett optical encasement.'),
('Goku Ultra Instinct Secret Rare DBS Foil', 'anime', 'ANIME CARD', 'Mythic Rare', '1st Edition', 'BGS 10 Pristine', 2100.00, 0.7500, 'https://i.pinimg.com/736x/d6/3a/74/d63a7450e6aea6186bb4db0e418a8976.jpg', 'bg-purple-100 text-purple-800 border-purple-300', 'border-purple-500', FALSE, FALSE, 'Silver hair Ultra Instinct form with reflective silver chrome border and subgrade 10.'),
('Gojo Satoru Unlimited Void Holographic Slab', 'anime', 'ANIME CARD', 'Mythic Rare', '1st Edition', 'PSA 10 Gem Mint', 1850.00, 0.6500, 'https://i.pinimg.com/736x/35/1f/c5/351fc51d72cd1b4528c95125d1b90ea1.jpg', 'bg-purple-100 text-purple-800 border-purple-300', 'border-purple-500', FALSE, FALSE, 'Jujutsu Kaisen special edition slab featuring Gojo unmasked with six eyes reflection.'),
('Lionel Messi 2022 World Cup Golden Ball Refractor Slab', 'football', 'FOOTBALL CARD', 'Mythic Rare', '1st Edition', 'PSA 10 Gem Mint', 4800.00, 1.7000, 'https://i.pinimg.com/736x/da/6f/2c/da6f2c6782704e4120fc689f5da89482.jpg', 'bg-emerald-100 text-emerald-800 border-emerald-300', 'border-emerald-500', TRUE, TRUE, 'Historic tournament commemorative gold refractor trading card in gem mint condition.'),
('Cristiano Ronaldo CR7 Manchester United Rookie Card Slab', 'football', 'FOOTBALL CARD', 'Mythic Rare', '1st Edition', 'BGS 9.5 Gem Mint', 4200.00, 1.5000, 'https://i.pinimg.com/736x/12/ce/23/12ce236055ea444ce30780afda629a5d.jpg', 'bg-emerald-100 text-emerald-800 border-emerald-300', 'border-emerald-500', TRUE, FALSE, 'Portuguese legend commemorative trading card encased with tamper-proof sonic weld.'),
('Erling Haaland Dortmund Rookie Gold Refractor', 'football', 'FOOTBALL CARD', 'Mythic Rare', '1st Edition', 'PSA 10 Gem Mint', 2600.00, 0.9200, 'https://i.pinimg.com/736x/a9/78/19/a97819aa814cf2614b9b8ce97a71248e.jpg', 'bg-emerald-100 text-emerald-800 border-emerald-300', 'border-emerald-500', FALSE, FALSE, 'Goal scoring sensation debut year chrome rookie card in flawless gem mint casing.'),
('Sachin Tendulkar 1999 Century Master Relic Slab', 'cricket', 'CRICKET CARD', 'Mythic Rare', '1st Edition', 'BGS 9.5 Gem Mint', 4100.00, 1.4500, 'https://i.pinimg.com/736x/42/e3/1a/42e31a89a861c1bf09dd484ceb6babac.jpg', 'bg-sky-100 text-sky-800 border-sky-300', 'border-sky-500', TRUE, TRUE, 'Includes game-used jersey patch embed with certified provenance serial.'),
('Rust Kernel Hacker #08', 'dev', 'DEV CARD', 'Mythic Rare', '1st Edition', 'BGS 9.5 Gem Mint', 2200.00, 0.7800, 'https://i.pinimg.com/1200x/52/c9/06/52c9067bd5e9c4188f8241857fca1597.jpg', 'bg-indigo-100 text-indigo-800 border-indigo-300', 'border-indigo-500', TRUE, FALSE, 'Rare low-latency systems developer series card in immaculate acrylic slab.');
