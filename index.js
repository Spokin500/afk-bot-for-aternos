const mineflayer = require('mineflayer');
const fs = require('fs');
const express = require('express');
const app = express();

// --- 1. RENDER 7/24 AÇIK TUTMA SİSTEMİ ---
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Pcdyfy AFK Sistemi Kusursuz Çalışıyor!'));
app.listen(port, () => console.log(`[SİSTEM] Web paneli ${port} portunda hazır.`));

// --- 2. AYARLARI ÇEKME ---
let rawdata = fs.readFileSync('config.json');
let data = JSON.parse(rawdata);

// Gizli Şifre
const secretPassword = "fe80:0000:0000:0000:0204:61ff:fe9d:f156";

function createPerfectBot() {
    const bot = mineflayer.createBot({
        host: data["ip"],
        port: parseInt(data["port"]),
        username: data["name"],
        version: false,  // Otomatik sürüm algılama (1.20 mi 1.21 mi kendi bulur)
        hideErrors: true 
    });

    console.log(`[BAĞLANTI] Sunucuya giriliyor: ${data["ip"]}:${data["port"]}`);

    // --- 3. TEXTURE PACK REDDETME (HAYIR DEME) ---
    bot.on('resource_pack', () => {
        console.log("[KORUMA] Sunucu paket indirmek istedi, 'HAYIR' denilerek reddedildi.");
        bot.denyResourcePack(); // İndirmeyi reddeder
    });

    // --- 4. AKILLI AUTHME SİSTEMİ (Sohbeti Okur) ---
    bot.on('messagestr', (message) => {
        let text = message.toLowerCase();
        
        // Sunucu "register" kelimesi geçen bir mesaj atarsa
        if (text.includes('/register')) {
            console.log("[AUTHME] Kayıt isteği okundu, şifre yazılıyor...");
            bot.chat(`/register ${secretPassword} ${secretPassword}`);
        }
        
        // Sunucu "login" kelimesi geçen bir mesaj atarsa
        if (text.includes('/login')) {
            console.log("[AUTHME] Giriş isteği okundu, şifre yazılıyor...");
            bot.chat(`/login ${secretPassword}`);
        }
    });

    // --- 5. ÖLÜM KORUMASI ---
    bot.on('death', () => {
        console.log("[UYARI] Bot öldü! Yeniden doğuyor...");
        bot.chat('/respawn');
    });

    // --- 6. İNSAN TAKLİDİ (Anti-AFK) ---
    bot.on('time', () => {
        if (bot.time.age % 150 === 0) {
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 500);
        }
    });

    // --- 7. BAĞLANTI KONTROLÜ VE HATA YÖNETİMİ ---
    bot.on('kicked', reason => {
        console.log("\n[SUNUCUDAN ATILDI] Sebep: " + reason);
    });

    bot.on('error', err => {
        console.log("[SİSTEM HATASI] " + err.message);
    });

    bot.on('end', () => {
        console.log("[BAĞLANTI KOPTU] 15 saniye sonra tekrar denenecek...");
        setTimeout(createPerfectBot, 15000);
    });
}

// Sistemi Başlat
createPerfectBot();
