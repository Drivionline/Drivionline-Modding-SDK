# Drivionline - Modding SDK

<a href="#english-documentation">English</a> | <a href="#turkce-dokumantasyon">Türkçe</a>

---

<a id="english-documentation"></a>
## English

### Project Overview
Drivionline is a multiplayer vehicle simulation developed with the **Godot Engine**. The project is designed to provide semi-realistic vehicle physics and integrated simulation features.

### Modding Framework
The game features a dedicated **Lua API** for community-driven content. This system allows developers to create custom scripts that interact with the game's logic without requiring access to the primary source code.

#### Core Capabilities
| Feature | Description |
| :--- | :--- |
| **Server Logic** | Creation of custom game modes and server-side scripts. |
| **UI Management** | Development of interactive user interface elements. |

#### Technical Constraints and Standards
To ensure system stability, the modding environment is strictly limited to **Lua**. Core engine features and vehicle physics models are handled internally and are not accessible via the modding API.

> **Important**: Documentation and implementation guides for this SDK strictly exclude any references to C# to maintain project standards.

### Resources
* **Official Website**: [drivionline.com](https://drivionline.com)
* **API Reference**: [drivionline.com/docs](https://drivionline.com/docs)
* **License for Sample Codes**: MIT License

---

<a id="turkce-dokumantasyon"></a>
## Türkçe

### Proje Genel Bakış
Drivionline, **Godot Engine** kullanılarak geliştirilmiş bir çok oyunculu araç simülasyonudur. Proje, yarı gerçekçi araç fiziği ve entegre simülasyon özellikleri sunmaya odaklanmaktadır.

### Modlama Yapısı
Oyun, topluluk içerikleri için özel bir **Lua API** yapısına sahiptir. Bu sistem, geliştiricilerin ana kaynak koduna ihtiyaç duymadan oyunun mantığıyla etkileşime giren özel scriptler oluşturmasına olanak tanır.

#### Temel Yetenekler
| Özellik | Açıklama |
| :--- | :--- |
| **Sunucu Mantığı** | Özel oyun modları ve sunucu taraflı scriptlerin kurgulanması. |
| **Arayüz Yönetimi** | Etkileşimli kullanıcı arayüzü elementlerinin geliştirilmesi. |

#### Teknik Kısıtlamalar ve Standartlar
Sistem kararlılığını korumak amacıyla modlama ortamı tamamen **Lua** dili ile sınırlandırılmıştır. Çekirdek motor özellikleri ve araç fizik modelleri dahili olarak yönetilmektedir; modlama API'si üzerinden bu sistemlere müdahale edilemez.

> **Önemli**: Proje standartlarını korumak amacıyla, bu SDK kapsamında hazırlanan dökümanlar ve uygulama rehberleri hiçbir şekilde C# referansı içermez.

### Kaynaklar
* **Resmi Web Sitesi**: [drivionline.com](https://drivionline.com)
* **API Referansı**: [drivionline.com/docs](https://drivionline.com/docs)
* **Örnek Kodların Lisansı**: MIT Lisansı
