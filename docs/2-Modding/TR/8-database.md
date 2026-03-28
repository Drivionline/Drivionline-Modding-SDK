# Database İşlemleri Ve Notlar

Drivionline, tüm kalıcı verileri yönetmek için merkezi bir SQLite veritabanı (server.sqlite) kullanır. Geliştiriciler, oyuncu verilerini saklamak, özel sistemler (ekonomi, envanter vb.) kurmak veya mevcut tabloları sorgulamak için katmana sahiptir: **SQL API.**

## 1. Notlar

### 1.1 Veritabanı Mimarisi
Sunucu başlatıldığında aşağıdaki temel tablolar otomatik olarak yapılandırılır:

KeyValueStore: JSON formatında esnek veri saklama alanı.

```text
Players: Oyuncu rolleri ve temel hesap bilgilerini içeren tablo.
    -DbId: Oyuncunun ana id'si
    -Role: Oyuncunun rolü
    -Username: Oyuncunun ana kullanıcı adı
```

```text
Bans: Sunucu güvenlik ve yasaklama kayıtları.
    DbId: Banlanan oyuncunun kullanıcı adı
    Reason: Banlanma sebebi
    Bantime: Banlanma zamanı
    UnbanTime Ban'ın bitiş zamanı
```

### 1.2 Veri Saklama Yöntemleri

SQL API (Raw SQL)
Kendi tablolarını oluşturmak veya karmaşık sorgular çalıştırmak isteyen geliştiriciler için doğrudan erişim sağlar.

server.dbExecute(query, params): Veri ekleme, güncelleme veya tablo oluşturma işlemleri için kullanılır. Etkilenen satır sayısını döndürür.

server.dbQuery(query, params): Veri çekme işlemleri için kullanılır. Sonuçları bir Lua tablosu (JSON Array) olarak döndürür.

### 1.3 Güvenlik ve SQL Injection Koruması
Veritabanı güvenliği için tüm dinamik veriler parametreli sorgular ile iletilmelidir. Değerleri doğrudan SQL metnine birleştirmek (string concatenation) yerine, @ veya $ ön ekiyle parametre tablosu kullanılmalıdır.

Güvenli Kullanım Örneği:

```lua

local dbid = server.getPlayerDbId(playerId)
local params = { 
    ["@role"] = "admin",
    ["@id"] = dbid 
    }

server.dbExecute("UPDATE Players SET Money = @para WHERE DbId = @id", params)

```

### 1.4 Desteklenen Veri Tipleri (SQLite)
SQL sorgularında sütun tanımlarken aşağıdaki tipler referans alınmalıdır:

INTEGER: Tam sayılar (ID, miktar, zaman damgası).

TEXT: Metin verileri ve JSON blokları.

REAL: Ondalıklı sayılar (Koordinatlar, hız verileri).

NULL: Boş değerler.

### 1.5 Önemli Notlar ve Kısıtlamalar
Transaction Yönetimi: SQLite dosya tabanlı bir sistemdir; yoğun yazma işlemlerinde performans için sorguların optimize edilmesi önerilir.

Tablo Yönetimi: Mod geliştiricileri CREATE TABLE IF NOT EXISTS komutuyla kendi özel tablolarını oluşturabilirler.

Otomatik ID: PRIMARY KEY AUTOINCREMENT özelliği, eklenen her satır için benzersiz bir kimlik oluşturulmasını sağlar.

### 1.6 SQL Temel Komutları Rehberi (Lua API Kullanımı)

#### 1.6.1 Veri Çekme (`SELECT`)
Veritabanından bilgi okumak için `server.dbQuery` kullanılır. Bu fonksiyon her zaman bir tablo (liste) döndürür. En çok oyuncu parası, seviyesi veya sıralama listesi yaparken işe yarar.

```lua
-- 1. Tüm oyuncuların isimlerini ve paralarını getir (Parametreye gerek yok)
local tum_oyuncular = server.dbQuery("SELECT Username, money FROM Players")

-- 2. GÜVENLİ KULLANIM: Parası belli bir miktardan çok olan "admin"leri getir
local params = { 
    ["@hedef_para"] = 5000, 
    ["@aranan_rol"] = "admin" 
}
local zengin_adminler = server.dbQuery("SELECT * FROM Players WHERE money > @hedef_para AND Role = @aranan_rol", params)

-- 3. En zengin 10 oyuncuyu parasına göre sırala (Zenginden fakire)
local top10 = server.dbQuery("SELECT Username, money FROM Players ORDER BY money DESC LIMIT 10")
```

