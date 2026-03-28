let registeredEmail = "";

// --- ADIM 1: KAYIT İSTEĞİ ATMA ---
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const btn = document.getElementById('regSubmitBtn');
    const errorMsg = document.getElementById('regErrorMsg');
    
    const payload = {
        username: document.getElementById('regUsername').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value,
        is_unverified_request: false, // DOĞRULAMALI (GÜVENLİ) KAYIT
        software_fingerprint_data: { "browser": navigator.userAgent }
    };

    btn.innerText = "İşleniyor...";
    btn.disabled = true;
    errorMsg.style.display = 'none';

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            registeredEmail = payload.email;
            document.getElementById('registerPanel').style.display = 'none';
            document.getElementById('verifyPanel').style.display = 'block';
        } else {
            errorMsg.style.backgroundColor = "#4a1111";
            errorMsg.style.borderColor = "#b71c1c";
            errorMsg.style.color = "#ffcccc";
            errorMsg.innerText = data.message || "Kayıt başarısız.";
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        errorMsg.style.backgroundColor = "#4a1111";
        errorMsg.style.borderColor = "#b71c1c";
        errorMsg.style.color = "#ffcccc";
        errorMsg.innerText = "Sunucu bağlantı hatası.";
        errorMsg.style.display = 'block';
    } finally {
        btn.innerText = "Kayıt Ol";
        btn.disabled = false;
    }
});

// --- ADIM 2: KODU DOĞRULAMA İSTEĞİ ---
document.getElementById('verifyForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const btn = document.getElementById('verSubmitBtn');
    const errorMsg = document.getElementById('verErrorMsg');
    
    const payload = {
        email: registeredEmail,
        code: document.getElementById('verCode').value
    };

    btn.innerText = "Doğrulanıyor...";
    btn.disabled = true;
    errorMsg.style.display = 'none';

    try {
        const response = await fetch('/api/auth/verify-email-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert("Hesabın başarıyla oluşturuldu ve başlangıç paketi verildi! Şimdi giriş yapabilirsin.");
            window.location.href = '/login';
        } else {
            errorMsg.style.backgroundColor = "#4a1111";
            errorMsg.style.borderColor = "#b71c1c";
            errorMsg.style.color = "#ffcccc";
            errorMsg.innerText = data.message || "Hatalı doğrulama kodu.";
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        errorMsg.style.backgroundColor = "#4a1111";
        errorMsg.style.borderColor = "#b71c1c";
        errorMsg.style.color = "#ffcccc";
        errorMsg.innerText = "Sunucu bağlantı hatası.";
        errorMsg.style.display = 'block';
    } finally {
        btn.innerText = "Doğrula ve Hesabı Aç";
        btn.disabled = false;
    }
});