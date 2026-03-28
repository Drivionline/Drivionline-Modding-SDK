// SAYFA YÜKLENİR YÜKLENMEZ OTURUM KONTROLÜ YAP (Güvenlik)
// true parametresi: Eğer adam giriş yapmamışsa anında login.html'e atar.
checkGlobalSession(true).then(user => {
    if (user) {
        // Adam giriş yapmış, sayfa normal çalışmaya devam edebilir.
        console.log("Hosting paneli yetkisi doğrulandı:", user.username);
    }
});

// --- ADIM 1: TALEP GÖNDERME ---
document.getElementById('requestForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const btn = document.getElementById('reqSubmitBtn');
    const errorMsg = document.getElementById('reqErrorMsg');
    const payload = { server_name: document.getElementById('serverName').value };

    btn.innerText = "İşleniyor...";
    btn.disabled = true;
    errorMsg.style.display = 'none';

    try {
        const response = await fetch('/api/user/hosting/request-key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            document.getElementById('requestPanel').style.display = 'none';
            document.getElementById('verifyPanel').style.display = 'block';
        } else {
            errorMsg.innerText = data.message || "İşlem başarısız.";
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        errorMsg.innerText = "Sunucu bağlantı hatası.";
        errorMsg.style.display = 'block';
    } finally {
        btn.innerText = "API Key Talep Et";
        btn.disabled = false;
    }
});

// --- ADIM 2: KODU DOĞRULAMA ---
document.getElementById('verifyForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const btn = document.getElementById('verSubmitBtn');
    const errorMsg = document.getElementById('verErrorMsg');
    const payload = { code: document.getElementById('verCode').value };

    btn.innerText = "Doğrulanıyor...";
    btn.disabled = true;
    errorMsg.style.display = 'none';

    try {
        const response = await fetch('/api/user/hosting/verify-key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            document.getElementById('verifyPanel').style.display = 'none';
            document.getElementById('successPanel').style.display = 'block';
            
            // KEY'i Ekrana Bas!
            document.getElementById('finalApiKey').value = data.server_data.api_key;
        } else {
            errorMsg.innerText = data.message || "Hatalı kod.";
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        errorMsg.innerText = "Sunucu bağlantı hatası.";
        errorMsg.style.display = 'block';
    } finally {
        btn.innerText = "Doğrula ve Key Oluştur";
        btn.disabled = false;
    }
});