#### 1.6.2 Veri Güncelleme (`UPDATE`)
Mevcut bir kaydı değiştirmek için `server.dbExecute` kullanılır. Oyuncu para kazandığında veya rütbe atladığında bunu kullanırsın. **DİKKAT:** `WHERE` kullanmazsan herkesin verisi değişir!

```lua
-- 1. ID'si 5 olan oyuncunun parasını 100 arttır
local para_params = { 
    ["@eklenecek"] = 100, 
    ["@hedef_id"] = 5 
}
server.dbExecute("UPDATE Players SET money = money + @eklenecek WHERE DbId = @hedef_id", para_params)

-- 2. Bir oyuncuyu banlı olarak işaretle
local ban_params = { 
    ["@sebep"] = "Hile Kullanımı", 
    ["@hedef_id"] = 10 
}
server.dbExecute("UPDATE Bans SET Reason = @sebep WHERE DbId = @hedef_id", ban_params)
```

#### 1.6.3 Yeni Veri Ekleme (`INSERT` / `REPLACE`)
Veritabanına yeni bir satır ekler. SQLite'da `REPLACE` komutu, eğer o ID (veya Key) varsa günceller, yoksa yeni oluşturur (Hayat kurtarır).

```lua
-- 1. Yeni bir oyuncu kaydı aç
local kayit_params = { 
    ["@id"] = 15, 
    ["@isim"] = "HizliSofor", 
    ["@rol"] = "user" 
}
server.dbExecute("INSERT INTO Players (DbId, Username, Role) VALUES (@id, @isim, @rol)", kayit_params)

-- 2. Kayıt varsa güncelle, yoksa yeni oluştur (Key-Value sistemi gibi çalışır)
local kv_params = { 
    ["@anahtar"] = "sunucu_mesaji", 
    ["@deger"] = "Hoş geldiniz!" 
}
server.dbExecute("REPLACE INTO KeyValueStore (Key, Value) VALUES (@anahtar, @deger)", kv_params)
```

#### 1.6.4 Veri Silme (`DELETE`)
Bir satırı tamamen yok eder. Ban kaldırmak veya eski kayıtları temizlemek için kullanılır.

```lua
-- 1. Belirli bir oyuncunun banını kaldır
local unban_params = { 
    ["@hedef_id"] = 5 
}
server.dbExecute("DELETE FROM Bans WHERE DbId = @hedef_id", unban_params)

-- 2. KeyValueStore tablosundaki belirli bir ayarı sil
local ayar_params = { 
    ["@silinecek_anahtar"] = "eski_etkinlik" 
}
server.dbExecute("DELETE FROM KeyValueStore WHERE Key = @silinecek_anahtar", ayar_params)
```

#### 1.6.5 Tablo Yapısını Değiştirme (`ALTER TABLE`)
Tabloyu silmeden yeni bir sütun (özellik) eklemek için kullanılır. 
*(Not: SQL kuralları gereği tablo veya sütun isimleri parametre `@` ile belirtilemez. Bu yüzden bu komutlar doğrudan çalıştırılır.)*

```lua
-- 1. Players tablosuna "Level" adında bir sayı sütunu ekle (Varsayılan 1 olsun)
server.dbExecute("ALTER TABLE Players ADD COLUMN Level INTEGER DEFAULT 1")

-- 2. Araçlar tablosuna "Color" adında bir metin sütunu ekle
server.dbExecute("ALTER TABLE Vehicles ADD COLUMN Color TEXT DEFAULT 'White'")
```

---

**Altın İpuçları**

