# Obje ve Asset Yönetimi Hakkında Bilgiler (AssetPack Sistemi)

Bu dökümanda sunucudaki modlu objelerin (Assetlerin) nasıl çalıştığını, haritaya nasıl ekleneceğini ve araç sisteminden farklı olarak neden "AssetPack" mantığını kullandığımızı göreceğiz.

## AssetPack Nedir ve Neden Var?

Araç modlarında her ZIP dosyasının içinde tek bir araba bulunur ve `info.json` içindeki `"id"` (örneğin: `car_123`) kullanılarak çağrılır. 

Ancak objelerde (marker, sokak lambası, çöp kutusu, garaj kapısı vb.) her ufak model için ayrı ayrı ZIP dosyası indirmek hem sunucuyu hem de oyuncunun indirme süresini yorar. Bu yüzden **AssetPack** (Obje Paketi) sistemini kullanıyoruz. Bir AssetPack modunun içine tek bir ZIP ile onlarca farklı model koyabiliriz.

İstemci (oyun), tipi `AssetPack` olan bir mod yüklediğinde ana mod ID'sine bakmaz. Bunun yerine `info.json` içindeki `"contents"` kısmına bakar ve oradaki isimleri obje olarak hafızasına kaydeder.

### Örnek bir AssetPack `info.json` dosyası:

```json
{
  "id": "sehir_paketi_1",
  "name": "Şehir Eşyaları",
  "type": "AssetPack", 
  "contents": {
    "cop_kutusu": "modeller/cop.glb",
    "sokak_lambasi": "modeller/lamba.glb",
    "park_banki": "modeller/bank.glb"
  }
}
```

Yukarıdaki örnekte modun asıl ID'si olan `sehir_paketi_1` ismini Lua tarafında **hiçbir zaman kullanmayacağız**. Objeleri yaratırken sadece `"contents"` altındaki isimleri (`cop_kutusu`, `sokak_lambasi`, `park_banki`) kullanacağız.

---

## Objeleri Haritada Yaratmak

AssetPack içindeki bir objeyi dünyaya yerleştirmek için `assets.create` API'sini kullanıyoruz.

Bkz: https://drivionline.com/docs/?lang=TR&class=2+-+Modding&doc=6-assets.md#asset-yaratma-ve-temel-asset-kontrolleri

### API

`assets.create(playerId, uniqueId, assetName, x, y, z, rx, ry, rz, collision)`

	Özellikleri:
		- playerId: Objeyi görecek olan oyuncunun kimlik numarası.
		- uniqueId: Bu objeye senin verdiğin benzersiz isim (Örn: "kapi_1", "lamba_5"). Silmek veya hareket ettirmek için bu id'yi kullanacaksın.
		- assetName: info.json içindeki "contents" kısmında yazan isim (Örn: "sokak_lambasi").
		- x, y, z: Objenin dünyadaki koordinatları.
		- rx, ry, rz: (Opsiyonel) Objenin dönüş açıları (Derece cinsinden).
		- collision: (Opsiyonel) Objenin katı olup olmadığı, içinden geçilip geçilemeyeceği (true/false). Belirtilmezse varsayılan true'dur.


### Örnek kod

```lua
server.on("onPlayerJoin", function(playerId)
    
    -- Oyuncu girdiğinde karşısına bir sokak lambası ve çöp kutusu koyalım.
    
    -- DİKKAT: "sehir_paketi_1" DEĞİL, contents içindeki "sokak_lambasi" ismini kullanıyoruz!
    assets.create(playerId, "benim_lambam_1", "sokak_lambasi", 10, 0, 15)
    
    -- Biraz yanına çöp kutusu koyalım ve collision'ı kapatalım (içinden geçilebilsin)
    assets.create(playerId, "benim_cop_kutum", "cop_kutusu", 12, 0, 15, 0, 0, 0, false)
    
end)
```

---

## Sık Yapılan Hatalar (Çalışmıyor Sorunu)

Eğer `assets.create` kodunu yazdığınız halde obje sahnede belirmiyorsa, muhtemelen modun ana `id` değerini girmeye çalışıyorsunuzdur. 

Örneğin, aşağıdaki gibi bir marker paketimiz olsun:

```json
{
  "id": "marker_1",
  "name": "islevsel",
  "type": "AssetPack", 
  "contents": {
    "marker": "marker/marker.glb"
  }
}
```

**YANLIŞ KULLANIM:**
Bir marker yaratmak için modun ana id'sini (`marker_1`) kullanmak:

```lua
-- HATA: marker_1, info.json içindeki ana id'dir. İstemci bunu obje olarak tanımaz.
local SENSOR_ASSET = "marker_1" 
assets.createTrigger(playerId, "sensor_1", SENSOR_ASSET, 5, 0, 5, 3.0)
```

**DOĞRU KULLANIM:**
Marker yaratmak için `"contents"` içindeki anahtarı (`marker`) kullanmak:

```lua
-- DOĞRU: contents içinde "marker" yazıyordu, obje ismi olarak onu kullanmalıyız.
local SENSOR_ASSET = "marker" 
assets.createTrigger(playerId, "sensor_1", SENSOR_ASSET, 5, 0, 5, 3.0)
```

Bu sistem sayesinde tek bir mod indirterek (örneğin sadece 1 megabaytlık bir ZIP dosyası ile) haritadaki yüzlerce farklı objeyi rahatlıkla yönetebilir ve çağırabilirsiniz.