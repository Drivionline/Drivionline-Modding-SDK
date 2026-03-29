# UI Elemanları ve UI yapmak

Bu sayfada UI nasıl üretilir ve functionlara bağlanır ona bakacağız.

NOT: tüm kod eklemeleri ilk örnek kod üzerinden gider. sadece değişecek fonksiyonu verilir. ilk başta verilen kod 
iskelet kod görevi görür.

---

### API

`server.bindKey`

    Bu fonksiyon, oyuncunun klavyesini doğrudan senin Lua fonksiyonlarına bağlayan ana köprüdür.

    Ne Yapar? Oyuncu o tuşa bastığında, Godot sunucuya paket atar, sunucu da Lua'daki fonksiyonunu çağırır.

    Parametreler: playerId (Kim bastı?), key (Hangi tuş? örn: "B", "F2"), callback (Hangi fonksiyon çalışsın?).

`server.unbindKey`

    Bu fonksiyon, istemciye atanan tuşu kaldırır.

    Parametreler: playerId, key (Hangi tuş? örn: "B", "F2")
    
`UI.createMenu`

    Arayüz inşaatını başlatan temel komuttur.

    Ne Yapar? Hafızada yeni bir menü objesi oluşturur. Koordinatları ve başlığı ayarlar.

    Parametreler: playerId, başlık, x, y, genişlik(width), uzunluk(height), arkaPlanOlsunMu (true/false), tam_ekran(true/false)

`menu:addButton`

    X ve Y hesaplamaktan kurtaran, butonu otomatik dizen fonksiyondur.

    Ne Yapar? Menüdeki bir sonraki boş yere butonu yerleştirir ve tıklandığında ne olacağını kaydeder.

    Parametreler: butonYazısı, callbackFonksiyonu.

``menu:addLabel``

    Panele gelişmiş metin (label) ekler.

    Yatay ve dikey hizalama ile milimetrik konum kaydırma (offset) desteği vardır.

    Parametreler: 

            text: Label içerisinde yazacak metin.

            halg: Yatay hizalama (0: Sol, 1: Orta, 2: Sağ).

            valg: Dikey hizalama (0: Üst, 1: Orta, 2: Alt).

            h: Eleman yüksekliği (Opsiyonel, varsayılan 30).

            offX: Yatayda ince kaydırma (Sağ/Sol pixel ayarı).

            offY: Dikeyde ince kaydırma (Yukarı/Aşağı pixel ayarı).

``menu:addRow``

    Takip eden elemanları yan yana dizer.

    Belirtilen sayı kadar eleman eklendiğinde sistem otomatik olarak normal (alt alta) düzene döner.

    Parametreler: > * count: Yan yana kaç adet eleman dizileceği (Örn: 2, 3 vb.).

Örnek hızlı kullanım

```lua

-- Başlık orta hizalı (1) bir menü açtık
local menu = UI.createMenu(playerId, "p_panel", "YÖNETİM", 100, 100, 450, nil, true, false, 1)

-- 1. Satır: İki eleman yan yana
menu:addRow(2)
-- Yazıyı 5 pixel yukarı (-5) kaydırdık ki butonla tam hizalı dursun
menu:addLabel("Oyuncu Adı:", 0, 1, 40, 0, -5) 
menu:addButton("İncele", function() end)

-- 2. Satır: Üç eleman yan yana
menu:addRow(3)
menu:addButton("Kick", function() end)
menu:addButton("Ban", function() end)
menu:addButton("Mute", function() end)

menu:show()

```

`menu:show()`

    Paneli oluşturur(Yaratır)

`menu:close()`

    Paneli SİLMEZ, sadece görünmez yapar (Gizler). Oyuncu menüyü tekrar açtığında yazdığı yazılar veya slider ayarları bıraktığı gibi durur.

### İlk scriptimizi yazalım.

Bu scriptte panelimiz `B` tuşu ile açılacak ve basınca bir panel açılacak. Tekrar basınca kapanacak.
Panelin içinde ise bir buton olacak. butona basınca client'e mesaj gidecek.

### Örnek kod

```lua
server.on("onPlayerJoin", function(playerId)
    -- fonksiyonu B tuşuna atayalım
    server.bindKey(playerId, "B", panel_ac)

end)


function panel_ac(id)
    -- bir menu oluşturalım
    
    local menu = UI.createMenu(id, "test_menu", "Test menüsü", 200, 200, 1000, nil, true, false)

    if not menu then return end

    -- varsayılan olarak center (alg) false 
    menu:addLabel("UI testi başarılı!")
    -- bu labelde align center = true. oyunda dikkat ederseniz bu labelin yazısı ortalanmış bir şekilde durur panelde.
    menu:addLabel("centerli", true)

    -- buton ekliyoruz. callback içinde.
    menu:addButton("Mesaj gönder", function(playerId)

        server.sendMessage(playerId, "Merhaba ilk mesaj")
    end)

    -- kapatma butonu.
    menu:addButton("kapat", function(playerId)
        menu:close()
    end)

    -- menü oluşturuluyor.
    menu:show()

end

```

