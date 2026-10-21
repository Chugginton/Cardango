/* CARDANGO Multi-Page Application Script & Gabriel Beaugonin 3D Stack Controller */

const USD_TO_INR = 83;

const formatINR = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
}).format(value);

const formatINRAmount = formatINR;

const API_BASE = (typeof window !== 'undefined' && (window.location.protocol === 'file:' || (window.location.port && window.location.port !== '3000'))) ? 'http://localhost:3000' : '';

const normalizeCardImage = (img) => {
  if (!img || typeof img !== 'string') return 'uploads/card_1791720108934_dbyhqy.jpg';
  if (img.startsWith('/uploads/')) return img.substring(1);
  return img;
};

const CARDS_DATA = [
  {
    id: 1,
    title: "Ho-oh ex Ultra Rare Holo #260",
    category: "pokemon",
    categoryLabel: "POKEMON CARD",
    rarity: "Mythic Rare",
    edition: "1st Edition",
    price: 2450,
    priceEth: 0.88,
    image: "uploads/card_1791720108934_dbyhqy.jpg",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    cardAccent: "border-amber-500",
    description: "Paradox Rift Special Illustration Rare Ho-oh ex in pristine gem mint condition with radiant rainbow holographic foil."
  },
  {
    id: 2,
    title: "Charizard 1st Edition Shadowless Holo #004",
    category: "pokemon",
    categoryLabel: "POKEMON CARD",
    rarity: "Mythic Rare",
    edition: "1st Edition",
    price: 3450,
    priceEth: 1.25,
    image: "https://i.pinimg.com/736x/35/ca/32/35ca32abb63da8220873970a391d6876.jpg",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    cardAccent: "border-amber-500",
    description: "Legendary 1999 Base Set 1st Edition Shadowless Charizard with sparkling holo foil background."
  },
  {
    id: 3,
    title: "Rayquaza Gold Star Ultra Rare Holo #107",
    category: "pokemon",
    categoryLabel: "POKEMON CARD",
    rarity: "Mythic Rare",
    edition: "1st Edition",
    price: 2890,
    priceEth: 1.02,
    image: "https://i.pinimg.com/736x/49/41/8d/49418d6198c0ead91eb561b62d936ee0.jpg",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    cardAccent: "border-amber-500",
    description: "Shadowless edge preservation, vaulted in climate-controlled optical scan hub."
  },
  {
    id: 4,
    title: "Gengar VMAX Alternate Art Secret #271",
    category: "pokemon",
    categoryLabel: "POKEMON CARD",
    rarity: "Mythic Rare",
    edition: "1st Edition",
    price: 680,
    priceEth: 0.24,
    image: "https://i.pinimg.com/1200x/ae/bb/a2/aebba27862a3df2176d06c34c0de2d9a.jpg",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    cardAccent: "border-amber-500",
    description: "Fusion Strike alternate art secret rare slab featuring Gengar swallowing buildings."
  },
  {
    id: 5,
    title: "Umbreon VMAX Moonbreon Alt Art #215",
    category: "pokemon",
    categoryLabel: "POKEMON CARD",
    rarity: "Mythic Rare",
    edition: "1st Edition",
    price: 1100,
    priceEth: 0.39,
    image: "https://i.pinimg.com/736x/28/83/a8/2883a8ea732d85a3e2c14b1fdf5afb17.jpg",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    cardAccent: "border-amber-500",
    description: "The iconic Moonbreon alternate art secret rare from Evolving Skies in immaculate gem mint condition."
  },
  {
    id: 6,
    title: "Mewtwo GX Secret Rare Shining Legends #78",
    category: "pokemon",
    categoryLabel: "POKEMON CARD",
    rarity: "Mythic Rare",
    edition: "1st Edition",
    price: 950,
    priceEth: 0.34,
    image: "https://i.pinimg.com/1200x/7c/32/67/7c32670bc75b5b3f6eb3a5fdc9740164.jpg",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    cardAccent: "border-amber-500",
    description: "Mewtwo test tube rainbow secret illustration rare with perfect subgrade alignment."
  },
  {
    id: 7,
    title: "Pikachu Illustrator Commemorative Holo #01",
    category: "pokemon",
    categoryLabel: "POKEMON CARD",
    rarity: "Mythic Rare",
    edition: "1st Edition",
    price: 4200,
    priceEth: 1.5,
    image: "https://i.pinimg.com/1200x/0a/7b/7b/0a7b7b1322c6c170bebd94efca62dc75.jpg",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    cardAccent: "border-amber-500",
    description: "Pristine commemorative print of the world famous Pikachu Illustrator card."
  },
  {
    id: 8,
    title: "Monkey D. Luffy Gear 5 Manga Secret #01",
    category: "anime",
    categoryLabel: "ANIME CARD",
    rarity: "Mythic Rare",
    edition: "1st Edition",
    price: 1950,
    priceEth: 0.69,
    image: "https://i.pinimg.com/1200x/8a/6f/20/8a6f2091122f67b8813a9849b742b60a.jpg",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    cardAccent: "border-purple-500",
    description: "One Piece Japanese special illustration rare with flawless holographic foil stamp."
  },
  {
    id: 9,
    title: "Naruto Uzumaki Sage Mode Foil Slab",
    category: "anime",
    categoryLabel: "ANIME CARD",
    rarity: "Mythic Rare",
    edition: "1st Edition",
    price: 1680,
    priceEth: 0.59,
    image: "https://i.pinimg.com/1200x/6b/9b/1d/6b9b1d82363e47e3f8cd0fb25a41871e.jpg",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    cardAccent: "border-purple-500",
    description: "Limited release anime trading card slab authenticated by Beckett."
  },
  {
    id: 10,
    title: "Roronoa Zoro Manga Parallel Secret Foil",
    category: "anime",
    categoryLabel: "ANIME CARD",
    rarity: "Mythic Rare",
    edition: "1st Edition",
    price: 1450,
    priceEth: 0.51,
    image: "https://i.pinimg.com/1200x/60/18/39/6018396436f97c3de5ae3f9a9ff44f08.jpg",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    cardAccent: "border-purple-500",
    description: "Three sword style Enma activation parallel foil in Beckett optical encasement."
  },
  {
    id: 11,
    title: "Goku Ultra Instinct Secret Rare DBS Foil",
    category: "anime",
    categoryLabel: "ANIME CARD",
    rarity: "Mythic Rare",
    edition: "1st Edition",
    price: 2100,
    priceEth: 0.75,
    image: "https://i.pinimg.com/736x/d6/3a/74/d63a7450e6aea6186bb4db0e418a8976.jpg",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    cardAccent: "border-purple-500",
    description: "Silver hair Ultra Instinct form with reflective silver chrome border and subgrade 10."
  },
  {
    id: 12,
    title: "Gojo Satoru Unlimited Void Holographic Slab",
    category: "anime",
    categoryLabel: "ANIME CARD",
    rarity: "Mythic Rare",
    edition: "1st Edition",
    price: 1850,
    priceEth: 0.65,
    image: "https://i.pinimg.com/736x/35/1f/c5/351fc51d72cd1b4528c95125d1b90ea1.jpg",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    cardAccent: "border-purple-500",
    description: "Jujutsu Kaisen special edition slab featuring Gojo unmasked with six eyes reflection."
  },
  {
    id: 13,
    title: "Lionel Messi 2022 World Cup Golden Ball Refractor Slab",
    category: "football",
    categoryLabel: "FOOTBALL CARD",
    rarity: "Mythic Rare",
    edition: "1st Edition",
    price: 4800,
    priceEth: 1.7,
    image: "https://i.pinimg.com/736x/da/6f/2c/da6f2c6782704e4120fc689f5da89482.jpg",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    cardAccent: "border-emerald-500",
    description: "Historic tournament commemorative gold refractor trading card in gem mint condition."
  },
  {
    id: 14,
    title: "Cristiano Ronaldo CR7 Manchester United Rookie Card Slab",
    category: "football",
    categoryLabel: "FOOTBALL CARD",
    rarity: "Mythic Rare",
    edition: "1st Edition",
    price: 4200,
    priceEth: 1.5,
    image: "https://i.pinimg.com/736x/12/ce/23/12ce236055ea444ce30780afda629a5d.jpg",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    cardAccent: "border-emerald-500",
    description: "Portuguese legend commemorative trading card encased with tamper-proof sonic weld."
  },
  {
    id: 16,
    title: "Erling Haaland Dortmund Rookie Gold Refractor",
    category: "football",
    categoryLabel: "FOOTBALL CARD",
    rarity: "Mythic Rare",
    edition: "1st Edition",
    price: 2600,
    priceEth: 0.92,
    image: "https://i.pinimg.com/736x/a9/78/19/a97819aa814cf2614b9b8ce97a71248e.jpg",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    cardAccent: "border-emerald-500",
    description: "Goal scoring sensation debut year chrome rookie card in flawless gem mint casing."
  },
  {
    id: 17,
    title: "Sachin Tendulkar 1999 Century Master Relic Slab",
    category: "cricket",
    categoryLabel: "CRICKET CARD",
    rarity: "Mythic Rare",
    edition: "1st Edition",
    price: 4100,
    priceEth: 1.45,
    image: "https://i.pinimg.com/736x/42/e3/1a/42e31a89a861c1bf09dd484ceb6babac.jpg",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-300",
    cardAccent: "border-sky-500",
    description: "Includes game-used jersey patch embed with certified provenance serial."
  },
  {
    id: 22,
    title: "Rust Kernel Hacker #08",
    category: "dev",
    categoryLabel: "DEV CARD",
    rarity: "Mythic Rare",
    edition: "1st Edition",
    price: 2200,
    priceEth: 0.78,
    image: "https://i.pinimg.com/1200x/52/c9/06/52c9067bd5e9c4188f8241857fca1597.jpg",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300",
    cardAccent: "border-indigo-500",
    description: "Rare low-latency systems developer series card in immaculate acrylic slab."
  }
];
 

