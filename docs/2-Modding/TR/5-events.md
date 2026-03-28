# Event Sistemi (Olaylar)

Drivionline sunucusunda birçok sistem **Event (Olay)** mantığıyla çalışır. Bir oyuncu sunucuya bağlandığında, sunucudan ayrıldığında, bir bölgeye (marker) girdiğinde veya bir araca bindiğinde C# arka ucu (backend) Lua scriptlerine otomatik olarak bir tetikleyici gönderir.

Bir olayı dinlemek ve o olay gerçekleştiğinde kod çalıştırmak için `server.on()` fonksiyonunu kullanırız.

---

## 1. Sistem ve Mod Olayları
``onServerStart``

Scriptler yüklendiğinde veya /refreshmods yapıldığında bir kez çalışır.

```lua

server.on("onServerStart", function()
    server.consoleLog("Sistem Baslatildi: Tum scriptler ve tablolar yuklendi.")
end)

```

## 2. Oyuncu Bağlantı Olayları

``onPlayerJoin``

Oyuncu bağlandığında ve "ready" (hazır) olduğunda tetiklenir.

```lua

server.on("onPlayerJoin", function(playerId)
    server.sendMessage(playerId, "Giris Yaptin! Senin ID: " .. tostring(playerId))
end)

```

``onPlayerQuit``

Oyuncu oyunu kapattığında veya bağlantısı koptuğunda çalışır.

```lua

server.on("onPlayerQuit", function(playerId)
    server.consoleLog("Oyuncu Ayrildi: " .. tostring(playerId))
end)

```

## 3. Araç ve Teknik İstek Olayları

``onVehicleRequest``

Godot istemcisi üzerinden bir araca binme veya spawn talebi geldiğinde çalışır.

```lua

server.on("onVehicleRequest", function(playerId, carName, requestedId, isBroadcast)
    local info = string.format("Arac Istegi -> Model: %s, ID: %s, Herkes Gorsun: %s", 
        carName, tostring(requestedId), tostring(isBroadcast))
    server.sendMessage(playerId, info)
end)

```


## 4. Arayüz ve Ham Veri Olayı

``onGuiCallback``

Godot'tan gelen TÜM ham veriler buraya düşer. ui_helper.lua kütüphanesinin kalbidir.

```lua

server.on("onGuiCallback", function(playerId, message)
    -- 'message' ham JSON stringidir. Parametreleri gormek icin decode etmelisin.
    local data = server.jsonDecode(message)
    server.sendMessage(playerId, "Gelen Ham UI Mesaji: " .. message)
end)

```