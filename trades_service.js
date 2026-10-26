/**
 * CARDANGO Trade & Escrow System Service
 * Handles P2P card swap proposals, Supabase persistence (with JSON fallback),
 * and automated email notifications with confirmation action buttons.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const LOCAL_TRADES_FILE = path.join(__dirname, 'trades.json');
const LOCAL_LISTINGS_FILE = path.join(__dirname, 'trade_listings.json');

const DEFAULT_TRADE_LISTINGS = [
  {
    cardId: 1,
    cardName: 'Ho-oh ex Ultra Rare Holo #260',
    cardPrice: 203350,
    cardPriceEth: 0.88,
    image: 'uploads/card_1791720108934_dbyhqy.jpg',
    traderName: 'Aarav Mehta',
    traderEmail: 'aarav.collector@cardango.test',
    traderRole: 'Pro Collector • Mumbai'
  },
  {
    cardId: 2,
    cardName: 'Charizard 1st Edition Shadowless Holo #004',
    cardPrice: 1079000,
    cardPriceEth: 4.60,
    image: 'https://i.pinimg.com/736x/35/ca/32/35ca32abb63da8220873970a391d6876.jpg',
    traderName: 'Sofia D’Souza',
    traderEmail: 'sofia.dsouza@cardango.test',
    traderRole: 'Vault Verified • Goa'
  },
  {
    cardId: 3,
    cardName: 'Monkey D. Luffy Gear 5 Manga Secret #01',
    cardPrice: 481400,
    cardPriceEth: 2.05,
    image: 'https://i.pinimg.com/1200x/8a/6f/20/8a6f2091122f67b8813a9849b742b60a.jpg',
    traderName: 'Kabir Rao',
    traderEmail: 'kabir.rao@cardango.test',
    traderRole: 'Slab Expert • Delhi'
  },
  {
    cardId: 4,
    cardName: 'Lionel Messi 2022 World Cup Golden Ball Refractor',
    cardPrice: 738700,
    cardPriceEth: 3.15,
    image: 'https://i.pinimg.com/736x/da/6f/2c/da6f2c6782704e4120fc689f5da89482.jpg',
    traderName: 'Elena Fernandes',
    traderEmail: 'elena.f@cardango.test',
    traderRole: 'Top Trader • Bengaluru'
  },
  {
    cardId: 5,
    cardName: 'Sachin Tendulkar 1999 Century Relic Slab',
    cardPrice: 323700,
    cardPriceEth: 1.38,
    image: 'https://i.pinimg.com/736x/42/e3/1a/42e31a89a861c1bf09dd484ceb6babac.jpg',
    traderName: 'Arjun Nair',
    traderEmail: 'arjun.nair@cardango.test',
    traderRole: 'Grail Hunter • Pune'
  },
  {
    cardId: 6,
    cardName: 'Senior Full-Stack Architect #01',
    cardPrice: 12450,
    cardPriceEth: 0.05,
    image: 'https://i.pinimg.com/736x/a9/78/19/a97819aa814cf2614b9b8ce97a71248e.jpg',
    traderName: 'Mira Kapoor',
    traderEmail: 'mira.kapoor@cardango.test',
    traderRole: 'Mint Specialist • Jaipur'
  },
  {
    cardId: 7,
    cardName: 'Gengar VMAX Alternate Art Holo #271',
    cardPrice: 348600,
    cardPriceEth: 1.48,
    image: 'https://i.pinimg.com/736x/7d/53/7d/7d537d921356f9660ad5579fa0378051.jpg',
    traderName: 'Dev Patel',
    traderEmail: 'dev.patel@cardango.test',
    traderRole: 'Holo Scout • Hyderabad'
  },
  {
    cardId: 8,
    cardName: 'Roronoa Zoro King of Hell Secret Rare #02',
    cardPrice: 282200,
    cardPriceEth: 1.20,
    image: 'https://i.pinimg.com/736x/a0/0b/c5/a00bc506306e9ca9c2bfb032d8494b7e.jpg',
    traderName: 'Zara Khan',
    traderEmail: 'zara.khan@cardango.test',
    traderRole: 'Vault Curator • Chennai'
  }
];

// In-memory / file cache fallback if Supabase table is not yet provisioned
function readLocalTrades() {
  try {
    if (fs.existsSync(LOCAL_TRADES_FILE)) {
      const raw = fs.readFileSync(LOCAL_TRADES_FILE, 'utf8');
      return JSON.parse(raw || '[]');
    }
  } catch (e) {
    console.warn('Failed to read trades.json:', e.message);
  }
  return [];
}

function writeLocalTrades(trades) {
  try {
    fs.writeFileSync(LOCAL_TRADES_FILE, JSON.stringify(trades, null, 2), 'utf8');
  } catch (e) {
    console.warn('Failed to write trades.json:', e.message);
  }
}

// Global cached nodemailer transporter
let cachedTransporter = null;
let isEthereal = false;

async function getTransporter() {
  if (cachedTransporter) return { transporter: cachedTransporter, isEthereal };

  // 1. Check if user configured SMTP in .env
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const cleanPass = String(process.env.SMTP_PASS || '').replace(/\s+/g, '');
    const user = String(process.env.SMTP_USER || '').trim();
    const isGmail = (process.env.SMTP_HOST || '').includes('gmail') || user.includes('@gmail.com');

    if (isGmail) {
      cachedTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: user,
          pass: cleanPass
        }
      });
      console.log('[CARDANGO Mail] Connected to Gmail SMTP for:', user);
    } else {
      cachedTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: user,
          pass: cleanPass
        }
      });
      console.log('[CARDANGO Mail] Using configured SMTP server:', process.env.SMTP_HOST);
    }
    isEthereal = false;
    return { transporter: cachedTransporter, isEthereal };
  }

  // 2. Fallback to automated Ethereal test inbox (zero setup needed)
  try {
    console.log('[CARDANGO Mail] No custom SMTP found in .env. Initializing automated Ethereal mail account...');
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    isEthereal = true;
    console.log('[CARDANGO Mail] Ethereal inbox initialized:', testAccount.user);
    return { transporter: cachedTransporter, isEthereal };
  } catch (err) {
    console.warn('[CARDANGO Mail] Ethereal generation notice:', err.message);
    // Dummy transporter fallback
    cachedTransporter = nodemailer.createTransport({
      jsonTransport: true
    });
    isEthereal = false;
    return { transporter: cachedTransporter, isEthereal };
  }
}

/**
 * Format currency helper
 */
