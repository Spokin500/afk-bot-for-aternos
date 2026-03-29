const mineflayer = require('mineflayer');
const fs = require('fs');
const express = require('express');

// --- 1. RENDER 7/24 UYANIK TUTMA SİSTEMİ (EXPRESS) ---
const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.send('PcdyfyNetwork Mehmet Botu 7/24 Aktif!');
});

app.listen(port, () => {
    console.log(`[WEB] Render servisi ${port} portunda hazır.`);
});

// --- 2. AYARLARI OKU ---
// Dosyaların eksik olması ihtimaline karşı kontrol ekledim
const configPath = 'config.json';
if (!fs.existsSync(configPath)) {
    console.log("[HATA] config.json dosyası bulunamadı!");
    process.exit(1);
}
const config = JSON.parse(fs.readFileSync(configPath));
const botPassword = "boti"; // Şifren: boti

// --- 3. BOT OLUŞTURMA FONKSİYONU ---
function createBot() {
    console.log(`[BAĞLANTI] ${config.ip}:${config.port} adresine gidiliyor...`);

    const bot = mineflayer.createBot({
        host: config.ip,
        port: parseInt(config.port),
        username: config.name,
        version: "1.21.1",
        hideErrors: false,
        connectTimeout: 30000
    });

    // --- 4. TEXTURE PACK (KAYNAK PAKETİ) REDDİ ---
    // Fareyle 'Hayır'a basma sinyalini simüle eder, chat'e yazmaz.
    bot.on('resource_pack', () => {
        console.log("[TEXTURE PACK] Kaynak paketi isteği reddedildi (Nah).");
        bot.denyResourcePack(); 
    });

    // --- 5. AUTHME (Giriş/Kayıt) SİSTEMİ ---
    bot.on('message', (message) => {
        const msg = message.toString().toLowerCase();

        // Eğer chatte /register yazısı geçerse
        if (msg.includes('/register')) {
            console.log("[AUTHME] Kayıt yapılıyor...");
            bot.chat(`/register ${botPassword} ${botPassword}`);
        }
        
        // Eğer chatte /login yazısı geçerse
        if (msg.includes('/login')) {
            console.log("[AUTHME] Giriş yapılıyor...");
            bot.chat(`/login ${botPassword}`);
        }
    });

    // --- 6. OYUNA GİRİŞ DURUMU ---
    bot.on('spawn', () => {
        console.log("----------------------------------------");
        console.log(`[BAŞARILI] Bot ${bot.username} oyuna girdi!`);
        console.log("----------------------------------------");
    });

    // --- 7. HATA VE KOPMA YÖNETİMİ ---
    bot.on('error', (err) => {
        console.log(`[HATA] Bir sorun oluştu: ${err.message}`);
    });

    bot.on('kicked', (reason) => {
        console.log(`[ATILDI] Sunucudan atılma sebebi: ${reason}`);
    });

    bot.on('end', () => {
        console.log("[BİLGİ] Bağlantı bitti. 15 saniye sonra tekrar denenecek...");
        setTimeout(createBot, 15000); // 15 saniye sonra oto-yeniden bağlanma
    });
}

// Başlat
createBot();
