# Müşterilerin Yaşayabileceği Sorunlar ve Önlemler

İki müşteri tipi: **düğün sahipleri** (davetiye oluşturan/yöneten) ve **davetliler** (linke tıklayıp RSVP yapan).

---

## A) Düğün sahipleri (host)

### 1. Giriş / kayıt
- **Sorun:** Kayıt olurken e-posta doğrulama açıksa link gelmeyebilir veya spam’e düşer.
- **Önlem:** Supabase Auth’da e-posta şablonunu ve “Confirm email” ayarını kontrol edin; müşteriye spam klasörünü kontrol etmesini söyleyin.

### 2. “Satın almam gerekmiyor mu?” / Dashboard’a giremiyorum
- **Sorun:** Middleware, satın almamış kullanıcıyı `/dashboard`’a girince ana sayfaya yönlendiriyor (`?message=purchase_required`). Ana sayfada bu mesaj **şu an gösterilmiyor**; kullanıcı neden atıldığını anlamayabilir.
- **Önlem:** Ana sayfada `searchParams.get('message') === 'purchase_required'` ise bir bilgi kutusu/toast gösterin: “Dashboard’a erişmek için önce bir plan seçmeniz gerekiyor” + Fiyatlandırma’ya scroll veya link.

### 3. Davetiye oluşturdum ama link açılmıyor
- **Sorun:** “Davetiye bulunamadı” — slug yanlış kopyalanmış, davetiye `is_published: false` veya RLS yüzünden public okunamıyor olabilir.
- **Önlem:** Customize sonrası “Yayınla” / `is_published: true` olduğundan emin olun. RLS’te `is_published = true` olan davetiyeler herkese açık SELECT ile okunabilmeli. Müşteriye linki dashboard’daki “Davetiyeyi Paylaş” alanından kopyalattırın.

### 4. Revize ettim, eski link çalışır mı?
- **Sorun:** Slug değiştirilmediyse aynı link çalışır. Slug değiştirilirse eski link 404 olur.
- **Önlem:** Revize akışında slug değişikliğini açıkça belirtin; slug değişirse yeni linki paylaşmaları gerektiğini söyleyin.

### 5. Ödeme (Iyzico) tamamlandı ama dashboard hâlâ kapalı
- **Sorun:** Callback’te `purchases` tablosuna yazma hatası, session süresi veya RLS; middleware `hasActivePurchase` false döner.
- **Önlem:** Ödeme sonrası “Ödeme alındı, yönlendiriliyorsunuz” ekranı + birkaç saniye sonra dashboard’a yönlendirme. Hata durumunda “Sorun olursa çıkış yapıp tekrar girin veya destekle iletişime geçin” mesajı. Loglarda callback ve `purchases` insert hatalarını izleyin.

### 6. Açılış videoları / davetiye görseli görünmüyor
- **Sorun:** `lib/invitation-media.ts` içinde URL’ler placeholder veya yanlış; video/görsel yüklenemiyor.
- **Önlem:** Kendi video ve görsel URL’lerinizi yazın; CDN/storage CORS ve erişilebilir olsun. Mobilde otoplay kısıtları için “Tıklayın” ile başlatma zaten var.

---

## B) Davetliler (misafir)

### 1. Linke tıkladım, “Davetiye bulunamadı”
- **Olası nedenler:** Link kesilmiş/yanlış kopyalanmış, davetiye yayından kaldırılmış, süre/limit (varsa) aşılmış.
- **Önlem:** Davetiyeyi paylaşan kişiye aynı linki tekrar göndermesini veya dashboard’dan kopyalayıp iletmesini söyleyin. Hata sayfasında “Linki baştan kopyalayıp deneyin; sorun sürerse düğün sahibiyle iletişime geçin” gibi kısa bir metin ekleyebilirsiniz.

### 2. RSVP gönderdim ama onay görmedim
- **Sorun:** Form gönderildi ama ağ hatası, 4xx/5xx veya RLS yüzünden insert başarısız; kullanıcı “Başarıyla gönderildi” görmeden sayfada kalıyor.
- **Önlem:** RSVP API hata döndüğünde kullanıcıya net mesaj (örn. “Gönderilemedi, internet bağlantınızı kontrol edip tekrar deneyin”). Başarılı cevapta toast + “Teşekkürler, yanıtınız alındı” mesajı (zaten var).

### 3. Videolar oynatılmıyor / çok yavaş
- **Sorun:** Büyük dosya, yavaş sunucu, mobil veri veya tarayıcı otoplay politikası.
- **Önlem:** Videoları sıkıştırıp CDN’den servis edin; “Tıklayın” ile başlatma kullanın. İsteğe bağlı: düşük kaliteli alternatif veya “Video atla” seçeneği.

### 4. Mobilde sayfa yarıda kesiliyor / kaydırmıyor
- **Sorun:** Viewport, fixed element veya overflow ayarı; bazı cihazlarda scroll engelleniyor gibi hissedilebilir.
- **Önlem:** Davetiye sayfasında `min-height` ve `overflow` test edin; “Yukarı/aşağı kaydırın” ipucu ekleyebilirsiniz.

### 5. Dil benim dilimde değil
- **Sorun:** Davetiyenin dili host’un seçimine bağlı; davetli farklı dil bekliyor.
- **Önlem:** İleride davetli tarafında dil seçimi (query veya banner) eklenebilir. Şimdilik host’un doğru dil seçtiğinden emin olun.

---

## C) Genel / teknik

### 1. Yavaş veya çalışmayan site
- **Sorun:** Hosting kesintisi, Supabase limiti, ağ sorunu.
- **Önlem:** `/api/health` ile izleme; Supabase kullanım ve limitleri takip; müşteriye “Birkaç dakika sonra tekrar deneyin” bilgisi.

### 2. “Oturumum kapandı” / Sürekli login’e atıyor
- **Sorun:** Cookie silindi, süre doldu veya middleware’de session yenilenemedi.
- **Önlem:** Supabase SSR cookie ayarlarının doğru olduğundan emin olun; “Oturumunuz sonlanmış olabilir, tekrar giriş yapın” mesajı.

### 3. E-posta / bildirim yok
- **Sorun:** RSVP veya mesaj bildirimi şu an uygulamada yok; host davetli yanıtlarını sadece dashboard’dan görüyor.
- **Önlem:** İleride e-posta (Supabase Edge Function veya harici servis) eklenebilir. Şimdilik host’a dashboard’u düzenli kontrol etmesini söyleyin.

---

## Özet öncelikler

| Öncelik | Sorun | Önerilen aksiyon |
|--------|--------|-------------------|
| Yüksek | purchase_required mesajı ana sayfada görünmüyor | Ana sayfada `message=purchase_required` için bilgi kutusu |
| Yüksek | “Davetiye bulunamadı” belirsiz | Hata sayfasına kısa “Ne yapabilirsiniz?” metni |
| Orta | RSVP hata mesajı | API hata cevabını kullanıcıya net gösterme |
| Orta | Video/görsel URL’leri | invitation-media.ts’e gerçek URL’ler; CDN/CORS |
| Düşük | Dil seçimi (davetli) | İleride eklenebilir |

Bu dokümanı güncel tutarak yeni destek taleplerine göre madde ekleyebilirsiniz.
