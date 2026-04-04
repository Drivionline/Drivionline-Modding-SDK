# Drivionline Modlama API'sine Hoş Geldiniz

Drivionline sunucuları, tamamen **Lua** diliyle yazılmış modları ve scriptleri destekler. C# tabanlı backend motorumuz sayesinde, oyun içindeki her bir elementi, oyuncuyu ve aracı kontrol edebilirsiniz.

Bu dökümantasyon serisi, kendi oyun modunuzu, arayüzlerinizi (GUI) ve sistemlerinizi kurmanız için ihtiyacınız olan tüm fonksiyonları ve eventleri içerir.

# Kendi hesabınıza admin/owner yetkisi nasıl verilir?

Sunucunun ``scripts/support/authorization_setup.lua`` adresindeki Lua kodunun ``local username = "ADD USERNAME"`` değişkenindeki ``"ADD USERNAME"`` değişkeni yerine kendi kullanıcı adınız yazınız. ``local new_role = "admin"`` değişkeni yerine ise eğer özel sisteminiz varsa herhangi bir özel yetki yazabilirsiniz. Ama varsayılan ve standart sistemler genelde ``"admin"`` yetkisi kullanılır. Eğer kendinize ``"owner"`` yetkisi vermek isterseniz(bu en üst yetkidir dikkatli olunuz) rol yerine ``"owner"`` yazabilirsiniz. İşlemin sonunda oyuna girip F7 Komut girişine ``/set_role`` komutunu yazmayı unutmayınız.


## Kullandığımız Lua sürümü

**Sürüm**: Lua 5.2 tabanlıdır (5.1 ile de %99 uyumludur).

**En Büyük Tuzak**: Tablolar 1'den başlar. myTable[0] dersen nil alırsın.

**Dışarıya Kapalı**: Güvenlik için os.execute (sistem komutu) ve io (dosya yazma/okuma) gibi tehlikeli kütüphaneler kapalıdır.

**Kayıt İşlemleri**: Veri kaydetmek için database API'mizi kullanabilirsiniz.

**Operatör Notu**: Lua 5.3 ile gelen // (tam sayı bölme) veya &, | (bit operatörleri) çalışmaz. Bit işlemleri için bit32 kütüphanesi kullanılmalı.

## Lua Stubs hizmetimiz

Herhangi bir Lua Stubs aracı kullanıyorsanız veya kullanmıyorsanız fark etmez kullanıyorsanız bu dosya aşırı işinize yarar ama kesinlikle server dosyasının yanında  ``scripts/Drivionline_API.lua`` yolunda gelen lua kodunu her script yazmadan önce 1 kere açınız veya arkada açık tutunuzki Lua Stubs programınız bunu bir kütüphane sansın ve fonksiyon tamamlama gibi parametreler nereye gelecek gibi herşeyi kod yazarken anında görünüz. Bu kod yazma hızınızı kat kat artırır. 
Bu durum ``scripts/helpers`` klasöründeki helper kodları içinde böyledir. 

## Hızlı Başlangıç

İlk scriptinizi yazmak oldukça basittir. Sunucu klasörünüzdeki `scripts` dizinine yeni bir `.lua` dosyası oluşturun ve aşağıdaki kodları yapıştırın.

### İlk Komutunuzu Oluşturun

Oyuncuların F7 konsolundan yazabileceği bir komut oluşturalım.

```lua
-- Sunucu başladığında loglara bilgi yazdıralım
function onServerStart()
    server.consoleLog("İlk scriptimiz başarıyla yüklendi!")
end
server.on("onServerStart", onServerStart)

-- Oyuncuya araç veren basit bir komut: /arabaver
server.addCommand("arabaver", function(playerId, args)
    
    -- Oyuncunun adını çekiyoruz
    local isim = server.getPlayerName(playerId)
    
    -- Oyuncuya bir araç spawn ediyoruz (Örn: jreo_model_23)
    car.create(playerId, "jreo_model_23", 1)
    
    -- Oyuncuya mesaj gönderiyoruz
    server.sendMessage(playerId, "Tebrikler " .. isim .. ", aracın oluşturuldu!")
    
end)