const serverSelect = document.getElementById('serverSelect');
const loadPlayersBtn = document.getElementById('loadPlayersBtn');
const playerListBody = document.getElementById('playerListBody');
const banListBody = document.getElementById('banListBody');
const banDurationInput = document.getElementById('banDurationInput'); // Dakika Kutusu

checkGlobalSession(true).then(user => {
    if (user) loadMyServers();
});

// --- SAHİP OLDUĞUM SUNUCULARI ÇEK ---
async function loadMyServers() {
    try {
        const res = await fetch('/api/manage-server/my-servers');
        const data = await res.json();
        
        if (data.success) {
            serverSelect.innerHTML = '<option value="">-- Sunucu Seçin --</option>';
            if(data.servers.length === 0) {
                serverSelect.innerHTML = '<option value="">Hiç sunucunuz bulunmuyor.</option>';
                return;
            }

            data.servers.forEach(srv => {
                const opt = document.createElement('option');
                opt.value = srv.db_id;
                const status = srv.is_online ? `🟢 Aktif (${srv.players} Oyuncu)` : `🔴 Kapalı`;
                opt.textContent = `${srv.name} | ${status}`;
                if(!srv.is_online) opt.disabled = true;
                serverSelect.appendChild(opt);
            });
        }
    } catch(err) {
        serverSelect.innerHTML = '<option value="">Sunucular yüklenemedi</option>';
    }
}

// --- SUNUCU DEĞİŞİNCE LİSTELERİ YENİLE ---
serverSelect.addEventListener('change', () => {
    if(serverSelect.value) {
        loadPlayersBtn.style.display = 'block';
        fetchPlayers(serverSelect.value);
        fetchBans(serverSelect.value); // Ban listesini de çek
    } else {
        loadPlayersBtn.style.display = 'none';
        playerListBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #888;">Lütfen bir sunucu seçin.</td></tr>`;
        banListBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #888;">Lütfen bir sunucu seçin.</td></tr>`;
    }
});

loadPlayersBtn.addEventListener('click', () => {
    if (serverSelect.value) {
        fetchPlayers(serverSelect.value);
        fetchBans(serverSelect.value);
    }
});

