require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

/* ───────── Database Setup (MongoDB) ───────── */
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/hadibarisalim")
  .then(() => console.log("✔  MongoDB bağlantısı başarılı"))
  .catch(err => console.error("✘  MongoDB bağlantı hatası:", err.message));

const letterSchema = new mongoose.Schema({
  trackingId: { type: String, required: true, unique: true },
  status: { type: String, required: true, default: "sent" },
  sentAt: { type: Date, required: true, default: Date.now },
  readAt: { type: Date, default: null }
});

const Letter = mongoose.model("Letter", letterSchema);

function generateTrackingId() {
  return "HB-" + crypto.randomBytes(2).toString("hex").toUpperCase();
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

app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "public")));

/* ───────── Rate Limiting: 3 mails per day per IP ───────── */
const sendLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: "Günlük gönderim limitinize ulaştınız (3/gün). Yarın tekrar deneyebilirsiniz.",
  },
  keyGenerator: (req) => {
    return req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip;
  },
});

/* ───────── SMTP Transporter ───────── */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP on startup
transporter.verify().then(() => {
  console.log("✔  SMTP bağlantısı başarılı");
}).catch((err) => {
  console.error("✘  SMTP bağlantı hatası:", err.message);
  console.error("   .env dosyasındaki SMTP ayarlarını kontrol edin.");
});

