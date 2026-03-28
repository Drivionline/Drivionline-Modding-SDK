document.addEventListener('DOMContentLoaded', () => {
    // İlk yükleme
    fetchStats();

    // Her 5 saniyede bir canlı yenileme
    setInterval(fetchStats, 5000);
});

// fetchStats içindeki render kısmını şununla güncelle:
async function fetchStats() {
    try {
        const response = await fetch('/api/admin/attack-scoreboard');
        const data = await response.json();

        // 1. Kazananları Yazdır
        if (data.winners.day) {
            document.getElementById('winner-day').textContent = data.winners.day.target_path;
            document.getElementById('hits-day').textContent = data.winners.day.hits + " İSTEK";
        }
        if (data.winners.week) {
            document.getElementById('winner-week').textContent = data.winners.week.target_path;
            document.getElementById('hits-week').textContent = data.winners.week.hits + " İSTEK";
        }
        if (data.winners.month) {
            document.getElementById('winner-month').textContent = data.winners.month.target_path;
            document.getElementById('hits-month').textContent = data.winners.month.hits + " İSTEK";
        }

        // 2. Tabloyu Doldur (Daha detaylı)
        const tableBody = document.getElementById('attack-stats-body');
        tableBody.innerHTML = data.overall.map(row => {
            const first = new Date(row.first_seen).toLocaleString('tr-TR');
            const last = new Date(row.last_seen).toLocaleString('tr-TR');
            
            return `
                <tr>
                    <td style="color: #61afef; font-size: 12px;">
                        ${row.target_path}<br>
                        <small style="color:var(--text-muted)">İlk: ${first}</small><br>
                        <small style="color:var(--text-muted)">Son: ${last}</small>
                    </td>
                    <td style="font-weight: 600; text-align:center;">${row.total_hits}</td>
                    <td style="text-align:center;">${new Date(row.last_seen).toLocaleTimeString('tr-TR')}</td>
                    <td><span class="status-badge danger">AKTİF</span></td>
                </tr>
            `;
        }).join('');

    } catch (err) { console.error("Skorboard Hatası:", err); }
}

function renderTable(data) {
    const tableBody = document.getElementById('attack-stats-body');
    
    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">Henüz kayıtlı saldırı yok. Zift çukuru boş.</td></tr>';
        return;
    }

    tableBody.innerHTML = data.map(row => {
        // Kritik dosyalar için renk ayarı
        const isCritical = row.target_path.includes('.env') || row.target_path.includes('stripe') || row.target_path.includes('.git');
        const pathStyle = isCritical ? 'color: #f87171; font-weight: 600;' : 'color: #61afef;';
        
        // Hit sayısına göre badge
        const badgeClass = parseInt(row.total_hits) > 10 ? 'danger' : 'warning';
        const badgeText = parseInt(row.total_hits) > 10 ? 'Yüksek Risk' : 'Takipte';

        return `
            <tr>
                <td style="${pathStyle}">${row.target_path}</td>
                <td style="font-weight: 600;">${row.total_hits}</td>
                <td>${row.unique_bots}</td>
                <td><span class="status-badge ${badgeClass}">${badgeText}</span></td>
            </tr>
        `;
    }).join('');
}