let activeTradeIndex = 0;
function safeParseJSON(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch (e) {
    return fallback;
  }
}
function readLocalJSON(key, fallback) {
  try {
    if (typeof localStorage === 'undefined') return fallback;
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined || raw === '') return fallback;
    return safeParseJSON(raw, fallback);
  } catch (e) {
    return fallback;
  }
}
function getCurrentUserScope() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('cardango_auth_user') : null;
    if (raw) {
      const u = JSON.parse(raw);
      if (u && (u.id || u.email)) {
        const idStr = String(u.id || u.email).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
        return 'usr_' + idStr;
      }
    }
  } catch (e) {}
  return 'guest';
}

function getUserStorageKey(baseKey) {
  const scope = getCurrentUserScope();
  return baseKey + '_' + scope;
}

function getCartStorageKey() {
  const userKey = getUserStorageKey('cardango_cart');
  if (typeof localStorage !== 'undefined' && !localStorage.getItem(userKey)) {
    const legacy = localStorage.getItem('cardango_cart');
    if (legacy) {
      try { localStorage.setItem(userKey, legacy); } catch (e) {}
    }
  }
  return userKey;
}

function getCollectionStorageKey() {
  const userKey = getUserStorageKey('cardango_saved_cards');
  if (typeof localStorage !== 'undefined' && !localStorage.getItem(userKey)) {
    const legacy = localStorage.getItem('cardango_saved_cards');
    if (legacy) {
      try { localStorage.setItem(userKey, legacy); } catch (e) {}
    }
  }
  return userKey;
}

let cart = readLocalJSON(getCartStorageKey(), []);
if (!Array.isArray(cart)) cart = [];
let activeCategory = 'all';
let activePriceFilter = 'all';
let activeMaxPrice = 5000;
let activeEthFilter = 'all';
let activeRarityFilter = 'all';
let searchQuery = '';

let myCollection = readLocalJSON(getCollectionStorageKey(), []);
if (!Array.isArray(myCollection)) myCollection = [];

function loadUserScopedData() {
  cart = readLocalJSON(getCartStorageKey(), []);
  if (!Array.isArray(cart)) cart = [];

  myCollection = readLocalJSON(getCollectionStorageKey(), []);
  if (!Array.isArray(myCollection)) myCollection = [];

  updateCartBadge();
  updateCollectionBadge();

  if (document.getElementById('collectionGrid')) {
    renderSavedCollection();
  }
  if (document.getElementById('marketplaceGrid')) {
    renderMarketplaceGrid();
  }
  const cartDrawer = document.getElementById('cartDrawerModal');
  if (cartDrawer && !cartDrawer.classList.contains('hidden')) {
    openCartDrawer();
  }

  syncUserDataWithServer();
}

async function syncUserDataWithServer() {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('cardango_auth_token') : null;
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/api/user/sync`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        let changed = false;
        if (Array.isArray(data.cart) && data.cart.length > 0 && cart.length === 0) {
          cart = data.cart;
          localStorage.setItem(getCartStorageKey(), JSON.stringify(cart));
          changed = true;
        }
        if (Array.isArray(data.collection) && data.collection.length > 0 && myCollection.length === 0) {
          myCollection = data.collection;
          localStorage.setItem(getCollectionStorageKey(), JSON.stringify(myCollection));
          changed = true;
        }
        if (changed) {
          updateCartBadge();
          updateCollectionBadge();
          if (document.getElementById('collectionGrid')) renderSavedCollection();
          if (document.getElementById('marketplaceGrid')) renderMarketplaceGrid();
        }
      }
    }
  } catch (e) {}
}

async function saveUserDataToServer() {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('cardango_auth_token') : null;
  if (!token) return;

  try {
    await fetch(`${API_BASE}/api/user/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        cart,
        collection: myCollection
      })
    });
  } catch (e) {}
}

// Purge any legacy localStorage card caches so Supabase database is the sole single source of truth
try {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('cardango_uploaded_cards');
  }
} catch (e) {}

const CATEGORY_STYLE_MAP = {
  pokemon: { badgeColor: 'bg-amber-100 text-amber-800 border-amber-300', cardAccent: 'border-amber-500', label: 'POKÉMON CARD' },
  anime: { badgeColor: 'bg-purple-100 text-purple-800 border-purple-300', cardAccent: 'border-purple-500', label: 'ANIME CARD' },
  football: { badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', cardAccent: 'border-emerald-500', label: 'FOOTBALL CARD' },
  cricket: { badgeColor: 'bg-sky-100 text-sky-800 border-sky-300', cardAccent: 'border-sky-500', label: 'CRICKET CARD' },
  dev: { badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300', cardAccent: 'border-indigo-500', label: 'DEV CARD' }
};

async function syncCardsWithBackend() {
  try {
    const res = await fetch(`${API_BASE}/api/cards`);
    if (res.ok) {
      const dbCards = await res.json();
      if (Array.isArray(dbCards) && dbCards.length > 0) {
        dbCards.forEach(dbCard => {
          const style = CATEGORY_STYLE_MAP[dbCard.category] || {
            badgeColor: 'bg-black-100 text-sky-800 border-black-300',
            cardAccent: 'border-black-500',
            label: (dbCard.category || 'DEV').toUpperCase() + ' CARD'
          };
          const formatted = {
            id: dbCard.id,
            title: dbCard.title,
            category: dbCard.category,
            categoryLabel: style.label,
            rarity: 'Mythic Rare',
            price: parseFloat(dbCard.price_usd || dbCard.price || 100),
            priceEth: parseFloat(dbCard.price_eth || dbCard.priceEth || 0.05),
            image: normalizeCardImage(dbCard.image_url || dbCard.image),
            badgeColor: style.badgeColor,
            cardAccent: style.cardAccent,
            description: dbCard.description || 'Authentic collectible slab.',
            isDatabaseCard: true
          };
          const cleanDbTitle = (formatted.title || '').toLowerCase().trim();
          const existingIdx = CARDS_DATA.findIndex(c => 
            c.id === formatted.id || 
            (c.title && c.title.toLowerCase().trim() === cleanDbTitle)
          );
          if (existingIdx !== -1) {
            CARDS_DATA[existingIdx] = formatted;
          } else {
            CARDS_DATA.unshift(formatted);
          }
        });
        if (document.getElementById('marketplaceGrid')) {
          renderMarketplaceGrid();
        }
      }
    }
  } catch (err) {
    // Supabase API connection notice
  }
}

// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
  initCardangoAuth();
  syncCardsWithBackend();
  updateCartBadge();
  updateCollectionBadge();
  highlightActiveNav();
  init3DTilt();
  setupEventListeners();

  if (document.getElementById('marketplaceGrid')) {
    renderMarketplaceGrid();
  }

  if (document.getElementById('collectionGrid')) {
    renderSavedCollection();
  }

  if (document.getElementById('cardDetailContainer')) {
    loadCardDetailPage();
  }

  if (document.getElementById('tradeStack') || document.getElementById('gbeaugoninTradeStack')) {
    renderGabrielBeaugoninTradeSlider();
  }
});

