## Ses Sistemi API 

3D ses/müzik sistemini yöneten API'ler 

---

### API

``world.playSound``
> * Belirtilen URL'deki ses veya müzik dosyasını 3D dünyada oynatır ve tüm oyunculara senkronize bir şekilde yayınlar.
> * Parametreler: 
> * `attachId`: Sese verilecek benzersiz kimlik (genelde aracı veya oyuncuyu temsil eden playerId kullanılır).
> * `url`: Oynatılacak ses dosyasının veya yayının bağlantı adresi.
> * `x`, `y`, `z`: Ses kaynağının bulunacağı 3D koordinatlar.
> * `dist`: Sesin duyulabileceği maksimum uzaklık (mesafe).
> * `startMs`: Sesin başlangıç zamanı. Oyuncuların aynı saniyeyi dinlemesi için `server.getTimestamp()` ile alınarak gönderilir.

``world.setEq``
> * Halihazırda çalan bir sesin bas, tiz ve genel ses seviyesini (volume) günceller ve tüm oyunculara eşitler.
> * Parametreler: 
> * `attachId`: Ayarları güncellenecek sesin kimliği.
> * `bass`: Bas seviyesi (Örn: -24.0 ile 24.0 arası).
> * `treble`: Tiz seviyesi (Örn: -24.0 ile 24.0 arası).
> * `vol`: Ana ses seviyesi (Örn: 0.0 ile 100.0 arası).

``world.stopSound``
> * Belirtilen kimliğe sahip sesi durdurur ve tüm oyuncuların sisteminden tamamen kaldırır.
> * Parametreler: 
> * `attachId`: Durdurulacak sesin kimliği.

#### Örnek Kullanım

```lua
-- Sesi başlatma
local pos = world.getPlayerPosition(playerId)
world.playSound(tostring(playerId), "https://...", pos.x, pos.y, pos.z, 150.0, server.getTimestamp())

-- Sesi ve EQ ayarlarını güncelleme
world.setEq(tostring(playerId), 12.0, -5.0, 80.0)

-- Sesi durdurma
world.stopSound(tostring(playerId))

```

