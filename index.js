const mineflayer = require('mineflayer');
const fs = require('fs');
const express = require('express');
const app = express();

/**
 * --- 1. RENDER 7/24 AKTİF TUTMA SİSTEMİ ---
 * Render'ın "Service is live" demesi ve kapanmaması için minik bir web sitesi açar.
 */
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Pcdyfy AFK Sistemi 7/24 Kesintisiz Çalışıyor!'));
app.listen(port, () => console.log(`[SİSTEM] Web arayüzü ${port} portunda hazır.`));

/**
 * --- 2. AYARLARI ÇEKME ---
 */
let rawdata = fs.readFileSync('config.json');
let data = JSON.parse(rawdata);

// Güvenli şifre (IPv6 formatındaki şifren)
const secretPassword = "fe80:0000:0000:0000:0204:61ff:fe9d:f156";

function createPerfectBot() {
    console.log(`[BAĞLANTI] ${data["ip"]} adresine bağlanılıyor...`);

    const bot = mineflayer.createBot({
        host: data["ip"],
        port: parseInt(data["port"]),
        username: data["name"],
        version: "1.21.1", // Protokol hatasını önlemek için sabit sürüm
        viewDistance: "tiny", // RAM tasarrufu için görüş mesafesi en düşükte
        checkTimeoutInterval: 60000
    });

    /**
     * --- 3. KAYNAK PAKETİ KORUMASI ---
     * Sunucu paket indirmek isterse "Hayır" diyerek reddeder.
     */
    bot.on('resource_pack', () => {
        console.log("[KORUMA] Kaynak paketi isteği reddedildi (HAYIR).");
        bot.denyResourcePack();
    });

    /**
     * --- 4. AKILLI SOHBET OKUYUCU (AUTHME) ---
     * Ekranda /login veya /register yazısını gördüğü an şifreyi yapıştırır.
     */
    bot.on('messagestr', (message) => {
        const text = message.toLowerCase();
        
        if (text.includes('/register')) {
            console.log("[AUTHME] Kayıt olma mesajı algılandı.");
            bot.chat(`/register ${secretPassword} ${secretPassword}`);
        } 
        else if (text.includes('/login')) {
            console.log("[AUTHME] Giriş yapma mesajı algılandı.");
            bot.chat(`/login ${secretPassword}`);
        }
    });

    /**
     * --- 5. OYUN İÇİ ETKİNLİKLER ---
     */
    bot.on('spawn', () => {
        console.log("------------------------------------------");
        console.log("[BAŞARILI] Bot sunucuya girdi ve dünyada doğdu!");
        console.log("------------------------------------------");
    });

    bot.on('death', () => {
        console.log("[UYARI] Bot öldü, otomatik yeniden doğuluyor...");
        bot.chat('/respawn');
    });

    // AFK kalmamak için her 2 dakikada bir zıplar ve etrafına bakar
    bot.on('time', () => {
        if (bot.time.age % 140 === 0) {
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 500);
            
            // Rastgele bir yöne bak (İnsan taklidi)
            const yaw = Math.random() * Math.PI * 2;
            bot.look(yaw, 0, false);
        }
    });

    /**
     * --- 6. HATA VE BAĞLANTI YÖNETİMİ ---
     */
    bot.on('kicked', (reason) => {
        console.log("[ATILDI] Sunucudan atılma sebebi: " + reason);
    });

    bot.on('error', (err) => {
        if (err.message.includes('minecraftVersion')) return; // Gereksiz logları temizle
        console.log("[HATA] Bir sorun oluştu: " + err.message);
    });

    bot.on('end', () => {
        console.log("[KOPMA] Bağlantı bitti. 15 saniye içinde tekrar denenecek...");
        setTimeout(createPerfectBot, 15000);
    });
}

// Botu ilk kez başlat
createPerfectBot();
