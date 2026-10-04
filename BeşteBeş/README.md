# Beşte Beş

Beşte Beş, Expo ve React Native ile geliştirilen çevrimdışı bir Türkçe kelime bulmacasıdır. Günlük ortak kelimeyi veya sınırsız rastgele oyunları altı denemede çözmeyi amaçlar.

## Özellikler

- Yerel takvime göre günlük bulmaca ve gece yarısı geri sayımı
- Sınırsız rastgele oyun ve kaldığın yerden devam etme
- Çift harfleri doğru değerlendiren Wordle puanlaması
- Türkçe ve İngilizce arayüz
- Kalıcı açık/koyu tema ve titreşim ayarı
- Yerel istatistikler, seriler, kupalar ve tahmin dağılımı
- Gizli kelimeyi açıklamayan emoji sonuç paylaşımı
- Telefon, küçük ekran, tablet ve web için responsive düzen
- Hesap, reklam, analiz ve backend gerektirmeyen offline-first yapı

## Çevrimdışı kelime verisi

Tahmin sözlüğü ve hedef havuzu, Güncel Türkçe Sözlük 12. baskısından build
sırasında üretilir ve uygulamaya statik olarak gömülür. Uygulama çalışırken
internet bağlantısı, API, backend veya cihaz içi veritabanı kullanmaz.

- Geçerli tahmin listesi özel ad olmayan 5 harfli sözlük maddelerini kapsar.
- Hedef listesi ayrıca yalnızca ağız, eskimiş, argo veya kaba kullanım anlamı
  bulunan maddeleri eler.
- Kaynak ve lisans bilgileri `THIRD_PARTY_NOTICES.md` dosyasındadır.

Kaynak JSON güncellendiğinde veri paketi şöyle yeniden üretilebilir:

```bash
npm run words:generate -- /path/to/gts.json
```

## Çalıştırma

Node.js 22.13 veya üzeri gerekir.

```bash
npm install
npm start
```

## Kalite kontrolleri

```bash
npm run check
```

EAS geliştirme, önizleme ve production profilleri `eas.json` içinde tanımlıdır. Expo projesi hesaba bağlandıktan sonra EAS Update proje kimliği ve URL’si Expo tarafından oluşturulmalıdır.
