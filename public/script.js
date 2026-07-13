(function () {
  "use strict";

  /* ───────── Templates (3 variants per tone) ───────── */
  var templates = {
    duygusal: [
      {
        subject: "Sana içimden geldiği gibi yazıyorum, {isim}",
        body:
          "Sevgili {isim},\n\n" +
          "Bu satırları yazarken elimin biraz titrediğini itiraf etmeliyim. Aramızdaki bu sessizliğin içinde bile seni düşünmeden geçen bir gün olmadı. Birlikte güldüğümüz anları, en sıradan günleri bile özel kılan o hâli çok özledim.\n\n" +
          "Belki bazı şeyleri doğru söyleyemedim, belki bazı anları kaçırdım. Ama şunu bilmeni isterim: sana duyduğum sevgi hâlâ burada, tam da bıraktığımız yerde duruyor.\n\n" +
          "Sadece konuşabilir miyiz? Karşılıklı, sakince, kalbimizi ortaya koyarak. Cevabın ne olursa olsun, bunu sana söylemem gerekiyordu.\n\n" +
          "Seni düşünüyorum."
      },
      {
        subject: "Bazı şeyler söylenmeden kalmamalı, {isim}",
        body:
          "Canım {isim},\n\n" +
          "Bu mesajı kaç kere yazmaya başlayıp sildiğimi bilsen… Ama artık içimde tutamıyorum. Seninle geçirdiğimiz her an, her kahkaha, her sessizlik bile benim için anlam taşıyordu.\n\n" +
          "Şu an aramızda ne varsa — kırgınlık mı, yanlış anlama mı, bıkkınlık mı — bunların hiçbiri sana olan sevgimi silmeye yetmedi. Ve sanırım hiçbir zaman yetemeyecek.\n\n" +
          "Senden tek istediğim bir şans daha değil; sadece bir konuşma. Yüz yüze, gözlerinin içine bakarak, kalbimdekileri anlatmak istiyorum.\n\n" +
          "Ne olursa olsun, sen benim için hep özel kalacaksın."
      },
      {
        subject: "Gece yine seni düşündüm, {isim}",
        body:
          "{isim},\n\n" +
          "Gecenin bu saatinde yine aklıma geldin. Aslında gitmiyorsun ki aklımdan — hep oradasın. Birlikte yürüdüğümüz yolları, paylaştığımız bakışları, yarıda kalan cümlelerimizi düşünüyorum.\n\n" +
          "İkimiz de mükemmel değildik. Belki de mükemmel olmaya çalışırken birbirimizi kaybettik. Ama sana şunu söyleyebilirim: hâlâ seninle aynı gökyüzüne baktığımda içim sızlıyor.\n\n" +
          "Bu mektubu sana uzatılmış bir el olarak düşün. Tutmak senin elinde.\n\n" +
          "Hâlâ buradayım."
      }
    ],
    sitemkar: [
      {
        subject: "İçimde kalanları sana anlatmam lazım, {isim}",
        body:
          "{isim},\n\n" +
          "Bunu yazmak kolay olmadı, çünkü içimde hâlâ küçük bir sitem var. Bazı şeyleri konuşmadan bitirdik, bazı cümleler yarım kaldı. Sen gittikten sonra ben o yarım cümlelerle baş başa kaldım.\n\n" +
          "Kırgınım, evet. Ama bu kırgınlığın altında hâlâ seni önemsediğim gerçeği duruyor. Keşke o son günlerde ikimiz de biraz daha sabırlı olabilseydik.\n\n" +
          "Bunu bir suçlama olarak değil, içimi dökme ihtiyacı olarak oku. Belki hâlâ konuşacak şeylerimiz vardır."
      },
      {
        subject: "Bunu sana söylemem gerekiyordu, {isim}",
        body:
          "{isim},\n\n" +
          "Uzun zamandır içimde biriktirdiğim şeyler var ve artık taşıyamıyorum. Beni tanıyorsun — kolay kolay sitem etmem, ama bu sefer farklı.\n\n" +
          "Senin için orada olduğum zamanlarda, benim için orada olmadığını hissettim. Belki farkında değildin, belki farklı bir dönemindeydin. Ama o boşluk bende derin bir iz bıraktı.\n\n" +
          "Yine de sana kızgın değilim — daha çok üzgünüm. Çünkü seninle olan ilişkimiz benim için gerçekten değerliydi. Hâlâ değerli.\n\n" +
          "Bu satırları okuduktan sonra ne hissedeceğini bilemiyorum. Ama en azından bilmeni istedim."
      },
      {
        subject: "Bir şeyleri konuşmadan bırakmak istemiyorum, {isim}",
        body:
          "{isim},\n\n" +
          "Biliyorum, belki bu mesajı beklemiyordun. Ama suskunluğumun arkasında \"her şey yolunda\" olmadığını anlamanı istiyorum.\n\n" +
          "Seninle paylaştığımız güzel anların gölgesinde, beni inciten küçük ama biriken şeyler de vardı. Her seferinde \"geçer\" dedim, ama geçmedi. Biriktirdim ve sonunda aramıza mesafe koydum.\n\n" +
          "Seni kaybetmek istemezdim, ama kendimi de kaybetmek istemiyordum. Belki şimdi, biraz zaman geçtikten sonra, ikimiz de daha net görebiliriz.\n\n" +
          "Konuşmak istersen, kapım açık."
      }
    ],
    uzlasmaci: [
      {
        subject: "Bir adım atmak istiyorum, {isim}",
        body:
          "Merhaba {isim},\n\n" +
          "Aramızda olanları uzun zamandır düşünüyorum ve kendi payıma düşen hataları artık daha net görebiliyorum. Seni suçlamak için değil, gerçekten bir şeyleri düzeltmek için yazıyorum.\n\n" +
          "İkimiz de o süreci farklı yaşamış olabiliriz ama ben, geride bıraktığımız şeyin bir konuşmayı hak ettiğini düşünüyorum. İstersen kısa bir kahve molası, istersen sadece birkaç dakikalık bir telefon görüşmesi — sana nasıl uygunsa.\n\n" +
          "Hazır olduğunda ben buradayım."
      },
      {
        subject: "Barışmak için geç değil diye düşünüyorum, {isim}",
        body:
          "Merhaba {isim},\n\n" +
          "Bu mesajı yazmak için çok düşündüm, çünkü doğru kelimeleri bulmak istedim. Aramızdaki sorun ne olursa olsun, ikimizin de iyi niyetli olduğuna inanıyorum.\n\n" +
          "Kendi hatalarımı görüyorum ve bunlarla yüzleşmeye hazırım. Senden tek beklentim bir fırsat — oturup sakin sakin konuşma fırsatı. Suçlama yok, yargılama yok, sadece dürüstlük.\n\n" +
          "Eğer sen de hazırsan, bir çay/kahve içelim mi? Zamanlama ve yer tamamen sana kalmış.\n\n" +
          "İyi dileklerimle."
      },
      {
        subject: "Seninle konuşmak istiyorum, {isim}",
        body:
          "Selam {isim},\n\n" +
          "Bir süredir aramızdaki bu sessizliği düşünüyorum. İkimiz de belki inatlaştık, belki gururumuza yenildik. Ama sonuçta ikimiz de bundan mutlu değiliz — en azından ben değilim.\n\n" +
          "Sorumluluk almaktan kaçınmıyorum. Nerede hata yaptıysam kabul ediyorum. Ve senden de aynısını istemiyorum bile — sadece konuşabilmemizi istiyorum.\n\n" +
          "Hayat kısa, güzel insanlarla küs kalmak için çok kısa. Ne dersin, bir adım atalım mı?\n\n" +
          "Seni düşünüyorum."
      }
    ]
  };

  /* ───────── Random Template Picker ───────── */
  function pickTemplate(tone) {
    var variants = templates[tone];
    if (!variants || variants.length === 0) return null;
    return variants[Math.floor(Math.random() * variants.length)];
  }

  /* ───────── DOM Refs ───────── */
  var els = {
    recipientName: document.getElementById("recipient-name"),
    recipientEmail: document.getElementById("recipient-email"),
    senderName: document.getElementById("sender-name"),
    senderField: document.getElementById("sender-field"),
    modeCards: Array.prototype.slice.call(document.querySelectorAll(".mode-card")),
    toneCards: Array.prototype.slice.call(document.querySelectorAll(".tone-card")),
    paperEmpty: document.getElementById("paper-empty"),
    paperContent: document.getElementById("paper-content"),
    subject: document.getElementById("preview-subject"),
    body: document.getElementById("preview-body"),
    sendBtn: document.getElementById("send-btn"),
    sendBtnText: document.querySelector(".send-btn__text"),
    sendBtnArrow: document.querySelector(".send-btn__arrow"),
    sendBtnSpinner: document.querySelector(".send-btn__spinner"),
    validationNote: document.getElementById("validation-note"),
    toast: document.getElementById("toast"),
    toastIcon: document.getElementById("toast-icon"),
    toastText: document.getElementById("toast-text"),
    successOverlay: document.getElementById("success-overlay"),
    successClose: document.getElementById("success-close"),
    spotifyLink: document.getElementById("spotify-link"),
    successTrackingCode: document.getElementById("success-tracking-code"),
    trackingCodeInput: document.getElementById("tracking-code-input"),
    trackingBtn: document.getElementById("tracking-btn"),
    trackingResult: document.getElementById("tracking-result"),
    consentTerms: document.getElementById("consent-terms"),
    consentKvkk: document.getElementById("consent-kvkk"),
    linkTerms: document.getElementById("link-terms"),
    linkPrivacy: document.getElementById("link-privacy"),
    linkKvkk: document.getElementById("link-kvkk"),
    legalModal: document.getElementById("legal-modal"),
    legalModalClose: document.getElementById("legal-modal-close"),
    legalModalTitle: document.getElementById("legal-modal-title"),
    legalModalContent: document.getElementById("legal-modal-content")
  };

  var selectedTone = null;
  var selectedMode = "anonymous"; // default
  var isSending = false;

  /* ───────── Helpers ───────── */
  function hasName() {
    return els.recipientName.value.trim().length > 0;
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  /* ───────── Toast Notification ───────── */
  var toastTimer = null;
  function showToast(message, type) {
    clearTimeout(toastTimer);
    els.toastIcon.textContent = type === "success" ? "✓" : "✕";
    els.toastText.textContent = message;
    els.toast.className = "toast toast--" + type + " show";
    toastTimer = setTimeout(function () {
      els.toast.classList.remove("show");
    }, 4500);
  }

  /* ───────── Mode Switcher ───────── */
  els.modeCards.forEach(function (card) {
    card.addEventListener("click", function () {
      selectedMode = card.getAttribute("data-mode");
      els.modeCards.forEach(function (c) {
        c.classList.remove("active");
        c.setAttribute("aria-checked", "false");
      });
      card.classList.add("active");
      card.setAttribute("aria-checked", "true");

      // Show/hide sender name field
      if (selectedMode === "named") {
        els.senderField.hidden = false;
      } else {
        els.senderField.hidden = true;
      }

      updateSendState();
    });
  });

  /* ───────── Tone Availability ───────── */
  function updateToneAvailability() {
    var enabled = hasName();
    els.toneCards.forEach(function (card) {
      card.disabled = !enabled;
    });
  }

  /* ───────── Apply Tone Template (random variant) ───────── */
  function applyTone(tone) {
    var t = pickTemplate(tone);
    var name = els.recipientName.value.trim();
    if (!t || !name) return;

    els.subject.value = t.subject.replace("{isim}", name);
    els.body.value = t.body.replace(/\{isim\}/g, name);

    els.paperEmpty.hidden = true;
    els.paperContent.hidden = false;

    updateSendState();
  }

  /* ───────── Send State ───────── */
  function updateSendState() {
    var validEmail = isValidEmail(els.recipientEmail.value);
    var nameOk = hasName();
    var toneOk = !!selectedTone;
    var modeOk = !!selectedMode;
    var senderOk = selectedMode === "anonymous" || (els.senderName && els.senderName.value.trim().length > 0);
    var consentOk = els.consentTerms.checked && els.consentKvkk.checked;

    var ready = nameOk && validEmail && toneOk && modeOk && senderOk && consentOk && !isSending;
    els.sendBtn.disabled = !ready;

    if (els.recipientEmail.value.trim().length > 0 && !validEmail) {
      els.validationNote.textContent = "Alıcının e-posta adresi geçerli görünmüyor.";
    } else {
      els.validationNote.textContent = "";
    }
  }

  /* ───────── Event Listeners: Tone Cards ───────── */
  els.toneCards.forEach(function (card) {
    card.addEventListener("click", function () {
      if (card.disabled) return;
      selectedTone = card.getAttribute("data-tone");
      els.toneCards.forEach(function (c) { c.classList.remove("active"); });
      card.classList.add("active");
      applyTone(selectedTone);
    });
  });

  /* ───────── Event Listeners: Inputs ───────── */
  els.recipientName.addEventListener("input", function () {
    updateToneAvailability();
    updateSendState();
  });

  els.recipientEmail.addEventListener("input", updateSendState);
  els.subject.addEventListener("input", updateSendState);
  els.body.addEventListener("input", updateSendState);
  els.consentTerms.addEventListener("change", updateSendState);
  els.consentKvkk.addEventListener("change", updateSendState);

  if (els.senderName) {
    els.senderName.addEventListener("input", updateSendState);
  }

  /* ───────── Send Button ───────── */
  els.sendBtn.addEventListener("click", async function () {
    if (isSending || els.sendBtn.disabled) return;

    var recipientName = els.recipientName.value.trim();
    var recipientEmail = els.recipientEmail.value.trim();
    var senderName = els.senderName ? els.senderName.value.trim() : "";

    if (!recipientName || !isValidEmail(recipientEmail) || !selectedTone || !selectedMode) {
      updateSendState();
      return;
    }

    // Set loading state
    isSending = true;
    els.sendBtn.classList.add("loading");
    els.sendBtnText.textContent = "Gönderiliyor...";
    els.sendBtnArrow.hidden = true;
    els.sendBtnSpinner.hidden = false;
    els.sendBtn.disabled = true;

    try {
      var response = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: recipientName,
          recipientEmail: recipientEmail,
          senderName: senderName,
          tone: selectedTone,
          mode: selectedMode,
          subject: els.subject.value,
          body: els.body.value,
          spotifyLink: els.spotifyLink ? els.spotifyLink.value.trim() : "",
          consentGiven: els.consentTerms.checked && els.consentKvkk.checked
        })
      });

      var data = await response.json();

      if (data.ok) {
        // Show tracking code
        if (els.successTrackingCode && data.trackingId) {
          els.successTrackingCode.textContent = data.trackingId;
        }
        // Show success overlay
        els.successOverlay.hidden = false;
        showToast("Mektubun başarıyla gönderildi! 💌", "success");
      } else {
        showToast(data.error || "Bir hata oluştu.", "error");
      }
    } catch (err) {
      showToast("Bağlantı hatası. Lütfen tekrar deneyin.", "error");
    } finally {
      // Reset loading state
      isSending = false;
      els.sendBtn.classList.remove("loading");
      els.sendBtnText.textContent = "Mektubu Gönder";
      els.sendBtnArrow.hidden = false;
      els.sendBtnSpinner.hidden = true;
      updateSendState();
    }
  });

  /* ───────── Success Overlay Close ───────── */
  els.successClose.addEventListener("click", function () {
    els.successOverlay.hidden = true;
    resetForm();
  });

  /* ───────── Reset Form ───────── */
  function resetForm() {
    els.recipientName.value = "";
    els.recipientEmail.value = "";
    if (els.senderName) els.senderName.value = "";
    if (els.spotifyLink) els.spotifyLink.value = "";
    els.subject.value = "";
    els.body.value = "";
    els.consentTerms.checked = false;
    els.consentKvkk.checked = false;

    selectedTone = null;
    els.toneCards.forEach(function (c) { c.classList.remove("active"); });

    els.paperEmpty.hidden = false;
    els.paperContent.hidden = true;

    updateToneAvailability();
    updateSendState();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ───────── Letter Tracking ───────── */
  if (els.trackingBtn) {
    els.trackingBtn.addEventListener("click", async function () {
      var code = els.trackingCodeInput.value.trim().toUpperCase();
      if (!code) {
        showTrackingResult("Lütfen bir takip kodu girin.", "error");
        return;
      }

      // Eğer kullanıcı "HB-" girmeden sadece 4 haneli kodu girdiyse otomatik ekleyelim
      if (code.length === 4 && !code.startsWith("HB-")) {
        code = "HB-" + code;
        els.trackingCodeInput.value = code;
      }

      // Kod formatı doğrulaması (HB-XXXX formatı)
      if (!/^HB-[0-9A-F]{4}$/.test(code)) {
        showTrackingResult("Geçersiz kod formatı! Kod 'HB-XXXX' formatında olmalıdır.", "error");
        return;
      }

      els.trackingBtn.disabled = true;
      els.trackingBtn.textContent = "Sorgulanıyor...";
      els.trackingResult.hidden = true;

      try {
        var response = await fetch("/api/track/" + encodeURIComponent(code));
        
        if (!response.ok) {
          // Sunucudan hata geldiyse ve yanıt JSON değilse güvenli hata mesajı gösterelim
          var errorMsg = "Mektup bulunamadı veya sunucu hatası oluştu.";
          try {
            var errData = await response.json();
            errorMsg = errData.error || errorMsg;
          } catch (jsonErr) {
            if (response.status === 404) {
              errorMsg = "Mektup bulunamadı (404).";
            }
          }
          showTrackingResult(errorMsg, "error");
          return;
        }

        var data = await response.json();

        if (data.ok) {
          var statusObj = data.data;
          var msg = "";
          if (statusObj.status === "read") {
            var date = new Date(statusObj.readAt).toLocaleString("tr-TR");
            msg = "👁️ Mektubun " + date + " tarihinde okundu!";
            showTrackingResult(msg, "success");
          } else {
            msg = "📬 Mektubun yolda veya henüz açılmadı.";
            showTrackingResult(msg, "success");
          }
        } else {
          showTrackingResult(data.error || "Mektup bulunamadı.", "error");
        }
      } catch (err) {
        // file:// protokolü veya sunucu kapalı olma durumu
        if (window.location.protocol === "file:") {
          showTrackingResult("Tarayıcıda dosyayı doğrudan açtınız (file://). Lütfen projeyi 'http://localhost:3000' adresi üzerinden çalıştırın.", "error");
        } else {
          showTrackingResult("Bağlantı hatası! Lütfen Node.js sunucusunun (localhost:3000) çalıştığından emin olun.", "error");
        }
      } finally {
        els.trackingBtn.disabled = false;
        els.trackingBtn.textContent = "Sorgula";
      }
    });
  }

  function showTrackingResult(message, type) {
    els.trackingResult.textContent = message;
    els.trackingResult.className = "tracking-result " + type;
    els.trackingResult.hidden = false;
  }

  /* ───────── Legal Modal Logic ───────── */
  var legalTexts = {
    terms: {
      title: "Kullanım Koşulları",
      content: "<h4>1. Hizmetin Amacı</h4><p>Hadi Barışalım, kullanıcıların birbirlerine önceden belirlenmiş şablonlar ile anonim veya isimli olarak e-posta göndermelerini sağlayan bir platformdur.</p><h4>2. Kullanım Sınırları</h4><p>Bu platform yasadışı, tehditkar, taciz edici veya başkalarının haklarını ihlal eden içeriklerin gönderilmesi için kullanılamaz. Sistem kötüye kullanımı engellemek için IP tabanlı günlük gönderim limiti (max 3) uygular.</p><h4>3. Sorumluluk Reddi</h4><p>Gönderilen e-postaların içeriğinden ve alıcı üzerindeki etkisinden tamamen gönderici sorumludur. Hadi Barışalım platformu, gönderilen mesajlar nedeniyle oluşabilecek anlaşmazlıklarda sorumluluk kabul etmez.</p>"
    },
    privacy: {
      title: "Gizlilik Politikası",
      content: "<h4>1. Toplanan Veriler</h4><p>Hizmeti sunabilmek için alıcının e-posta adresi, adı ve (varsa) sizin adınız toplanır. Ayrıca kötüye kullanımı önlemek amacıyla IP adresiniz sistem tarafından geçici olarak izlenir.</p><h4>2. Verilerin Kullanımı</h4><p>Toplanan e-posta adresleri ASLA pazarlama amacıyla kullanılmaz veya üçüncü şahıslara satılmaz. Mektup içeriği ve alıcı adresi sadece e-postanın iletilmesi amacıyla kullanılır.</p><h4>3. Takip Teknolojileri (Piksel)</h4><p>E-postanın okunup okunmadığını tespit etmek için gönderilen maile 1x1 boyutunda görünmez bir takip pikseli eklenir. Bu teknoloji, e-postayı açan cihazın IP adresi ve tarayıcı bilgilerini (User-Agent) anonim olarak analiz ederek okuma durumunu belirler.</p>"
    },
    kvkk: {
      title: "KVKK Açık Rıza Metni",
      content: "<h4>Kişisel Verilerin İşlenmesi</h4><p>Hadi Barışalım platformunu kullanarak, alıcıya ait e-posta adresini ve ad bilgisini sistemimize giriyorsunuz. Bu verilerin 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, yalnızca e-postanın gönderilmesi ve (gerekirse) log kayıtlarının güvenlik amacıyla geçici süreliğine tutulması amacıyla işlenmesine açık rıza göstermektesiniz.</p><h4>Açık Rıza Beyanı</h4><p>Onay kutusunu işaretleyerek; girdiğiniz verilerin, e-postanın iletilmesi amacıyla yurt içi veya yurt dışındaki e-posta sunucuları (örn. Google SMTP) aracılığıyla aktarılmasına onay verdiğinizi beyan edersiniz.</p>"
    }
  };

  function openLegalModal(type, e) {
    e.preventDefault();
    var data = legalTexts[type];
    if (data) {
      els.legalModalTitle.innerHTML = data.title;
      els.legalModalContent.innerHTML = data.content;
      els.legalModal.hidden = false;
    }
  }

  els.linkTerms.addEventListener("click", function(e) { openLegalModal("terms", e); });
  els.linkPrivacy.addEventListener("click", function(e) { openLegalModal("privacy", e); });
  els.linkKvkk.addEventListener("click", function(e) { openLegalModal("kvkk", e); });

  els.legalModalClose.addEventListener("click", function() {
    els.legalModal.hidden = true;
  });

  els.legalModal.addEventListener("click", function(e) {
    if (e.target === els.legalModal) {
      els.legalModal.hidden = true;
    }
  });

  /* ───────── Init ───────── */
  updateToneAvailability();
  updateSendState();
})();
