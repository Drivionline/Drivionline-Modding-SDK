# Oyuncu aracının verilerine müdahele ve Element yönetimi

Bu dökümanda oyuncuların aracından nasıl veri çekilir onu göreceğiz.  
Yanında da `getElementData`, `setElementData`, `removeElementData` mantığını inceleyeceğiz.

## 1. Araç durumunu çekmek.

`B` tuşuna basıldığında tuşa basan oyuncunun aracından durum verilerini çekeceğiz.

### API

`car.requestCarState(playerId, function(playerId, data)`

    Bu API oyuncunun aracındaki durum verilerini çekmenizi sağlar.

    data. ile ulaşabileceğimiz veriler:

		"rpm": motorun rpm
		"kmh": hız
		"gear": vites
		"fuel": motorun yakıt miktarı 
		"en_health": motorun sağlığı
		"en_oil": motor yağ durumu
		"kilometer": ne kadar kilometre gittiği
		"steer_deg": direksiyon açısı

`server.bindKey`

    Bu fonksiyon, oyuncunun klavyesini doğrudan senin Lua fonksiyonlarına bağlayan ana köprüdür.

    Ne Yapar? Oyuncu o tuşa bastığında, Godot sunucuya paket atar, sunucu da Lua'daki fonksiyonunu çağırır.

    Parametreler: playerId (Kim bastı?), key (Hangi tuş? örn: "B", "F2"), callback (Hangi fonksiyon çalışsın?).

### Örnek kod

```lua

server.on("onPlayerJoin", function(playerId)

	-- oyuncu girdiğinde tuşu bind ediyoruz.
    server.bindKey(playerId, "B", function(playerId)
		-- car API den requestCarState yapıp veri çekme isteği gönderiyoruz.
        car.requestCarState(playerId, function(playerId, data)
            
			-- veriler data. üzerinden alınır.
            local speed = math.floor(data.kmh)
            local rpm = math.floor(data.rpm)

			-- oyuncuya veriyi gönderiyoruz.
            server.sendMessage(playerId, "Speed: " .. speed)
            server.sendMessage(playerId, "Rpm: " .. rpm )
        
        end)
    end)
end)


```

---

## 2. Aracın verileri ile oynamak.

Şimdi aracın durum verileri ile oynayacağız.
`B` tuşuna basınca aracın turbosu açılacak birdaha basınca kapanacak.

### API

`car.setCarState(playerId, data)`

	Aracın verileri ile oynayabilir

	Parametreler: playerId, data

		data içeriği şunun gibi olabilir:

			car.setCarState(id, {

				motor_sagligi = 100.0,
				motor_yagi = 100.0,
				mevcut_benzin = 45.0

			})

		Kontrol edebileceğiniz değişkenler:

			Motor ve Bakım:

				motor_yagi: Kalan yağ

				motor_sagligi: Motor hasarı

				clutch_health: Debriyaj sağlığı

			Yakıt ve Mesafe:

				mevcut_benzin: Depodaki yakıt

				kilometre: Toplam mesafe

				tuketim_100km: Araç tüketimi

				toplam_yakilan: Harcanan yakıt

				Performans (Turbo):

				turbo_on: Turbo aktif

				turbo_max_psi: Maksimum basınç

				turbo_spool_rate: Dolma hızı

				turbo_rpm_bonus: Redline bonusu

			Işıklar ve Sinyaller:

				farlar_acik: Far durumu

				fren_lambasi_yansin: Fren lambası

				geri_vites_lambasi_yansin: Geri lambası

				korna_caliyor: Korna durumu

				sinyal_durumu: Sinyal yönü (-1 = sol, 1 = sağ, 2 = dörtlü)

			Lastikler:

				tire_wear: Aşınma (Tablo)

				tire_types: Lastik türü (Tablo)


			UYARI: (Tablo olanları tire_wear = { fl = 0.5, fr = 0.5... } şeklinde Lua tablosu olarak göndermen gerekir.)