// --- 1. OYUNCULARI ÇEK VE ÇİZ ---
async function fetchPlayers(dbId) {
    playerListBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #aaa;">Yükleniyor...</td></tr>`;
    try {
        const response = await fetch(`/api/manage-server/${dbId}/players`);
        const data = await response.json();

        if (response.ok && data.success) {
            if (!data.players || data.players.length === 0) {
                playerListBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #888;">Sunucuda kimse yok.</td></tr>`;
                return;
            }
            playerListBody.innerHTML = ""; 
            data.players.forEach(player => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>#${player.userId}</td>
                    <td><strong>${player.username}</strong> <span style="color:#888; font-size:11px;">(${player.nickname})</span></td>
                    <td>${player.car}</td>
                    <td>
                        <button class="btn-kick btn-action" data-action="kick" data-target="${player.userId}" data-server="${dbId}">Kick</button>
                        <button class="btn-ban btn-action" data-action="ban" data-target="${player.userId}" data-server="${dbId}">Ban</button>
                    </td>
                `;
                playerListBody.appendChild(tr);
            });
        } else {
            playerListBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #ff5555;">${data.message || "Hata"}</td></tr>`;
        }
    } catch (err) {
        playerListBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #ff5555;">Bağlantı hatası!</td></tr>`;
    }
}

// --- 2. BANLARI ÇEK VE ÇİZ ---
async function fetchBans(serverDbId) { // Parametre ismini karışmasın diye serverDbId yaptık
    banListBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #aaa;">Banlar yükleniyor...</td></tr>`;
    try {
        const response = await fetch(`/api/manage-server/${serverDbId}/bans`);
        const data = await response.json();

        if (response.ok && data.success) {
            if (!data.bans || data.bans.length === 0) {
                banListBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #888;">Banlı oyuncu bulunmuyor.</td></tr>`;
                return;
            }
            banListBody.innerHTML = ""; 
            
            const nowSeconds = Math.floor(Date.now() / 1000);

            data.bans.forEach(ban => {
                // KRİTİK DÜZELTME: Gelen JSON'daki harf küçülmesine karşı iki ihtimali de dene
                const targetId = ban.DbId || ban.dbId;
                const reasonText = ban.Reason || ban.reason;
                const unbanTime = ban.UnbanTime || ban.unbanTime;

                const tr = document.createElement('tr');
                
                // Kalan süreyi hesapla ve formatla
                let timeLeftText = "";
                let remaining = unbanTime - nowSeconds;
                
                if (remaining > 10 * 365 * 24 * 3600) {
                    timeLeftText = "<span style='color:#ff3333; font-weight:bold;'>Sınırsız (Kalıcı)</span>";
                } else if (remaining > 0) {
                    let hours = Math.floor(remaining / 3600);
                    let mins = Math.floor((remaining % 3600) / 60);
                    timeLeftText = `${hours} Saat, ${mins} Dk.`;
                } else {
                    timeLeftText = "<span style='color:#4caf50;'>Süresi Dolmuş</span>";
                }

                tr.innerHTML = `
                    <td>#${targetId}</td>
                    <td>${reasonText}</td>
                    <td>${timeLeftText}</td>
                    <td>
                        <button class="btn-unban btn-action" data-action="unban" data-target="${targetId}" data-server="${serverDbId}">Banı Kaldır</button>
                    </td>
                `;
                banListBody.appendChild(tr);
            });
        } else {
            banListBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #ff5555;">${data.message || "Hata"}</td></tr>`;
        }
    } catch (err) {
        banListBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #ff5555;">Bağlantı hatası!</td></tr>`;
    }
}

// --- BUTON TIKLAMALARINI YAKALA (KICK/BAN/UNBAN) ---
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-action')) {
        const action = e.target.getAttribute('data-action');
        const targetId = e.target.getAttribute('data-target');
        const dbId = e.target.getAttribute('data-server');
        
        let reason = "";
        let durationMinutes = 0;

        if (action === 'ban') {
            // Yukarıdaki input kutusundan dakikayı al!
            durationMinutes = parseInt(banDurationInput.value);
            if (isNaN(durationMinutes)) {
                alert("Lütfen geçerli bir ban süresi girin!");
                return;
            }
            reason = prompt("Ban sebebini giriniz:", "Kurallara aykırı davranış.");
            if (reason === null) return; // İptal
            
            const msg = durationMinutes === 0 ? "KALICI olarak" : `${durationMinutes} dakika`;
            if (!confirm(`Oyuncuyu (ID: ${targetId}) ${msg} banlamak istediğinize emin misiniz?`)) return;

        } else if (action === 'kick') {
            reason = 'Yönetici tarafından atıldınız.';
            if (!confirm(`Oyuncuyu (ID: ${targetId}) kicklemek istediğinize emin misiniz?`)) return;
        } else if (action === 'unban') {
            if (!confirm(`Oyuncunun (ID: ${targetId}) banını kaldırmak istediğinize emin misiniz?`)) return;
        }

        sendCommand(dbId, action, targetId, reason, durationMinutes);
    }
});

// --- KOMUT GÖNDER ---
async function sendCommand(dbId, action, targetId, reason, durationMinutes) {
    try {
        const response = await fetch('/api/manage-server/send-command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                db_id: dbId, 
                action: action,
                target_id: targetId,
                reason: reason,
                duration_minutes: durationMinutes
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert(`Başarılı: ${data.message}`);
            if (serverSelect.value) {
                fetchPlayers(serverSelect.value);
                fetchBans(serverSelect.value);
            }
        } else {
            alert(`Hata: ${data.message || 'İşlem başarısız.'}`);
        }
    } catch (err) {
        alert('Sunucu ile iletişim kurulamadı. Lütfen tekrar deneyin.');
    }
}