/* ───────── Message Templates (Multiple per tone) ───────── */
const templates = {
  duygusal: [
    {
      subject: "Sana içimden geldiği gibi yazıyorum, {isim}",
      body:
        "Sevgili {isim},\n\n" +
        "Bu satırları yazarken elimin biraz titrediğini itiraf etmeliyim. Aramızdaki bu sessizliğin içinde bile seni düşünmeden geçen bir gün olmadı. Birlikte güldüğümüz anları, en sıradan günleri bile özel kılan o hâli çok özledim.\n\n" +
        "Belki bazı şeyleri doğru söyleyemedim, belki bazı anları kaçırdım. Ama şunu bilmeni isterim: sana duyduğum sevgi hâlâ burada, tam da bıraktığımız yerde duruyor.\n\n" +
        "Sadece konuşabilir miyiz? Karşılıklı, sakince, kalbimizi ortaya koyarak. Cevabın ne olursa olsun, bunu sana söylemem gerekiyordu.\n\n" +
        "Seni düşünüyorum.",
    },
    {
      subject: "Bazı şeyler söylenmeden kalmamalı, {isim}",
      body:
        "Canım {isim},\n\n" +
        "Bu mesajı kaç kere yazmaya başlayıp sildiğimi bilsen… Ama artık içimde tutamıyorum. Seninle geçirdiğimiz her an, her kahkaha, her sessizlik bile benim için anlam taşıyordu.\n\n" +
        "Şu an aramızda ne varsa — kırgınlık mı, yanlış anlama mı, bıkkınlık mı — bunların hiçbiri sana olan sevgimi silmeye yetmedi. Ve sanırım hiçbir zaman yetemeyecek.\n\n" +
        "Senden tek istediğim bir şans daha değil; sadece bir konuşma. Yüz yüze, gözlerinin içine bakarak, kalbimdekileri anlatmak istiyorum.\n\n" +
        "Ne olursa olsun, sen benim için hep özel kalacaksın.",
    },
    {
      subject: "Gece yine seni düşündüm, {isim}",
      body:
        "{isim},\n\n" +
        "Gecenin bu saatinde yine aklıma geldin. Aslında gitmiyorsun ki aklımdan — hep oradasın. Birlikte yürüdüğümüz yolları, paylaştığımız bakışları, yarıda kalan cümlelerimizi düşünüyorum.\n\n" +
        "İkimiz de mükemmel değildik. Belki de mükemmel olmaya çalışırken birbirimizi kaybettik. Ama sana şunu söyleyebilirim: hâlâ seninle aynı gökyüzüne baktığımda içim sızlıyor.\n\n" +
        "Bu mektubu sana uzatılmış bir el olarak düşün. Tutmak senin elinde.\n\n" +
        "Hâlâ buradayım.",
    },
  ],
  sitemkar: [
    {
      subject: "İçimde kalanları sana anlatmam lazım, {isim}",
      body:
        "{isim},\n\n" +
        "Bunu yazmak kolay olmadı, çünkü içimde hâlâ küçük bir sitem var. Bazı şeyleri konuşmadan bitirdik, bazı cümleler yarım kaldı. Sen gittikten sonra ben o yarım cümlelerle baş başa kaldım.\n\n" +
        "Kırgınım, evet. Ama bu kırgınlığın altında hâlâ seni önemsediğim gerçeği duruyor. Keşke o son günlerde ikimiz de biraz daha sabırlı olabilseydik.\n\n" +
        "Bunu bir suçlama olarak değil, içimi dökme ihtiyacı olarak oku. Belki hâlâ konuşacak şeylerimiz vardır.",
    },
    {
      subject: "Bunu sana söylemem gerekiyordu, {isim}",
      body:
        "{isim},\n\n" +
        "Uzun zamandır içimde biriktirdiğim şeyler var ve artık taşıyamıyorum. Beni tanıyorsun — kolay kolay sitem etmem, ama bu sefer farklı.\n\n" +
        "Senin için orada olduğum zamanlarda, benim için orada olmadığını hissettim. Belki farkında değildin, belki farklı bir dönemindeydin. Ama o boşluk bende derin bir iz bıraktı.\n\n" +
        "Yine de sana kızgın değilim — daha çok üzgünüm. Çünkü seninle olan ilişkimiz benim için gerçekten değerliydi. Hâlâ değerli.\n\n" +
        "Bu satırları okuduktan sonra ne hissedeceğini bilemiyorum. Ama en azından bilmeni istedim.",
    },
    {
      subject: "Bir şeyleri konuşmadan bırakmak istemiyorum, {isim}",
      body:
        "{isim},\n\n" +
        "Biliyorum, belki bu mesajı beklemiyordun. Ama suskunluğumun arkasında \"her şey yolunda\" olmadığını anlamanı istiyorum.\n\n" +
        "Seninle paylaştığımız güzel anların gölgesinde, beni inciten küçük ama biriken şeyler de vardı. Her seferinde \"geçer\" dedim, ama geçmedi. Biriktirdim ve sonunda aramıza mesafe koydum.\n\n" +
        "Seni kaybetmek istemezdim, ama kendimi de kaybetmek istemiyordum. Belki şimdi, biraz zaman geçtikten sonra, ikimiz de daha net görebiliriz.\n\n" +
        "Konuşmak istersen, kapım açık.",
    },
  ],
  uzlasmaci: [
    {
      subject: "Bir adım atmak istiyorum, {isim}",
      body:
        "Merhaba {isim},\n\n" +
        "Aramızda olanları uzun zamandır düşünüyorum ve kendi payıma düşen hataları artık daha net görebiliyorum. Seni suçlamak için değil, gerçekten bir şeyleri düzeltmek için yazıyorum.\n\n" +
        "İkimiz de o süreci farklı yaşamış olabiliriz ama ben, geride bıraktığımız şeyin bir konuşmayı hak ettiğini düşünüyorum. İstersen kısa bir kahve molası, istersen sadece birkaç dakikalık bir telefon görüşmesi — sana nasıl uygunsa.\n\n" +
        "Hazır olduğunda ben buradayım.",
    },
    {
      subject: "Barışmak için geç değil diye düşünüyorum, {isim}",
      body:
        "Merhaba {isim},\n\n" +
        "Bu mesajı yazmak için çok düşündüm, çünkü doğru kelimeleri bulmak istedim. Aramızdaki sorun ne olursa olsun, ikimizin de iyi niyetli olduğuna inanıyorum.\n\n" +
        "Kendi hatalarımı görüyorum ve bunlarla yüzleşmeye hazırım. Senden tek beklentim bir fırsat — oturup sakin sakin konuşma fırsatı. Suçlama yok, yargılama yok, sadece dürüstlük.\n\n" +
        "Eğer sen de hazırsan, bir çay/kahve içelim mi? Zamanlama ve yer tamamen sana kalmış.\n\n" +
        "İyi dileklerimle.",
    },
    {
      subject: "Seninle konuşmak istiyorum, {isim}",
      body:
        "Selam {isim},\n\n" +
        "Bir süredir aramızdaki bu sessizliği düşünüyorum. İkimiz de belki inatlaştık, belki gururumuza yenildik. Ama sonuçta ikimiz de bundan mutlu değiliz — en azından ben değilim.\n\n" +
        "Sorumluluk almaktan kaçınmıyorum. Nerede hata yaptıysam kabul ediyorum. Ve senden de aynısını istemiyorum bile — sadece konuşabilmemizi istiyorum.\n\n" +
        "Hayat kısa, güzel insanlarla küs kalmak için çok kısa. Ne dersin, bir adım atalım mı?\n\n" +
        "Seni düşünüyorum.",
    },
  ],
};

/* ───────── Random Template Picker ───────── */
function pickTemplate(tone) {
  const variants = templates[tone];
  if (!variants || variants.length === 0) return null;
  return variants[Math.floor(Math.random() * variants.length)];
}

/* ───────── Validation Helpers ───────── */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitize(str, maxLen) {
  if (typeof str !== "string") return "";
  return str.trim().slice(0, maxLen);
}