`server.setElementData(elementId, key, value, broadcast)`

	Özellikleri: 
		-elementId, obje veya oyuncu fark etmez bir değer alır.
			Oyunculara geçiçi bir veri takmak için bunu kullanabilirsiniz.
			elementId parametresine playerId verebilirsiniz. bu size kalmış.

		-key parametresi ise string formatında (örnek: "meslek") alır.

		-value ise bool, string, float, int farketmeksizin alabilir
			örnek: "polis" veya 100 veya 100.0 veya true
		
		-broadcast parametresi o element değişikliği tüm oyunculara yayınlansınmı seçeneğidir.
			varsayılan olarak true 

		Eğer oyuncu sunucudan çıkarsa, o oyuncuya ait element dataları ClearElement fonksiyonu ile otomatik olarak temizlenir

`server.getElementData(elementId, key)`

	Özellikleri:
		-elementId, obje veya oyuncu fark etmez bir değer alır.
			Oyunculara geçiçi bir veri takmak için bunu kullanabilirsiniz.
			elementId parametresine playerId verebilirsiniz. bu size kalmış.

		-key parametresi hangi elementin valuesinin alınacağını belirler.


### Örnek kod


```lua

server.on("onPlayerJoin", function(playerId)

    server.bindKey(playerId, "B", function(playerId)

		-- burada "or false" kullanmamızın sebebi "nil/null" korumasıdır.
        local turbo_active = server.getElementData(playerId, "turbo_on") or false

		--data değişkenini belirliyoruz
        local data = {}
        
		-- turbo aktifmi değilmi kontrolü.
        if turbo_active == false then

			-- turbo kapalıysa açıyoruz.

            data = {

                turbo_on = true,
                turbo_max_psi = 5.0
            }
            server.setElementData(playerId, "turbo_on", true)
        else
			
			-- turbo açıksa kapatıyoruz.
            data = {

                turbo_on = false,
                turbo_max_psi = 5.0
            }
            server.setElementData(playerId, "turbo_on", false)
        end

		-- ASIL KISIM: aracın durumunu güncelliyoruz.
        car.setCarState(playerId, data)

    end)
end)


```


---


## 3. Oyuncuyu ve aracı yönetmek

Yine car sınıfını kullanarak oyuncuyu araçtan atacağız, araca ışınlayacağız, aracı sileceğiz, aracı yaratacağız.

### API

`car.kick(playerId)`

	Özellikleri:
		-playerId: Araca binen oyuncunun kimlik numarasıdır.
		Oyuncuyu araçtan zorla indirmek (atmak) için kullanılır.
		Araç silinmez, olduğu yerde kalır. Sadece oyuncu yaya moduna geçer.

`car.destroy(playerId)`

	Özellikleri:
		-playerId: Aracı silinecek olan oyuncunun kimlik numarasıdır.
		Oyuncunun mevcut aracını hem sunucudan hem de tüm istemcilerden tamamen siler.
		Oyuncu otomatik olarak "Character" (yaya) moduna geçirilir.

`car.putIn(playerId, carName, uniqueId)`

	Özellikleri:
		-playerId: Araca bindirilecek oyuncunun kimlik numarasıdır.
		-carName: Aracın model adı (örneğin: "jreo_model_23").
		-uniqueId: Aracın dünyadaki benzersiz ID'si.
		Oyuncuyu bekletmeden, anında aktif yada park edilmiş aracının içine ışınlar.

`car.create(playerId, modelName, uniqueId)`

	Özellikleri:
		-playerId: Araç verilecek oyuncunun kimlik numarasıdır.
		-modelName: Yaratılacak aracın model adı (örneğin: "jreo_model_23").
		-uniqueId: Araca atanacak benzersiz kimlik numarası.
		Oyuncu için yeni bir araç nesnesi oluşturur ve istemciye (Godot) yükleme emrini gönderir.

