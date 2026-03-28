// --- MEVCUT GİRİŞ YAPMA (LOGIN) MANTIĞI ---
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault(); 
    
    const btn = document.getElementById('submitBtn');
    const errorMsg = document.getElementById('errorMsg');
    
    const payload = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        source: 'web', 
        remember_me: document.getElementById('rememberMe').checked,
        software_fingerprint_data: { "browser": navigator.userAgent } 
    };

    btn.innerText = "Giriş yapılıyor..."; btn.disabled = true; errorMsg.style.display = 'none';

    try {
        const response = await fetch('/api/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (response.ok && data.success) {
            errorMsg.style.backgroundColor = "#1b5e20"; errorMsg.style.borderColor = "#4caf50"; errorMsg.style.color = "#ffffff";
            errorMsg.innerText = "Giriş Başarılı! Ana ekrana yönlendiriliyorsun...";
            errorMsg.style.display = 'block';
            setTimeout(() => { window.location.href = '/'; }, 1500);
        } else {
            errorMsg.style.backgroundColor = "#4a1111"; errorMsg.style.borderColor = "#b71c1c"; errorMsg.style.color = "#ffcccc";
            errorMsg.innerText = data.message || "Giriş başarısız.";
            errorMsg.style.display = 'block';
            btn.innerText = "Giriş Yap"; btn.disabled = false;
        }
    } catch (err) {
        errorMsg.style.backgroundColor = "#4a1111"; errorMsg.style.borderColor = "#b71c1c"; errorMsg.style.color = "#ffcccc";
        errorMsg.innerText = "Sunucu ile bağlantı kurulamadı."; errorMsg.style.display = 'block';
        btn.innerText = "Giriş Yap"; btn.disabled = false;
    }
});


// --- PANELLER ARASI GEÇİŞ ---
const loginPanel = document.getElementById('loginPanel');
const forgotPanel1 = document.getElementById('forgotPanel1');
const forgotPanel2 = document.getElementById('forgotPanel2');

// Şifremi Unuttum Butonuna Basınca
document.getElementById('showForgotBtn').addEventListener('click', (e) => {
    e.preventDefault();
    loginPanel.style.display = 'none';
    forgotPanel1.style.display = 'block';
});

// Geri Dön Butonlarına Basınca
const showLoginPanel = (e) => {
    e.preventDefault();
    forgotPanel1.style.display = 'none';
    forgotPanel2.style.display = 'none';
    loginPanel.style.display = 'block';
};
document.getElementById('backToLogin1').addEventListener('click', showLoginPanel);
document.getElementById('backToLogin2').addEventListener('click', showLoginPanel);


// --- ŞİFREMİ UNUTTUM MANTIĞI ---
let forgotEmailMemory = "";

// ADIM 1: Kod İsteme
document.getElementById('forgotForm1').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const btn = document.getElementById('forgotSubmit1');
    const alertBox = document.getElementById('forgotError1');
    forgotEmailMemory = document.getElementById('forgotEmail').value;

    btn.innerText = "Gönderiliyor..."; btn.disabled = true; alertBox.style.display = 'none';

    try {
        const response = await fetch('/api/auth/forgot-password', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ email: forgotEmailMemory })
        });
        const data = await response.json();

        if (response.ok && data.success) {
            // Başarılıysa 2. panele (Kod girme ekranına) geç
            forgotPanel1.style.display = 'none';
            forgotPanel2.style.display = 'block';
        } else {
            alertBox.style.display = 'block'; alertBox.innerText = data.message || "Hata oluştu.";
            btn.innerText = "Sıfırlama Kodu Gönder"; btn.disabled = false;
        }
    } catch (err) {
        alertBox.style.display = 'block'; alertBox.innerText = "Bağlantı hatası.";
        btn.innerText = "Sıfırlama Kodu Gönder"; btn.disabled = false;
    }
});

// ADIM 2: Kodu Doğrula ve Şifreyi Değiştir
document.getElementById('forgotForm2').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const btn = document.getElementById('forgotSubmit2');
    const alertBox = document.getElementById('forgotError2');
    
    const payload = {
        email: forgotEmailMemory,
        code: document.getElementById('resetCode').value,
        newPassword: document.getElementById('newResetPassword').value
    };

    btn.innerText = "İşleniyor..."; btn.disabled = true; alertBox.style.display = 'none';

    try {
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (response.ok && data.success) {
            alert("Şifreniz başarıyla sıfırlandı! Şimdi yeni şifrenizle giriş yapabilirsiniz.");
            window.location.reload(); // Sayfayı yenile ki tertemiz login ekranı gelsin
        } else {
            alertBox.style.display = 'block'; alertBox.innerText = data.message || "Hatalı kod veya işlem başarısız.";
            btn.innerText = "Şifreyi Değiştir"; btn.disabled = false;
        }
    } catch (err) {
        alertBox.style.display = 'block'; alertBox.innerText = "Bağlantı hatası.";
        btn.innerText = "Şifreyi Değiştir"; btn.disabled = false;
    }
});