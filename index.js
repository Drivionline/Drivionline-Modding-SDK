// public/index.js

async function fetchServerList() {
    const tbody = document.getElementById('serverListBody');
    if (!tbody) return; // Tablo yoksa dur (Navbar artık kendi başının çaresine bakıyor)

    try {
        const response = await fetch('/api/user/server-list');
        const data = await response.json();

        if (response.ok && data.success) {
            tbody.innerHTML = ''; 
            
            if (data.servers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #888;">Şu anda aktif bir sunucu bulunmuyor.</td></tr>';
                return;
            }
            
            // 1. Sunucuları ID'ye göre sırala
            data.servers.sort((a, b) => a.id - b.id);

            // 2. Tabloyu oluştur
            data.servers.forEach(server => {
                const typeBadge = server.is_private ? '<span class="badge-private">Private</span>' : '<span class="badge-official">Official</span>';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="font-weight: bold; color: #777;">#${server.id}</td>
                    <td style="font-weight: bold; color: #fff;">${server.name}</td>
                    <td><span style="color: #4caf50;">${server.players}</span> <span style="color: #666;">/ ${server.max_players}</span></td>
                    <td>${typeBadge}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #b71c1c;">Bağlantı hatası: Sunuculara ulaşılamıyor.</td></tr>';
    }
}

// SAYFA TAMAMEN YÜKLENDİĞİNDE ÇALIŞACAK KODLAR
document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Ziyaretçilere sunucu listesini hemen göster
    fetchServerList();

    // 2. Oturum durumunu kontrol et (Misafirleri login'e atmaz, session.js halleder)
    const user = await checkGlobalSession(false); 

    // 3. CTA bölümü HTML'den silindiği için buradaki gereksiz DOM manipülasyon kodları da uçuruldu.
});