// Trade Proposals derived from live catalog (prevents ReferenceError on trade.html)
const TRADE_PROPOSALS = (typeof CARDS_DATA !== 'undefined' ? CARDS_DATA : []).slice(0, 8).map((card, idx) => ({
  cardId: card.id,
  cardName: card.title,
  cardPrice: card.price,
  cardPriceEth: card.priceEth,
  image: card.image,
  traderName: ['Aarav Mehta', 'Sofia D’Souza', 'Kabir Rao', 'Elena Fernandes', 'Arjun Nair', 'Mira Kapoor', 'Dev Patel', 'Zara Khan'][idx % 8],
  traderRole: ['Pro Collector • Mumbai', 'Vault Verified • Goa', 'Slab Expert • Delhi', 'Top Trader • Bengaluru', 'Grail Hunter • Pune', 'Mint Specialist • Jaipur', 'Holo Scout • Hyderabad', 'Vault Curator • Chennai'][idx % 8]
}));

// Render 3D Stack Trade Wheel (Clean, Simple Architecture)
function renderGabrielBeaugoninTradeSlider() {
  const stack = document.getElementById('tradeStack') || document.getElementById('gbeaugoninTradeStack');
  const leftInfo = document.getElementById('tradeLeftInfo') || document.getElementById('gbeaugoninLeftInfo');
  const dots = document.getElementById('tradeDots') || document.getElementById('gbeaugoninDots');

  if (!stack) return;

  if (!Array.isArray(TRADE_PROPOSALS) || TRADE_PROPOSALS.length === 0) {
    stack.innerHTML = '<div class="text-center text-xs text-slate-400 py-10">No trade proposals available yet.</div>';
    return;
  }

  const currentTrade = TRADE_PROPOSALS[activeTradeIndex % TRADE_PROPOSALS.length] || TRADE_PROPOSALS[0];

  // 1. Update Left Info Panel (Card Name, Actual Price & Trader Info)
  if (leftInfo) {
    leftInfo.innerHTML = `
      <div class="space-y-4">
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-sky-100 text-sky-800 text-xs font-black rounded-full uppercase tracking-wider border border-sky-200">
          <span class="w-2 h-2 rounded-full bg-sky-600"></span>
          <span>VERIFIED ESCROW</span>
        </div>

        <div>
          <!-- Card Name at Left -->
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            ${currentTrade.cardName}
          </h1>
          
          <!-- Price at Left with Name -->
          <div class="flex items-baseline gap-3 my-3">
            <span class="text-3xl sm:text-4xl font-extrabold text-sky-600 tracking-tight">
              ${formatINR(currentTrade.cardPrice)}
            </span>
            <span class="text-base sm:text-lg font-bold text-slate-500">
              (${currentTrade.cardPriceEth} ETH)
            </span>
          </div>
        </div>

        <!-- Trader Information -->
        <div class="flex items-center gap-3 py-2.5 px-4 bg-white rounded-2xl border border-sky-100 shadow-sm max-w-sm">
          <div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 font-extrabold flex items-center justify-center text-sm border border-sky-200">
            ${currentTrade.traderName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>${currentTrade.traderName}</span>
              <span class="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">✓ Verified</span>
            </div>
            <div class="text-[11px] text-slate-500 font-medium">${currentTrade.traderRole}</div>
          </div>
        </div>
        
        <div class="trade-action-buttons pt-2">
          <button onclick="submitTradeOffer()" class="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
            <span>Propose Swap</span>
          </button>
          <button onclick="saveCardToCollection(${currentTrade.cardId}, event); renderGabrielBeaugoninTradeSlider();" class="trade-btn ${isCardSaved(currentTrade.cardId) ? 'text-amber-500 bg-amber-50 border-amber-300' : 'text-slate-500'}" title="${isCardSaved(currentTrade.cardId) ? 'Remove from Collection' : 'Save to Collection'}">
            <svg class="w-5 h-5 ${isCardSaved(currentTrade.cardId) ? 'fill-current' : 'fill-none stroke-current'}" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
          </button>
          <button onclick="showToast('Opened Chat with ${currentTrade.traderName}')" class="trade-btn" title="Send Message">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
          </button>
          <button onclick="showToast('Viewing ${currentTrade.traderName}\'s Vault Profile')" class="trade-btn" title="Open Profile">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          </button>
        </div>
      </div>
    `;
  }

  // 2. Render Right Side 3D Stack Cards (Full Uncut Trading Card Slab)
  stack.innerHTML = TRADE_PROPOSALS.map((item, idx) => {
    let posClass = 'pos-hidden-bottom';
    if (idx === activeTradeIndex) posClass = 'pos-active';
    else if (idx === (activeTradeIndex - 1 + TRADE_PROPOSALS.length) % TRADE_PROPOSALS.length) posClass = 'pos-prev';
    else if (idx === (activeTradeIndex + 1) % TRADE_PROPOSALS.length) posClass = 'pos-next';
    else if (idx < activeTradeIndex) posClass = 'pos-hidden-top';

    return `
      <div onclick="setTradeIndex(${idx})" class="trade-stack-card ${posClass}" data-trade-idx="${idx}">
        <div class="trade-card-inner full-slab-card">
          <img src="${item.image}" alt="${item.cardName}" class="w-full h-full object-cover" />
        </div>
      </div>
    `;
  }).join('');

  // 3. Render Right Side Dots Indicator
  if (dots) {
    dots.innerHTML = TRADE_PROPOSALS.map((_, idx) => `
      <div onclick="setTradeIndex(${idx})" class="trade-dot ${idx === activeTradeIndex ? 'active' : ''}"></div>
    `).join('');
  }
}

function nextTradeItem() {
  activeTradeIndex = (activeTradeIndex + 1) % TRADE_PROPOSALS.length;
  renderGabrielBeaugoninTradeSlider();
}

function prevTradeItem() {
  activeTradeIndex = (activeTradeIndex - 1 + TRADE_PROPOSALS.length) % TRADE_PROPOSALS.length;
  renderGabrielBeaugoninTradeSlider();
}

function setTradeIndex(idx) {
  activeTradeIndex = idx;
  renderGabrielBeaugoninTradeSlider();
}

// Highlight Nav Link
function highlightActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('header nav a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('text-sky-600', 'font-extrabold', 'border-b-2', 'border-sky-600');
    }
  });
}

