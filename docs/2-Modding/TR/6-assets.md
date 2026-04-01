# Asset yaratma ve temel asset kontrolleri

Bu dökümantasyon'da temel assets helperini ve asset hareket ettirmeyi göreceğiz.

## 1. Hızlı Başlangıç

İlk scriptimizi yazalım.
Dökümandaki tüm eklemeler ilk koyduğum uzun script üzerinden düzenlenecektir.
Tüm testlerden önce "B" tuşuna basmayı unutmayınızki önce obje yaratılsın 

> **ÖNEMLİ BİLGİ: GLOBAL SENKRONİZASYON (isPersistent)**
> Bu dökümandaki tüm `assets` fonksiyonlarının (create, move, rotate, anim, remove vb.) en sonunda gizli bir `isPersistent` parametresi vardır.
> Varsayılan olarak bu değer **true** kabul edilir. Yani oluşturduğunuz, hareket ettirdiğiniz veya sildiğiniz bir obje **sunucudaki tüm oyuncularda** eşzamanlı olarak görünür/değişir. Yeni giren oyuncular da bu objeleri otomatik olarak görür.
> Eğer bir işlemin *sadece o oyuncunun ekranında* olmasını istiyorsanız, fonksiyonun en son parametresine `false` yazmalısınız.

### İlk Assetinizi Oluşturun

Oyuncular "B" tuşuna bastığında dünyada bir obje yaratalım.

### Kullanacağımız API'ler

`assets.create`
    Dünyada fiziksel bir nesne (mesh) oluşturur.

    Parametreler: playerId, id (benzersiz isim), modelName, x, y, z, rx, ry, rz, collision (true/false).

    Özellik: collision belirtilmezse varsayılan olarak true (katı obje) kabul edilir.

    Not: Parametrelerdeki "benzersiz isim" kısmına istediğiniz ismi girebilirsiniz.

    Not: modelName: info.json içindeki "contents" kısmında yazan isim (Örn: "sokak_lambasi").

`server.bindKey`
    Bir oyuncunun klavyesindeki belirli bir tuşu sunucu taraflı bir Lua fonksiyonuna bağlar. Oyuncu tuşa bastığında, atanan fonksiyon sunucu üzerinde anında tetiklenir. 

    Parametreler: playerId, key (String formatında tuş ismi, örn: "F2", "K"), callback (Tuşa basıldığında çalışacak fonksiyon). 


### basit bir obje yaratma örneği aşağıdadır. Bu scriptin sonucu sahnede `x: 1, y: 0, z: 1` kordinatında mesh(nesne) oluşacaktır.

```lua

local hediye_asset = "hediye"
local hediye_unid = "suprise"

server.on("onPlayerJoin", function(playerId)
    server.bindKey(playerId, "B", function(id)

        assets.create(id, hediye_unid, hediye_asset, 1,2,1)
    end)
end)

```


## 2. Şimdi bu scriptimize basit bir `trigger` kontrol mekanizması ekleyelim.

### Kullanacağımız API'ler

`assets.createTrigger`
    Oyuncunun girip çıkabileceği, içinden geçilebilen bir sensör alanı oluşturur.

    Parametreler: playerId, id, modelName, x, y, z, radius.

    Not: Bu nesne her zaman has_collision = false olarak yaratılır.

### Örnek marker kontrol kodu aşağıdaki gibidir