`car.approve(playerId, carName, uniqueId, broadcast)`

	Özellikleri:
		-playerId: Onaylanacak oyuncunun kimlik numarasıdır.
		-carName: Aracın model ismi.
		-uniqueId: Aracın benzersiz kimlik numarası.
		-broadcast: Bu bilginin diğer oyunculara gönderilip gönderilmeyeceği (true/false).
		Sunucunun "Evet, bu oyuncu şu an bu araçtadır" diyerek işlemi resmiyete döktüğü onay mekanizmasıdır.
		Hile koruması ve senkronizasyon için kritiktir.


### Örnek kod

```lua

server.on("onPlayerJoin", function(playerId)
    -- tuş atıyoruz
    server.bindKey(playerId, "B", function(playerId)
        
		-- bir panel oluşturuyoruz
        local menu = UI.createMenu(playerId, "menum", "TEST menüsü", 200, 200, nil, nil, true, false)
		-- hata önlemi
        if not menu then return end

		-- bir buton ve bu buton araç yaratır.
        menu:addButton("yarat", function ()

            car.create(playerId, "jreo_model_23", 31)
        end)


        -- dropdown için liste oluşturuyoruz.
        local list = {"create", "remove", "enter", "kick" }

        menu:addDropdown(list, function(playerId, index, txt)
            
            if txt == "create" then
				-- aracı oluşturur
                car.create(playerId, "jreo_model_23", 138)
            elseif txt == "remove" then
				-- aracı siler
                car.destroy(playerId)
            elseif txt == "enter" then
				-- araca zorla bindirir 
                car.putIn(playerId)
            elseif txt == "kick" then
				-- araçtan atar
                car.kick(playerId)
            end
        
        end)
        
        menu:show()
    end)
end)

```

### car.approve API'sinin kullanımı

Özellikleri:
		-playerId: Onaylanacak oyuncunun kimlik numarasıdır.
		-carName: Aracın model ismi.
		-uniqueId: Aracın benzersiz kimlik numarası.
		-broadcast: Bu bilginin diğer oyunculara gönderilip gönderilmeyeceği (true/false).
		Sunucunun "Evet, bu oyuncu şu an bu araçtadır" diyerek işlemi resmiyete döktüğü onay mekanizmasıdır.
		Hile koruması ve senkronizasyon için kritiktir.

### Örnek kod

