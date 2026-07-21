require("dotenv").config();

/* ───────── Global Error Handlers ───────── */
process.on("uncaughtException", (err) => {
  console.error("CRITICAL: Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("CRITICAL: Unhandled Rejection at:", promise, "reason:", reason);
});

const express = require("express");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { isToxic } = require("./utils/moderation");
const app = express();
const PORT = process.env.PORT || 3000;

/* ───────── CSRF Token Sistemi (Double Submit Cookie) ───────── */
const CSRF_TOKEN_EXPIRY = 30 * 60 * 1000; // 30 dakika

function generateCsrfToken() {
  return crypto.randomBytes(32).toString("hex");
}

function validateCsrfToken(cookieToken, bodyToken) {
  if (!cookieToken || !bodyToken) return false;
  // Timing-safe karşılaştırma (brute-force koruması)
  try {
    const a = Buffer.from(cookieToken, "utf8");
    const b = Buffer.from(bodyToken, "utf8");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/* ───────── Deneme Modu ─────────
   true  = Rate limiting KAPALI (test aşaması)
   false = Rate limiting AKTİF  (production)
   Production'a geçince bu değeri false yapın veya .env'ye DENEME_MODU=false ekleyin.
───────────────────────────────── */
const DENEME_MODU = process.env.DENEME_MODU === "true"; // varsayılan: false (güvenli — production-ready)

/* ───────── Database Setup (MongoDB + Vercel Connection Caching) ───────── */
let isDbConnected = false;
let dbConnectionPromise = null; // Vercel serverless: bağlantı promise'ini cache'le

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 5000, // Vercel timeout (10s) öncesi yeterli süre
  socketTimeoutMS: 10000,
  maxPoolSize: 10,
  minPoolSize: 1,
  bufferCommands: false, // Fail fast if DB is disconnected instead of hanging indefinitely
};

// MongoDB bağlantı fonksiyonu — SRV başarısız olursa fallback URI'ye geçer
async function connectMongoDB() {
  // Zaten bağlıysa atla
  if (mongoose.connection.readyState === 1) {
    isDbConnected = true;
    return;
  }
  // Bağlanıyorsa mevcut promise'i bekle (çift bağlantı önleme)
  if (mongoose.connection.readyState === 2 && dbConnectionPromise) {
    return dbConnectionPromise;
  }

  const primaryUri = process.env.MONGODB_URI || "mongodb://localhost:27017/hadibarisalim";
  const fallbackUri = process.env.MONGODB_URI_FALLBACK;

  dbConnectionPromise = (async () => {
    try {
      await mongoose.connect(primaryUri, MONGO_OPTIONS);
      isDbConnected = true;
      console.log("✔  MongoDB bağlantısı başarılı (SRV)");
    } catch (err) {
      console.error("✘  MongoDB SRV bağlantı hatası:", err.message);

      // Fallback: Doğrudan shard adresleriyle bağlan
      if (fallbackUri) {
        console.log("↻  Fallback URI deneniyor (direkt shard adresleri)...");
        try {
          await mongoose.connect(fallbackUri, MONGO_OPTIONS);
          isDbConnected = true;
          console.log("✔  MongoDB bağlantısı başarılı (Fallback)");
        } catch (fallbackErr) {
          isDbConnected = false;
          console.error("✘  MongoDB fallback bağlantı hatası:", fallbackErr.message);
          console.error("   Atlas Dashboard: https://cloud.mongodb.com");
        }
      } else {
        isDbConnected = false;
        console.error("   MONGODB_URI_FALLBACK tanımlı değil. .env dosyasını kontrol edin.");
        console.error("   Atlas Dashboard: https://cloud.mongodb.com");
      }
    } finally {
      dbConnectionPromise = null;
    }
  })();

  return dbConnectionPromise;
}

// İlk bağlantıyı başlat (ama await ETME — serverless'ta middleware bekleyecek)
connectMongoDB();

/* ───────── ensureDbConnected Middleware ───────── */
// Her API isteğinden önce MongoDB bağlantısını garanti eder
async function ensureDbConnected(req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectMongoDB();
    }
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ ok: false, error: "Veritabanı bağlantısı kurulamadı. Lütfen birkaç saniye sonra tekrar deneyin." });
    }
    next();
  } catch (err) {
    console.error("ensureDbConnected hatası:", err.message);
    return res.status(503).json({ ok: false, error: "Veritabanı bağlantısı kurulamadı. Lütfen tekrar deneyin." });
  }
}