---

## İnput kullanımı (text input)

Burada bir input yaratmayı ve ondan gelen metni oyuncuya geri atmayı göstereceğiz.
İnputa girilen bilgili alıp daha önce yaptığımız butona basınca oyuncuya inputa yazdığı metni göndereceğiz.

### API

`menu:addInput`

    Bu API panele bir Input elemanı eklemenizi sağlar.

    Parametreler: 
        -placeholder: Kutunun içi boşken görünen gri ipucu metni (örn: "Adınızı yazın...").

        -isLive:

            --false: Oyuncu yazısını bitirip Enter'a bastığında veya kutudan çıktığında (focus_exited) veri bir kez gönderilir.

            --true: Oyuncu her harfe bastığında (300ms gecikmeyle) sunucuya anlık veri akar.

        -callbackFunc: Veri geldiğinde çalışacak fonksiyon. Bu fonksiyon sana iki değer döndürür: (playerId, text).

### Örnek script

```lua

function panel_ac(id)

    local menu = UI.createMenu(id, "test_menu", "Test menüsü", 200, 200, 1000, nil, true, false)

    if not menu then return end

    -- girilen metini tutmak için değişken.
    local girilen_metin = "..."

    menu:addLabel("Kutucuğa metin giriniz.", true)

    -- isLive = false: Sadece Enter'a basınca veya kutudan çıkınca veriyi günceller
    -- (sunucunun ağ trafiği için önemli)
    menu:addInput("Metin giriniz...", false, function(playerId, txt)
        -- inputtan gelen metni girilen_metin de tutuyoruz.
        girilen_metin = txt
    end)

    -- gelen input verisini(yazıyı) tuşa basınca oyuncuya gönderiyoruz.
    menu:addButton("girilen inputu gönder", function(playerId)
        server.sendMessage(playerId, girilen_metin)
    end)

    menu:addButton("kapat", function(playerId)
        menu:close()
    end)
    menu:show()

end

```

---

## Progress bar(yükleme çubuğu) kullanımı.

Bu kısımda progressbar kullanımını göreceğiz. 

### API

`menu:addProgressBar`

    Panele bir Yükleme barı ekler. 

    Parametreler: val, maxVal
        
        val = o anlık değeri.

        maxVal = barın alabileceği maksimum değer.

`server.updateUI`

    UI elemanını günceller.

    Parametreler:

        playerId, "bar_id", { val = yeni_hiz }
    
    bar_id veya alınacak UI elemanının ID değerini almayı göstereceğim.


Bu kodda panele bir Progress bar ekliyeceğiz ve onu bir butona basıldığında inputa girilen
değere göre güncelleyeğiz. 

### Örnek kod

```lua

function panel_ac(id)
    local menu = UI.createMenu(id, "test_menu", "Test menüsü", 200, 200, 1000, nil, true, false)

    if not menu then return end

    local girilen_sayi

    menu:addLabel("Kutucuğa metin giriniz.", true)

    -- isLive = false: Sadece Enter'a basınca veya kutudan çıkınca veriyi günceller
    -- (sunucunun ağ trafiği için önemli)
    menu:addInput("Metin giriniz...", false, function(playerId, deger)
        girilen_sayi = deger
    end)

    local progressbar_id = menu:addProgressBar(0, 100)

    menu:addButton("girilen inputu gönder", function(playerId)
        server.updateUI(playerId, progressbar_id, { val = girilen_sayi})
    end)

    menu:show()

end

```

Farklı bir versiyon olan değer girildiği an progressbar güncellenecek.

### Örnek kod

```lua

function panel_ac(id)
    local menu = UI.createMenu(id, "test_menu", "Test menüsü", 200, 200, 1000, nil, true, false)

    if not menu then return end

    local progressbar_id = menu:addProgressBar(0, 100)

    -- isLive = true: 300ms gecikme ile  değer girildiği an günceler.
    menu:addInput("Metin giriniz...", true, function(playerId, deger)
        -- ProgressBar'ı sürekli güncelliyoruz.
        server.updateUI(playerId, progressbar_id, { val = deger})
    end)
    
    menu:show()

end

```

---


## Dropdown kullanımı

