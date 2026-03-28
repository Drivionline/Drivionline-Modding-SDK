let currentUserEmail = "";

// 1. OTURUM KONTROLÜ (Giriş yapmamışsa login'e atar)
checkGlobalSession(true).then(user => {
    if (user) {
        currentUserEmail = user.email;
        document.getElementById('newNickname').value = user.nickname;

        // MİSAFİR HESAP KONTROLÜ
        const isGuest = !user.is_verified || (user.email && user.email.startsWith('unverified_'));

        if (isGuest) {
            document.getElementById('userEmailTxt').innerText = "Misafir Hesap (Doğrulanmamış)";
            document.getElementById('userEmailTxt').style.color = "#ff9800";
            
            // Şifre panelini gizle, Hesap bağlama panelini göster
            const passPanel = document.getElementById('passwordPanel');
            if(passPanel) passPanel.style.display = 'none';
            
            document.getElementById('claimAccountPanel').style.display = 'block';
        } else {
            document.getElementById('userEmailTxt').innerText = currentUserEmail;
        }
    }
});

// 2. TAKMA AD (NICKNAME) GÜNCELLEME
document.getElementById('nicknameForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('nickSubmitBtn');
    const alertBox = document.getElementById('nickAlert');
    const payload = { new_nickname: document.getElementById('newNickname').value };

    btn.disabled = true; alertBox.style.display = 'none';

    try {
        const token = localStorage.getItem('token'); // Tarayıcıdan token'ı al

        const response = await fetch('/api/user/set-nickname', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // BURADAKİ AUTHORIZATION SATIRINI SİL
            },
            credentials: 'include', // Sadece bu kalsın ki cookie'yi otomatik göndersin
            body: JSON.stringify(payload)
        })
        const data = await response.json();

        alertBox.style.display = 'block';
        if (response.ok && data.success) {
            // YENİ EKLENEN SATIR: Backend'den gelen yepyeni token'ı tarayıcıya kaydet
            if (data.new_token) {
                localStorage.setItem('token', data.new_token);
            }

            alertBox.style.backgroundColor = "#1b5e20"; 
            alertBox.style.borderColor = "#4caf50"; 
            alertBox.style.color = "#fff";
            alertBox.innerText = "Takma ad güncellendi! (Sayfa yenilendiğinde üstte görünecek)";
        } else {
            alertBox.style.backgroundColor = "#4a1111"; alertBox.style.borderColor = "#b71c1c"; alertBox.style.color = "#ffcccc";
            alertBox.innerText = data.message || "Hata oluştu.";
        }
    } catch (err) {
        alertBox.style.display = 'block'; alertBox.innerText = "Bağlantı hatası.";
    } finally {
        btn.disabled = false;
    }
});

// 3. ŞİFRE SIFIRLAMA KODU İSTE (Adım 1)
document.getElementById('requestResetBtn').addEventListener('click', async function() {
    const btn = this;
    const alertBox = document.getElementById('passAlert');
    
    btn.innerText = "Kod Gönderiliyor..."; btn.disabled = true; alertBox.style.display = 'none';

    try {
        const response = await fetch('/api/auth/forgot-password', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ email: currentUserEmail })
        });
        const data = await response.json();

        if (response.ok && data.success) {
            btn.style.display = 'none'; 
            document.getElementById('resetPasswordForm').classList.remove('hidden'); 
            
            alertBox.style.display = 'block';
            alertBox.style.backgroundColor = "#1b5e20"; alertBox.style.borderColor = "#4caf50"; alertBox.style.color = "#fff";
            alertBox.innerText = "Onay kodu e-postanıza gönderildi!";
        } else {
            alertBox.style.display = 'block'; alertBox.innerText = data.message || "Hata oluştu.";
            btn.innerText = "Şifre Sıfırlama Kodu Gönder"; btn.disabled = false;
        }
    } catch (err) {
        alertBox.style.display = 'block'; alertBox.innerText = "Bağlantı hatası.";
        btn.innerText = "Şifre Sıfırlama Kodu Gönder"; btn.disabled = false;
    }
});

