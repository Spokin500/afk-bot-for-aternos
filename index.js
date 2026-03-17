const mineflayer = require('mineflayer');
const fs = require('fs');
const express = require('express');
const app = express();

// --- 1. RENDER 7/24 TUTMA SİSTEMİ ---
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('PcdyfyNetwork AFK Sistemi Aktif!'));
app.listen(port, () => console.log(`[SİSTEM] Web arayüzü hazır.`));

// --- 2. AYARLARI OKU ---
let rawdata = fs.readFileSync('config.json');
let data = JSON.parse(rawdata);

// IPv6 formatındaki özel şifren
const secretPassword = "fe80:0000:0000:0000:0204:61ff:fe9d:f156";

function createPerfectBot() {
    console.log(`[BAĞLANTI] PcdyfyNetwork.aternos.me:28903 adresine bağlanılıyor...`);

    const bot = mineflayer.createBot({
        host: "PcdyfyNetwork.aternos.me", // IP'yi garantiye almak için direkt buraya da yazdım
        port: 28903,                       // Portu direkt buraya da sabitledim
        username: data["name"],
        version: "1.21.1", 
        viewDistance: "tiny",
        hideErrors: false,
        connectTimeout: 30000
    });

    // --- 3. AUTHME SİSTEMİ ---
    bot.on('messagestr', (message) => {
        const msg = message.toLowerCase();
        if (msg.includes('/login') || msg.includes('/register')) {
            console.log("[AUTHME] Giriş komutu gönderiliyor...");
            bot.chat(`/login ${secretPassword}`);
            bot.chat(`/register ${secretPassword} ${secretPassword}`);
        }
    });

    // --- 4. KAYNAK PAKETİ REDDİ ---
    bot.on('resource_pack', () => {
        console.log("[BİLGİ] Kaynak paketi reddedildi.");
        bot.denyResourcePack();
    });

    // --- 5. OYUNA GİRİŞ KONTROLÜ ---
    bot.on('spawn', () => {
        console.log("========================================");
        console.log("[BAŞARILI] PCDYFY BOT OYUNDA!");
        console.log("========================================");
    });

    // --- 6. HATA VE KOPMA YÖNETİMİ ---
    bot.on('error', (err) => {
        console.log(`[HATA] ${err.code} - ${err.message}`);
    });

    bot.on('kicked', (reason) => {
        console.log(`[ATILDI] Sebep: ${reason}`);
    });

    bot.on('end', () => {
        console.log("[BİLGİ] Bağlantı bitti. 15 saniye sonra tekrar denenecek...");
        setTimeout(createPerfectBot, 15000);
    });
}

// Sistemi Başlat
createPerfectBot();