```lua

-- ID Kontrolcü Değişkeni
-- ID Controller Variable
-- true: Sunucu rastgele güvenli ID üretir (Çakışmayı önler)
-- true: Server generates a random secure ID (Prevents collisions)
-- false: İstemciden (client) gelen ID'ye güvenilir ve o kullanılır
-- false: Trusts and uses the ID coming from the client
local useServerGeneratedId = true

-- Rastgelelik için seed
-- Seed for randomness
math.randomseed(os.time())

-- Aktif araç ID'lerini takip etmek için basit bir liste
-- Simple list to track active vehicle IDs
local activeVehicleIds = {}

local function generateUniqueId()
    local newId
    repeat
        -- 1000 ile 999999 arasında rastgele bir sayı
        -- Random number between 1000 and 999999
        newId = math.random(1000, 999999)
    until not activeVehicleIds[newId] -- Eğer bu ID kullanılıyorsa tekrar üret
                                      -- If this ID is in use, generate again
    
    activeVehicleIds[newId] = true
    return newId
end

-- C#'tan gelen ana isteği dinliyoruz
-- Listening to the main request coming from C#
server.on("onVehicleRequest", function(playerId, carName, requestedId, isBroadcast)
    
    -- 1. DURUM: ARAÇTAN İNME (EXIT)
    -- CASE 1: EXITING VEHICLE (EXIT)
    if carName == "Character" or requestedId == -2 then
        -- İnme işleminde ID üretmeye gerek yok, onayla gitsin
        -- No need to generate ID for exiting, just approve it
        car.approve(playerId, "Character", -2, true)
        return
    end

    -- 2. DURUM: GARAJ ÖNİZLEME (PREVIEW)
    -- CASE 2: GARAGE PREVIEW (PREVIEW)
    -- Sadece oyuncu görüyor (Broadcast FALSE).
    -- Only visible to the player (Broadcast FALSE).
    if isBroadcast == false then
        car.approve(playerId, carName, requestedId, false)
        return
    end

    -- 3. DURUM: ARACA BİNME / SPAWN (ENTER)
    -- CASE 3: ENTERING VEHICLE / SPAWN (ENTER)
    -- Broadcast TRUE ise araç herkes için oluşturuluyor demektir.
    -- If Broadcast is TRUE, it means the vehicle is being created for everyone.
    if isBroadcast == true then
        
        local finalVehicleId
        
        -- Değişkene göre ID'yi belirle
        -- Determine the ID based on the variable
        if useServerGeneratedId then
            -- Sunucu tarafında benzersiz bir ID oluşturuyoruz.
            -- Generating a unique ID on the server side.
            finalVehicleId = generateUniqueId()
            print("[FREEROAM] Arac Olusturuluyor (Sunucu ID). Oyuncu: " .. playerId .. " | Model: " .. carName .. " | ID: " .. finalVehicleId)
        else
            -- İstemciden gelen ID'ye güveniyoruz.
            -- Trusting the ID coming from the client.
            finalVehicleId = requestedId
            
            -- Client'tan gelen ID'yi de aktif listeye ekleyelim ki karışıklık olmasın
            -- Let's add the ID from the client to the active list to prevent confusion
            activeVehicleIds[finalVehicleId] = true
            
            print("[FREEROAM] Arac Olusturuluyor (Client ID). Oyuncu: " .. playerId .. " | Model: " .. carName .. " | Gelen ID: " .. finalVehicleId)
        end

        -- Belirlenen finalVehicleId ile aracı herkese onayla.
        -- Approve the vehicle to everyone with the determined finalVehicleId.
        car.approve(playerId, carName, finalVehicleId, true)
    end
end)

```


---


## 4. Element silmek

Element silmek için ``server.removeElementData(elementId, key)`` kullanılır
Örnek kodda `B` tuşu ile bir element oluşturacağız ve `M` tuşu ile o elementi sileceğiz.

### API

`server.removeElementData(elementId, key)`

	Özellik: bir Element'i silebilir.

		-elementId, setElementData ile oluşturulan bir elementin elementId'si girilebilir.

		-key, yine setElementData ile oluşturulan bir elementin key değeri girilir. 
			örnek olarak: "meslek" vermiştik.

### Örnek kod

```lua

server.on("onPlayerJoin", function(playerId)

    server.bindKey(playerId, "B", function(playerId)
        -- elementi ekliyoruz
        server.setElementData(playerId, "test", "valuee", true)
		-- eklediğimiz elementi alıyoruz
        local element = server.getElementData(playerId, "test")
		-- eklediğimiz elementin adını cliente gönderiyoruz
        server.sendMessage(playerId, "element add: " .. element)
    end)

    server.bindKey(playerId, "M", function(playerId)
        
		--	elementi SİLİYORUZ
        server.removeElementData(playerId, "test")
		-- sildiğimiz elementi almaya çalışıyoruz
        local element = server.getElementData(playerId, "test")
		-- eğer gerçekten silinmişse alamayız ve element = nil gelir 
        if element == nil then
			-- element gerçekten silinmişse cliente söyle
            server.sendMessage(playerId, "element delete")
        else
            server.sendMessage(playerId, "element delete fail: " .. element)
        end
    end)
end)

```


---


## 5. Tablo olan CarState değişkenleri

tire_wear değişkeninin kullanılması örnek olarak gösterilecektir.
`B` tuşuna basıldığında araç sanki buz pateninde kayar gibi kayacak.
Yol tutuşu o denli azalacak.

### Örnek kod

