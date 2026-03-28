// public/session.js

async function checkGlobalSession(requireAuth = false) {
    try {
        // 1. localStorage token alma satırını SİL
        // const token = localStorage.getItem('token'); 

        const response = await fetch('/web/me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
                // 'Authorization' satırını BURADAN TAMAMEN SİLİYORUZ
            },
            credentials: 'include' // Cookie'yi otomatik göndermesi için bu kalıyor
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // --- GİRİŞ BAŞARILI, KULLANICI TANINDI ---
            
            // 1. Sağ üstteki kullanıcı menüsünü SVG İkonlu Dropdown yapısı ile güncelle
            const userMenu = document.getElementById('userMenu');
            if (userMenu) {
                userMenu.innerHTML = `
                    <div class="dropdown" style="display: flex; align-items: center;">
                        <span style="color: #a1a1aa; margin-right: 8px; font-size: 13px;">Hoş geldin,</span>
                        
                        <button class="dropdown-btn" style="color: var(--accent); font-size: 14px; font-weight: bold; background: rgba(0, 162, 255, 0.1); border: 1px solid rgba(0, 162, 255, 0.2); border-radius: 8px; padding: 8px 15px; display: flex; align-items: center; gap: 6px;">
                            ${data.user.nickname}
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: 1px;"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        
                        <div class="dropdown-content" style="right: 0; left: auto; top: 115%; min-width: 190px;">
                            <a href="/profile" style="display: flex; align-items: center; gap: 10px;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                Profil Ayarları
                            </a>
                            <a href="#" onclick="alert('Çok Yakında!')" style="display: flex; align-items: center; gap: 10px;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
                                Garajım
                            </a>
                            <a href="#" id="logoutBtn" style="color: #ef4444; border-top: 1px solid var(--glass-border); margin-top: 5px; display: flex; align-items: center; gap: 10px;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                Çıkış Yap
                            </a>
                        </div>
                    </div>
                `;

                // Çıkış yapma işlemi
                document.getElementById('logoutBtn').addEventListener('click', async function(e) {
                    e.preventDefault(); 
                    try { 
                        
                        await fetch('/web/logout', { method: 'POST', credentials: 'include' }); 
                        window.location.href = '/'; 
                    } catch (err) {
                        console.error(err);
                    }
                });
            }

            // 2. Dropdown menülerini giriş yapmış kullanıcıya göre doldur
            const accountDropdown = document.getElementById('accountDropdown');
            if (accountDropdown) {
                accountDropdown.innerHTML = `
                    <a href="/profile">Profil ve Güvenlik</a>
                `;
            }

            const serverDropdown = document.getElementById('serverDropdown');
            if (serverDropdown) {
                serverDropdown.innerHTML = `
                    <a href="/hosting">Private Server Kur</a>
                    <a href="/management">Sunucu Yönetimi</a>
                `;
            }

            return data.user; 
        } else {
            // Token geçersizse veya yoksa misafir muamelesi yap
            if (requireAuth) window.location.href = '/login';
            return null;
        }
    } catch (err) {
        console.error("Oturum kontrol hatası:", err);
        if (requireAuth) window.location.href = '/login';
        return null;
    }
}