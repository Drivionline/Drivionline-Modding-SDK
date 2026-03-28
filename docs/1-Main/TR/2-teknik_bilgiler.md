# Genel teknik bilgiler

Drivionline gelişmekte olan bir projedir ve genel amacı Lua modding, Multiplayer sistemleridir. 

### Oyuncu ve araçların yönetimi

Oyuncuların araç seçme, hareket verileri gibi anlık ve küçük veriler Godot'un ``PacketPeerUDP`` sınıfını kullanarak C# game serverine paket gönderir ve duruma göre C# game server'de diğer oyunculara yayar. En yüksek performans ve en yüksek hız için elimizden geleni yapıyoruz.

### Lua modding sistemi

Lua scriptleri aslında C# game servere MoonSharp ile bağlanıyor. 
Lua, C# tarafındaki API'leri çağırarak aslında sadece cliente şifreli bir TCP kanalı üzerinden komutlar gönderir.
Godot'da bu paketler duruma göre yöneticilere dağıtılır ve ona göre komutlar işlenir.

### Donanım destekleri

Direksiyon seti sistemim basit bir Arduino Leonardo ile yapılmış DIY FFB bir sistem olduğu için şuan oyunda çok detaylı bir FFB yok.
Elimden geldiğince geliştirmeye çalışıyorum ama vites desteği falan daha geliştirilecek.
Donanım ile Godot'un iletişimi için SDL3 kütüphanesini kullanılıyor.
Temel FFB ve gaz, fren, debriyaj desteği var ama okadar da gelişmiş değil.
SDL3 gelişmiş bir kütüphane olduğu için diğer direksiyon setlerini destekler.

### UDP Paket boyutları

UDP Kısmında paket boyutlarını oldukça düşük tutmaya çalışıyorum.
Paket boyutları hakkında genel bir bilgi verirsek anlık hareket verileri saniyede 20 kere gönderiliyor ve hareket verisinin boyutu güncellemeler ile değişebilir ama genelde 30-40 Byte arasında.

### Private server kurulumu

Private server kurmak istiyorsanız herhangi bir hosting firmasından kendinize ait bir Sunucu kiralamanız lazım.
Kurulum detayları için: https://drivionline.com/docs/?lang=TR&class=1-Main&doc=3-server_kurulum.md#server-kurulumu-ve-detaylar

### Mod dağıtımı 

Private server dosyanızın server_mods klasörüne attığınız her mod dosyası (.zip olmak zorunda) sunucuya giren tüm oyuncular tarafından indirilebilir ve 50505 tcp(Http) portu üzerinden dağıtılır. Server dosyalarındaki default modlar temel geliştirme ve ana oynanış içindir.

Eğer server_mods klasöründe bir mod dosyası değişirse veya dosya eklenirse otomatik olarak sistem bunu anlar ve oyuncuların oyununa yeniden indirme komutu gönderir ve sadece değişen dosyayı anlarlar ve otomatik indirirler.

### Harita ve Araç modu hakkında bilgiler

Harita veya Araç modlarını yapmanız için sadece bir modelleme programı(Blender vb.) ve modelleme bilginiz olması yeter. 
Modlama desteği zaten basittir ve olabildiğince basit tutmaya çalışıyoruz. Modelleri ve bilgi dosyalarını ana mod dosyası olacak bir .zip dosyasına atmalısınız model dosyası olarak .GLB formatı kullanılır ve içinde animasyon, texture, material barındırabilirsiniz.