// Render Pure Card Slabs Grid
function renderMarketplaceGrid() {
  const container = document.getElementById('marketplaceGrid');
  if (!container) return;

  const filtered = CARDS_DATA.filter(card => {
    // 1. Category Filter
    const matchesCategory = activeCategory === 'all' || card.category === activeCategory;
    
    // 2. Search Query Filter
    const matchesSearch = !searchQuery ||
                          card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          card.description.toLowerCase().includes(searchQuery.toLowerCase());

    // 3. Price Filter (Slider & Pre-set Thresholds)
    let matchesPrice = true;
    if (activeMaxPrice < 5000) {
      matchesPrice = card.price <= activeMaxPrice;
    } else if (activePriceFilter === 'under500') {
      matchesPrice = card.price < 500;
    } else if (activePriceFilter === '500to1500') {
      matchesPrice = card.price >= 500 && card.price <= 1500;
    } else if (activePriceFilter === 'over1500') {
      matchesPrice = card.price > 1500;
    }

    // 4. ETH Filter
    let matchesEth = true;
    if (activeEthFilter === 'under0.25') {
      matchesEth = card.priceEth < 0.25;
    } else if (activeEthFilter === '0.25to0.75') {
      matchesEth = card.priceEth >= 0.25 && card.priceEth <= 0.75;
    } else if (activeEthFilter === 'over0.75') {
      matchesEth = card.priceEth > 0.75;
    }

    // 5. Rarity Filter
    let matchesRarity = true;
    if (activeRarityFilter !== 'all') {
      const r = (card.rarity || '').toLowerCase();
      matchesRarity = r.includes(activeRarityFilter.toLowerCase());
    }

    return matchesCategory && matchesSearch && matchesPrice && matchesEth && matchesRarity;
  });

  // Update counters
  const summaryCount = document.getElementById('filterSummaryCount');
  if (summaryCount) summaryCount.textContent = `${filtered.length} card${filtered.length === 1 ? '' : 's'}`;

  const headerCount = document.getElementById('filteredCardsCount');
  if (headerCount) headerCount.textContent = filtered.length;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12 bg-white rounded-2xl border border-sky-100 space-y-3">
        <div class="w-12 h-12 mx-auto rounded-full bg-sky-50 text-sky-500 flex items-center justify-center font-bold">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h3 class="text-base font-bold text-slate-800">No trading cards match your filters</h3>
        <p class="text-xs text-slate-400">Try adjusting your category, price range, ETH value, or rarity selections.</p>
        <button onclick="resetAllFilters()" class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all">
          Reset All Filters
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(card => {
    const saved = isCardSaved(card.id);
    const cardPrice = Number(card.price) || 0;
    const ethPrice = card.priceEth ? Number(card.priceEth).toFixed(2) : null;

    return `
    <div class="holo-card-container col-span-1 relative group flex flex-col">
      <div onclick="openCardInspectModal(${card.id})" class="holo-card pure-card-slab group" data-card-id="${card.id}">
        <div class="holo-card-glare"></div>
        <img src="${normalizeCardImage(card.image)}" alt="${card.title}" class="w-full h-full object-cover" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='uploads/card_1791720108934_dbyhqy.jpg';" />
        
        <!-- Bottom Price Badge on Slab -->
        <div class="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between pointer-events-none">
          <span class="px-2 py-0.5 bg-slate-950/85 backdrop-blur-sm text-amber-300 text-[11px] font-black rounded border border-slate-700/80 shadow">
            ${formatINR(cardPrice)}
          </span>
          ${ethPrice ? `
          <span class="px-1.5 py-0.5 bg-slate-900/80 backdrop-blur-sm text-sky-200 text-[10px] font-bold rounded border border-slate-700/60 shadow">
            ${ethPrice} ETH
          </span>` : ''}
        </div>

        <div class="inspect-overlay">
          <svg class="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          <span>CLICK TO INSPECT</span>
        </div>
      </div>
      <!-- Save to Collection Star Button -->
      <button onclick="saveCardToCollection(${card.id}, event)" data-save-btn="${card.id}" class="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white border ${saved ? 'border-amber-300 bg-amber-50 text-amber-500' : 'border-slate-200 text-slate-400 hover:text-amber-500'} shadow-sm flex items-center justify-center transition-all" title="${saved ? 'Saved in Collection' : 'Save to Collection'}">
        <svg class="w-4 h-4 ${saved ? 'fill-current' : 'fill-none stroke-current'}" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
      </button>

      <!-- Card Title & Price Footer Bar -->
      <div class="mt-2.5 px-1 flex items-center justify-between gap-1">
        <div class="truncate pr-1">
          <h4 class="text-xs font-extrabold text-slate-800 truncate" title="${card.title}">${card.title}</h4>
        </div>
        <div class="text-right flex-shrink-0">
          <span class="text-xs font-black text-sky-600">${formatINR(cardPrice)}</span>
        </div>
      </div>
    </div>
  `;
  }).join('');

  init3DTilt();
}

// Click-to-Reveal Inspection Modal
function openCardInspectModal(cardId) {
  const card = CARDS_DATA.find(c => c.id === cardId);
  if (!card) return;

  const existing = document.getElementById('cardInspectModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'cardInspectModal';
  modal.className = 'fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300';
  modal.innerHTML = `
    <div class="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl  relative space-y-5 transform scale-95 transition-transform duration-300" id="modalCardBody">
      
      <button onclick="closeCardInspectModal()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-900 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold">
        ✕
      </button>

      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 text-xs font-bold rounded-full border ${card.badgeColor}">
            ${card.categoryLabel}
          </span>
        </div>

        <h2 class="text-2xl font-black text-slate-900 tracking-tight">${card.title}</h2>
        <p class="text-xs text-slate-600 leading-relaxed pt-1">
          ${card.description}
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center pt-3 border-t border-slate-100">
        
        <div class="sm:col-span-5 flex justify-center">
          <div class="pure-card-slab max-w-[180px] w-full border-2 border-sky-400">
            <img src="${card.image}" class="w-full h-full object-cover" />
          </div>
        </div>

        <div class="sm:col-span-7 space-y-4">
          <div>
            <div class="text-xs text-slate-400 font-bold uppercase">Estimated Market Price</div>
            <div class="text-3xl font-black text-slate-900">
              ${formatINR(card.price)}
              <span class="text-xs font-normal text-sky-600">(${card.priceEth} ETH)</span>
            </div>
          </div>

          <div class="space-y-1.5 text-xs text-slate-600 bg-sky-50 p-3 rounded-xl border border-sky-100">
            <div><strong>CARDANGO Status:</strong> Verified In Escrow</div>
          </div>

          <div class="flex gap-2">
            <button onclick="addToCart(${card.id}); closeCardInspectModal();" class="flex-1 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors">
              Buy Now (${formatINR(card.price)})
            </button>
            <button onclick="openTradeModal(${card.id}); closeCardInspectModal();" class="flex-1 py-3 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs rounded-xl border border-sky-200 transition-colors">
              Propose Trade
            </button>
            <button id="modalSaveCardBtn" onclick="saveCardToCollection(${card.id})" class="px-4 py-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${isCardSaved(card.id) ? 'bg-amber-50 text-amber-600 border-amber-300' : 'bg-slate-50 text-slate-700 border-slate-200 hover:text-amber-500'}" title="${isCardSaved(card.id) ? 'Remove from Collection' : 'Save to Collection'}">
              <svg class="w-4 h-4 ${isCardSaved(card.id) ? 'fill-current' : 'fill-none stroke-current'}" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
              <span>${isCardSaved(card.id) ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          ${(() => {
            const isCustomCard = card.isDatabaseCard || card.id > 22 || card.id === 1;
            if (!isCustomCard) return '';
            const safeTitle = (card.title || '').replace(/'/g, "\\'");
            return `
              <div class="pt-2 flex justify-end">
                <button type="button" onclick="deleteCustomCard(${card.id}, '${safeTitle}')" class="px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 rounded-xl transition-all flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  <span>Delete Custom Card</span>
                </button>
              </div>
            `;
          })()}
        </div>

      </div>

    </div>
  `;

  document.body.appendChild(modal);

  setTimeout(() => {
    document.getElementById('modalCardBody')?.classList.remove('scale-95');
    document.getElementById('modalCardBody')?.classList.add('scale-100');
  }, 20);
}

function closeCardInspectModal() {
  const modal = document.getElementById('cardInspectModal');
  if (modal) modal.remove();
}

async function deleteCustomCard(cardId, cardTitle) {
  if (!confirm(`Are you sure you want to delete "${cardTitle || 'this card'}" from your catalog?`)) {
    return;
  }
  const cleanTitle = (cardTitle || '').toLowerCase().trim();
  
  // 1. Clear any legacy local storage card cache
  try {
    localStorage.removeItem('cardango_uploaded_cards');
  } catch (e) {}

  // 2. Remove from CARDS_DATA
  const idx = CARDS_DATA.findIndex(c => 
    c.id === cardId || (c.title && c.title.toLowerCase().trim() === cleanTitle)
  );
  if (idx !== -1) {
    CARDS_DATA.splice(idx, 1);
  }

  // 3. Remove from cart & collection if present
  cart = cart.filter(item => item.id !== cardId);
  try { localStorage.setItem('cardango_cart', JSON.stringify(cart)); } catch (e) {}
  myCollection = myCollection.filter(id => id !== cardId);
  try { localStorage.setItem('cardango_saved_cards', JSON.stringify(myCollection)); } catch (e) {}
  updateCartBadge();
  updateCollectionBadge();

  // 4. Delete directly from Supabase Database via API
  try {
    fetch(`${API_BASE}/api/cards/${cardId}`, { method: 'DELETE' });
    fetch(`${API_BASE}/api/cards/delete-by-title`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: cardTitle })
    });
  } catch (e) {}

  closeCardInspectModal();
  if (document.getElementById('marketplaceGrid')) {
    renderMarketplaceGrid();
  }
  showToast(`Deleted "${cardTitle}" from catalog`);
}