```lua

local hediye_asset = "hediye"
local hediye_unid = "suprise"

local marker_asset = "marker"
local marker_unid = "markerim"

server.on("onPlayerJoin", function(playerId)
    -- oyuncu girdiğinde bir marker oluşturuyoruz
    assets.createTrigger(playerId, marker_unid, marker_asset, 2, 0, 2, 2.0)

    server.bindKey(playerId, "B", function(id)
        --eski kodumuzdaki parça
        assets.create(id, hediye_unid, hediye_asset, 1,0,1)

    end)
end)

server.on("onGuiCallback", function(playerId, jsonStr)
    --godot'dan gelen veriyi API kullanarak lua tablosuna dönüştürüyoruz
    --örnek veri tipi: {"cmd":"trigger_exit","id":"markerim"}

    local data = server.jsonDecode(jsonStr)

    --gelen verinin markerin unid'si ile uyuşup uyuşmadığına bakıyoruz.
    if data.id == marker_unid then
        
        --gelen verideki komut tipinin enter veya exit olduğuna bakıyoruz.
        if data.cmd == "trigger_enter" then
            
            server.sendMessage(playerId, "hoşgeldiniz")

        elseif data.cmd == "trigger_exit" then

            server.sendMessage(playerId, "görüşüsüz")
        
        end
        -- NOT: burada elseif kullanma sebebimiz
        -- eğer gelen veri "trigger_enter" değilse "trigger_exit" mi diye bakmak
        -- yoksa görüşürüz mesajı asla gidemezdi çünkü sinyal tek yönlü geliyor.

    end
end)

```

---

## 3. Şimdi bu trigger sistemimizi objeyi hareket ettirmek için kullanalım.

### Kullanacağımız API'ler

`assets.move`
    Bir nesneyi bir noktadan diğerine akıcı bir şekilde (Tween) taşır.

    Parametreler: playerId, id, x, y, z, time (saniye), ease ("linear" veya "sine").

### Kodda değişecek parça

```lua

server.on("onGuiCallback", function(playerId, jsonStr)

    local data = server.jsonDecode(jsonStr)

    if data.id == marker_unid then
        
        if data.cmd == "trigger_enter" then

            -- burada 1, 4, 1 olan kısım objenin olduğu yerden nereye gitmesi gerektiğinin parametresidir: x y z
            -- 1.0 olan kısım ise objenin hedeflenen konuma kaç saniyede ulaşması gerektiğidir.
            -- "linear" ise objenin ne tipte konuma ulaşacağıdır. 
            -- linear: düz bir çizgide ilerler. hızlanma veya yavaşlama yoktur.
            -- sine: yumuşak ve başta yavaş sonda yavaş ortada hızlanacak şekilde ilerler. market kapısı gibi yerlere iyi gider

            assets.move(playerId, hediye_unid, 1, 1, 1, 1.0, "linear")

        elseif data.cmd == "trigger_exit" then
            
            -- yukarıdaki durum buradada aynı. sadece eski konumuna çekiyoruz

            assets.move(playerId, hediye_unid, 1, 0, 1, 1.0, "linear")
        
        end
    end
end)

```

---

## 4. Şimdi koda objenin rotasyonunu değiştirme de ekleyelim.

### API

`assets.rotate`
    Bir nesneyi kendi ekseni etrafında, belirtilen derecelerde akıcı bir şekilde (Tween kullanarak) döndürür.

    Parametreler: playerId, id, rx (X açısı), ry (Y açısı), rz (Z açısı), time (saniye), ease ("linear" veya "sine").

    Teknik detay: Sen Lua da derece (0-360) yazarsın, sistem bunu otomatik olarak Godot nun anladığı radyan birimine çevirir.

### Örnek kod

```lua

server.on("onGuiCallback", function(playerId, jsonStr)

    local data = server.jsonDecode(jsonStr)

    if data.id == marker_unid then
        
        if data.cmd == "trigger_enter" then

            assets.move(playerId, hediye_unid, 1, 1, 1, 1.0, "linear")
            --burada hediye_unid zaten dönderilecek objenin takma id'sidir.
            -- 0, 100, 0 olan kısım hedef rotasyondur. X Y Z
            -- 3.0 saniye cinsinden hedef rotasyona ulaşmak için gereken süredir
            -- "sine" ise objenin ne tipte konuma ulaşacağıdır. 
            -- linear: düz bir çizgide ilerler. hızlanma veya yavaşlama yoktur.
            -- sine: yumuşak ve başta yavaş sonda yavaş ortada hızlanacak şekilde ilerler. market kapısı gibi yerlere iyi gider

            assets.rotate(playerId, hediye_unid, 0, 100, 0, 3.0, "sine")

        elseif data.cmd == "trigger_exit" then

            assets.move(playerId, hediye_unid, 1, 0, 1, 1.0, "linear")

            --burada yine objeyi eski rotasonuna alıyoruz.
            assets.rotate(playerId, hediye_unid, 0, 0, 0, 3.0, "sine")

        end
    end
end)

```

