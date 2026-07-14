async function testModeration(senderName, recipientName, templateId) {
  const payload = {
    recipientName: recipientName,
    recipientEmail: "test@example.com",
    senderName: senderName,
    tone: "duygusal",
    mode: "named",
    templateId: templateId,
    consentGiven: true
  };

  const res = await fetch("http://localhost:3000/api/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  
  const data = await res.json();
  console.log(`Test: Sender: "${senderName}", Recipient: "${recipientName}", Template: ${templateId}`);
  console.log(`Sonuç: ${data.ok ? 'Başarılı (Geçti)' : 'Engellendi - ' + data.error}\n`);
}

async function runTests() {
  await testModeration("Mehmet", "Ayşe", 0); // Normal isimler
  await testModeration("amk mehmet", "Ayşe", 1); // Gönderen isminde küfür
  await testModeration("Mehmet", "o.ç Ayşe", 2); // Alıcı isminde küfür
  await testModeration("Mehmet", "Ayşe", 9); // Normal
}

runTests();