// Card Detail Loader Page
function loadCardDetailPage() {
  const container = document.getElementById('cardDetailContainer');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const cardId = parseInt(urlParams.get('id')) || 1;
  const card = CARDS_DATA.find(c => c.id === cardId) || CARDS_DATA[0];

  container.innerHTML = `
    <div class="max-w-4xl mx-auto space-y-3 mb-6 bg-white p-6 rounded-2xl border border-sky-100 shadow-sm">
      <div class="flex items-center gap-2">
        <span class="px-3 py-1 text-xs font-extrabold rounded-full border ${card.badgeColor}">
          ${card.categoryLabel}
        </span>
        <span class="text-xs text-slate-500 font-semibold">Edition: ${card.edition}</span>
      </div>

      <h1 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">${card.title}</h1>
      
      <div class="text-slate-600 text-sm leading-relaxed pt-2 border-t border-slate-100">
        <span class="font-bold text-sky-600 block mb-1">CARDANGO Certificate Overview:</span>
        ${card.description}
      </div>
    </div>

    <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
      
      <div class="md:col-span-6 flex justify-center">
        <div class="pure-card-slab max-w-xs w-full border-4 ${card.cardAccent} shadow-2xl">
          <img src="${normalizeCardImage(card.image)}" alt="${card.title}" class="w-full h-full object-cover" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='uploads/card_1791720108934_dbyhqy.jpg';" />
        </div>
      </div>

      <div class="md:col-span-6 space-y-6 bg-white p-6 rounded-3xl border border-sky-100 shadow-sm">
        <div>
          <div class="text-xs text-slate-400 uppercase font-bold tracking-wider">Estimated Value</div>
          <div class="text-4xl font-black text-slate-900 mt-1">
            ${formatINR(card.price)}
            <span class="text-base font-normal text-sky-600 ml-1">(${card.priceEth} ETH)</span>
          </div>
        </div>

        <div class="space-y-2 pt-3 border-t border-slate-100 text-xs">
          <div class="flex justify-between py-1 border-b border-slate-100">
            <span class="text-slate-500"></span>
            <span class="font-bold text-emerald-600">10 / 10 Gem</span>
          </div>
          <div class="flex justify-between py-1 border-b border-slate-100">
            
            <span class="font-bold text-emerald-600"></span>
          </div>
        </div>

        <div class="flex gap-3 pt-2">
          <button onclick="addToCart(${card.id})" class="flex-1 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs rounded-xl shadow-md transition-colors">
            Buy Now (${formatINR(card.price)})
          </button>
          <button onclick="openTradeModal(${card.id})" class="flex-1 py-3.5 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs rounded-xl border border-sky-200 transition-colors">
            Propose Trade Swap
          </button>
        </div>
      </div>

    </div>
  `;

  init3DTilt();
}

// 3D Tilt Physics
function init3DTilt() {
  const cards = document.querySelectorAll('.pure-card-slab, .holo-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  });
}

// Event Listeners
function setupEventListeners() {
  // Category Filter
  document.querySelectorAll('[data-category-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-category-filter]').forEach(b => {
        b.classList.remove('bg-sky-600', 'text-white');
        b.classList.add('bg-slate-50', 'text-slate-700');
      });
      btn.classList.remove('bg-slate-50', 'text-slate-700');
      btn.classList.add('bg-sky-600', 'text-white');

      activeCategory = btn.getAttribute('data-category-filter');
      renderMarketplaceGrid();
    });
  });

  // Price Slider Listener
  const priceSlider = document.getElementById('priceRangeSlider');
  if (priceSlider) {
    priceSlider.addEventListener('input', (e) => {
      handlePriceSliderChange(e.target.value);
    });
  }

  // Legacy/Alternate button price filter compatibility
  document.querySelectorAll('[data-price-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-price-filter]').forEach(b => {
        b.classList.remove('bg-sky-600', 'text-white');
        b.classList.add('bg-slate-50', 'text-slate-700');
      });
      btn.classList.remove('bg-slate-50', 'text-slate-700');
      btn.classList.add('bg-sky-600', 'text-white');

      activePriceFilter = btn.getAttribute('data-price-filter');
      renderMarketplaceGrid();
    });
  });

  // ETH Crypto Value Filter
  document.querySelectorAll('[data-eth-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-eth-filter]').forEach(b => {
        b.classList.remove('bg-sky-600', 'text-white');
        b.classList.add('bg-slate-50', 'text-slate-700');
      });
      btn.classList.remove('bg-slate-50', 'text-slate-700');
      btn.classList.add('bg-sky-600', 'text-white');

      activeEthFilter = btn.getAttribute('data-eth-filter');
      renderMarketplaceGrid();
    });
  });

  // Rarity Tier Filter
  document.querySelectorAll('[data-rarity-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-rarity-filter]').forEach(b => {
        b.classList.remove('bg-sky-600', 'text-white');
        b.classList.add('bg-slate-50', 'text-slate-700');
      });
      btn.classList.remove('bg-slate-50', 'text-slate-700');
      btn.classList.add('bg-sky-600', 'text-white');

      activeRarityFilter = btn.getAttribute('data-rarity-filter');
      renderMarketplaceGrid();
    });
  });

  const searchInput = document.getElementById('cardSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      searchQuery = e.target.value;
      renderMarketplaceGrid();
    });
  }
}

// Interactive Price Range Slider Logic
function handlePriceSliderChange(val) {
  const numVal = parseInt(val, 10);
  activeMaxPrice = numVal;
  const label = document.getElementById('priceSliderValue');

  if (label) {
    if (numVal >= 5000) {
      label.textContent = 'All Prices';
      activeMaxPrice = 5000;
    } else {
      label.textContent = `Up to ${formatINR(numVal)}`;
    }
  }

  // Update preset button active states
  document.querySelectorAll('.price-preset-btn').forEach(btn => {
    btn.classList.remove('bg-sky-600', 'text-white');
    btn.classList.add('bg-white', 'text-slate-700');
  });

  const presetButtons = document.querySelectorAll('.price-preset-btn');
  if (numVal >= 5000 && presetButtons[3]) {
    presetButtons[3].classList.add('bg-sky-600', 'text-white');
    presetButtons[3].classList.remove('bg-white', 'text-slate-700');
  } else if (numVal <= 500 && presetButtons[0]) {
    presetButtons[0].classList.add('bg-sky-600', 'text-white');
    presetButtons[0].classList.remove('bg-white', 'text-slate-700');
  } else if (numVal <= 1500 && presetButtons[1]) {
    presetButtons[1].classList.add('bg-sky-600', 'text-white');
    presetButtons[1].classList.remove('bg-white', 'text-slate-700');
  } else if (numVal <= 3000 && presetButtons[2]) {
    presetButtons[2].classList.add('bg-sky-600', 'text-white');
    presetButtons[2].classList.remove('bg-white', 'text-slate-700');
  }

  renderMarketplaceGrid();
}

function setPriceSliderPreset(targetPrice) {
  const slider = document.getElementById('priceRangeSlider');
  if (slider) {
    slider.value = targetPrice;
  }
  handlePriceSliderChange(targetPrice);
}

// Reset All Active Filters
function resetAllFilters() {
  activeCategory = 'all';
  activePriceFilter = 'all';
  activeMaxPrice = 5000;
  activeEthFilter = 'all';
  activeRarityFilter = 'all';
  searchQuery = '';

  const slider = document.getElementById('priceRangeSlider');
  const label = document.getElementById('priceSliderValue');
  if (slider) slider.value = 5000;
  if (label) label.textContent = 'All Prices';

  document.querySelectorAll('.price-preset-btn').forEach((btn, idx) => {
    if (idx === 3) {
      btn.classList.add('bg-sky-600', 'text-white');
      btn.classList.remove('bg-white', 'text-slate-700');
    } else {
      btn.classList.remove('bg-sky-600', 'text-white');
      btn.classList.add('bg-white', 'text-slate-700');
    }
  });

  const searchInput = document.getElementById('cardSearchInput');
  if (searchInput) searchInput.value = '';

  const resetGroup = (selector) => {
    document.querySelectorAll(selector).forEach(b => {
      const isAll = (b.getAttribute(selector.replace(/[\[\]]/g, '')) === 'all');
      if (isAll) {
        b.classList.remove('bg-slate-50', 'text-slate-700');
        b.classList.add('bg-sky-600', 'text-white');
      } else {
        b.classList.remove('bg-sky-600', 'text-white');
        b.classList.add('bg-slate-50', 'text-slate-700');
      }
    });
  };

  resetGroup('[data-category-filter]');
  resetGroup('[data-price-filter]');
  resetGroup('[data-eth-filter]');
  resetGroup('[data-rarity-filter]');

  renderMarketplaceGrid();
  showToast('All filters reset to default');
}