// 4. KODU ONAYLA VE ŞİFREYİ DEĞİŞTİR (Adım 2)
document.getElementById('resetPasswordForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('resetSubmitBtn');
    const alertBox = document.getElementById('passAlert');
    
    const payload = {
        email: currentUserEmail,
        code: document.getElementById('resetCode').value,
        newPassword: document.getElementById('newPassword').value
    };

    btn.innerText = "İşleniyor..."; btn.disabled = true; alertBox.style.display = 'none';

    try {
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (response.ok && data.success) {
            alert("Şifreniz başarıyla güncellendi! Mevcut oturumunuz güvenlik için kapatıldı. Lütfen tekrar giriş yapın.");
            await fetch('/web/logout', { 
                method: 'POST',
                credentials: 'include' 
            });
            window.location.href = '/login';
        } else {
            alertBox.style.display = 'block';
            alertBox.style.backgroundColor = "#4a1111"; alertBox.style.borderColor = "#b71c1c"; alertBox.style.color = "#ffcccc";
            alertBox.innerText = data.message || "Hatalı kod veya işlem başarısız.";
        }
    } catch (err) {
        alertBox.style.display = 'block'; alertBox.innerText = "Bağlantı hatası.";
    } finally {
        btn.innerText = "Kodu Onayla ve Şifreyi Değiştir"; btn.disabled = false;
    }
});

// 5. HESAP YÜKSELTME KODU İSTE (Adım 1)
document.getElementById('claimRequestForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('claimReqBtn');
    const alertBox = document.getElementById('claimAlert');
    const emailInput = document.getElementById('claimEmail').value;

    btn.innerText = "Kod Gönderiliyor..."; btn.disabled = true; alertBox.style.display = 'none';

    try {
        const response = await fetch('/api/user/claim-account/request', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            credentials: 'include',
            body: JSON.stringify({ email: emailInput })
        });
        const data = await response.json();

        if (response.ok && data.success) {
            document.getElementById('claimRequestForm').classList.add('hidden');
            document.getElementById('claimVerifyForm').classList.remove('hidden');
            
            alertBox.style.display = 'block';
            alertBox.style.backgroundColor = "#1b5e20"; alertBox.style.borderColor = "#4caf50"; alertBox.style.color = "#fff";
            alertBox.innerText = "Onay kodu e-postanıza gönderildi!";
        } else {
            alertBox.style.display = 'block'; alertBox.innerText = data.message || "Hata oluştu.";
            btn.innerText = "Doğrulama Kodu Gönder"; btn.disabled = false;
        }
    } catch (err) {
        alertBox.style.display = 'block'; alertBox.innerText = "Bağlantı hatası.";
        btn.innerText = "Doğrulama Kodu Gönder"; btn.disabled = false;
    }
});

// 6. KODU ONAYLA VE HESABI KALICI YAP (Adım 2)
document.getElementById('claimVerifyForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('claimVerBtn');
    const alertBox = document.getElementById('claimAlert');
    const codeInput = document.getElementById('claimCode').value;

    btn.innerText = "İşleniyor..."; btn.disabled = true; alertBox.style.display = 'none';

    try {
        const response = await fetch('/api/user/claim-account/verify', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            credentials: 'include', // <-- BUNU EKLE
            body: JSON.stringify({ code: codeInput })
        });
        const data = await response.json();

        if (response.ok && data.success) {
            // localStorage setItem kısmını TAMAMEN SİL. Çerezi backend halletti bile.
            alert("Hesabınız başarıyla doğrulandı ve kalıcı hale getirildi! Sayfa yenileniyor...");
            window.location.reload();
        } else {
            alertBox.style.display = 'block';
            alertBox.style.backgroundColor = "#4a1111"; alertBox.style.borderColor = "#b71c1c"; alertBox.style.color = "#ffcccc";
            alertBox.innerText = data.message || "Hatalı kod veya işlem başarısız.";
            btn.innerText = "Kodu Onayla ve Hesabı Bağla"; btn.disabled = false;
        }
    } catch (err) {
        alertBox.style.display = 'block'; alertBox.innerText = "Bağlantı hatası.";
        btn.innerText = "Kodu Onayla ve Hesabı Bağla"; btn.disabled = false;
    }
});