mongoose.connection.on("connected", () => { isDbConnected = true; });
mongoose.connection.on("disconnected", () => { isDbConnected = false; });

const letterSchema = new mongoose.Schema({
  trackingId: { type: String, required: true, unique: true },
  status: { type: String, required: true, default: "sent" },
  sentAt: { type: Date, required: true, default: Date.now, expires: '30d' }, // KVKK: 30 gün sonra otomatik sil (TTL)
  readAt: { type: Date, default: null }
});

const Letter = mongoose.model("Letter", letterSchema);

const blocklistSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  blockedAt: { type: Date, default: Date.now }
});

const Blocklist = mongoose.model("Blocklist", blocklistSchema);

function generateTrackingId() {
  return "HB-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

/* ───────── HTML Escape (XSS Koruması) ───────── */
function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ───────── E-posta Header Injection Koruması ───────── */
function sanitizeEmailHeader(str) {
  if (typeof str !== "string") return "";
  // Newline, carriage return, tırnak ve köşeli parantezleri temizle
  return str.replace(/["<>\r\n\\]/g, "").trim();
}

/* ───────── Spotify URL Doğrulama ───────── */
function isValidSpotifyUrl(url) {
  if (!url) return true; // Boş ise sorun yok, opsiyonel alan
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === "open.spotify.com";
  } catch {
    return false;
  }
}

/* ───────── Security ───────── */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
      },
    },
  })
);

app.use(compression()); // Gzip sıkıştırması
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public"), {
  maxAge: "7d",
  immutable: false,
  etag: true,
  lastModified: true
}));

/* ───────── CORS Koruması ───────── */
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://hadibarisalim.com",
    "https://www.hadibarisalim.com"
  ];
  // Geliştirme ortamında localhost'a izin ver
  if (process.env.NODE_ENV !== "production") {
    allowedOrigins.push("http://localhost:" + PORT);
  }
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

/* ───────── Rate Limit Store Definition ───────── */
const rateLimitSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  hits: { type: Number, default: 0 },
  expireAt: { type: Date, required: true, expires: 0 } // TTL index
});
const RateLimitModel = mongoose.model("RateLimit", rateLimitSchema);