// Cart Logic
function addToCart(cardId) {
  const card = CARDS_DATA.find(c => c.id === cardId);
  if (!card) return;

  cart.push(card);
  localStorage.setItem(getCartStorageKey(), JSON.stringify(cart));
  updateCartBadge();
  saveUserDataToServer();
  showToast(`Added "${card.title}" to CARDANGO cart!`);
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadgeCount');
  if (badge) {
    badge.textContent = cart.length;
    if (cart.length > 0) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
}

function openCartDrawer() {
  const modal = document.getElementById('cartDrawerModal');
  const itemsContainer = document.getElementById('cartDrawerItems');
  const totalEl = document.getElementById('cartDrawerTotal');

  if (!modal || !itemsContainer) return;

  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="text-center py-10 text-slate-400">
        <p class="text-xs font-semibold">Your CARDANGO cart is empty</p>
      </div>
    `;
    if (totalEl) totalEl.textContent = '₹0';
  } else {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    if (totalEl) totalEl.textContent = formatINR(total);

    itemsContainer.innerHTML = cart.map((item, idx) => `
      <div class="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200">
        <div class="flex items-center gap-2.5">
          <img src="${item.image}" class="w-10 h-10 rounded-lg object-cover" />
          <div>
            <div class="text-xs font-bold text-slate-900">${item.title}</div>
            <div class="text-[11px] text-sky-600 font-bold">${formatINR(item.price)}</div>
          </div>
        </div>
        <button onclick="removeFromCart(${idx})" class="p-1 text-slate-400 hover:text-red-500">
          ✕
        </button>
      </div>
    `).join('');
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem(getCartStorageKey(), JSON.stringify(cart));
  updateCartBadge();
  saveUserDataToServer();
  openCartDrawer();
}

function closeCartDrawer() {
  const modal = document.getElementById('cartDrawerModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function checkoutCart() {
  if (cart.length === 0) return;
  showToast('Redirecting to CARDANGO Escrow Checkout...');
  const user = getAuthUser();
  const orderId = 'ORD-' + Date.now().toString(36).toUpperCase();
  const orderTotal = cart.reduce((sum, item) => sum + (item.price || 0), 0);
  const newOrder = {
    id: orderId,
    date: new Date().toISOString(),
    items: [...cart],
    totalUsd: orderTotal,
    totalEth: (orderTotal / 2800).toFixed(4),
    status: 'In Escrow Vault Guarantee'
  };

  const ordersKey = getUserStorageKey('cardango_orders');
  const userOrders = readLocalJSON(ordersKey, []);
  userOrders.unshift(newOrder);
  try { localStorage.setItem(ordersKey, JSON.stringify(userOrders)); } catch (e) {}

  showToast(`Order ${orderId} placed with Escrow Guarantee! 🎉`);
  cart = [];
  localStorage.setItem(getCartStorageKey(), JSON.stringify(cart));
  updateCartBadge();
  saveUserDataToServer();
  closeCartDrawer();
}

// Trade Modal Logic
function openTradeModal(cardId) {
  const card = CARDS_DATA.find(c => c.id === cardId) || CARDS_DATA[0];

  const targetTitle = document.getElementById('tradeTargetTitle');
  const targetImage = document.getElementById('tradeTargetImage');
  const modal = document.getElementById('tradeModal');

  if (targetTitle) targetTitle.textContent = card.title;
  if (targetImage) targetImage.src = card.image;

  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeTradeModal() {
  const modal = document.getElementById('tradeModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function submitTradeOffer() {
  requireAuth('propose swaps and trades', () => {
    showToast('Trade proposal submitted to CARDANGO escrow! 🛡️');
    closeTradeModal();
  });
}

function submitSimpleInquiry() {
  showToast('CARDANGO appraisal request received!');
}

// ==========================================
// USER SAVED CARDS COLLECTION LOGIC
// ==========================================
function isCardSaved(cardId) {
  return myCollection.some(c => c.id === cardId);
}

function saveCardToCollection(cardId, e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  requireAuth('save cards to your collection', () => {
    const card = CARDS_DATA.find(c => c.id === cardId);
    if (!card) return;

    const index = myCollection.findIndex(c => c.id === cardId);
    if (index === -1) {
      myCollection.push(card);
      localStorage.setItem(getCollectionStorageKey(), JSON.stringify(myCollection));
      saveUserDataToServer();
      showToast(`Saved "${card.title}" to Your Collection! ⭐`);
    } else {
      myCollection.splice(index, 1);
      localStorage.setItem(getCollectionStorageKey(), JSON.stringify(myCollection));
      saveUserDataToServer();
      showToast(`Removed "${card.title}" from Your Collection`);
    }

    updateCollectionBadge();
    updateSaveButtons(cardId);

    if (document.getElementById('collectionGrid')) {
      renderSavedCollection();
    }
  });
}

function removeCardFromCollection(cardId, e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  const card = CARDS_DATA.find(c => c.id === cardId);
  myCollection = myCollection.filter(c => c.id !== cardId);
  localStorage.setItem(getCollectionStorageKey(), JSON.stringify(myCollection));
  saveUserDataToServer();
  if (card) {
    showToast(`Removed "${card.title}" from Your Collection`);
  }
  updateCollectionBadge();
  updateSaveButtons(cardId);
  if (document.getElementById('collectionGrid')) {
    renderSavedCollection();
  }
}

function updateCollectionBadge() {
  const count = myCollection.length;
  document.querySelectorAll('#collectionNavBadge, .collection-badge').forEach(badge => {
    badge.textContent = count;
    if (count > 0) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  });
}

function updateSaveButtons(cardId) {
  const saved = isCardSaved(cardId);
  const modalBtn = document.getElementById('modalSaveCardBtn');
  if (modalBtn) {
    if (saved) {
      modalBtn.className = 'px-4 py-3 rounded-xl border border-amber-300 bg-amber-50 text-amber-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-all';
      modalBtn.innerHTML = `
        <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
        <span>Saved</span>
      `;
    } else {
      modalBtn.className = 'px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:text-amber-500 font-bold text-xs flex items-center justify-center gap-1.5 transition-all';
      modalBtn.innerHTML = `
        <svg class="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
        <span>Save</span>
      `;
    }
  }

  document.querySelectorAll(`[data-save-btn="${cardId}"]`).forEach(btn => {
    if (saved) {
      btn.className = 'absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white border border-amber-300 bg-amber-50 text-amber-500 shadow-sm flex items-center justify-center transition-all';
      btn.innerHTML = `<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>`;
    } else {
      btn.className = 'absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white border border-slate-200 text-slate-400 hover:text-amber-500 shadow-sm flex items-center justify-center transition-all';
      btn.innerHTML = `<svg class="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>`;
    }
  });
}

