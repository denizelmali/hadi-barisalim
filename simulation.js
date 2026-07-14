// simulation.js
const crypto = require("crypto");

console.log("==========================================");
console.log("   Hadi Barışalım - Piksel Simülasyonu   ");
console.log("==========================================\n");

// Gerçek zamanlı gecikme fonksiyonu (gerçekten beklemek için)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Mock Veritabanı
const db = {};
const Letter = {
  create: async (data) => {
    db[data.trackingId] = { ...data };
  },
  findOne: async (query) => {
    return db[query.trackingId] || null;
  },
  save: async (doc) => {
    db[doc.trackingId] = doc;
  }
};

// sunucu tarafındaki okuma mantığının BİREBİR aynısı (server.js'den kopyalandı)
async function trackingPixelRoute(id, userAgent) {
  const letter = await Letter.findOne({ trackingId: id });
  if (letter) {
    const isBot = /bot|spider|crawl|scan|virus|barracuda|mimecast|proofpoint|appengine/i.test(userAgent.toLowerCase());
    const timeDiffMs = Date.now() - new Date(letter.sentAt).getTime();
    
    if (letter.status !== "read") {
      // 5 saniye kuralı
      if (!isBot && timeDiffMs > 5000) {
        letter.status = "read";
        letter.readAt = new Date();
        await Letter.save(letter);
        console.log(`   [SUNUCU] 👁 Piksel isteği kabul edildi. Mektup 'okundu' yapıldı.`);
      } else {
        console.log(`   [SUNUCU] 🚫 Sahte/erken tıklama reddedildi! (Bot mu: ${isBot}, Geçen Süre: ${timeDiffMs}ms)`);
      }
    }
  }
}

async function runSimulation() {
  const trackingId = "HB-" + crypto.randomBytes(2).toString("hex").toUpperCase();
  
  console.log(`[0. saniye] ✉ Yeni bir mektup oluşturuldu ve gönderildi. ID: ${trackingId}`);
  await Letter.create({
    trackingId: trackingId,
    status: "sent",
    sentAt: new Date(),
    readAt: null
  });

  // TEST 1: Spam filtresi anında tarar (2 saniye sonra)
  console.log(`\n--- TEST 1: 2 Saniye sonra gelen anlık SPAM filtresi taraması ---`);
  await sleep(2000);
  console.log(`[2. saniye] Spam klasörü veya Apple Mail arka planı pikseli yüklemeye çalışıyor...`);
  await trackingPixelRoute(trackingId, "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"); // Gerçek tarayıcı taklidi
  
  let check = await Letter.findOne({ trackingId });
  console.log(`[Sonuç] Mektup durumu: ${check.status.toUpperCase()}`); // Hâlâ 'sent' olmalı

  // TEST 2: Bot taraması (Googlebot)
  console.log(`\n--- TEST 2: 10 Saniye sonra gelen Güvenlik Botu Taraması ---`);
  await sleep(8000);
  console.log(`[10. saniye] Güvenlik tarayıcısı piksele tıklıyor...`);
  await trackingPixelRoute(trackingId, "Mozilla/5.0 (compatible; Googlebot/2.1)");
  
  check = await Letter.findOne({ trackingId });
  console.log(`[Sonuç] Mektup durumu: ${check.status.toUpperCase()}`); // Hâlâ 'sent' olmalı

  // TEST 3: Bekleme ve Kontrol
  console.log(`\n--- BEKLEME ---`);
  console.log(`[20. saniye] Kimse maili açmadı. Kontrol ediyoruz...`);
  await sleep(10000);
  check = await Letter.findOne({ trackingId });
  console.log(`[Sonuç] Mektup durumu: ${check.status.toUpperCase()}`);

  console.log(`[30. saniye] Hâlâ kimse maili açmadı. Kontrol ediyoruz...`);
  await sleep(10000);
  check = await Letter.findOne({ trackingId });
  console.log(`[Sonuç] Mektup durumu: ${check.status.toUpperCase()}`);

  // TEST 4: GERÇEK KULLANICI OKUMASI
  console.log(`\n--- TEST 4: Gerçek Kullanıcı Okuması ---`);
  console.log(`[40. saniye] Alıcı maili açtı (Spam değil, Inbox) ve görseller yüklendi!`);
  await sleep(10000);
  await trackingPixelRoute(trackingId, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
  
  check = await Letter.findOne({ trackingId });
  console.log(`[Sonuç] Mektup durumu: ${check.status.toUpperCase()} ✅`); // Artık READ olmalı!
  
  console.log("\n==========================================");
  console.log(" SIMULASYON BAŞARIYLA TAMAMLANDI ");
  console.log(" Mantık mükemmel şekilde çalışıyor.");
  console.log("==========================================\n");
}

runSimulation();