```lua

server.on("onPlayerJoin", function(playerId)

    server.bindKey(playerId, "B", function(playerId)
        
		-- veri belirliyoruz
        local data = {
            -- düzenlenecek veri tire_wear
            tire_wear = { fl = 0.5, fr = 0.5, rl = 1.0, rr = 1.0}
        }

		-- veriyi gönderiyoruz
        car.setCarState(playerId, data)
    end)
end)

```


---


## 6. Suncudaki yüklü modların listesini çekmek

Sunucu klasörünün server_mods klasöründeki araç modlarını ve diğer api olan araç dahil tüm modları çekmeyi göreceğiz.

### API

``server.getVehicleList()``

    Özelliği: Sunucuda yüklü olan ve tipi "vehicle", "araba", "araç" vb. olan tüm modların ID/isimlerini bir Lua tablosu olarak döndürür.

``server.getModList()``

    Özelliği: Suncuda yüklü olan TÜM tipli modların listesini Lua tablosu olarak döndürür.

### Örnek kod

Şimdi oyuncu ``B`` tuşuna basınca bu listeden araçları çekip oyuncuya göndereceğiz.
Diğer örnekte ise yine `B` tuşuna basılınca sunucudaki tüm modların listesini oyuncuya göndereceğiz

```lua

server.on("onPlayerJoin", function(playerId)

    server.bindKey(playerId, "B", function(playerId)
        -- listeyi sunucudan çekiyoruz
        local list = server.getVehicleList()
        -- for kullanımı şart gibi birşey
        for car_id in pairs(list) do
            -- oyuncuya yolluyoruz listeyi
            server.sendMessage(playerId, tostring(car_id))
        end
    end)
end)

```

### getModList için örnek kod

```lua

server.on("onPlayerJoin", function(playerId)

    server.bindKey(playerId, "B", function(playerId)

        local list = server.getModList()

        for mod_id in pairs(list) do
            server.sendMessage(playerId, tostring(mod_id))
        end
    end)
end)

```


--- 


## 7. Oyuncunun/Aracın pozisyonunu ayarlamak ve pozisyon verisini çekmek

Oyuncunun pozisyonunu ayarlayabileceğimiz ve pozisyonunu çekebileceğimiz API'ler bulunur.

### API

`world.setPlayerPosition(playerId, x, y, z)`

    Özellik: Oyuncu eğer araçta ise araç ile birlikte belirlediğiniz pozisyona ışınlanır.
        eğer araçta değil ise sadece karakteri ışınlanır.
    
`world.getPlayerPosition(playerId)`

    Oyuncunun pozisyonuna erişir. yine araçta ise aracın pozisyonu araçta değil ise karakterin pozisyonu döner.
        örn: local pos = world.getPlayerPosition(playerId)

### Örnek kod

``B`` tuşuna basınca pozisyonumuzu göreceğiz.
``M`` tuşuna basınca pozisyonumuzu ayarlayacağız.

Neden `unpack` kullandık?

Lua'da bir tablonun içindeki değerleri sırayla fonksiyonun parametrelerine "saçmak" için unpack kullanılır. Bu sayede tabloyu tek tek yazmakla uğraşmazsın.

Neden `math.floor()` kullandık?

Bu Lua'da birnevi temizleyicidir. normalde pozisyon verisini çekince 32.239132981312 kirli sayılar gelir. bunu temizleyerek 32 gibi bir sayıya dönüştürüyoruz.

```lua

server.on("onPlayerJoin", function(playerId)
    server.bindKey(playerId, "B", function(playerId)
        
        local pos = world.getPlayerPosition(playerId)
        
        -- Döngüye girmeden direkt değerleri birleştirip tek mesajda yolluyoruz
        local mesaj = string.format("Pozisyonun -> X: %s, Y: %s, Z: %s", math.floor(pos.x), math.floor(pos.y), math.floor(pos.z))
        server.sendMessage(playerId, mesaj)
    end)

    server.bindKey(playerId, "M", function()

        local target_pos = { 1, 10, 11}
        world.setPlayerPosition(playerId, unpack(target_pos))
    end)
end)

```