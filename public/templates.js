(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    // Node.js
    module.exports = factory();
  } else {
    // Browser
    root.letterTemplates = factory();
  }
}(typeof window !== 'undefined' ? window : this, function() {
  return {
    duygusal: [
      {
        subject: "Sana içimden geldiği gibi yazıyorum, {isim}",
        body: "Sevgili {isim},\n\nBu satırları yazarken elimin biraz titrediğini itiraf etmeliyim. Aramızdaki bu sessizliğin içinde bile seni düşünmeden geçen bir gün olmadı. Birlikte güldüğümüz anları, en sıradan günleri bile özel kılan o hâli çok özledim.\n\nBelki bazı şeyleri doğru söyleyemedim, belki bazı anları kaçırdım. Ama şunu bilmeni isterim: sana duyduğum sevgi hâlâ burada, tam da bıraktığımız yerde duruyor.\n\nSadece konuşabilir miyiz? Karşılıklı, sakince, kalbimizi ortaya koyarak. Cevabın ne olursa olsun, bunu sana söylemem gerekiyordu.\n\nSeni düşünüyorum."
      },
      {
        subject: "Bazı şeyler söylenmeden kalmamalı, {isim}",
        body: "Canım {isim},\n\nBu mesajı kaç kere yazmaya başlayıp sildiğimi bilsen… Ama artık içimde tutamıyorum. Seninle geçirdiğimiz her an, her kahkaha, her sessizlik bile benim için anlam taşıyordu.\n\nŞu an aramızda ne varsa — kırgınlık mı, yanlış anlama mı, bıkkınlık mı — bunların hiçbiri sana olan sevgimi silmeye yetmedi. Ve sanırım hiçbir zaman yetemeyecek.\n\nSenden tek istediğim bir şans daha değil; sadece bir konuşma. Yüz yüze, gözlerinin içine bakarak, kalbimdekileri anlatmak istiyorum.\n\nNe olursa olsun, sen benim için hep özel kalacaksın."
      },
      {
        subject: "Gece yine seni düşündüm, {isim}",
        body: "{isim},\n\nGecenin bu saatinde yine aklıma geldin. Aslında gitmiyorsun ki aklımdan — hep oradasın. Birlikte yürüdüğümüz yolları, paylaştığımız bakışları, yarıda kalan cümlelerimizi düşünüyorum.\n\nİkimiz de mükemmel değildik. Belki de mükemmel olmaya çalışırken birbirimizi kaybettik. Ama sana şunu söyleyebilirim: hâlâ seninle aynı gökyüzüne baktığımda içim sızlıyor.\n\nBu mektubu sana uzatılmış bir el olarak düşün. Tutmak senin elinde.\n\nHâlâ buradayım."
      },
      {
        subject: "Bir şarkı çaldı ve aklıma düştün, {isim}",
        body: "Sevgili {isim},\n\nBugün radyoda o şarkı çaldı ve beni anında o güzel günlere götürdü. Hani zamanın durduğu, sadece ikimizin olduğu o anlara. Kalbimde o kadar derin bir yerin var ki, araya giren mesafeler bile bunu değiştiremedi.\n\nGururu, kırgınlıkları bir kenara bırakıp sana koşmak istiyorum bazen. Eğer senin kalbinde de benim için küçük bir pencere hâlâ açıksa, o pencereden yeniden güneşi görebilmeyi çok isterim.\n\nSeni kocaman özledim."
      },
      {
        subject: "Zaman dursa da hislerim durmuyor, {isim}",
        body: "{isim},\n\nZamanın her şeyin ilacı olduğunu söylerler ama sanırım benim ilacım sende kaldı. Ne yapsam, nereye baksam senden bir iz buluyorum.\n\nİkimiz de hata yaptık, ikimiz de kırıldık belki. Ama hiçbir kırgınlık, birbirimizi gülümsetirken hissettiğimiz o sıcaklıktan daha değerli olamaz.\n\nGeriye bakıp 'keşke' demektense, ileriye bakıp 'iyi ki' demek için bir adım atıyorum. Lütfen elimi havada bırakma."
      },
      {
        subject: "Rüyalarımda bile seni arıyorum, {isim}",
        body: "Gözlerimi kapattığımda bile sen varsın, {isim}.\n\nKaçmaya çalıştığım tüm düşünceler sonunda hep sana çıkıyor. Seninle olmak bir alışkanlık değil, nefes almak gibiymiş, bunu sen gidince daha iyi anladım.\n\nSana söyleyemediğim her şey için özür dilerim. Eğer sen de içindeki o ince sızıyı hissediyorsan, gel her şeye yeniden, taptaze bir sayfa açalım."
      },
      {
        subject: "Yarım kalan hikayemiz için, {isim}",
        body: "Canım {isim},\n\nBizim hikayemiz böyle yarım kalmamalıydı. O kadar çok güzel anıyı, yaşanmışlığı bir kalemde silip atmak bana hiç adil gelmiyor.\n\nEğer bir mucize olacaksa, bu ancak ikimiz ellerimizi tekrar birleştirdiğimizde olacak. Lütfen geçmişin gölgelerinden sıyrılıp, sadece kalbinin sesini dinler misin?\n\nÇünkü benim kalbim sürekli senin adını sayıklıyor."
      },
      {
        subject: "Seninle güzelleşen dünyam için, {isim}",
        body: "{isim},\n\nSen hayatımdan çıktığından beri her şey biraz daha renksiz, her şarkı biraz daha anlamsız. Çünkü onlara anlam katan şey aslında sensin.\n\nEğer kırgınsan, telafi etmek için ne gerekiyorsa yapmaya hazırım. Yeter ki o güzel gülüşünden beni mahrum bırakma. \n\nSadece bir 'merhaba' yazman bile, dünyamı yeniden aydınlatmaya yetecek."
      },
      {
        subject: "Kalbimden kopup gelenler, {isim}",
        body: "Değerlim, {isim},\n\nHiçbir süslü cümleye sığınmadan, en yalın halimle söylüyorum: Sensiz eksikliğimi her zerremde hissediyorum. Senin o şefkatli bakışın, en zor anımda içimi ferahlatan sesin olmadan eksik biriyim.\n\nYeniden başlamak, yeniden biz olmak o kadar zor olmamalı. Ben buradayım ve senin bir adım atmanı, ya da adım atmama izin vermeni bekliyorum."
      },
      {
        subject: "Son bir şans için, {isim}",
        body: "{isim},\n\nBelki bu mektubu okuduğunda yüzünde hafif bir tebessüm olur, belki de derin bir iç çekersin. Sadece bilmeni isterim ki, ben seni hiç unutmadım.\n\nHatalarımı gördüm, sensizliğin ne demek olduğunu acı bir şekilde anladım. Şimdi senden tek ricam, geçmişi geçmişte bırakıp, yepyeni bir 'biz' için bana küçük de olsa bir fırsat vermen.\n\nSeni tüm kalbimle bekliyor olacağım."
      }
    ],
    sitemkar: [
      {
        subject: "İçimde kalanları sana anlatmam lazım, {isim}",
        body: "{isim},\n\nBunu yazmak kolay olmadı, çünkü içimde hâlâ küçük bir sitem var. Bazı şeyleri konuşmadan bitirdik, bazı cümleler yarım kaldı. Sen gittikten sonra ben o yarım cümlelerle baş başa kaldım.\n\nKırgınım, evet. Ama bu kırgınlığın altında hâlâ seni önemsediğim gerçeği duruyor. Keşke o son günlerde ikimiz de biraz daha sabırlı olabilseydik.\n\nBunu bir suçlama olarak değil, içimi dökme ihtiyacı olarak oku. Belki hâlâ konuşacak şeylerimiz vardır."
      },
      {
        subject: "Bunu sana söylemem gerekiyordu, {isim}",
        body: "{isim},\n\nUzun zamandır içimde biriktirdiğim şeyler var ve artık taşıyamıyorum. Beni tanıyorsun — kolay kolay sitem etmem, ama bu sefer farklı.\n\nSenin için orada olduğum zamanlarda, benim için orada olmadığını hissettim. Belki farkında değildin, belki farklı bir dönemindeydin. Ama o boşluk bende derin bir iz bıraktı.\n\nYine de sana kızgın değilim — daha çok üzgünüm. Çünkü seninle olan ilişkimiz benim için gerçekten değerliydi. Hâlâ değerli.\n\nBu satırları okuduktan sonra ne hissedeceğini bilemiyorum. Ama en azından bilmeni istedim."
      },
      {
        subject: "Bir şeyleri konuşmadan bırakmak istemiyorum, {isim}",
        body: "{isim},\n\nBiliyorum, belki bu mesajı beklemiyordun. Ama suskunluğumun arkasında \"her şey yolunda\" olmadığını anlamanı istiyorum.\n\nSeninle paylaştığımız güzel anların gölgesinde, beni inciten küçük ama biriken şeyler de vardı. Her seferinde \"geçer\" dedim, ama geçmedi. Biriktirdim ve sonunda aramıza mesafe koydum.\n\nSeni kaybetmek istemezdim, ama kendimi de kaybetmek istemiyordum. Belki şimdi, biraz zaman geçtikten sonra, ikimiz de daha net görebiliriz.\n\nKonuşmak istersen, kapım açık."
      },
      {
        subject: "Beklentiler ve Hayal Kırıklıkları, {isim}",
        body: "{isim},\n\nZaman zaman insan en çok değer verdiğinden yara alıyor. Beni en çok üzen şey ayrılığımız değil, o son süreçte birbirimize karşı ne kadar yabancılaştığımızdı.\n\nBir adım atmak, sadece senin için değil benim için de zordu ama hep ben çabalıyormuşum gibi hissetmek beni tüketti.\n\nEğer bir gün gerçekten olaylara benim penceremden bakabilirsen, neden o kadar sessizleştiğimi anlarsın. Hala konuşulacak bir şeyler kaldığına inanıyorsan, dinlemeye hazırım."
      },
      {
        subject: "Değer miydi böyle bitmesine, {isim}?",
        body: "{isim},\n\nHer şey bittiğinde elimde sadece koca bir 'neden?' sorusu kaldı. İkimiz de hatalıydık belki ama o umursamaz tavrın içimi en çok acıtan şeydi.\n\nBirlikte onca fırtınayı atlatmışken, küçücük bir rüzgarda gemiyi ilk senin terk etmeni beklemiyordum.\n\nYine de o eski, beni gerçekten anlayan {isim}'i özlemiyor değilim. Sadece içimde kalan bu yükü seninle paylaşmak istedim."
      },
      {
        subject: "Yarım kalan hesaplaşmalar, {isim}",
        body: "{isim},\n\nBazı vedalar çok sessiz olur ama arkalarında sağır edici bir gürültü bırakırlar. Sen o gürültüyü duymadan gittin.\n\nBeni dinlemediğin, anlamaya çalışmadığın o günlerde ne kadar yalnız hissettiğimi asla bilemeyeceksin.\n\nAma garip bir şekilde içimdeki bu öfke yavaş yavaş yerini büyük bir boşluğa ve seni anlama isteğine bıraktı. Eğer sen de olaylara dışarıdan bakıp 'haklı olduğu yerler vardı' dersen, konuşabiliriz."
      },
      {
        subject: "Söylenmemiş Cümleler Yükü, {isim}",
        body: "{isim},\n\nSusmak en büyük tepkidir derler, ama bazen susmak sadece daha fazla anlaşılmamayı getiriyor. Ben de artık susmak istemiyorum.\n\nBeni en hassas noktamdan kırdığın o anlarda, keşke gözlerimin içine bakıp o acıyı görebilseydin.\n\nSenden bir özür veya pişmanlık beklemiyorum. Sadece içimdekileri bilmeni istedim, çünkü bunları söylemezsem o yükten asla kurtulamayacağım. "
      },
      {
        subject: "Farkında mısın bilmiyorum ama... {isim}",
        body: "{isim},\n\nO kadar kendinle ve kendi doğrularınla meşguldün ki, yanındaki insanın yavaş yavaş nasıl kırıldığını fark etmedin bile.\n\nBenim sessizliğim bir kabul değil, sadece artık çabalamaktan yorulmaktı. Sana anlatmaya çalıştığım onca şeyi rüzgara söylemişim gibi hissettim.\n\nEğer bir gün gerçekten dinlemeye hazır olursan ve sadece 'kendin' için değil 'biz' için bir şeyler yapmak istersen, o zaman belki yaralarımızı konuşabiliriz."
      },
      {
        subject: "Kendimi değil, bizi savundum, {isim}",
        body: "{isim},\n\nSen hep benim seninle savaştığımı sandın. Oysa ben seninle değil, bizi kaybetmemek için senin o duvarlarına karşı savaşıyordum.\n\nBeni en çok yoran senin o aşılmaz duvarlarındı. Ne kadar çabalasam da hep o duvara çarpıp geri döndüm.\n\nŞimdi o duvarların ardında yalnız mısın, mutlu musun bilmiyorum. Ama benim sana duyduğum öfke değil, sadece derin bir hayal kırıklığı."
      },
      {
        subject: "Belki de böylesi daha iyiydi... {isim}",
        body: "{isim},\n\nHer bitiş yeni bir başlangıçtır derler. Ama benim için bu bitiş, içimde koca bir soru işareti bıraktı.\n\nNeden onca güzel anı varken, bir anda birbirimize bu kadar düşman olduk? Benim sana kızgınlığım geçici, ama içimdeki o kırıklık hep kalacak gibi.\n\nSana kızamıyorum bile artık. Eğer bir gün gerçekten neyi kaybettiğimizi anlarsan, belki o zaman aynı dili konuşabiliriz."
      }
    ],
    uzlasmaci: [
      {
        subject: "Bir adım atmak istiyorum, {isim}",
        body: "Merhaba {isim},\n\nAramızda olanları uzun zamandır düşünüyorum ve kendi payıma düşen hataları artık daha net görebiliyorum. Seni suçlamak için değil, gerçekten bir şeyleri düzeltmek için yazıyorum.\n\nİkimiz de o süreci farklı yaşamış olabiliriz ama ben, geride bıraktığımız şeyin bir konuşmayı hak ettiğini düşünüyorum. İstersen kısa bir kahve molası, istersen sadece birkaç dakikalık bir telefon görüşmesi — sana nasıl uygunsa.\n\nHazır olduğunda ben buradayım."
      },
      {
        subject: "Barışmak için geç değil diye düşünüyorum, {isim}",
        body: "Merhaba {isim},\n\nBu mesajı yazmak için çok düşündüm, çünkü doğru kelimeleri bulmak istedim. Aramızdaki sorun ne olursa olsun, ikimizin de iyi niyetli olduğuna inanıyorum.\n\nKendi hatalarımı görüyorum ve bunlarla yüzleşmeye hazırım. Senden tek beklentim bir fırsat — oturup sakin sakin konuşma fırsatı. Suçlama yok, yargılama yok, sadece dürüstlük.\n\nEğer sen de hazırsan, bir çay/kahve içelim mi? Zamanlama ve yer tamamen sana kalmış.\n\nİyi dileklerimle."
      },
      {
        subject: "Seninle konuşmak istiyorum, {isim}",
        body: "Selam {isim},\n\nBir süredir aramızdaki bu sessizliği düşünüyorum. İkimiz de belki inatlaştık, belki gururumuza yenildik. Ama sonuçta ikimiz de bundan mutlu değiliz — en azından ben değilim.\n\nSorumluluk almaktan kaçınmıyorum. Nerede hata yaptıysam kabul ediyorum. Ve senden de aynısını istemiyorum bile — sadece konuşabilmemizi istiyorum.\n\nHayat kısa, güzel insanlarla küs kalmak için çok kısa. Ne dersin, bir adım atalım mı?\n\nSeni düşünüyorum."
      },
      {
        subject: "Zeytin dalı uzatıyorum, {isim}",
        body: "Merhaba {isim},\n\nZaman geçtikçe öfkenin ve kırgınlığın ne kadar anlamsız olduğunu daha iyi anlıyorum. Yaşadığımız o gerginlikleri geride bırakıp, sadece güzel anılarımıza odaklanmak istiyorum.\n\nEğer kabul edersen, bu mesajımı sana uzattığım bir zeytin dalı olarak gör. Bütün o negatifliği geride bırakıp, iki olgun insan gibi yeniden iletişim kurabiliriz.\n\nCevabını bekliyor olacağım."
      },
      {
        subject: "Keşke o anki sinirle konuşmasaydık, {isim}",
        body: "{isim},\n\nO gün ikimiz de çok sinirliydik ve ağzımızdan çıkanları kulağımız duymadı. Şimdi sakin kafayla düşündüğümde, aslında çözülemeyecek bir sorunumuz olmadığını görüyorum.\n\nBen kendi adıma o günkü tavrımdan dolayı özür diliyorum. Sen de eğer içinde bana karşı biriken öfkeyi biraz olsun hafifletebildiysen, lütfen bana bir şans ver. \n\nYeniden başlamak için hiçbir zaman geç değildir."
      },
      {
        subject: "Gururu bir kenara bıraktım, {isim}",
        body: "Selam {isim},\n\nGünlerdir içimde bir savaş veriyorum ve sonunda gururumun değil, kalbimin kazanmasına izin verdim.\n\nHatalı olan kim olursa olsun, bu küslük ikimize de zarar veriyor. Ben kendi duvarlarımı yıktım ve sana geliyorum. \n\nSenden de aynı cesareti bekliyorum. Hadi bu saçma duruma bir son verip, birbirimize eski sıcaklığımızla sarılalım."
      },
      {
        subject: "Yeniden biz olabilir miyiz? {isim}",
        body: "Canım {isim},\n\nBirlikte çözdüğümüz onca sorunun yanında bu yaşadığımız şey gerçekten çok küçük kalıyor. İkimizin enerjisi ve o güzel uyumumuz, böyle basit bir tartışmaya kurban gitmemeli.\n\nSeni, sohbetimizi ve o eşsiz dostluğumuzu çok özledim. Geçmişe sünger çekip, kaldığımız o güzel yerden devam etmeye ne dersin?\n\nBir mesaj uzağındayım."
      },
      {
        subject: "Görmezden gelmeyelim, {isim}",
        body: "Merhaba {isim},\n\nHepimiz zaman zaman hata yapar, yanlış anlaşılırız. Önemli olan düştüğümüzde birbirimize el uzatıp kalkabilmektir.\n\nBizim aramızdaki bağın bu kadar zayıf olduğuna inanmıyorum. Bu sessizliği bozmak, birbirimizi yeniden anlamaya çalışmak zorundayız. \n\nEğer içinde bana karşı küçük bir sevgi kırıntısı kaldıysa, lütfen bu mesajıma bir karşılık ver. Her şeyi düzeltebiliriz."
      },
      {
        subject: "Sakin kafayla konuşmaya ne dersin? {isim}",
        body: "{isim},\n\nOlayların sıcaklığıyla belki ikimiz de mantıklı düşünemedik. Ama aradan geçen bu zaman, bana aslında aramızdaki problemin ne kadar basit olduğunu gösterdi.\n\nBenim için değerlisin ve seni kaybetmek istemiyorum. Her şeyi masaya yatırıp, empatiyle ve sevgiyle birbirimizi dinlemeye çok ihtiyacımız var.\n\nHazır hissettiğinde bir kahve içip dertleşelim. Bekliyorum."
      },
      {
        subject: "Özür dilerim ve çok özledim, {isim}",
        body: "Canım {isim},\n\nLafı hiç dolandırmadan söyleyeceğim: Nerede yanlış yaptıysam özür dilerim. Haklı çıkmaktan çok, seninle yeniden iyi olmaya ihtiyacım var.\n\nAramızdaki bu soğuk savaş artık bitsin istiyorum. Çünkü sensizlik beklediğimden çok daha zor ve anlamsızmış.\n\nLütfen bu mesajımı bir zayıflık değil, sana verdiğim değerin bir göstergesi olarak kabul et. Seni seviyorum."
      }
    ]
  };
}));
