# Mather Yayın Kontrol Listesi

Son denetim: 4 Ekim 2026

## Mevcut durum

- [x] Expo SDK 57 kullanılıyor; Android `targetSdkVersion` 36 gereksinimini karşılıyor.
- [x] Uygulama sürümü `1.0.0`, iOS build numarası `1`, Android version code `1`.
- [x] Lint, TypeScript ve 10 otomatik test başarılı.
- [x] Expo bağımlılıkları önerilen sürümlerle uyumlu.
- [x] Uygulama çevrimdışı çalışıyor; hesap, reklam, analiz ve takip SDK'sı yok.
- [x] Uygulama içinde Türkçe ve İngilizce gizlilik politikası ile kullanım koşulları ekranları var.
- [x] iOS ve Google Play için opak mağaza ikonu adayları hazır.
- [x] Android adaptif ikon katmanı mevcut.

## Mağaza kaydından önce kesinleştirilecekler

- [ ] Mağaza adı: öneri `Mather: Denklem Bulmacası` / `Mather: Equation Puzzle`.
- [ ] `Mather` adı için mağaza ve marka uygunluğu kontrol edilecek. Google Play'de aynı adla bir matematik uygulaması, Steam'de aynı adla bir matematik oyunu bulunuyor.
- [ ] Kalıcı paket kimliği onaylanacak. Mevcut değer: `mather.selmanyalcin.mather`; önerilen standart biçim: `com.selmanyalcin.mather`.
- [ ] Expo slug değeri düzenlenecek. Mevcut `mather-app-slug` geçici görünüyor; öneri: `mather` veya uygun boş bir varyasyon.
- [ ] App Store'da görünecek geliştirici/satıcı adı kesinleştirilecek.
- [ ] Destek e-posta adresi sağlanacak.
- [ ] Herkese açık destek URL'si hazırlanacak.
- [ ] Herkese açık gizlilik politikası URL'si hazırlanacak ve `PRIVACY.md` içindeki geçici GitHub yönlendirmesi kaldırılacak.

Paket kimliği ve mağaza kaydı ilk yayından sonra değiştirilemeyeceği için bu bölüm onaylanmadan production kaydı oluşturulmamalı.

## Görsel materyaller

- [x] iOS ana ikon adayı: `assets/store/mather-icon-ios-1024.png` (1024 x 1024, opak).
- [x] Google Play ikon adayı: `assets/store/mather-icon-google-play-512.png` (512 x 512, opak).
- [x] Mevcut Android adaptif foreground: `assets/adaptive-icon.png`.
- [ ] Yeni ikon onaylanınca uygulama paketi içindeki `assets/icon.png` ile uyumlu hale getirilecek.
- [ ] Google Play feature graphic hazırlanacak (1024 x 500).
- [ ] Türkçe ve İngilizce telefon ekran görüntüleri hazırlanacak.
- [ ] `supportsTablet: true` korunacaksa iPad ekran görüntüleri ve tablet testi tamamlanacak; aksi halde tablet desteği kapatılacak.

## Mağaza metni taslağı

### Türkçe

- Ad: `Mather: Denklem Bulmacası`
- Alt başlık: `Günlük matematik oyunu`
- Kısa açıklama: `Gizli denklemi 6 denemede bul; günlük veya sınırsız matematik bulmacaları çöz.`
- Birincil kategori: Oyunlar / Bulmaca
- İkincil kategori: Eğitim

### English

- Name: `Mather: Equation Puzzle`
- Subtitle: `A daily math brain game`
- Short description: `Find the hidden equation in 6 tries with daily and unlimited math puzzles.`
- Primary category: Games / Puzzle
- Secondary category: Education

## Mağaza beyanları

- [ ] Apple App Privacy: `No, we do not collect data from this app` beyanı uygulama ve üçüncü taraf paketler için son kez doğrulanacak.
- [ ] Google Play Data safety: veri toplanmadığı ve paylaşılmadığı beyan edilecek.
- [ ] Reklam: yok.
- [ ] Uygulama içi satın alma: yok.
- [ ] Hesap/giriş: yok; inceleme hesabı gerekmiyor.
- [ ] İçerik derecelendirme ve hedef yaş grubu formları doldurulacak.
- [ ] Uygulama "çocuklar için" olarak işaretlenmeyecekse mağaza metinleri ve hedef kitle seçimi bunu açıkça yansıtacak.
- [ ] İhracat uyumluluğu/şifreleme soruları build içeriğine göre yanıtlanacak.

## Hesaplar ve dağıtım

- [ ] Expo hesabında `eas login` yapılacak ve proje oluşturulacak/bağlanacak.
- [ ] Apple Developer Program üyeliği ve App Store Connect erişimi hazır olacak.
- [ ] Google Play Console geliştirici hesabı ve kimlik doğrulaması tamamlanacak.
- [ ] Yeni kişisel Google Play hesabı kurallarına tabi ise en az 12 tester ile 14 gün kesintisiz kapalı test planlanacak.
- [ ] Android internal test build'i gerçek cihazda doğrulanacak.
- [ ] iOS build'i TestFlight üzerinden gerçek iPhone ve destek açık kalırsa iPad'de doğrulanacak.

## Önerilen yayın sırası

1. İsim, paket kimliği, geliştirici adı ve destek e-postasını kesinleştir.
2. Gizlilik ve destek sayfalarını herkese açık URL'lerde yayınla.
3. İkonu onayla; feature graphic ve mağaza ekran görüntülerini üret.
4. Expo/EAS projesini bağla ve preview build al.
5. Gerçek cihaz testlerini tamamla.
6. App Store Connect ve Play Console kayıtlarını, beyanları ve mağaza metinlerini doldur.
7. Production `.ipa` ve `.aab` build'lerini üretip TestFlight/internal track'e gönder.
8. Son kontrolden sonra incelemeye gönder ve kontrollü yayınla.

## Resmî kaynaklar

- Apple gizlilik bilgileri: https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/
- Apple ekran görüntüleri: https://developer.apple.com/help/app-store-connect/manage-app-information/upload-app-previews-and-screenshots/
- Google Play Data safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Google Play yeni kişisel hesap test şartı: https://support.google.com/googleplay/android-developer/answer/14151465
- Android hedef API şartı: https://developer.android.com/google/play/requirements/target-sdk
- Expo mağazaya gönderim: https://docs.expo.dev/deploy/submit-to-app-stores/