---

## 5. Animasyon oynatma

Kodumuza animasyon oynatma desteği ekleyelim

### API

`assets.anim`
    Bir nesnenin (.glb dosyasının) içine gömülü olan hazır animasyonları oynatır.

    Parametreler: playerId, id, animName (Klip adı[ÇOK ÇOK önemli NOTU OKU]), speed (Oynatma hızı), reverse (true veya false).

    Gereksinim: Nesne modelinin içinde bir AnimationPlayer bulunmalıdır; sistem bu düğümü otomatik olarak bulur ve animasyonu başlatır.

    reverse parametresi animasyonu geri sarmak içindir.

    Eğer modeli bir modelleme programından örn: Blender export ettiyseniz ve blenderde bu meshe animasyon atadıysanız,
     otomatik olarak godot tarafında animasyon nodesi hazırlanır

### Örnek kod

# ÇOK ÖNEMLİ NOT: ANİMASYON İSMİ ör: "Cube_001Action" VERİRKEN ŞUNA ÇOK DİKKAT EDİN:

Eğer modele Blender'de bir animasyon yaptıysanız kesinlikle meshin yanındaki ok tuşuna basın ve childlerine bakın. Animation un da childlerine bakın ve orada 
NLA Tracks yazan birşeyin üstünde bir node var o animasyonun adıdır. kesinlike içinde . veya , gibi semboller bırakmayın. eğer bırakmak zorundaysanız şuna dikkat edin: ÖRN: animasyon adı Cube.001Action ise kesinlikle kodda anim kısmına isim girerken `"Cube_001Action"` yazınız. Çünkü modeller godotta import edilirken isimlerdeki "." gibi yerler "_" dönüştürülür. Buna KESİNLİKLE dikkat ediniz.


```lua

server.on("onGuiCallback", function(playerId, jsonStr)

    local data = server.jsonDecode(jsonStr)

    if data.id == marker_unid then
        
        if data.cmd == "trigger_enter" then

            assets.move(playerId, hediye_unid, 1, 1, 1, 1.0, "linear")
            assets.rotate(playerId, hediye_unid, 0, 100, 0, 3.0, "sine")

            --hediye_unid yine oynatılacak nesnenin unique id'si
            --"Cube_001Action" ise oynatılacak animasyonun adı.
            --BU ANİMASYON OYNATMA KISMINA ÇOK ÖNEMLİ DEĞİNMEM LAZIM LÜTFEN ÜSTTEKİ YAZIYI OKU!
            assets.anim(playerId, hediye_unid, "Cube_001Action", 1.0, false)

        elseif data.cmd == "trigger_exit" then

            assets.move(playerId, hediye_unid, 1, 0, 1, 1.0, "linear")
            assets.rotate(playerId, hediye_unid, 0, 0, 0, 3.0, "sine")
            assets.anim(playerId, hediye_unid, "Cube_001Action", 1.0, true)

        end
    end
end)

```

---

## 6. Objeyi silmek

Bu kısımda objeyi silmek için örnek kod vereceğiz.
Oyuncu "G" tuşuna bastığında "B" tuşu ile oluşturduğumuz kutu 3 saniye sonra silinecek.

### API

`server.setTimer`
    Belirlenen bir süre sonunda bir fonksiyonu çalıştırır. İsteğe bağlı olarak bu işlemi sonsuz döngüye sokabilir. 

    ms (Milisaniye): İşlemin ne kadar süre sonra gerçekleşeceğini belirler.  (Örnek: 1000 = 1 saniye, 5000 = 5 saniye). 

    callback (Fonksiyon): Süre dolduğunda çalışacak olan Lua fonksiyonudur. 

    loop (Döngü): true yapılırsa timer her dolduğunda tekrar başlar; false (varsayılan) yapılırsa sadece bir kez çalışır ve durur.

