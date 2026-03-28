# API Hakkında önemli bilgiler

kullanacağınız API'ler basittir. Ama bunları bilmenizde çok fayda var.

---

## 1. Parametre döndüren API'ler. 

Parametre döndüren API'lerin callback fonksiyonuna bir function bağlarsanız parametreler otomatik olacak çağırılan function'un parametrelerine verilir. 

### Örnek:

```lua

function tamirEt(playerId, args)
    -- tamir mantığı...
    server.sendMessage(playerId, "Aracınız tamir edildi.")
end

server.addCommand("tamir", tamirEt)

```

Veya

```lua

-- 1. Önce aksiyon fonksiyonunu tanımlıyoruz
function kemerAksiyonu(playerId)
    --kod içeriği...
end

-- 2. Event içinde sadece fonksiyon adını gönderiyoruz
server.on("onPlayerJoin", function(playerId)
    -- NOT: kemerAksiyonu() şeklinde parantez koyma, sadece ismini yaz!
    server.bindKey(playerId, "B", kemerAksiyonu) 
end)

```

## 2. server.updateUI API'si

Bu API'de değinilmesi gereken çok önemli bir nokta var.

İşte en özet haliyle farklar:

1. txt (Görünen Metin)
    Nedir: Ekranda basılı olan, kullanıcının gözüyle gördüğü karakter dizisidir (String).

    Amacı: Kullanıcıya bilgi vermek veya ondan veri (isim, şifre vb.) almaktır.

    Örnek: Bir **Label** kutusunun içindeki "Merhaba Dünya" yazısı.

2. val (Arkadaki Değer)
    Nedir: UI'daki görselin kod tarafındaki karşılığıdır. Çoğu zaman txt ile aynıdır ama fark şudur: txt "123" ise, val bunu sayı (Integer) 123 olarak tutar.

    Amacı: Matematiksel işlem yapmak veya veritabanına ham veriyi göndermek.

    Örnek: **Progess Bar**'ın değerini güncellerken kullanılır.

3. checked (Durum/Onay)
    Nedir: Bir Boolean (true/false) değeridir. Sadece "seçili mi, değil mi?" sorusuna yanıt verir.

    Amacı: Switch, Checkbox veya Radio Button gibi bileşenlerin açık/kapalı durumunu kontrol etmek.

    Örnek: **CheckBox** checked (Tik işareti) verisini güncellemek.

## 3. LUA scriptlerine require durumu

Başka bir scripti çağırırken require("panel") yerine eğer script alt klasörde ise örnek: require("ui/panel") yazınız.

## 4. Hook sistemi

Modlama sistemi, birden fazla scriptin aynı anda, birbirini bozmadan çalışabilmesi için bir Hook (Kanca) mimarisi kullanır.

`server.on(eventName, callback)`

    Bu fonksiyon, sunucuda gerçekleşen bir olaya "abone olmanızı" sağlar. Klasik function onEventName() kullanımının aksine, server.on kullandığınızda diğer scriptlerin aynı olayı dinlemesini engellemezsiniz.

Neden Önemli?: Bir mod oyuncu girdiğinde hoş geldin mesajı atarken, başka bir mod aynı anda oyuncuya başlangıç arabası verebilir. runEvent arka planda her iki scripti de sırayla çalıştırır.

### Örnek kod

```lua

-- Birinci script: Karşılama mesajı
server.on("onPlayerJoin", function(playerId)
    server.sendMessage(playerId, "Sunucuya hoş geldin!")
end)

-- İkinci script: Log kaydı
server.on("onPlayerJoin", function(playerId)
    server.consoleLog("Oyuncu katıldı, ID: " .. playerId)
end)

```