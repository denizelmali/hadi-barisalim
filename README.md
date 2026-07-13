# Hadi Barışalım

Alıcının adına ve seçtiğin tona göre hazır bir barışma mektubu oluşturan, tek sayfalık statik bir site. Kurulumu yok, sunucusu yok — üç dosya: `index.html`, `style.css`, `script.js`.

## Neden backend / otomatik gönderim yok?

`terkokuyorsun.com`'daki mekanizma, alıcının bilgilerini alıp mesajı **anonim olarak ve sunucu üzerinden otomatik** gönderiyor. Barışma mektubu için bu kısmı bilinçli olarak değiştirdim: bu site mesajı kendi sunucusundan göndermek yerine, `mailto:` linkiyle senin **kendi mail uygulamanı** (Gmail, Outlook, Mail…) açıp mektubu oraya dolduruyor — gönder tuşuna sen basıyorsun, kendi hesabından.

Bunun birkaç pratik faydası var:

- **Spam'e düşme riski neredeyse sıfır.** Spam filtreleri toplu/otomatik gönderilen mailleri hedef alır; bu mektup senin kişisel hesabından, tek seferde gidiyor.
- **Kurulum derdi yok.** SMTP, API anahtarı, gönderici domain doğrulama (SPF/DKIM/DMARC) gerekmiyor.
- **Tamamen stabil.** Çökebilecek bir backend yok; sadece statik HTML/CSS/JS.
- **Daha ikna edici.** Bilinmeyen bir adresten gelen bir "barışalım" maili muhtemelen spam/oltalama zannedilir ya da hiç açılmaz. Alıcı, gerçekten kimden geldiğini gördüğünde mektuba çok daha fazla değer verir.
- **Ücretsiz barındırılabilir.**

Hiçbir mesaj sunucuya gitmiyor, hiçbir yerde saklanmıyor — form verisi tarayıcıdan hiç çıkmıyor.

## Yayınlama

1. Bu klasörü ([Netlify Drop](https://app.netlify.com/drop)) sayfasına sürükle bırak yap; saniyeler içinde canlıya alır.
   - Alternatif: klasörü bir GitHub reposuna push edip GitHub Pages ya da Vercel ile bağla.
2. Domainini satın aldıktan sonra barındırma servisinin "Custom domain / Add domain" ayarından bağla ve kayıtçı panelinden DNS'i yönlendir (genelde birkaç saat içinde yayılır).

## Domain fiyatları (Temmuz 2026 araştırması)

Öne çıkan nokta: ilk yıl kampanya fiyatına değil, **yenileme fiyatına** bak — asıl maliyet orada.

| Kayıtçı | İlk yıl (.com) | Yenileme (yıllık) | Not |
|---|---|---|---|
| **Porkbun** | ~$10–11 | ~$11 (neredeyse sabit) | Promosyon kodu gerekmiyor, ücretsiz WHOIS gizliliği, sürpriz zam yok |
| Spaceship (Namecheap'in yan markası) | ~$3–9 (kampanyalı) | ~$10 | En düşük ilk yıl fiyatlarından biri, 5 yıllık toplamda en ucuzlardan |
| Cloudflare Registrar | ~$10 | ~$10 (maliyetine satar) | Kâr marjı eklemiyor; teknik kullanıcılar için sade |
| Namecheap | ~$6–7 (kampanyalı) | ~$15–19 | İlk yıl ucuz görünür, yenilemede fark büyür |
| GoDaddy | ~$5 (kampanyalı) | ~$23 | 4 seçenek içinde en pahalısı |
| Natro / Turhost / İsimtescil (TR) | ~550–900 TL | ~500–800 TL | TL ile ödeme, Türkçe destek; .com.tr biraz daha pahalı (~900–1100 TL ilk yıl) |

**Önerim:** Kredi/banka kartınla uluslararası ödeme yapabiliyorsan **Porkbun** — fiyatı sabit, sürprizsiz, "hadibarisalim.com" gibi bir isim için yıllık ~$11 civarı. TL ile ödemeyi ve Türkçe destek almayı tercih ediyorsan **Natro** ya da **İsimtescil** makul bir alternatif; sadece kampanya bittikten sonraki yenileme fiyatına bakmayı unutma.

Domainin müsait olup olmadığını kayıtçının kendi arama kutusundan kontrol etmen gerekiyor — örn. `hadibarisalim.com`, `hadibarisalim.co` gibi alternatiflerle.

## Marka görünümlü bir mail adresi (opsiyonel)

Cevapların "sen@hadibarisalim.com" gibi bir adrese gelmesini istersen (toplu gönderim için değil, sadece görünüm için):

- **Zoho Mail**'in ücretsiz planı bir domain için tek kullanıcı barındırır.
- **Google Workspace** aylık ücretlidir ama tanıdık Gmail arayüzünü kullanmaya devam edersin.

Kurduktan sonra o adresi telefonundaki/bilgisayarındaki mail uygulamanda varsayılan hesap yaparsan, "Gönder" butonuna bastığında `mailto:` o hesaptan açılır.

## Dosyalar

- `index.html` — sayfa yapısı
- `style.css` — tasarım
- `script.js` — form mantığı, üç mesaj şablonu, mailto oluşturma