* **`WHERE` Unutma:** `UPDATE` ve `DELETE` yaparken komutun sonuna `WHERE` şartı eklemeyi unutursan tüm veritabanı birbirine girer, sunucu patlar.
* **`LIMIT` Kullan:** Sıralama listesi yaparken binlerce oyuncuyu çekmek sunucuyu yorar, her zaman `LIMIT 10` veya `LIMIT 50` gibi sınır koy.
* **`LIKE` ile Arama:** İsminde belirli bir kelime geçen oyuncuları bulmak istiyorsan parametrelerde `%` (yüzde) işaretini kullanmalısın.
  Örnek: `server.dbQuery("SELECT * FROM Players WHERE Username LIKE @aranan", { ["@aranan"] = "%Can%" })`

--- 

## 2. Gerçek kullanım örnekleri

Chat'e yeni bir komut ekleyeceğiz ismi ``/rol`` olacak ve örnek kullanım şu: ``/rol kadi admin``
bunu yazınca ise bu komutun argümanlarından veritabanında o oyuncuyu bulup rolünü ``admin`` yapacağız.

**DİKKAT**! Bu testi sadece test ortamında yapınız. Asla canlı ortamda rastgele birisine ``admin`` rolü vermeyiniz. Ve bu yapılan komut sadece ``admin`` rolü olanlar tarafından kullanılabilir. Testten önce kendi hesabınıza ``admin`` rolü vermeyi unutmayınız(bkz: https://drivionline.com/docs/?lang=TR&class=2+-+Modding&doc=1-intro.md#kendi-hesabiniza-admin-owner-yetkisi-nasil-verilir).


### 2.1 Veritabanı Sonuç Tablosu (Result Keys)

| Anahtar (Key) | Hangi Fonksiyonda Var? | Veri Tipi | Açıklama |
| :--- | :--- | :--- | :--- |
| **`success`** | Hem Query hem Execute | `Boolean` | İşlem SQL hatası almadan tamamlandıysa `true`, hata varsa `false` döner. |
| **`data`** | **Sadece `dbQuery`** | `Table` (Dizi) | Veritabanından gelen satırların listesidir. İlk satıra `data[1]` ile ulaşılır. |
| **`affectedRows`** | **Sadece `dbExecute`** | `Number` | İşlemden etkilenen (güncellenen, silinen veya eklenen) satır sayısıdır. |
| **`error`** | Hem Query hem Execute | `String` | **Sadece `success` false olduğunda mevcuttur.** SQL hata mesajını içerir. |

### Örnek kod

```lua

server.addCommand("rol", function(playerId, args)
    -- komuttan gelen argümanları alıyoruz
    if args[1] and args[2] then

        -- dbid'mizi alıyoruz
        local my_dbid = server.getPlayerDbId(playerId)

        -- params belirliyoruz
        local my_params = { ["@dbid"] = my_dbid }
        local result = server.dbQuery("SELECT Role FROM Players WHERE DbId = @dbid", my_params)

        if result.success and result.data[1].Role then
            local my_role = result.data[1].Role
            if my_role == "admin" then
                role_update(playerId, args)
                server.sendMessage(playerId, "You are an admin.")
            else 
                server.sendMessage(playerId, "You are NOT an admin.")
            end
        else 
            server.consoleLog("ERROR result CHECK")
        end
    end

end)

function role_update(playerId, args)
    -- güvenlik kontrolü
    if args[1] and args[2] then
        -- argümanlardan verileri çekiyoruz
        local username = args[1]
        local new_role = args[2]
        local params = { 
            ["@new_role"] = new_role,
            ["@username"] = username
        
        }
        -- veritabanı komutunu veriyoruz ve result alıyoruzki işlem başarılımı
        -- değilimi bakalım.
        local result = server.dbExecute("UPDATE Players SET Role = @new_role WHERE Username = @username", params)
        if result.success then
            -- başarılıysa sonucu gönderiyoruz.
            -- error sisteminin nasıl çalıştığını merak ediyorsanız db sorgusundaki
            -- WHERE kelimesini WERE falan yapabilirsiniz.
            server.sendMessage(playerId, string.format("Role update! new role: %s to %s", new_role, username))
        elseif result.error then
            -- hata olursa hatanın ham halini konsola basıyoruz. 
            server.consoleLog("error db execute: " .. tostring(result.error))
            server.sendMessage(playerId, "role update error")
        end
    end
end


```