Şimdi panele Dropdown koymayı ve seçilen veriyi oyuncuya göndermeyi göreceğiz.

### API

`menu:addDropdown`

    Dropdown, ekranda çok yer kaplamadan oyuncuya bir liste sunmanı sağlar. Seçim yapıldığında sana hem seçilen öğenin sırasını (index) hem de üzerindeki metni (text) gönderir.

    Parametreleri: menu:addDropdown(itemsList, callbackFunc)
        itemsList (table): İçeride görünecek seçeneklerin listesi. Örn: {"Kırmızı", "Mavi"}.

        callbackFunc: Oyuncu bir seçim yaptığında tetiklenir. Sana şu değerleri döner: (playerId, index, text).

            index: Seçilen öğenin sırası (0'dan başlar).

            text: Seçilen öğenin üzerindeki yazı.

### Örnek kod

```lua 

function panel_ac(id)
    local menu = UI.createMenu(id, "test_menu", "Test menüsü", 200, 200, 1000, nil, true, false)

    if not menu then return end

    -- liste yapıyoruz
    local liste = { "seçenek_1", "seçenek2", "test1", "selam", "merhaba", "kırmızı"}
    -- panele Dropdown ekliyoruz.
    menu:addDropdown(liste, function(playerId, index, txt)
        -- cliente Seçilenin text değerini ve index değerini gönderiyoruz.
        server.sendMessage(playerId, "Seçilen: " .. txt .. ", Seçilenin sırası: " .. index)
    end)
    menu:show()
end

```

---

## CheckBox kullanımı

Şimdi CheckBox kullanımını göreceğiz.

### API

`menu:addCheckBox(text, isChecked, callbackFunc)`

    Checkbox, ikili (true/false) seçimler yapmak için kullanılır. Örneğin; farları açmak, ABS sistemini aktif etmek veya bir ayarı onaylamak için idealdir.

    Parametreler:

        text: Kutunun yanında görünecek açıklama yazısı.

        isChecked: Menü açıldığında VARSAYILAN olarak işaretli mi olsun? (true/false).

        Callback Dönüşü: (playerId, state). state değeri oyuncu kutuyu işaretlediğinde true, işareti kaldırdığında false olarak gelir.

### Örnek kod

```lua

function panel_ac(id)
    local menu = UI.createMenu(id, "test_menu", "Test menüsü", 200, 200, 1000, nil, true, false)

    if not menu then return end

    -- panele CheckBox ekliyoruz.
    menu:addCheckBox("Test CheckBox", false, function(playerId, durum)
        -- gelen durumu cliente gönderiyoruz.
        -- NOT: durum bir bool olarak geliyor. bunu sendMessage gibi string gönderen 
        -- bir API'ye gönderirken kesinlikle tostring() kullanın.
        server.sendMessage(playerId, "Seçilen CheckBox durumu " .. tostring(durum))
    end)

    menu:show()

end

```

---

## Slider kullanımı

Bu kısımda Slider kullanmayı göreceğiz.

Slider kaydırılınca cliente değeri gönderelim ve bir labele değeri yazdıralım.

### API

`menu:addSlider(min, max, val, step, callbackFunc)`

    Slider, belirli bir aralıktaki sayısal değerleri seçmek için kullanılır. Godot tarafında paket trafiğini önlemek için sadece oyuncu kaydırmayı bırakınca (drag_ended) sunucuya veri gönderir.

    Parametreler:

        min: Çubuğun en solundaki minimum değer.

        max: Çubuğun en sağındaki maksimum değer.

        val: Başlangıçta çubuğun duracağı yer (mevcut değer).

        step: Çubuğun kaçar kaçar artacağı (Örn: 1.0 veya 0.5).

        Callback Dönüşü: (playerId, value). value değeri oyuncunun seçtiği sayısal miktardır.

### Örnek kod

```lua

function panel_ac(id)
    local menu = UI.createMenu(id, "test_menu", "Test menüsü", 200, 200, 1000, nil, true, false)

    if not menu then return end

    menu:addLabel("Slideri kaydır")

    local gosterge_id = menu:addLabel("0")

    menu:addSlider(0, 100, 1, 0.5, function(playerId, value)

        server.sendMessage(playerId, tonumber(value))
        server.updateUI(playerId, gosterge_id, { txt = tostring(value) })

    end)

    menu:show()

end

```

---


## Panele Texutre koymak.

Bu kısımda bir Panele texture giydireceğiz.

### API

`server.setImage(playerId, panel_id, texture_id)`

    Bu API bir panele texture giydirmenizi sağlar.

    texture_id = mod'un zip dosyasının içindeki info.json içindeki  "id" kısmıdır, Örnek: "id": "panel_texture" ise texture_id parametresine "panel_texture" gelir. 

    Parametreler: playerId, panel_id, texture_id

### Örnek kod

Bu kodda menu.id ile eriştiğimiz ve menu. üzerinden erişebileceğimiz tüm değişkenler şunlardır:


| Değişken | Anlamı |
| :--- | :--- |
| **menu.id** | Menü İsmi |
| **menu.playerId** | Sahip Oyuncu |
| **menu.title** | Pencere Başlığı |
| **menu.x** | Yatay Konum |
| **menu.y** | Dikey Konum |
| **menu.width** | Genişlik |
| **menu.height** | Yükseklik |
| **menu.hasBackground** | Arka Plan |
| **menu.isFullscreen** | Tam Ekran |
| **menu.elements** | Parça Listesi |


```lua

function panel_ac(id)
    local menu = UI.createMenu(id, "test_menu", "Test menüsü", 200, 200, 1000, 500, true, false)

    if not menu then return end

    -- boş olmasın diye bir label ekliyoruz.
    menu:addLabel("Test")

    -- panel_id değişkenini menu.id diye alıyoruz. 
    -- PEKİ bu menu.id de id nereden geldi?:
    -- menu değişkeni bir tablo döndürür. tablonun içeriği yukarıda belirtildi.

    server.setImage(id, menu.id, "panel_texture")

    menu:show()

end

```

---


## Yan yana eleman dizmek

Bunu ``menu:startRow(<yan yana dizilecek eleman sayısı>)`` ile yapacağız.

### Örnek kod

```lua

function open_panel(playerId)
    local menu = UI.createMenu(playerId, "test_menu", "Test menüsü", 300, 200, 1000, 500, true, false)
    if not menu then return end


        
    -- YAN YANA 3 FARKLI ELEMAN KOYALIM
    menu:startRow(3)

    -- 1. Eleman: Sadece Yazı
    menu:addLabel("Kan Grubu:", 0) 

    -- 2. Eleman: Açılır Menü (Dropdown)
    menu:addDropdown({"A+", "A-", "B+", "B-", "0+", "0-", "AB+", "AB-"}) 

    -- 3. Eleman: Buton
    menu:addButton("Güncelle", function(p)
        server.consoleLog("Kan grubu güncellendi!")
    end)

    -- Alt satıra geçer ve normal devam eder...
    menu:startRow(2)
    menu:addCheckBox("VIP Oyuncu", true)
    menu:addInput("Not bırak...", false)

    menu:show()
    
end

```


---


## Theme sistemi ve kullanımı

Oyun içindeki her panele her butona herşeye ortak bir theme veya her ayrı menüye ayrı bir theme verebilirsiniz. 

Eğer tüm elemanların almasını istediğiniz ortak bir theme varsa ``scripts/helpers/ui_helper.lua`` scriptindeki ``DefaultTheme`` tablosunu kendinize göre ayarlayabilirsiniz.

Eğer herhangi bir scriptten o menüye özel theme vermek istiyorsanız ``menu:setTheme(theme)`` kullanabilirsiniz. Sadece ``DefaultTheme`` ayarlayıp kullanırsanız gerek yok.

### API

``menu:setTheme(theme)``

    Özellik: Tüm elemanlara Godot'un StyleBoxFlat sistemini kullanarak bir tema verir.

    Parametreler: theme(eğer herhangi bir scriptten o menüye özel theme vermek istiyorsanız kullanabilirsiniz)

### Örnek kod

```lua

local my_theme = {
    bg_color = "#0B0F19",       -- Panel arkaplan rengi
    btn_normal = "#1D4ED8",     -- Buton rengi
    btn_hover = "#2563EB",      -- Butonun üstüne gelinceki renk
    btn_pressed = "#1E40AF",    -- Butona tıklayınca görünen renk
    input_bg = "#000000",       -- İnput elemanının iç rengi
    text_color = "#FFFFFF",     -- Genel yazı rengi
    radius = 6                    -- Kenar bükme
}

local menu = UI.createMenu(playerId, "test_menu", "Test Menüsü", 200, 100, 600, 400)
menu:setTheme(my_theme) --
menu:addLabel("TestLabel", 1, 1)
menu:addButton("TestButton", function() end)
menu:addInput("TestInput", false, function() end)
menu:show()

```


---


## Sekmeli sistem

Sekmeli sistemi kullanmak için şuna bakabilirsiniz

### API

`menu:addTabs(tabList, activeTab, callbackFunc)`

    Özellik: aktif panele sekme değiştirme butonları ekler ve yetenek verir.

    Parametreler: 
        tabList, lua tablosu olarak sekme listesi alır
            örn: {"Tab1", "Tab2"}
        
        activeTab, aktif olan sekmenin bilgisidir.

        callbackFunc, playerId ve selectedPage döndürür fonksiyon çağrılabilir

### Örnek Kod

```lua

server.bindKey(playerId, "B", function(id) panel(id, "Sayfa1") end)

function panel(playerId, sayfa)
    -- 1. Varsayılan Sayfa (Eğer belirtilmezse ilk açılışta burası görünür)
    sayfa = sayfa or "Sayfa1"

    -- 2. Paneli Oluştur (ID "basit_pnl" olduğu için her çağrıda eskiyi siler)
    local menu = UI.createMenu(playerId, "basit_pnl", "Basit Panel", 400, 200, 600, 400, true, false)
    if not menu then return end

    -- 3. Sekmeleri Ekle
    -- addTabs: Butonları dizer, tıklanan sekmeyi bu fonksiyonu (panel) tekrar çağıracak şekilde ayarlar.
    menu:addTabs({"Sayfa1", "Sayfa2"}, sayfa, function(id, secilen)
        panel(id, secilen) 
    end)

    -- 4. İçerik (Hangi sayfa seçiliyse sadece o görünür)
    if sayfa == "Sayfa1" then
        menu:addLabel("Burası birinci sayfa içeriği.", 1, 1)
        menu:addButton("Tıkla", function(id) server.sendMessage(id, "1. Sayfadasın!") end)

    elseif sayfa == "Sayfa2" then
        menu:addLabel("Burası ikinci sayfa içeriği.", 1, 1)
        menu:addCheckBox("Onay Kutusu", false)
    end

    -- Paneli ekrana bas
    menu:show()
end

```

---


## Otomatik Hafıza (State) Sistemi ve Görünürlük (Visibility)

Menüleri her seferinde baştan yaratmak veya silmek yerine, performansı artırmak için Gizle/Göster (Toggle) mantığı kullanılır. Ayrıca menüdeki değişkenleri kaybetmemek için `menu.state` tablosu mevcuttur.

### Ek API ve Özellikler

`menu:setVisible(state)`

    Panelin ekrandaki görünürlüğünü anlık olarak değiştirir.
    Parametreler: state (true veya false)

`menu:close()`

    Paneli SİLMEZ, sadece görünmez yapar (Gizler). Aslında arka planda `menu:setVisible(false)` çalıştırır. Oyuncu menüyü tekrar açtığında yazdığı yazılar veya slider ayarları bıraktığı gibi durur.

`menu:destroy()`

    Paneli sunucudan ve ekrandan KÖKTEN SİLER. Sadece menüyü tamamen yok etmek istediğinizde kullanın.

`menu.state`

    Bu bir fonksiyon değil, o menüye ve oyuncuya özel kalıcı bir hafıza tablosudur. Oyuncu arayüzü kapatıp açsa bile (oyundan çıkana kadar) bu tablodaki veriler asla silinmez.

### Yeni Menü Mantığı (Örnek Kod)

`UI.createMenu` aynı menü ismiyle tekrar çağrıldığında paneli otomatik gizler veya açar ve **nil** döner. Bu sayede aşağıdaki kodlar sadece oyuncu menüyü İLK KEZ açtığında çalışır.

```lua

server.on("onPlayerJoin", function(playerId)
    server.bindKey(playerId, "B", function(pId) 
        akilli_panel(pId) 
    end)
end)

function akilli_panel(id)
    local menu = UI.createMenu(id, "ornek_menu", "Akıllı Menü", 200, 200, 600)
    
    -- Menü zaten varsa ui_helper bunu görünür/görünmez yapar ve nil döner. 
    -- Kod burada kesilir, aşağıdaki butonlar tekrar yaratılmaz.
    if not menu then return end

    -- OTOMATİK HAFIZA (State): Oyuncuya özel kalıcı değişkenler
    local s = menu.state
    s.kullanici_adi = s.kullanici_adi or "Misafir"
    s.ses_seviyesi = s.ses_seviyesi or 100.0

    menu:addInput(s.kullanici_adi, true, function(pId, text)
        s.kullanici_adi = text -- Oyuncu yazdıkça hafızaya kaydolur
    end)

    menu:addSlider(0, 100, s.ses_seviyesi, 1, function(pId, val)
        s.ses_seviyesi = val -- Slider kaydıkça hafızada tutulur
    end)

    menu:addButton("Kapat", function(pId)
        menu:close() -- SADECE GİZLER! B'e basıp tekrar açtığında her şey duruyor olacak.
    end)

    menu:show()
end

```