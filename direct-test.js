require("dotenv").config();
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function run() {
  const recipientEmail = "test-29b2tsxdl@srv1.mail-tester.com";
  const trackingId = "HB-" + crypto.randomBytes(2).toString("hex").toUpperCase();
  // Using a real looking URL for the test to avoid broken link deduction if it checks format
  const serverUrl = "https://hadibarisalim.com";
  
  const fromName = process.env.SMTP_FROM_NAME || "Hadi Barışalım";
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  const subject = "Sana içimden geldiği gibi yazıyorum, Test";
  const body = "Sevgili Test,\n\nBu satırları yazarken elimin biraz titrediğini itiraf etmeliyim...\n\nSeni düşünüyorum.";
  
  const footerText = "Bu e-posta, hadibarisalim.com platformu aracılığıyla bir kullanıcımız tarafından anonim olarak oluşturulmuş ve size iletilmiştir. Platformumuz, insanların içlerinden geçenleri dürüstçe yazabilmeleri için güvenli bir iletişim köprüsü kurmayı amaçlar.";

  const htmlBody = `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#1E1520;font-family:'Georgia',serif;">
  <div style="max-width:580px;margin:40px auto;background:#F6EEE1;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#1E1520,#2A1E2C);padding:32px 40px;text-align:center;">
      <h1 style="margin:0;font-family:'Georgia',serif;font-size:24px;color:#E7C685;font-weight:normal;font-style:italic;">
        Hadi <em>Barış</em><span style="color:#C9A15B;">alım</span>
      </h1>
    </div>
    <div style="padding:40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:16px;">
      <p style="margin:0 0 16px;line-height:1.7;color:#2B211B;">Sevgili Test,</p>
      <p style="margin:0 0 16px;line-height:1.7;color:#2B211B;">Bu satırları yazarken elimin biraz titrediğini itiraf etmeliyim...</p>
    </div>
    <div style="padding:0 40px 32px;text-align:center;">
      <p style="margin:24px 0 8px;font-size:13px;color:#8A7A63;font-style:italic;">${footerText}</p>
      <p style="margin:0;font-size:11px;color:#8A7A63;opacity:0.8;">
        Bu tür mektupların doğası gereği kişisel olduğunu hatırlatmak isteriz. Eğer bu mesajı bir hata sonucu aldığınızı düşünüyorsanız veya gelecekte sistemimiz üzerinden benzer e-postalar almak istemiyorsanız, lütfen platformumuzu ziyaret ederek iletişime geçin. 
        Güvenliğiniz ve gizliliğiniz için sistemimiz katı gönderim limitleriyle korunmaktadır.
      </p>
    </div>
  </div>
  <img src="${serverUrl}/api/track/${trackingId}/pixel.gif" width="1" height="1" border="0" style="display:block; border:none; outline:none; text-decoration:none;" alt="" />
</body>
</html>`;

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: recipientEmail,
      replyTo: `"No Reply" <noreply@hadibarisalim.com>`,
      subject: subject,
      text: body,
      html: htmlBody,
      messageId: `<${trackingId}@hadibarisalim.com>`,
      headers: {
        "X-Entity-Ref-ID": trackingId,
        "List-Unsubscribe": `<${serverUrl}/api/unsubscribe>`
      }
    });
    console.log("Mail sent:", info.messageId);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