`assets.remove`
    Dünyada var olan bir objeyi kalıcı olarak siler. (Eğer global yaratıldıysa herkesten silinir).

    Parametreler: playerId, id (silinecek objenin benzersiz ismi), isPersistent (opsiyonel, varsayılan true).

### Örnek kod

```lua

server.on("onPlayerJoin", function(playerId)

    assets.createTrigger(playerId, marker_unid, marker_asset, 2, 0, 2, 2.0)
    server.bindKey(playerId, "B", function(id)

        assets.create(id, hediye_unid, hediye_asset, 1,0,1)

    end)

    server.bindKey(playerId, "G", function(id)
    
        server.setTimer(3000, function()
        
            assets.remove(playerId, hediye_unid)
        
        end, false)
    
    end)
end)


```

---


# Ve bunların hepsi ile birlikte final scriptimiz

```lua

local hediye_asset = "hediye"
local hediye_unid = "suprise"

local marker_asset = "marker"
local marker_unid = "markerim"

server.on("onPlayerJoin", function(playerId)

    assets.createTrigger(playerId, marker_unid, marker_asset, 2, 0, 2, 2.0)
    server.bindKey(playerId, "B", function(id)

        assets.create(id, hediye_unid, hediye_asset, 1,0,1)

    end)

    server.bindKey(playerId, "G", function(id)
    
        server.setTimer(3000, function()
        
            assets.remove(playerId, hediye_unid)
        
        end, false)
    
    end)
end)



server.on("onGuiCallback", function(playerId, jsonStr)

    local data = server.jsonDecode(jsonStr)

    if data.id == marker_unid then
        
        if data.cmd == "trigger_enter" then

            assets.move(playerId, hediye_unid, 1, 1, 1, 1.0, "linear")
            assets.rotate(playerId, hediye_unid, 0, 100, 0, 3.0, "sine")
            assets.anim(playerId, hediye_unid, "Cube_001Action", 1.0, false)

        elseif data.cmd == "trigger_exit" then

            assets.move(playerId, hediye_unid, 1, 0, 1, 1.0, "linear")
            assets.rotate(playerId, hediye_unid, 0, 0, 0, 3.0, "sine")
            assets.anim(playerId, hediye_unid, "Cube_001Action", 1.0, true)

        end
    end
end)

```

---

## 7. Objeyi Bir Oyuncuya/Araca Sabitlemek (Stick)

Bir objeyi yarattıktan sonra onu bir oyuncuya zımbalayabilirsiniz (Örneğin oyuncunun eline çanta vermek veya kafasına şapka takmak).

### API

`assets.stick`
    Bir nesneyi belirtilen hedefe (targetPlayerId) yapıştırır. Hedef hareket ettikçe obje de onunla hareket eder.

    Parametreler: playerId, id (objenin id'si), targetPlayerId (yapışacağı oyuncu/hedef), lx, ly, lz (hedefe olan X,Y,Z uzaklığı/ofseti), rx, ry, rz (objenin rotasyonu), attachType (yapışma tipi/kemik adı), isPersistent.

### Örnek Kod

```lua

server.on("onPlayerJoin", function(playerId)
    server.bindKey(playerId, "H", function(id)
        -- Önce şapkayı yaratıyoruz (Kordinatların çok önemi yok, çünkü hemen yapıştıracağız)
        assets.create(id, "oyuncu_sapka", "sapka_model", 0, 0, 0)
        
        -- 0.5 saniye bekleyip objeyi oyuncunun kafasına zımbalıyoruz
        -- (Objenin godot tarafında yüklenmesine kısa bir süre tanımak sağlıklı olur)
        server.setTimer(500, function()
            -- lx, ly, lz ayarları ile şapkanın tam kafaya oturması için ofset (kaydırma) veriyoruz.
            assets.stick(id, "oyuncu_sapka", id, 0, 1.8, 0, 0, 0, 0, "head")
        end, false)
    end)
end)

```