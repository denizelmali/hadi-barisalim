async function testModeration(bodyText) {
  const payload = {
    recipientName: "Ahmet",
    recipientEmail: "test@example.com",
    senderName: "Mehmet",
    tone: "duygusal",
    mode: "named",
    body: bodyText,
    consentGiven: true
  };

  const res = await fetch("http://localhost:3000/api/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  
  const data = await res.json();
  console.log(`Test Metni: "${bodyText}"`);
  console.log(`Sonuç: ${data.ok ? 'Başarılı (Geçti)' : 'Engellendi - ' + data.error}\n`);
}

async function runTests() {
  await testModeration("Seni çok özledim, lütfen barışalım.");
  await testModeration("seni s.i.k.e.r.i.m anladın mı beni");
  await testModeration("o. r o . s  p.   u  çocuğu");
  await testModeration("sen tam bir amk salagisin");
  await testModeration("g.a.v.a.t mısın oğlum sen?");
  await testModeration("zaman çok hızlı geçiyor ama seni unutamıyorum."); // False positive test for "am"
}

runTests();
