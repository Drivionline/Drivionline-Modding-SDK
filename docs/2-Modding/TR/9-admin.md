# Admin Yönetimi ve Ban, Kick Olayları

Bu bölümde sunucunuzdaki oyuncuları yönetmek için kullanabileceğiniz Admin API'lerini göreceğiz.

---

## 1. Ban ve Kick İşlemleri

Oyuncuları sunucudan atmak veya geçici/kalıcı olarak uzaklaştırmak için kullanılır.

### API'ler

`server.admin.banPlayer(dbId, "sebep", süre)`
> Ban atar.
> **Parametreler:** `dbId` (Oyuncunun kalıcı ID'si), `"sebep"` (Ban sebebi), `süre` (Dakika cinsinden)

`server.admin.kickPlayer(playerId, "sebep")`
> Oyuncuyu oyundan atar.
> **Parametreler:** `playerId` (DbId değil, ağdaki playerId!), `"sebep"` (Atılma sebebi)

### Örnek Kullanım

```lua
-- Belirli bir DbId'yi 24 saatliğine (1440 dakika) banlama
server.admin.banPlayer(15, "Hile kullanımı tespit edildi", 1440)

-- Ağdaki aktif bir playerId'yi oyundan atma
server.admin.kickPlayer(3, "Çok fazla küfür ettin")
```

---

## 2. Ban Kaldırma İşlemi

Banlanmış bir oyuncunun cezasını erken bitirmek için kullanılır.

### API

`server.admin.unbanPlayer(dbId)`
> Oyuncunun banını kaldırır.
> **Parametreler:** `DbId` (Kalıcı veritabanı ID'si)

### Örnek Kullanım

```lua
-- DbId'si 15 olan oyuncunun banını açma
server.admin.unbanPlayer(15)
```

---

## 3. Listeleme İşlemleri (Aktif Oyuncular ve Banlılar)

Sunucudaki mevcut oyuncuları veya veritabanındaki banlıları liste halinde (JSON olarak) çekmenizi sağlar.

### API'ler

`server.admin.getActivePlayers()`
> Sunucudaki aktif oyuncuların listesini JSON döner. İçeriği: `playerId`, `dbId`, `username`, `nickname`.

`server.admin.getAllBans()`
> Veritabanındaki tüm banlı oyuncuları JSON döner. İçeriği: `DbId`, `Reason`, `UnbanTime`.

### Örnek Kullanım (Aktif Oyuncuları Çekme)

*Not: Çekilen veriyi döngüye sokabilmek için `server.jsonDecode` kullanmayı unutmayın.*

```lua
-- Sunucudaki oyuncuları konsola yazdırma örneği
local playersJson = server.admin.getActivePlayers()
local players = server.jsonDecode(playersJson)

for i, p in pairs(players) do
    server.consoleLog("Oyuncu: " .. p.nickname .. " | Username: " .. p.username .. " | DbId: " .. p.dbId)
end
```

### Örnek Kullanım (Banlıları Çekme)

```lua
-- Banlı listesini çekip işleme örneği
local bansJson = server.admin.getAllBans()
local bannedPlayers = server.jsonDecode(bansJson)

for i, ban in pairs(bannedPlayers) do
    server.consoleLog("Banlı DbId: " .. ban.DbId .. " | Sebep: " .. ban.Reason)
end
```

---

## 4. Oyuncu Bilgilerini Sorgulama

ID numaralarını kullanarak oyuncuların isim, takma ad gibi veritabanı kayıtlarına ulaşmanızı sağlar.

### API'ler

`server.getPlayerUsername(playerId)`
> Sadece o an oyunda olan `playerId` ile oyuncunun Usernamesine erişir.

`server.getPlayerNameByDbId(DbId)`
> `DbId` kullanarak veritabanından oyuncunun oyun içi ismini (Nickname) çeker.

`server.getPlayerUsernameByDbId(DbId)`
> `DbId` kullanarak veritabanından oyuncunun kullanıcı adını (Username) çeker.

### Örnek Kullanım

```lua
-- DbId üzerinden oyuncu detaylarını öğrenme
local targetDbId = 42

local nickname = server.getPlayerNameByDbId(targetDbId)
local username = server.getPlayerUsernameByDbId(targetDbId)

server.consoleLog("Sorgulanan Oyuncu: " .. nickname .. " (" .. username .. ")")
```