class MongooseStore {
  constructor(windowMs, prefix) {
    this.windowMs = windowMs;
    this.prefix = prefix || ""; // Her limiter'ın key'lerini izole et
  }
  init(options) {
    if (options && options.windowMs) {
      this.windowMs = options.windowMs;
    }
  }
  _prefixedKey(key) {
    return this.prefix + key;
  }
  async increment(key) {
    if (mongoose.connection.readyState !== 1) return { totalHits: 1, resetTime: new Date(Date.now() + this.windowMs) };
    try {
      const prefixedKey = this._prefixedKey(key);
      const expireAt = new Date(Date.now() + this.windowMs);
      const doc = await RateLimitModel.findOneAndUpdate(
        { key: prefixedKey },
        { $inc: { hits: 1 }, $setOnInsert: { expireAt: expireAt } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return { totalHits: doc.hits, resetTime: doc.expireAt };
    } catch (err) {
      console.error("RateLimitError:", err);
      return { totalHits: 1, resetTime: new Date(Date.now() + this.windowMs) };
    }
  }
  async decrement(key) {
    if (mongoose.connection.readyState !== 1) return;
    try {
      await RateLimitModel.updateOne({ key: this._prefixedKey(key) }, { $inc: { hits: -1 } });
    } catch (err) {}
  }
  async resetKey(key) {
    if (mongoose.connection.readyState !== 1) return;
    try {
      await RateLimitModel.deleteOne({ key: this._prefixedKey(key) });
    } catch (err) {}
  }
}

let sendLimiter, recipientLimiter, generalApiLimiter;

if (!DENEME_MODU) {
  generalApiLimiter = rateLimit({
    store: new MongooseStore(15 * 60 * 1000, "gen:"),
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // 15 dakikada max 100 istek
    message: { ok: false, error: "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin." },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip
  });

  app.use("/api/", generalApiLimiter);

  sendLimiter = rateLimit({
    store: new MongooseStore(24 * 60 * 60 * 1000, "send:"),
    windowMs: 24 * 60 * 60 * 1000, // 24 saat
    max: 10, // Günde max 10 mail (farklı alıcılara gönderilebilir, spam koruması alıcı bazlı recipientLimiter'da)
    message: { ok: false, error: "Günlük mektup gönderme limitine (10) ulaştınız. Lütfen yarın tekrar deneyin." },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip
  });

  recipientLimiter = rateLimit({
    store: new MongooseStore(24 * 60 * 60 * 1000, "rcpt:"),
    windowMs: 24 * 60 * 60 * 1000, // 24 saat
    max: 3, // Aynı alıcıya günde max 3 mail (spam koruması)
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: true,
    message: {
      ok: false,
      error: "Bu e-posta adresine günlük gönderim limitine ulaşıldı (3/gün). Lütfen yarın tekrar deneyin.",
    },
    keyGenerator: (req) => {
      return req.body.recipientEmail ? req.body.recipientEmail.toLowerCase().trim() : (req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip);
    },
  });
  console.log("🛡  Mail gönderim rate limiter AKTİF (MongoDB - IP: 10/gün, Alıcı: 3/gün)");
} else {
  // Deneme modunda boş middleware
  sendLimiter = (req, res, next) => next();
  recipientLimiter = (req, res, next) => next();
  console.log("⚠  DENEME MODU: Mail gönderim rate limiter KAPALI");
}

/* ───────── SMTP Transporter ───────── */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: false,
  pool: true,          // Bağlantı havuzu: serverless'ta reuse sağlar
  maxConnections: 1,   // Serverless ortamda tek bağlantı yeterli
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 8000,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// NOT: transporter.verify() kaldırıldı — cold start'ta gereksiz gecikme yaratıyordu.
// SMTP hataları zaten sendMail() sırasında yakalanıyor.
console.log("📧  SMTP transporter hazır (verify atlandı — cold start optimizasyonu)");

/* ───────── Message Templates (Multiple per tone) ───────── */
const templates = require("./public/templates.js");

/* ───────── Validation Helpers ───────── */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitize(str, maxLen) {
  if (typeof str !== "string") return "";
  return str.trim().slice(0, maxLen);
}

/* ───────── API: Send Mail ───────── */
/* ───────── API: CSRF Token Endpoint ───────── */
app.get("/api/csrf-token", (req, res) => {
  const token = generateCsrfToken();
  res.cookie("csrf_token", token, {
    maxAge: CSRF_TOKEN_EXPIRY,
    httpOnly: false, // İstemci JavaScript'inin okuyabilmesi için false
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ ok: true, token });
});

app.post("/api/send", ensureDbConnected, sendLimiter, recipientLimiter, async (req, res) => {
  try {
    // CSRF Token doğrulaması (Double Submit Cookie)
    const cookieToken = req.cookies && req.cookies.csrf_token;
    const headerOrBodyToken = req.body._csrf || req.headers["x-csrf-token"];
    
    if (!validateCsrfToken(cookieToken, headerOrBodyToken)) {
      return res.status(403).json({ ok: false, error: "Güvenlik doğrulaması başarısız. Lütfen sayfayı yenileyip tekrar deneyin." });
    }
    
    // Tek kullanımlık olması için doğrulandıktan sonra çerezi temizleyelim
    res.clearCookie("csrf_token");
    const recipientName = sanitize(req.body.recipientName, 100);
    const recipientEmail = sanitize(req.body.recipientEmail, 254);
    const senderName = sanitize(req.body.senderName, 100);
    const tone = sanitize(req.body.tone, 20);
    const mode = sanitize(req.body.mode, 10); // "anonymous" or "named"
    const templateId = req.body.templateId;
    const spotifyLink = sanitize(req.body.spotifyLink, 500);
    const honeypot = req.body.website;

    // ── Hızlı doğrulamalar (DB gerektirmeyen) ──

    // Görünmez Bot Koruması (Honeypot)
    if (honeypot) {
      return res.json({ ok: true, message: "Mektubun başarıyla gönderildi! 💌", trackingId: "HB-BOTTEST" });
    }

    // Validation (DB gerektirmeyen — hızlı red)
    if (!recipientName) {
      return res.status(400).json({ ok: false, error: "Alıcının adı gerekli." });
    }
    if (!recipientEmail || !isValidEmail(recipientEmail)) {
      return res.status(400).json({ ok: false, error: "Geçerli bir e-posta adresi girin." });
    }
    if (!tone || !templates[tone] || templates[tone].length === 0) {
      return res.status(400).json({ ok: false, error: "Geçerli bir ton seçin." });
    }
    if (templateId === undefined || templateId === null || typeof templateId !== "number" || templateId < 0 || templateId >= templates[tone].length) {
      return res.status(400).json({ ok: false, error: "Geçersiz taslak seçimi. Lütfen sayfayı CTRL+F5 ile yenileyerek tekrar deneyin." });
    }
    if (!mode || !["anonymous", "named"].includes(mode)) {
      return res.status(400).json({ ok: false, error: "Gönderim modu seçin." });
    }
    if (!req.body.consentGiven) {
      return res.status(400).json({ ok: false, error: "Lütfen Yasal İzinleri onaylayın." });
    }

    // Spotify link güvenlik doğrulaması
    if (spotifyLink && !isValidSpotifyUrl(spotifyLink)) {
      return res.status(400).json({ ok: false, error: "Geçersiz Spotify linki. Sadece open.spotify.com linkleri kabul edilir." });
    }

    // Toksik İçerik / Küfür Filtresi Kontrolü (Sadece isimler için)
    if (isToxic(senderName) || isToxic(recipientName)) {
      return res.status(400).json({ 
        ok: false, 
        error: "Mesajınız topluluk kurallarımıza (hakaret/nefret söylemi) aykırı içerik barındırdığı için gönderilemedi." 
      });
    }

    // ── DB gerektiren kontroller ──

    // Alıcı Blocklist (Kara Liste) Kontrolü
    const isBlocked = await Blocklist.exists({ email: recipientEmail.toLowerCase() });
    if (isBlocked) {
      return res.status(403).json({
        ok: false,
        error: "Bu e-posta adresi sistemimizden mektup almayı reddetmiştir. Gönderim yapılamaz."
      });
    }

    // Build the message (from server-side template)
    const tpl = templates[tone][templateId];
    const subject = tpl.subject.replace("{isim}", recipientName);
    let body = tpl.body.replace(/\{isim\}/g, recipientName);

    // Add signature for named mode
    if (mode === "named" && senderName) {
      body += "\n\n— " + senderName;
    }

    // Determine sender display name
    const fromName = sanitizeEmailHeader(
      mode === "named" && senderName
        ? senderName
        : process.env.SMTP_FROM_NAME || "Hadi Barışalım"
    );

    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

    // Tracking ID setup
    const trackingId = generateTrackingId();
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const serverUrl = `${protocol}://${req.get("host")}`;

    // Build HTML version
    const htmlBody = buildHtmlEmail(subject, body, mode === "anonymous", spotifyLink, trackingId, serverUrl, recipientEmail);

    // ── DB kayıt (Mail gönderilmeden hemen önce yapıyoruz ki Google Cache Proxy anında sorgularsa bulabilsin) ──
    await Letter.create({
      trackingId: trackingId,
      status: "sent",
      sentAt: new Date(),
      readAt: null
    });

    try {
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: recipientEmail,
        replyTo: mode === "named" && senderName ? undefined : `"No Reply" <noreply@hadibarisalim.com>`,
        subject: subject,
        text: body,
        html: htmlBody,
        messageId: `<${trackingId}@hadibarisalim.com>`,
        headers: {
          "X-Entity-Ref-ID": trackingId
        }
      });
    } catch (mailErr) {
      await Letter.deleteOne({ trackingId: trackingId }).catch(() => {});
      throw mailErr;
    }

    console.log(
      `✉  Mail gönderildi → ${recipientEmail} (${mode}, ${tone}) [ID: ${trackingId}]`
    );

    return res.json({
      ok: true,
      message: "Mektubun başarıyla gönderildi! 💌",
      trackingId: trackingId
    });
  } catch (err) {
    console.error("Mail gönderim hatası:", err);
    return res.status(500).json({
      ok: false,
      error: "Mail gönderilemedi. Lütfen daha sonra tekrar deneyin.",
    });
  }
});