/* ───────── API: Send Mail ───────── */
app.post("/api/send", sendLimiter, async (req, res) => {
  try {
    const recipientName = sanitize(req.body.recipientName, 100);
    const recipientEmail = sanitize(req.body.recipientEmail, 254);
    const senderName = sanitize(req.body.senderName, 100);
    const tone = sanitize(req.body.tone, 20);
    const mode = sanitize(req.body.mode, 10); // "anonymous" or "named"
    const customSubject = sanitize(req.body.subject, 200);
    const customBody = sanitize(req.body.body, 5000);
    const spotifyLink = sanitize(req.body.spotifyLink, 500);

    // Validation
    if (!recipientName) {
      return res.status(400).json({ ok: false, error: "Alıcının adı gerekli." });
    }
    if (!recipientEmail || !isValidEmail(recipientEmail)) {
      return res.status(400).json({ ok: false, error: "Geçerli bir e-posta adresi girin." });
    }
    if (!tone || !templates[tone] || templates[tone].length === 0) {
      return res.status(400).json({ ok: false, error: "Geçerli bir ton seçin." });
    }
    if (!mode || !["anonymous", "named"].includes(mode)) {
      return res.status(400).json({ ok: false, error: "Gönderim modu seçin." });
    }

    // Build the message (pick random template variant)
    const tpl = pickTemplate(tone);
    const subject = customSubject || tpl.subject.replace("{isim}", recipientName);
    let body = customBody || tpl.body.replace(/\{isim\}/g, recipientName);

    // Add signature for named mode
    if (mode === "named" && senderName) {
      body += "\n\n— " + senderName;
    }

    // Determine sender display name
    const fromName = mode === "named" && senderName
      ? senderName
      : process.env.SMTP_FROM_NAME || "Hadi Barışalım";

    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

    // Tracking ID setup
    const trackingId = generateTrackingId();
    const serverUrl = req.protocol + "://" + req.get("host");

    // Build HTML version
    const htmlBody = buildHtmlEmail(subject, body, mode === "anonymous", spotifyLink, trackingId, serverUrl);

    // Save tracking data to MongoDB FIRST
    // Bu sayede veritabanı bağlantısı kopuksa boşuna mail atılmaz.
    await Letter.create({
      trackingId: trackingId,
      status: "sent",
      sentAt: new Date(),
      readAt: null
    });

    try {
      // Send mail
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: recipientEmail,
        subject: subject,
        text: body, // plain text doesn't have spotify button or pixel
        html: htmlBody,
      });
    } catch (mailErr) {
      // Mail gitmezse veritabanındaki kaydı silelim ki tutarsızlık olmasın
      await Letter.deleteOne({ trackingId: trackingId }).catch(() => {});
      throw mailErr; // Dışarıdaki ana catch bloğuna fırlatalım
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

/* ───────── HTML Email Builder ───────── */
function buildHtmlEmail(subject, textBody, isAnonymous, spotifyLink, trackingId, serverUrl) {
  const paragraphs = textBody
    .split("\n\n")
    .map((p) => p.replace(/\n/g, "<br>"))
    .map((p) => `<p style="margin:0 0 16px;line-height:1.7;color:#2B211B;">${p}</p>`)
    .join("");

  const spotifyHtml = spotifyLink
    ? `<div style="margin: 32px 0; text-align: center;">
         <a href="${spotifyLink}" target="_blank" style="display: inline-block; background: #C9A15B; color: #1E1520; text-decoration: none; padding: 12px 24px; border-radius: 999px; font-weight: bold; font-family: -apple-system, sans-serif; font-size: 14px;">
           🎵 Bu mektuba eklenen şarkıyı dinle
         </a>
       </div>`
    : "";

  const footer = isAnonymous
    ? `<p style="margin:24px 0 0;font-size:13px;color:#8A7A63;font-style:italic;">Bu mektup, hadibarisalim.com üzerinden anonim olarak gönderilmiştir.</p>`
    : `<p style="margin:24px 0 0;font-size:13px;color:#8A7A63;font-style:italic;">Bu mektup, hadibarisalim.com üzerinden gönderilmiştir.</p>`;

  const trackingPixel = `<img src="${serverUrl}/api/track/${trackingId}/pixel.gif" width="1" height="1" alt="" style="display:none;" />`;

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

/* ───────── API: Tracking Pixel ───────── */
app.get("/api/track/:id/pixel.gif", async (req, res) => {
  const id = req.params.id;

  try {
    const letter = await Letter.findOne({ trackingId: id });
    if (letter && letter.status !== "read") {
      letter.status = "read";
      letter.readAt = new Date();
      await letter.save();
      console.log(`👁  Mektup okundu [ID: ${id}]`);
    }
  } catch (err) {
    console.error("Tracking pixel DB hatası:", err);
  }

  // 1x1 transparent GIF
  const pixel = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );
  res.writeHead(200, {
    "Content-Type": "image/gif",
    "Content-Length": pixel.length,
    "Cache-Control": "no-store, no-cache, must-revalidate, private",
  });
  res.end(pixel);
});

/* ───────── API: Check Status ───────── */
app.get("/api/track/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const letter = await Letter.findOne({ trackingId: id });

    if (!letter) {
      return res.status(404).json({ ok: false, error: "Mektup bulunamadı." });
    }

    res.json({ ok: true, data: letter });
  } catch (err) {
    console.error("Tracking API hatası:", err);
    res.status(500).json({ ok: false, error: "Sunucu hatası" });
  }
});

/* ───────── API: Health Check ───────── */
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

/* ───────── Start ───────── */
app.listen(PORT, () => {
  console.log(`\n🕊  Hadi Barışalım sunucusu çalışıyor → http://localhost:${PORT}\n`);
});
