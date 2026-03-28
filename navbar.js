const navbarHTML = `
    <div class="top-bar">
        <div style="display: flex; align-items: center; gap: 20px;">
            <a href="/" class="logo-area" style="text-decoration: none;">
                <img src="/assets/logo.svg" alt="Drivionline Logo">
            </a>
            
            <div id="nav-stats" style="font-size: 13px; font-weight: bold; background: rgba(255,255,255,0.05); padding: 6px 15px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center;">
                <span style="color: #888;">Veriler çekiliyor...</span>
            </div>
            
            <div id="mainNav" class="nav-menu">
                
                <div class="dropdown">
                    <button class="dropdown-btn">Hesap İşlemleri ▾</button>
                    <div class="dropdown-content" id="accountDropdown">
                        <div style="padding: 20px 15px; text-align: center; font-size: 13px; color: var(--text-muted); line-height: 1.8; min-width: 230px;">
                            Lütfen bu sayfaya girmek için <br>
                            <a href="/login" class="inline-link">giriş yapınız</a> veya <a href="/register" class="inline-link">kayıt olunuz</a>.
                        </div>
                    </div>
                </div>

                <div class="dropdown">
                    <button class="dropdown-btn">Sunucu İşlemleri ▾</button>
                    <div class="dropdown-content" id="serverDropdown">
                        <div style="padding: 20px 15px; text-align: center; font-size: 13px; color: var(--text-muted); line-height: 1.8; min-width: 230px;">
                            Lütfen bu sayfaya girmek için <br>
                            <a href="/login" class="inline-link">giriş yapınız</a> veya <a href="/register" class="inline-link">kayıt olunuz</a>.
                        </div>
                    </div>
                </div>

                <div class="dropdown">
                    <button class="dropdown-btn">Geliştirici ▾</button>
                    <div class="dropdown-content" id="devDropdown" style="min-width: 180px;">
                        <a href="/docs">Dökümantasyon (API)</a>
                        <a href="#">GitHub (Yakında)</a>
                    </div>
                </div>

            </div>
        </div>

        <div id="userMenu">
            <a href="/login" class="btn">Giriş Yap</a>
        </div>
    </div>
`;

const container = document.getElementById('navbar-container');
if (container) { container.innerHTML = navbarHTML; }

// Dropdown Tıklama Mantığı
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('dropdown-btn')) {
        e.preventDefault();
        const content = e.target.nextElementSibling;
        document.querySelectorAll('.dropdown-content').forEach(c => c !== content && c.classList.remove('show'));
        content.classList.toggle('show');
    } else if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-content').forEach(c => c.classList.remove('show'));
    }
});

// Sayfa yüklendiğinde Navbar kendi istatistiklerini kendi çeksin
document.addEventListener('DOMContentLoaded', async () => {
    const navStats = document.getElementById('nav-stats');
    if (!navStats) return;

    try {
        const response = await fetch('/api/user/server-list');
        const data = await response.json();

        if (response.ok && data.success) {
            let totalPlayers = 0;
            let activeServers = data.servers.length;

            if (activeServers === 0) {
                navStats.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 8px; color: #a1a1aa;">
                        <div style="width: 8px; height: 8px; background-color: #ef4444; border-radius: 50%;"></div>
                        <span>Sunucu Yok</span>
                    </div>
                `;
                return;
            }

            data.servers.forEach(server => {
                totalPlayers += server.players;
            });

            navStats.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; color: #e4e4e7;">
                    <div style="width: 8px; height: 8px; background-color: #9fc522ff; border-radius: 50%; box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);"></div>
                    <span>${activeServers} Sunucu</span>
                    <span style="color: #52525b;">/</span>
                    <span>${totalPlayers} Oyuncu</span>
                </div>
            `;
        }
    } catch (err) {
        navStats.innerHTML = `<span style="color: #ef4444;">Bağlantı Hatası</span>`;
    }
});