function formatCurrency(val) {
  if (!val) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN');
}

/**
 * Email template for when a Trade Proposal is sent
 */
function renderProposalEmailToOwner({ trade, baseUrl, acceptUrl, declineUrl }) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0b1320; color: #f1f5f9; margin: 0; padding: 24px; }
      .container { max-width: 600px; margin: 0 auto; background: #131d2e; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
      .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 24px; text-align: center; }
      .badge { display: inline-block; background: rgba(255,255,255,0.2); color: #fff; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 8px; }
      .title { color: #ffffff; font-size: 22px; font-weight: 900; margin: 0; }
      .content { padding: 32px 24px; }
      .intro { font-size: 15px; color: #cbd5e1; line-height: 1.5; margin-bottom: 24px; }
      .cards-grid { display: table; width: 100%; margin-bottom: 24px; }
      .card-col { display: table-cell; width: 48%; vertical-align: top; background: #1e293b; border-radius: 16px; padding: 16px; text-align: center; }
      .card-spacer { display: table-cell; width: 4%; text-align: center; vertical-align: middle; font-size: 20px; color: #38bdf8; font-weight: bold; }
      .card-img { width: 100%; max-height: 220px; object-fit: contain; border-radius: 12px; background: #0f172a; margin-bottom: 12px; }
      .card-tag { font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: 6px; display: inline-block; margin-bottom: 6px; }
      .tag-receive { background: #065f46; color: #34d399; }
      .tag-give { background: #1e3a8a; color: #93c5fd; }
      .card-title { font-size: 14px; font-weight: 800; color: #f8fafc; margin-bottom: 4px; }
      .card-price { font-size: 13px; font-weight: 700; color: #38bdf8; }
      .details-box { background: #0f172a; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #1e293b; }
      .btn-container { text-align: center; margin: 32px 0 16px; }
      .btn-accept { display: inline-block; background: #0284c7; color: #ffffff !important; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 12px; text-decoration: none; margin-right: 12px; box-shadow: 0 4px 15px rgba(2, 132, 199, 0.4); }
      .btn-decline { display: inline-block; background: #334155; color: #cbd5e1 !important; font-size: 14px; font-weight: 700; padding: 14px 24px; border-radius: 12px; text-decoration: none; }
      .footer { border-top: 1px solid #1e293b; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <span class="badge">CARDANGO ESCROW TRADE</span>
        <h1 class="title">⚔️ New Swap Proposal Received</h1>
      </div>
      <div class="content">
        <p class="intro">
          Hello <strong>${trade.owner_name}</strong>,<br>
          Collector <strong>${trade.proposer_name}</strong> (<a href="mailto:${trade.proposer_email}" style="color:#38bdf8;">${trade.proposer_email}</a>) has proposed a card swap with you through the CARDANGO Escrow Vault!
        </p>

        <div class="cards-grid">
          <!-- What they offer you -->
          <div class="card-col">
            <span class="card-tag tag-receive">You Receive</span>
            <img src="${trade.offered_card_image}" alt="${trade.offered_card_title}" class="card-img" />
            <div class="card-title">${trade.offered_card_title}</div>
            <div class="card-price">${formatCurrency(trade.offered_card_price)}</div>
          </div>
          <div class="card-spacer">⇄</div>
          <!-- What you give -->
          <div class="card-col">
            <span class="card-tag tag-give">You Give</span>
            <img src="${trade.target_card_image}" alt="${trade.target_card_title}" class="card-img" />
            <div class="card-title">${trade.target_card_title}</div>
            <div class="card-price">${formatCurrency(trade.target_card_price)}</div>
          </div>
        </div>

        <div class="details-box">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 700; margin-bottom: 6px;">PROPOSAL DETAILS:</div>
          <div style="font-size: 13px; color: #e2e8f0; margin-bottom: 4px;"><strong>Trade ID:</strong> ${trade.id}</div>
          ${trade.cash_sweetener > 0 ? `<div style="font-size: 13px; color: #34d399; margin-bottom: 4px;"><strong>Cash Sweetener Added:</strong> +${formatCurrency(trade.cash_sweetener)}</div>` : ''}
          ${trade.note ? `<div style="font-size: 13px; color: #cbd5e1; margin-top: 8px;"><strong>Note from ${trade.proposer_name}:</strong> <em>"${trade.note}"</em></div>` : ''}
        </div>

        <p style="font-size: 13px; color: #94a3b8; text-align: center;">
          Clicking <strong>Accept & Confirm</strong> immediately locks and executes this exchange under CARDANGO Escrow Protection.
        </p>

        <div class="btn-container">
          <a href="${acceptUrl}" class="btn-accept">✅ Accept &amp; Confirm Swap</a>
          <a href="${declineUrl}" class="btn-decline">✕ Decline</a>
        </div>
      </div>
      <div class="footer">
        CARDANGO Vault Escrow Protocol • Protected with 100% Authenticity Guarantee<br>
        If you did not expect this proposal, you can safely disregard or decline it.
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Email template for proposer acknowledging proposal is in Escrow Pending
 */
function renderProposalEmailToProposer({ trade, baseUrl, viewUrl }) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0b1320; color: #f1f5f9; margin: 0; padding: 24px; }
      .container { max-width: 600px; margin: 0 auto; background: #131d2e; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
      .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 24px; text-align: center; }
      .badge { display: inline-block; background: rgba(255,255,255,0.2); color: #fff; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 8px; }
      .title { color: #ffffff; font-size: 22px; font-weight: 900; margin: 0; }
      .content { padding: 32px 24px; }
      .intro { font-size: 15px; color: #cbd5e1; line-height: 1.5; margin-bottom: 24px; }
      .btn { display: inline-block; background: #0284c7; color: #ffffff !important; font-size: 14px; font-weight: 800; padding: 14px 28px; border-radius: 12px; text-decoration: none; }
      .footer { border-top: 1px solid #1e293b; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <span class="badge">ESCROW PENDING</span>
        <h1 class="title">🛡️ Trade Proposal Sent to Escrow</h1>
      </div>
      <div class="content">
        <p class="intro">
          Hello <strong>${trade.proposer_name}</strong>,<br>
          Your proposal to swap <strong>${trade.offered_card_title}</strong> for <strong>${trade.target_card_title}</strong> has been safely created and delivered to <strong>${trade.owner_name}</strong>.
        </p>

        <div style="background: #0f172a; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #1e293b;">
          <div style="font-size: 13px; color: #e2e8f0; margin-bottom: 4px;"><strong>Trade Proposal ID:</strong> ${trade.id}</div>
          <div style="font-size: 13px; color: #e2e8f0; margin-bottom: 4px;"><strong>Target Card:</strong> ${trade.target_card_title} (${formatCurrency(trade.target_card_price)})</div>
          <div style="font-size: 13px; color: #e2e8f0; margin-bottom: 4px;"><strong>Your Offered Card:</strong> ${trade.offered_card_title} (${formatCurrency(trade.offered_card_price)})</div>
          ${trade.cash_sweetener > 0 ? `<div style="font-size: 13px; color: #34d399;"><strong>Cash Adjustment:</strong> +${formatCurrency(trade.cash_sweetener)}</div>` : ''}
          <div style="font-size: 13px; color: #38bdf8; margin-top: 8px;"><strong>Status:</strong> Awaiting Owner Response</div>
        </div>

        <p style="font-size: 14px; color: #cbd5e1; text-align: center;">
          We will notify you immediately by email the moment ${trade.owner_name} confirms your proposal.
        </p>

        <div style="text-align: center; margin: 28px 0 12px;">
          <a href="${viewUrl}" class="btn">View Trade on CARDANGO</a>
        </div>
      </div>
      <div class="footer">
        CARDANGO Vault Escrow Protocol • Trade ID ${trade.id}
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Confirmation Email when trade is accepted
 */
function renderConfirmedEmail({ trade, recipientName, wonCardTitle, wonCardImage, wonCardPrice }) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0b1320; color: #f1f5f9; margin: 0; padding: 24px; }
      .container { max-width: 600px; margin: 0 auto; background: #131d2e; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
      .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 24px; text-align: center; }
      .badge { display: inline-block; background: rgba(255,255,255,0.2); color: #fff; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 8px; }
      .title { color: #ffffff; font-size: 22px; font-weight: 900; margin: 0; }
      .content { padding: 32px 24px; text-align: center; }
      .card-preview { background: #1e293b; border-radius: 16px; padding: 20px; display: inline-block; max-width: 280px; margin: 20px auto; }
      .card-img { width: 100%; max-height: 240px; object-fit: contain; border-radius: 12px; margin-bottom: 12px; }
      .footer { border-top: 1px solid #1e293b; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <span class="badge">TRADE COMPLETED</span>
        <h1 class="title">🎉 Trade Confirmed &amp; Vault Swapped!</h1>
      </div>
      <div class="content">
        <p style="font-size: 16px; color: #cbd5e1;">
          Congratulations <strong>${recipientName}</strong>!<br>
          The peer-to-peer card swap for <strong>Trade ${trade.id}</strong> has been officially confirmed and verified in the CARDANGO vault.
        </p>

        <div class="card-preview">
          <div style="font-size: 11px; font-weight: 800; color: #34d399; text-transform: uppercase; margin-bottom: 6px;">New Card in Your Collection</div>
          <img src="${wonCardImage}" alt="${wonCardTitle}" class="card-img" />
          <div style="font-size: 15px; font-weight: 800; color: #ffffff;">${wonCardTitle}</div>
          <div style="font-size: 13px; font-weight: 700; color: #38bdf8;">${formatCurrency(wonCardPrice)}</div>
        </div>

        <p style="font-size: 13px; color: #94a3b8;">
          Ownership of this card has been transferred to your CARDANGO portfolio. You can view, trade, or mint it anytime.
        </p>
      </div>
      <div class="footer">
        CARDANGO Vault Escrow Protocol • Thank you for trading safely!
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Main Service Object
 */
const TradesService = {
  /**
   * Create a new Trade Proposal
   */
  async createTradeProposal({ supabase, payload, baseUrl }) {
    const tradeId = 'TRD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const token = crypto.randomBytes(16).toString('hex');

    const trade = {
      id: tradeId,
      proposer_id: payload.proposer_id || 'usr_proposer',
      proposer_name: (payload.proposer_name || 'Cardango Collector').trim(),
      proposer_email: (payload.proposer_email || '').trim().toLowerCase(),
      owner_id: payload.owner_id || 'usr_owner',
      owner_name: (payload.owner_name || 'Vault Trader').trim(),
      owner_email: (payload.owner_email || '').trim().toLowerCase(),
      target_card_id: payload.target_card_id || null,
      target_card_title: payload.target_card_title || 'Untitled Card',
      target_card_image: payload.target_card_image || '',
      target_card_price: Number(payload.target_card_price || 0),
      offered_card_id: payload.offered_card_id || null,
      offered_card_title: payload.offered_card_title || 'Custom Offered Card',
      offered_card_image: payload.offered_card_image || '',
      offered_card_price: Number(payload.offered_card_price || 0),
      cash_sweetener: Number(payload.cash_sweetener || 0),
      note: (payload.note || '').trim(),
      status: 'pending',
      confirmation_token: token,
      created_at: new Date().toISOString(),
      confirmed_at: null
    };

    if (!trade.proposer_email || !trade.owner_email) {
      throw new Error('Both proposer_email and owner_email are required to initiate an Escrow Trade proposal.');
    }

    // 1. Save to Supabase (with fallback to local trades store)
    let savedInSupabase = false;
    try {
      const { error } = await supabase.from('trades').insert([trade]);
      if (!error) {
        savedInSupabase = true;
      } else {
        console.warn('[TradesService] Supabase insert notice:', error.message);
      }
    } catch (dbErr) {
      console.warn('[TradesService] Supabase fallback notice:', dbErr.message);
    }

    // Always keep in local file cache as well for ultra-fast reads & resilience
    const localTrades = readLocalTrades();
    localTrades.unshift(trade);
    writeLocalTrades(localTrades);

    // 2. Dispatch Emails
    const emailPreviews = [];
    try {
      const { transporter } = await getTransporter();
      const acceptUrl = `${baseUrl}/trade.html?tradeAction=accept&id=${trade.id}&token=${token}`;
      const declineUrl = `${baseUrl}/trade.html?tradeAction=decline&id=${trade.id}&token=${token}`;
      const viewUrl = `${baseUrl}/trade.html?viewTrade=${trade.id}`;

      // Email 1: Send to Card Owner
      const ownerInfo = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"CARDANGO Escrow" <escrow@cardango.com>',
        to: trade.owner_email,
        subject: `⚔️ Trade Proposal: ${trade.proposer_name} wants your ${trade.target_card_title}!`,
        html: renderProposalEmailToOwner({ trade, baseUrl, acceptUrl, declineUrl })
      });

      const ownerPreview = nodemailer.getTestMessageUrl(ownerInfo);
      if (ownerPreview) emailPreviews.push({ recipient: trade.owner_email, type: 'owner_proposal', url: ownerPreview });

      // Email 2: Send to Proposer
      const proposerInfo = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"CARDANGO Escrow" <escrow@cardango.com>',
        to: trade.proposer_email,
        subject: `🛡️ Trade Proposal Sent: Your offer for ${trade.target_card_title} is in Escrow`,
        html: renderProposalEmailToProposer({ trade, baseUrl, viewUrl })
      });

      const proposerPreview = nodemailer.getTestMessageUrl(proposerInfo);
      if (proposerPreview) emailPreviews.push({ recipient: trade.proposer_email, type: 'proposer_receipt', url: proposerPreview });

      console.log(`[TradesService] Dispatched 2 trade emails for ${trade.id}. Previews:`, emailPreviews);
    } catch (mailErr) {
      console.error('[TradesService] Email dispatch error:', mailErr.message);
    }

    return {
      trade,
      savedInSupabase,
      emailPreviews
    };
  },

  /**
   * Get Trade by ID
   */
  async getTrade(tradeId, supabase) {
    // Check Supabase first
    try {
      const { data, error } = await supabase.from('trades').select('*').eq('id', tradeId).single();
      if (!error && data) return data;
    } catch (e) {}

    // Fallback to local store
    const localTrades = readLocalTrades();
    return localTrades.find(t => t.id === tradeId) || null;
  },

  /**
   * List all trades (for an email or user)
   */
  async listTrades({ email, supabase }) {
    let result = [];
    try {
      let query = supabase.from('trades').select('*').order('created_at', { ascending: false });
      if (email) {
        query = query.or(`owner_email.eq.${email.toLowerCase()},proposer_email.eq.${email.toLowerCase()}`);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data;
    } catch (e) {}

    // Fallback to local store
    const localTrades = readLocalTrades();
    if (email) {
      const em = email.toLowerCase();
      return localTrades.filter(t => t.owner_email === em || t.proposer_email === em);
    }
    return localTrades;
  },

  /**
   * Accept Trade
   */
  async acceptTrade({ tradeId, token, supabase, baseUrl }) {
    let trade = await this.getTrade(tradeId, supabase);
    if (!trade) throw new Error('Trade proposal not found');

    if (trade.status === 'confirmed') {
      return { trade, alreadyConfirmed: true, message: 'This trade has already been confirmed.' };
    }
    if (trade.status === 'declined') {
      throw new Error('This trade proposal was already declined.');
    }

    if (token && trade.confirmation_token && token !== trade.confirmation_token) {
      throw new Error('Invalid confirmation security token.');
    }

    // Update Status
    const now = new Date().toISOString();
    trade.status = 'confirmed';
    trade.confirmed_at = now;

    // Update Supabase
    try {
      await supabase.from('trades').update({ status: 'confirmed', confirmed_at: now }).eq('id', tradeId);
    } catch (e) {}

    // Update local cache
    const localTrades = readLocalTrades();
    const idx = localTrades.findIndex(t => t.id === tradeId);
    if (idx !== -1) {
      localTrades[idx].status = 'confirmed';
      localTrades[idx].confirmed_at = now;
      writeLocalTrades(localTrades);
    }

    // Send Confirmation Emails to BOTH parties!
    const emailPreviews = [];
    try {
      const { transporter } = await getTransporter();

      // Email to Owner (received offered card)
      const ownerInfo = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"CARDANGO Escrow" <escrow@cardango.com>',
        to: trade.owner_email,
        subject: `🎉 Trade Confirmed! You acquired ${trade.offered_card_title}`,
        html: renderConfirmedEmail({
          trade,
          recipientName: trade.owner_name,
          wonCardTitle: trade.offered_card_title,
          wonCardImage: trade.offered_card_image,
          wonCardPrice: trade.offered_card_price
        })
      });
      const op = nodemailer.getTestMessageUrl(ownerInfo);
      if (op) emailPreviews.push({ recipient: trade.owner_email, url: op });

      // Email to Proposer (received target card)
      const propInfo = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"CARDANGO Escrow" <escrow@cardango.com>',
        to: trade.proposer_email,
        subject: `🎉 Trade Accepted! You acquired ${trade.target_card_title}`,
        html: renderConfirmedEmail({
          trade,
          recipientName: trade.proposer_name,
          wonCardTitle: trade.target_card_title,
          wonCardImage: trade.target_card_image,
          wonCardPrice: trade.target_card_price
        })
      });
      const pp = nodemailer.getTestMessageUrl(propInfo);
      if (pp) emailPreviews.push({ recipient: trade.proposer_email, url: pp });

    } catch (err) {
      console.warn('[TradesService] Confirmation email dispatch error:', err.message);
    }

    return {
      trade,
      success: true,
      message: 'Trade accepted! Both collectors have been notified and the card swap is confirmed.',
      emailPreviews
    };
  },

  /**
   * Add a card to the 3D P2P Trade Wheel listings
   */
  addTradeListing(listing) {
    const listings = this.getRawTradeListings();
    const filtered = listings.filter(l => String(l.cardId) !== String(listing.cardId) && l.cardName !== listing.cardName);
    filtered.unshift({
      cardId: listing.cardId || Date.now(),
      cardName: listing.cardName,
      cardPrice: Number(listing.cardPrice || 10000),
      cardPriceEth: Number(listing.cardPriceEth || 0.05),
      image: listing.image,
      traderName: (listing.traderName || 'Verified Collector').trim(),
      traderEmail: (listing.traderEmail || 'collector@cardango.com').trim().toLowerCase(),
      traderRole: (listing.traderRole || 'Vault Verified • Uploader').trim(),
      createdAt: new Date().toISOString()
    });
    try {
      fs.writeFileSync(LOCAL_LISTINGS_FILE, JSON.stringify(filtered, null, 2), 'utf8');
    } catch (e) {
      console.warn('Failed to write trade_listings.json:', e.message);
    }
    return filtered[0];
  },

  getRawTradeListings() {
    try {
      if (fs.existsSync(LOCAL_LISTINGS_FILE)) {
        const raw = fs.readFileSync(LOCAL_LISTINGS_FILE, 'utf8');
        return JSON.parse(raw || '[]');
      }
    } catch (e) {}
    return [];
  },

  getTradeListings() {
    const userListings = this.getRawTradeListings();
    const existingNames = new Set(userListings.map(u => (u.cardName || '').toLowerCase().trim()));
    const padded = [...userListings];
    for (const d of DEFAULT_TRADE_LISTINGS) {
      if (padded.length >= 8) break;
      if (!existingNames.has(d.cardName.toLowerCase().trim())) {
        padded.push(d);
        existingNames.add(d.cardName.toLowerCase().trim());
      }
    }
    return padded;
  },

  /**
   * Decline Trade
   */
  async declineTrade({ tradeId, token, supabase }) {
    let trade = await this.getTrade(tradeId, supabase);
    if (!trade) throw new Error('Trade proposal not found');

    if (trade.status === 'confirmed') {
      throw new Error('Cannot decline a trade that was already confirmed.');
    }

    trade.status = 'declined';

    try {
      await supabase.from('trades').update({ status: 'declined' }).eq('id', tradeId);
    } catch (e) {}

    const localTrades = readLocalTrades();
    const idx = localTrades.findIndex(t => t.id === tradeId);
    if (idx !== -1) {
      localTrades[idx].status = 'declined';
      writeLocalTrades(localTrades);
    }

    return { trade, success: true, message: 'Trade proposal declined.' };
  }
};

module.exports = TradesService;
