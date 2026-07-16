/**
 * Gelişmiş Yerel Türkçe Küfür & Hakaret Filtresi (AI-Free)
 */

// Kara liste (En yaygın ve sert Türkçe küfür / hakaret sözcükleri)
// Not: Sistem normalizasyon yaptığı için 'ş', 'ı' gibi harfleri 's', 'i' olarak ekliyoruz.
const BAD_WORDS = [
  "amk", "aq", "amq", "siktir", "sik", "sikerim", "siki", "sikik", "sikis", "sokus", 
  "orospu", "oc", "o.c", "pic", "pezevenk", "gavat", "yarrak", "yarak", "yaram", "yarram",
  "amcik", "am", "got", "gotveren", "gotunu", "gotveren", "kahpe", "ibne", "yavsak", 
  "kaltak", "surtuk", "fayise", "fuhus", "pic", "yavsak", "gavat", "kancik",
  "bok", "serefsiz", "haysiyetsiz", "orospucocugu", "ananizi", "anani",
  "salak", "aptal", "gerizekali", "ahmak", "kopek", "domuz", 
  "geber", "gebersin", "olum", "olursun"
];

// Yanlış pozitif vermesi muhtemel çok kısa kelimeleri doğrudan boşluksuz regex ile aramamak için
// İstisnalar (Örn: "am" kelimesi "ama", "zaman" gibi kelimelerde geçer. Bunu regex'te kelime sınırı ile arayacağız)
const EXACT_MATCH_WORDS = ["am", "got", "bok", "oc", "aq"]; 

/**
 * Karakter normalizasyonu (1 -> i, @ -> a, ş -> s vb.)
 */
function normalizeText(text) {
  let normalized = text.toLowerCase();
  
  // Leetspeak ve benzer karakter dönüşümleri
  const charMap = {
    'ş': 's', 'ç': 'c', 'ı': 'i', 'ğ': 'g', 'ö': 'o', 'ü': 'u',
    '@': 'a', '1': 'i', '0': 'o', '3': 'e', '4': 'a', '5': 's', '$': 's'
  };

  for (const [key, value] of Object.entries(charMap)) {
    normalized = normalized.split(key).join(value);
  }
  return normalized;
}

/**
 * Bir kelime için aralara boşluk/noktalama serpiştirilmiş halini yakalayacak Regex üretir
 * Örn: "sik" -> /s[\W_]*i[\W_]*k/i
 */
function createFuzzyRegex(word, isExact) {
  const letters = word.split('');
  const pattern = letters.join('[\\W_]*');
  
  // Eğer kelime kısaysa (am, got) kelime sınırları (\b veya boşluk) ekleyelim ki 
  // "zaman" (z-am-an) veya "sigorta" kelimesini yakalamasın.
  if (isExact || word.length <= 3) {
    return new RegExp(`(?:^|\\s)[\\W_]*${pattern}[\\W_]*(?:$|\\s)`, 'i');
  }
  
  return new RegExp(pattern, 'i');
}

/**
 * Metin toksik (küfür/hakaret) içeriyor mu?
 * @param {string} text - Kontrol edilecek metin
 * @returns {boolean} - Toksik ise true döner
 */
function isToxic(text) {
  if (!text) return false;

  const normalized = normalizeText(text);

  for (const word of BAD_WORDS) {
    const isExact = EXACT_MATCH_WORDS.includes(word);
    const regex = createFuzzyRegex(word, isExact);
    
    if (regex.test(normalized)) {
      // console.log(`Toksik tespit edildi. Eşleşen kural: ${word}`);
      return true;
    }
  }

  // Özel durum: Aradaki tüm boşlukları ve işaretleri silip birleşik kelime arama 
  // (Örn: "o r o s p u" veya "s i k t i r")
  const squashed = normalized.replace(/[\W_]+/g, '');
  for (const word of BAD_WORDS) {
    if (word.length > 3 && squashed.includes(word)) {
      // Çok kısa kelimeleri (am, oc) squashed'de aramıyoruz ki "anLAMiyorum" gibi kelimeler yakalanmasın.
      // console.log(`Toksik tespit edildi (Squashed). Eşleşen kural: ${word}`);
      return true;
    }
  }

  return false;
}

module.exports = { isToxic, normalizeText };