function renderSavedCollection() {
  const container = document.getElementById('collectionGrid');
  const emptyState = document.getElementById('collectionEmptyState');
  const totalCountEl = document.getElementById('collectionTotalCount');
  const totalValueEl = document.getElementById('collectionTotalValue');

  if (!container) return;

  const count = myCollection.length;
  const totalValue = myCollection.reduce((sum, c) => sum + (c.price || 0), 0);

  if (totalCountEl) totalCountEl.textContent = count;
  if (totalValueEl) totalValueEl.textContent = formatINR(totalValue);

  const noticeEl = document.getElementById('collectionUserNotice');
  if (noticeEl) {
    const user = getAuthUser();
    if (user) {
      noticeEl.innerHTML = `Personal verified vault for <span class="font-extrabold text-slate-800">${user.name}</span> (${user.email}). All cards saved here belong exclusively to your account.`;
    } else {
      noticeEl.innerHTML = `Viewing guest collection. <button type="button" onclick="openAuthModal('login')" class="text-sky-600 font-bold underline hover:text-sky-700">Sign in</button> to preserve your collection across devices.`;
    }
  }

  if (count === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  } else {
    if (emptyState) emptyState.classList.add('hidden');
  }

  container.innerHTML = myCollection.map(card => `
    <div class="bg-white rounded-2xl p-4 border border-sky-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
      <div>
        <div class="pure-card-slab w-full rounded-xl overflow-hidden mb-3 relative group" onclick="openCardInspectModal(${card.id})">
          <img src="${normalizeCardImage(card.image)}" alt="${card.title}" class="w-full h-full object-cover" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='uploads/card_1791720108934_dbyhqy.jpg';" />
          <button onclick="removeCardFromCollection(${card.id}, event)" title="Remove from Collection" class="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors">
            ✕
          </button>
        </div>

        <div class="flex items-center gap-1.5 mb-2">
          <span class="px-2 py-0.5 text-[10px] font-bold rounded ${card.badgeColor}">${card.categoryLabel}</span>
        </div>

        <h3 class="font-extrabold text-sm text-slate-900 line-clamp-1 mb-1" title="${card.title}">${card.title}</h3>
        <p class="text-xs text-slate-500 line-clamp-2 mb-3">${card.description}</p>
      </div>

      <div class="pt-3 border-t border-slate-100 space-y-2.5">
        <div class="flex items-baseline justify-between">
          <span class="text-xs text-slate-400 font-semibold">Value:</span>
          <span class="font-black text-slate-900 text-sm">${formatINR(card.price)}</span>
        </div>

        <div class="flex gap-2">
          <button onclick="addToCart(${card.id})" class="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all">
            Buy Now
          </button>
          <button onclick="openTradeModal(${card.id})" class="py-2 px-3 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs rounded-xl border border-sky-200 transition-all">
            Trade
          </button>
          <button onclick="openCardInspectModal(${card.id})" class="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl" title="Inspect">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  init3DTilt();
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-4 right-4 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-2xl border border-sky-400 flex items-center gap-2 transform translate-y-10 opacity-0 transition-all duration-300';
  toast.innerHTML = `
    <span class="w-2 h-2 rounded-full bg-sky-400"></span>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('translate-y-10', 'opacity-0');
  }, 50);

  setTimeout(() => {
    toast.classList.add('translate-y-10', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==========================================
// CARDANGO AUTHENTICATION SYSTEM
// ==========================================

let pendingAuthAction = null;
let currentAuthTab = 'login';

function getAuthUser() {
  try {
    const raw = localStorage.getItem('cardango_auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setAuthUser(user, token) {
  if (user) {
    const guestCartKey = 'cardango_cart_guest';
    const guestCollectionKey = 'cardango_saved_cards_guest';
    const guestCart = readLocalJSON(guestCartKey, []);
    const guestCollection = readLocalJSON(guestCollectionKey, []);

    localStorage.setItem('cardango_auth_user', JSON.stringify(user));
    if (token) localStorage.setItem('cardango_auth_token', token);

    const userCartKey = getCartStorageKey();
    const userCollKey = getCollectionStorageKey();
    let currentUsrCart = readLocalJSON(userCartKey, []);
    let currentUsrColl = readLocalJSON(userCollKey, []);

    if (Array.isArray(guestCart) && guestCart.length > 0) {
      guestCart.forEach(item => {
        if (!currentUsrCart.some(c => c.id === item.id)) currentUsrCart.push(item);
      });
      localStorage.setItem(userCartKey, JSON.stringify(currentUsrCart));
      localStorage.removeItem(guestCartKey);
    }

    if (Array.isArray(guestCollection) && guestCollection.length > 0) {
      guestCollection.forEach(item => {
        if (!currentUsrColl.some(c => c.id === item.id)) currentUsrColl.push(item);
      });
      localStorage.setItem(userCollKey, JSON.stringify(currentUsrColl));
      localStorage.removeItem(guestCollectionKey);
    }
  } else {
    localStorage.removeItem('cardango_auth_user');
    localStorage.removeItem('cardango_auth_token');
  }
  loadUserScopedData();
  updateAuthUI();
  document.dispatchEvent(new CustomEvent('cardango_auth_change', { detail: { user } }));
}

function logoutUser() {
  const user = getAuthUser();
  const userName = user ? user.name : 'Collector';
  setAuthUser(null);
  const dropdown = document.getElementById('userMenuDropdown');
  if (dropdown) dropdown.classList.add('hidden');
  showToast(`See you soon, ${userName}! Logged out.`);
}

function requireAuth(actionName, onAuthenticated) {
  const user = getAuthUser();
  if (user) {
    if (typeof onAuthenticated === 'function') onAuthenticated();
    return true;
  }
  pendingAuthAction = onAuthenticated;
  openAuthModal('login', `Sign in required to ${actionName}`);
  return false;
}

function openAuthModal(tab = 'login', message = '') {
  ensureAuthModalExists();
  currentAuthTab = tab;
  switchAuthTab(tab);

  const banner = document.getElementById('authModalContextBanner');
  const bannerText = document.getElementById('authModalContextText');
  if (banner && bannerText) {
    if (message) {
      bannerText.textContent = message;
      banner.classList.remove('hidden');
    } else {
      banner.classList.add('hidden');
    }
  }

  const errEl = document.getElementById('authModalError');
  if (errEl) errEl.classList.add('hidden');

  const modal = document.getElementById('cardangoAuthModal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeAuthModal() {
  const modal = document.getElementById('cardangoAuthModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function switchAuthTab(tab) {
  currentAuthTab = tab;
  const loginForm = document.getElementById('authLoginForm');
  const registerForm = document.getElementById('authRegisterForm');
  const tabLogin = document.getElementById('tabAuthLogin');
  const tabRegister = document.getElementById('tabAuthRegister');
  const errEl = document.getElementById('authModalError');
  if (errEl) errEl.classList.add('hidden');

  if (tab === 'login') {
    if (loginForm) loginForm.classList.remove('hidden');
    if (registerForm) registerForm.classList.add('hidden');
    if (tabLogin) tabLogin.classList.add('active');
    if (tabRegister) tabRegister.classList.remove('active');
  } else {
    if (loginForm) loginForm.classList.add('hidden');
    if (registerForm) registerForm.classList.remove('hidden');
    if (tabLogin) tabLogin.classList.remove('active');
    if (tabRegister) tabRegister.classList.add('active');
  }
}

async function handleLoginFormSubmit(e) {
  if (e) e.preventDefault();
  const emailInput = document.getElementById('authLoginEmail');
  const passInput = document.getElementById('authLoginPassword');
  const submitBtn = document.getElementById('authLoginSubmitBtn');

  const email = (emailInput?.value || '').trim();
  const password = (passInput?.value || '').trim();

  if (!email || !password) {
    showAuthError('Please enter both email and password.');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Signing in...</span>`;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      showAuthError(data.error || 'Invalid email or password.');
      return;
    }

    setAuthUser(data.user, data.token);
    closeAuthModal();
    showToast(`Welcome back, ${data.user.name}! 🛡️`);

    if (typeof pendingAuthAction === 'function') {
      const action = pendingAuthAction;
      pendingAuthAction = null;
      action();
    }
  } catch (netErr) {
    showAuthError('Network error connecting to auth service.');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Sign In to Vault</span>`;
    }
  }
}

async function handleRegisterFormSubmit(e) {
  if (e) e.preventDefault();
  const nameInput = document.getElementById('authRegisterName');
  const emailInput = document.getElementById('authRegisterEmail');
  const passInput = document.getElementById('authRegisterPassword');
  const confirmPassInput = document.getElementById('authRegisterConfirmPassword');
  const submitBtn = document.getElementById('authRegisterSubmitBtn');

  const name = (nameInput?.value || '').trim();
  const email = (emailInput?.value || '').trim();
  const password = (passInput?.value || '').trim();
  const confirmPass = (confirmPassInput?.value || '').trim();

  if (!name || !email || !password) {
    showAuthError('All fields are required.');
    return;
  }
  if (password.length < 6) {
    showAuthError('Password must be at least 6 characters long.');
    return;
  }
  if (password !== confirmPass) {
    showAuthError('Passwords do not match.');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Creating Account...</span>`;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      showAuthError(data.error || 'Failed to create account.');
      return;
    }

    setAuthUser(data.user, data.token);
    closeAuthModal();
    showToast(`Welcome to CARDANGO, ${data.user.name}! 🚀`);

    if (typeof pendingAuthAction === 'function') {
      const action = pendingAuthAction;
      pendingAuthAction = null;
      action();
    }
  } catch (netErr) {
    const newUser = {
      id: 'usr_local_' + Date.now(),
      name,
      email,
      role: 'Verified Collector',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80`,
      balanceUsd: 1500,
      balanceEth: 0.52
    };
    setAuthUser(newUser, 'token_local_' + Date.now());
    closeAuthModal();
    showToast(`Account created! Welcome, ${name}!`);
    if (typeof pendingAuthAction === 'function') {
      const action = pendingAuthAction;
      pendingAuthAction = null;
      action();
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Create Collector Account</span>`;
    }
  }
}

function showAuthError(msg) {
  const errEl = document.getElementById('authModalError');
  if (errEl) {
    errEl.textContent = msg;
    errEl.classList.remove('hidden');
  } else {
    showToast(msg);
  }
}

function toggleUserDropdown(event) {
  if (event) event.stopPropagation();
  const dropdown = document.getElementById('userMenuDropdown');
  if (dropdown) dropdown.classList.toggle('hidden');
}

function ensureAuthModalExists() {
  if (document.getElementById('cardangoAuthModal')) return;

  const modalHtml = `
    <div id="cardangoAuthModal" class="cardango-modal-backdrop" onclick="if(event.target === this) closeAuthModal()">
      <div class="cardango-modal-card p-6 sm:p-7" onclick="event.stopPropagation()">
        
        <div class="flex items-center justify-between pb-3.5 border-b border-sky-100">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 font-black shadow-sm">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            </div>
            <div>
              <h3 class="text-base font-black text-slate-900 tracking-tight leading-tight">CARDANGO Vault</h3>
              <p class="text-[11px] font-semibold text-slate-400">Collector Authentication & Escrow</p>
            </div>
          </div>
          <button type="button" onclick="closeAuthModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div id="authModalContextBanner" class="hidden mt-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
          <svg class="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <span id="authModalContextText">Sign in required to proceed</span>
        </div>

        <div class="flex p-1 bg-slate-100 rounded-xl mt-4 border border-slate-200">
          <button type="button" id="tabAuthLogin" onclick="switchAuthTab('login')" class="auth-tab-btn active">Sign In</button>
          <button type="button" id="tabAuthRegister" onclick="switchAuthTab('register')" class="auth-tab-btn">Create Account</button>
        </div>

        <div id="authModalError" class="hidden mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold"></div>

        <form id="authLoginForm" onsubmit="handleLoginFormSubmit(event)" class="mt-3.5 space-y-3">
          <div>
            <label class="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">Email Address</label>
            <input type="email" id="authLoginEmail" placeholder="collector@cardango.com" required class="auth-input" />
          </div>
          <div>
            <label class="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">Password</label>
            <input type="password" id="authLoginPassword" placeholder="••••••••" required class="auth-input" />
          </div>
          <button type="submit" id="authLoginSubmitBtn" class="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center">
            <span>Sign In to Vault</span>
          </button>
        </form>

        <form id="authRegisterForm" onsubmit="handleRegisterFormSubmit(event)" class="hidden mt-3.5 space-y-3">
          <div>
            <label class="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">Collector Name / Handle</label>
            <input type="text" id="authRegisterName" placeholder="e.g. Elena Fernandes" required class="auth-input" />
          </div>
          <div>
            <label class="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">Email Address</label>
            <input type="email" id="authRegisterEmail" placeholder="elena@cardango.com" required class="auth-input" />
          </div>
          <div>
            <label class="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">Password (min 6 characters)</label>
            <input type="password" id="authRegisterPassword" minlength="6" placeholder="••••••••" required class="auth-input" />
          </div>
          <div>
            <label class="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">Confirm Password</label>
            <input type="password" id="authRegisterConfirmPassword" minlength="6" placeholder="••••••••" required class="auth-input" />
          </div>
          <button type="submit" id="authRegisterSubmitBtn" class="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center">
            <span>Create Collector Account</span>
          </button>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function updateAuthUI() {
  let navContainer = document.getElementById('authNavContainer');

  if (!navContainer) {
    const cartBtn = document.querySelector('button[onclick*="openCartDrawer"]');
    if (cartBtn && cartBtn.parentElement) {
      navContainer = document.createElement('div');
      navContainer.id = 'authNavContainer';
      navContainer.className = 'flex items-center';
      cartBtn.parentElement.insertBefore(navContainer, cartBtn);
    }
  }

  if (!navContainer) return;

  const user = getAuthUser();

  if (!user) {
    navContainer.innerHTML = `
      <button type="button" onclick="openAuthModal('login')" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all mr-2">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
        <span>Sign In</span>
      </button>
    `;
  } else {
    navContainer.innerHTML = `
      <div class="relative mr-2" id="userMenuDropdownContainer">
        <button type="button" onclick="toggleUserDropdown(event)" class="flex items-center gap-2 py-1 px-2.5 rounded-xl bg-white hover:bg-sky-50 border border-sky-200 transition-all text-xs font-bold text-slate-800 shadow-sm">
          <img src="${user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}" alt="${user.name}" class="w-6 h-6 rounded-full object-cover border border-sky-300" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'" />
          <div class="text-left hidden sm:block">
            <div class="leading-tight text-slate-900 font-extrabold max-w-[100px] truncate">${user.name}</div>
          </div>
          <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </button>

        <div id="userMenuDropdown" class="hidden user-dropdown-panel animate-in fade-in zoom-in-95">
          <div class="px-3 py-2 border-b border-sky-100">
            <div class="text-xs font-black text-slate-900">${user.name}</div>
            <div class="text-[10px] text-slate-400 truncate">${user.email}</div>
            <div class="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>${user.role || 'Verified Collector'}</span>
            </div>
            <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span class="text-slate-400 font-medium">Vault Balance:</span>
              <span class="font-black text-sky-600">${formatINR(user.balanceUsd || 3450)}</span>
            </div>
            <div class="mt-1 flex items-center justify-between text-[11px]">
              <span class="text-slate-400 font-medium">Your Collection:</span>
              <span class="font-bold text-amber-600">${myCollection.length} saved</span>
            </div>
            <div class="mt-1 flex items-center justify-between text-[11px]">
              <span class="text-slate-400 font-medium">Your Cart:</span>
              <span class="font-bold text-sky-600">${cart.length} item${cart.length === 1 ? '' : 's'}</span>
            </div>
          </div>
          <div class="py-1">
            <a href="collection.html" class="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-600 rounded-xl transition-colors">
              <svg class="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <span>My Collection</span>
            </a>
            <a href="trade.html" class="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-600 rounded-xl transition-colors">
              <svg class="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
              <span>P2P Trade Wheel</span>
            </a>
            <a href="upload.html" class="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-600 rounded-xl transition-colors">
              <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              <span>Mint / Upload Card</span>
            </a>
          </div>
          <div class="pt-1 border-t border-slate-100">
            <button type="button" onclick="logoutUser()" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Update upload page notice if on upload.html
  const uploadNotice = document.getElementById('uploadAuthNotice');
  if (uploadNotice) {
    if (user) {
      uploadNotice.innerHTML = `
        <div class="flex items-center gap-2.5">
          <img src="${user.avatar}" alt="${user.name}" class="w-7 h-7 rounded-full object-cover border border-emerald-400" />
          <div>
            <div class="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>${user.name}</span>
              <span class="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-bold">✓ Authenticated Creator</span>
            </div>
            <div class="text-[11px] text-slate-500">Ready to mint and publish verified collectible slabs to CARDANGO</div>
          </div>
        </div>
        <button type="button" onclick="logoutUser()" class="px-2.5 py-1 text-slate-500 hover:text-rose-600 text-xs font-bold rounded-lg hover:bg-white transition-colors">Sign Out</button>
      `;
      uploadNotice.className = 'mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between';
    } else {
      uploadNotice.innerHTML = `
        <div class="flex items-center gap-2.5">
          <span class="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-black">🔒</span>
          <div>
            <div class="text-xs font-black text-slate-900">Collector Vault Authentication Required</div>
            <div class="text-[11px] text-slate-500">Sign in to mint cards to the vault</div>
          </div>
        </div>
        <button type="button" onclick="openAuthModal('login', 'Sign in to mint cards')" class="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all">Sign In</button>
      `;
      uploadNotice.className = 'mb-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between';
    }
  }
}

function toggleMobileNavMenu(e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  const dropdown = document.getElementById('mobileNavDropdown');
  if (dropdown) {
    dropdown.classList.toggle('hidden');
  }
}

function initCardangoAuth() {
  ensureAuthModalExists();
  updateAuthUI();

  // Escape key closes modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAuthModal();
      const mobileMenu = document.getElementById('mobileNavDropdown');
      if (mobileMenu) mobileMenu.classList.add('hidden');
    }
  });

  // Outside click closes dropdowns
  document.addEventListener('click', (e) => {
    const container = document.getElementById('userMenuDropdownContainer');
    const dropdown = document.getElementById('userMenuDropdown');
    if (dropdown && !dropdown.classList.contains('hidden')) {
      if (!container || !container.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    }

    const mobileMenu = document.getElementById('mobileNavDropdown');
    const mobileBtn = document.getElementById('mobileNavMenuBtn');
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
      if (!mobileMenu.contains(e.target) && (!mobileBtn || !mobileBtn.contains(e.target))) {
        mobileMenu.classList.add('hidden');
      }
    }
  });

  // Listen for storage changes across tabs
  window.addEventListener('storage', (e) => {
    if (e.key === 'cardango_auth_user') {
      updateAuthUI();
    }
  });
}


