(function () {
  "use strict";

  /* ───────── Random Template Picker ───────── */
  function pickTemplate(tone) {
    var variants = window.letterTemplates[tone];
    if (!variants || variants.length === 0) return null;
    var index = Math.floor(Math.random() * variants.length);
    return { id: index, tpl: variants[index] };
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
    shuffleBtn: document.getElementById("shuffle-btn"),
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
  var selectedTemplateId = null;
  var isSending = false;
  var csrfToken = null; // CSRF token sunucudan alınacak

  /* ───────── CSRF Token ───────── */
  async function fetchCsrfToken() {
    try {
      var response = await fetch("/api/csrf-token", { credentials: "same-origin" });
      var data = await response.json();
      if (data.ok) csrfToken = data.token;
    } catch (err) {
      console.warn("CSRF token alınamadı, yeniden denenecek.");
    }
  }
  // Sayfa yüklenince token al
  fetchCsrfToken();

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
      if (!enabled) {
        card.classList.add("disabled-look");
      } else {
        card.classList.remove("disabled-look");
      }
    });
  }

  /* ───────── Apply Tone Template (random variant) ───────── */
  function applyTone(tone) {
    var picked = pickTemplate(tone);
    var name = els.recipientName.value.trim();
    if (!picked || !name) return;

    selectedTemplateId = picked.id;
    els.subject.value = picked.tpl.subject.replace("{isim}", name);
    els.body.value = picked.tpl.body.replace(/\{isim\}/g, name);

    els.paperEmpty.hidden = true;
    els.paperContent.hidden = false;

    updateSendState();
  }

  if (els.shuffleBtn) {
    els.shuffleBtn.addEventListener("click", function() {
      if (selectedTone) applyTone(selectedTone);
    });
  }

  /* ───────── Gece Modu (Dark Mode) ───────── */
  var themeToggle = document.getElementById("theme-toggle");
  var themeIcon = themeToggle ? themeToggle.querySelector(".theme-icon") : null;
  
  // LocalStorage'dan temayı yükle
  var savedTheme = localStorage.getItem("hadi_barisalim_theme");
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark-theme");
    if (themeIcon) themeIcon.textContent = "☀️";
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function() {
      document.documentElement.classList.toggle("dark-theme");
      if (document.documentElement.classList.contains("dark-theme")) {
        localStorage.setItem("hadi_barisalim_theme", "dark");
        if (themeIcon) themeIcon.textContent = "☀️";
      } else {
        localStorage.setItem("hadi_barisalim_theme", "light");
        if (themeIcon) themeIcon.textContent = "🌙";
      }
    });
  }

  /* ───────── Template System ───────── */
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
      if (!hasName()) {
        showToast("Lütfen önce alıcının adını yazın!", "error");
        // Scroll to name input smoothly
        els.recipientName.scrollIntoView({ behavior: "smooth", block: "center" });
        els.recipientName.focus({ preventScroll: true });
        return;
      }
      
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
        credentials: "same-origin",
        body: JSON.stringify({
          recipientName: recipientName,
          recipientEmail: recipientEmail,
          senderName: senderName,
          tone: selectedTone,
          mode: selectedMode,
          templateId: selectedTemplateId,
          spotifyLink: els.spotifyLink ? els.spotifyLink.value.trim() : "",
          consentGiven: els.consentTerms.checked && els.consentKvkk.checked,
          website: document.getElementById("honeypot") ? document.getElementById("honeypot").value : "",
          _csrf: csrfToken
        })
      });

      var data = await response.json();

      if (data.ok) {
        // Show tracking code
        if (els.successTrackingCode && data.trackingId) {
          els.successTrackingCode.textContent = data.trackingId;
        }
        // Show envelope animation
        var animOverlay = document.getElementById("animation-overlay");
        if (animOverlay) {
          animOverlay.hidden = false;
          // Trigger animation
          requestAnimationFrame(function() {
            animOverlay.classList.add("animate-fly");
          });
          
          // Wait for animation to finish, then show success
          setTimeout(function() {
            animOverlay.hidden = true;
            animOverlay.classList.remove("animate-fly");
            els.successOverlay.hidden = false;
            showToast("Mektubun başarıyla gönderildi! 💌", "success");
          }, 2700);
        } else {
          // Fallback if animation overlay is missing
          els.successOverlay.hidden = false;
          showToast("Mektubun başarıyla gönderildi! 💌", "success");
        }
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
      // Her gönderimden sonra yeni CSRF token al (tek kullanımlık)
      fetchCsrfToken();
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

      // Eğer kullanıcı "HB-" girmeden sadece kodu girdiyse otomatik ekleyelim
      if (!code.startsWith("HB-") && (code.length === 4 || code.length === 8)) {
        code = "HB-" + code;
        els.trackingCodeInput.value = code;
      }

      // Kod formatı doğrulaması (HB-XXXX veya HB-XXXXXXXX formatı — eski ve yeni kodlar desteklenir)
      if (!/^HB-[0-9A-F]{4}$/.test(code) && !/^HB-[0-9A-F]{8}$/.test(code)) {
        showTrackingResult("Geçersiz kod formatı! Kod 'HB-XXXX' veya 'HB-XXXXXXXX' formatında olmalıdır.", "error");
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