/* ───────── API: Unsubscribe ───────── */
app.get("/api/unsubscribe", ensureDbConnected, async (req, res) => {
  const { email, token } = req.query;
  if (!email || !token) {
    return res.status(400).send("Eksik parametre.");
  }

  if (!process.env.SESSION_SECRET) {
    console.error("CRITICAL: SESSION_SECRET tanımlı değil! Unsubscribe devre dışı.");
    return res.status(503).send("Sistem bakımda. Lütfen daha sonra tekrar deneyin.");
  }
  const hmac = crypto.createHmac("sha256", process.env.SESSION_SECRET);
  const expectedToken = hmac.update(email).digest("hex");

  // Timing-safe karşılaştırma
  let isValid = false;
  try {
    const a = Buffer.from(token, "utf8");
    const b = Buffer.from(expectedToken, "utf8");
    isValid = a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch { isValid = false; }

  if (!isValid) {
    return res.status(403).send("Geçersiz doğrulama bağlantısı.");
  }

  try {
    await Blocklist.updateOne(
      { email: email.toLowerCase() },
      { $set: { email: email.toLowerCase(), blockedAt: Date.now() } },
      { upsert: true }
    );
    res.send(`
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Engellendi — Hadi Barışalım</title>
        <style>
          body { font-family: -apple-system, sans-serif; background: #1E1520; color: #F6EEE1; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; padding: 20px; }
          .card { background: #2A1E2C; padding: 40px; border-radius: 12px; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          h1 { color: #E7C685; margin-top: 0; }
          p { color: #c4b5c7; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>İşlem Başarılı</h1>
          <p><b>${escapeHtml(email)}</b> adresi kara listeye alındı.</p>
          <p>Artık Hadi Barışalım platformu üzerinden size mektup gönderilemeyecek.</p>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error("Unsubscribe error:", err);
    res.status(500).send("Sistem hatası. Lütfen daha sonra tekrar deneyin.");
  }
});

/* ───────── HTML Email Builder ───────── */
function buildHtmlEmail(subject, textBody, isAnonymous, spotifyLink, trackingId, serverUrl, recipientEmail) {
  const paragraphs = textBody
    .split("\n\n")
    .map((p) => escapeHtml(p).replace(/\n/g, "<br>"))
    .map((p) => `<p style="margin:0 0 16px;line-height:1.7;color:#2B211B;">${p}</p>`)
    .join("");

  const safeSpotifyLink = spotifyLink ? escapeHtml(spotifyLink) : "";
  const trackedSpotifyLink = safeSpotifyLink ? `${serverUrl}/api/track/${trackingId}/click?url=${encodeURIComponent(safeSpotifyLink)}` : "";
  
  const spotifyHtml = safeSpotifyLink
    ? `<div style="margin: 32px 0; text-align: center;">
         <a href="${trackedSpotifyLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #C9A15B; color: #1E1520; text-decoration: none; padding: 12px 24px; border-radius: 999px; font-weight: bold; font-family: -apple-system, sans-serif; font-size: 14px;">
           🎵 Bu mektuba eklenen şarkıyı dinle
         </a>
       </div>`
    : "";

  const footerText = isAnonymous 
    ? "Bu mesaj bir kullanıcımız tarafından size anonim olarak iletilmiştir." 
    : "Bu mesaj bir kullanıcımız tarafından size iletilmiştir.";

  // Generate Unsubscribe Link
  const sessionSecret = process.env.SESSION_SECRET;
  let unsubscribeLink = "";
  if (sessionSecret) {
    const hmac = crypto.createHmac("sha256", sessionSecret);
    const unsubscribeToken = hmac.update(recipientEmail).digest("hex");
    unsubscribeLink = `${serverUrl}/api/unsubscribe?email=${encodeURIComponent(recipientEmail)}&token=${unsubscribeToken}`;
  }

  const footer = `
    <p style="margin:24px 0 8px;font-size:13px;color:#8A7A63;font-style:italic;">${footerText}</p>
    <p style="margin:0 0 8px;font-size:11px;color:#8A7A63;opacity:0.8;">
      Eğer bu mesajı yanlışlıkla aldığınızı düşünüyorsanız veya bir daha e-posta almak istemiyorsanız, <a href="${unsubscribeLink}" style="color:#C9A15B;text-decoration:underline;">buraya tıklayarak engelleyebilirsiniz</a>.
    </p>`;

  const trackingPixel = `<img src="${serverUrl}/api/track/${trackingId}/pixel.gif" width="1" height="1" border="0" style="display:block; border:none; outline:none; text-decoration:none;" alt="" />`;

  return `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#1E1520;font-family:'Georgia',serif;">
  <div style="max-width:580px;margin:40px auto;background:#F6EEE1;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.4);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1E1520,#2A1E2C);padding:32px 40px;text-align:center;">
      <h1 style="margin:0;font-family:'Georgia',serif;font-size:24px;color:#E7C685;font-weight:normal;font-style:italic;">
        Hadi <em>Barış</em><span style="color:#C9A15B;">alım</span>
      </h1>
      <div style="width:80px;height:2px;background:linear-gradient(90deg,transparent,#C9A15B,transparent);margin:16px auto 0;"></div>
    </div>
    <!-- Body -->
    <div style="padding:40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:16px;">
      ${paragraphs}
      ${spotifyHtml}
    </div>
    <!-- Footer -->
    <div style="padding:0 40px 32px;text-align:center;">
      <div style="height:1px;background:linear-gradient(90deg,transparent,#D9C8AA,transparent);margin-bottom:20px;"></div>
      ${footer}
    </div>
  </div>
  ${trackingPixel}
</body>
</html>`;
}

/* ───────── Tracking Helper ───────── */
// Eski kodlar 4 karakterliydi (HB-XXXX), yeniler 8 karakterli (HB-XXXXXXXX). İkisini de destekle:
const trackingIdRegex = /^HB-([A-F0-9]{4}|[A-F0-9]{8})$/i;

/* ───────── API: Tracking Pixel ───────── */
app.get("/api/track/:id/pixel.gif", ensureDbConnected, async (req, res) => {
  const id = req.params.id;
  const userAgent = (req.headers["user-agent"] || "").toLowerCase();
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  // 1x1 transparent GIF Buffer
  const pixel = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );

  // Daha sıkı cache önleme başlıkları (özellikle proxy'ler için)
  res.writeHead(200, {
    "Content-Type": "image/gif",
    "Content-Length": pixel.length,
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
    "Pragma": "no-cache",
    "Expires": "0",
  });

  // Regex doğrulama ile geçersiz formatlar DB'yi yormaz
  if (!trackingIdRegex.test(id)) {
    return res.end(pixel);
  }

  try {
    const letter = await Letter.findOne({ trackingId: id });
    if (letter) {
      const isBot = /bot|spider|crawl|scan|virus|barracuda|mimecast|proofpoint|appengine/i.test(userAgent);
      const timeDiffMs = Date.now() - new Date(letter.sentAt).getTime();
      
      console.log(`[PIXEL HIT] ID: ${id} | TimeDiff: ${timeDiffMs}ms | IP: ${ip} | UA: ${userAgent}`);

      if (letter.status !== "read") {
        // Not: Google Image Proxy ve Apple Mail gibi servisler maili alır almaz
        // resmi pre-fetch (önbellekleme) yaparlar. Cache'lendiğinde gerçek okumayı
        // asla göremeyeceğimiz için bu ilk vuruşu "Okundu (Teslim Edildi/Tasarlandı)"
        // olarak kabul ediyoruz. isBot ve zaman kısıtlamalarını kaldırdık.
        letter.status = "read";
        letter.readAt = new Date();
        await letter.save();
        console.log(`👁  Mektup okundu/önbelleklendi (Pixel) [ID: ${id}]`);
      }
    }
  } catch (err) {
    console.error("Tracking pixel DB hatası:", err);
  }

  res.end(pixel);
});

/* ───────── API: Tracking Click (Spotify vb. linklere tıklanınca da okundu say) ───────── */
/* Güvenlik: Sadece güvenilir domainlere yönlendirme — Open Redirect engellendi */
const ALLOWED_REDIRECT_DOMAINS = ["open.spotify.com"];

app.get("/api/track/:id/click", ensureDbConnected, async (req, res) => {
  const id = req.params.id;
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).send("Yönlendirme linki eksik.");
  }

  // Open Redirect koruması: Sadece izin verilen domainlere yönlendir
  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== "https:" || !ALLOWED_REDIRECT_DOMAINS.includes(parsed.hostname)) {
      return res.status(403).send("Bu bağlantıya yönlendirme yapılamaz.");
    }
  } catch {
    return res.status(400).send("Geçersiz bağlantı.");
  }

  if (trackingIdRegex.test(id)) {
    try {
      const letter = await Letter.findOne({ trackingId: id });
      if (letter && letter.status !== "read") {
        letter.status = "read";
        letter.readAt = new Date();
        await letter.save();
        console.log(`🖱  Mektup okundu (Link Tıklaması) [ID: ${id}]`);
      }
    } catch (err) {
      console.error("Tracking click DB hatası:", err);
    }
  }

  res.redirect(targetUrl);
});

/* ───────── API: Check Status ───────── */
app.get("/api/track/:id", ensureDbConnected, async (req, res) => {
  try {
    const id = req.params.id;

    // Regex doğrulama
    if (!trackingIdRegex.test(id)) {
      return res.status(404).json({ ok: false, error: "Mektup bulunamadı." });
    }

    const letter = await Letter.findOne({ trackingId: id });

    if (!letter) {
      return res.status(404).json({ ok: false, error: "Mektup bulunamadı." });
    }

    // Sadece gerekli alanları döndür (hassas veri filtreleme)
    res.json({
      ok: true,
      data: {
        trackingId: letter.trackingId,
        status: letter.status,
        sentAt: letter.sentAt,
        readAt: letter.readAt
      }
    });
  } catch (err) {
    console.error("Tracking API hatası:", err);
    res.status(500).json({ ok: false, error: "Sunucu hatası" });
  }
});

/* ───────── API: Health Check ───────── */
/* Güvenlik: Production'da iç detaylar gizlenir */
app.get("/api/health", (_req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.json({ ok: isDbConnected });
  }
  // Development'ta detaylı bilgi
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    db: isDbConnected ? "connected" : "disconnected",
    mode: DENEME_MODU ? "test" : "production"
  });
});

/* ───────── API: Migrate Legacy Data (Secret Key ile korumalı) ───────── */
app.get("/api/migrate", ensureDbConnected, async (req, res) => {
  // Güvenlik: Sadece .env'de tanımlı secret key ile çalışır — hardcoded fallback YOK
  const secret = req.query.key || req.headers["x-migrate-key"];
  if (!process.env.MIGRATE_SECRET) {
    return res.status(503).json({ ok: false, error: "Migration devre dışı. MIGRATE_SECRET tanımlı değil." });
  }
  if (!secret || secret !== process.env.MIGRATE_SECRET) {
    return res.status(403).json({ ok: false, error: "Yetkisiz erişim." });
  }

  try {
    const fs = require('fs');
    const dataPath = path.join(__dirname, 'data', 'letters.json');
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      let count = 0;
      for (const [id, info] of Object.entries(data)) {
        await Letter.updateOne(
          { trackingId: id },
          { $set: { status: info.status, sentAt: info.sentAt, readAt: info.readAt } },
          { upsert: true }
        );
        count++;
      }
      return res.json({ ok: true, message: `${count} legacy letters migrated to MongoDB!` });
    }
    return res.json({ ok: false, message: "No legacy data found." });
  } catch (err) {
    console.error("Migration hatası:", err);
    res.status(500).json({ ok: false, error: "Migration sırasında hata oluştu." });
  }
});

/* ───────── 404 Handler ───────── */
app.use((req, res) => {
  // API rotaları için JSON 404
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ ok: false, error: "Endpoint bulunamadı." });
  }
  // Diğer rotalar için 404 sayfası
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"), (err) => {
    if (err) {
      res.status(404).send("Sayfa bulunamadı.");
    }
  });
});

/* ───────── Start ───────── */
let server;
// Vercel ortamı değilse sunucuyu başlat (Vercel serverless için export gerekli)
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  server = app.listen(PORT, () => {
    console.log(`\n🕊  Hadi Barışalım sunucusu çalışıyor → http://localhost:${PORT}\n`);
  });
}

module.exports = app;

/* ───────── Graceful Shutdown ───────── */
function gracefulShutdown(signal) {
  console.log(`\n${signal} sinyali alındı. Sunucu kapatılıyor...`);
  
  const closeServer = () => new Promise((resolve) => {
    if (server) {
      server.close(() => {
        console.log("HTTP sunucusu kapatıldı.");
        resolve();
      });
    } else {
      resolve();
    }
  });

  const closeDb = () => new Promise((resolve) => {
    if (mongoose.connection.readyState !== 0) {
      mongoose.connection.close(false).then(() => {
        console.log("MongoDB bağlantısı kapatıldı.");
        resolve();
      }).catch(err => {
        console.error("MongoDB kapatılırken hata oluştu:", err);
        resolve();
      });
    } else {
      resolve();
    }
  });

  Promise.all([closeServer(), closeDb()]).then(() => {
    console.log("Zarif kapanış tamamlandı. Çıkış yapılıyor.");
    process.exit(0);
  });
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Vercel Serverless Functions için app'i dışa aktarıyoruz
module.exports = app;
