const mineflayer = require('mineflayer');
const fs = require('fs');
const express = require('express');
const app = express();

// --- 1. RENDER 7/24 AÇIK TUTMA SİSTEMİ ---
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Pcdyfy AFK Sistemi Kusursuz Şekilde Çalışıyor!'));
app.listen(port, () => console.log(`[SİSTEM] Web paneli ${port} portunda hazır.`));

// --- 2. AYARLARI ÇEKME ---
let rawdata = fs.readFileSync('config.json');
let data = JSON.parse(rawdata);

// Senin özel IPv6 gizli şifren
const secretPassword = "fe80:0000:0000:0000:0204:61ff:fe9d:f156";

function createPerfectBot() {
    const bot = mineflayer.createBot({
        host: data["ip"],
        port: parseInt(data["port"]),
        username: data["name"],
        version: "1.21.1", // Loglarda gördüğümüz tam sürüm
        hideErrors: true   // Gereksiz konsol kalabalığını gizler
    });

    console.log(`[BAĞLANTI] Sunucuya giriliyor: ${data["ip"]}:${data["port"]}`);

    // --- 3. TEXTURE PACK KORUMASI ---
    bot.on('resource_pack', () => {
        console.log("[KORUMA] Sunucu paket gönderdi, otomatik kabul edildi.");
        bot.acceptResourcePack();
    });

    // --- 4. SÜPER HIZLI AUTHME (Zaman Aşımını Engeller) ---
    bot.on('spawn', function() {
        console.log("[OYUN] Bot dünyaya indi! Şifre işlemleri başlıyor...");
        
        // Timeout yememek için sadece 1 saniye bekleyip şifreyi yazıyoruz
        setTimeout(() => {
            bot.chat(`/register ${secretPassword} ${secretPassword}`);
            
            // Register ve Login çakışmasın diye araya yarım saniye (500ms) koyduk
            setTimeout(() => {
                bot.chat(`/login ${secretPassword}`);
                console.log("[AUTHME] Giriş komutları başarıyla gönderildi!");
            }, 500);
            
        }, 1000); 
    });

    // --- 5. ÖLÜM KORUMASI (Şimşek veya mob öldürürse) ---
    bot.on('death', () => {
        console.log("[UYARI] Bot öldü! Yeniden doğuyor...");
        bot.chat('/respawn');
    });

    // --- 6. KUSURSUZ İNSAN TAKLİDİ VE ANTİ-AFK ---
    bot.on('time', () => {
        // Sunucu zamanına göre düzenli ama rastgele hareketler
        if (bot.time.age % 100 === 0) {
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 500);
            
            // Kafasını rastgele yönlere çevirir
            const yaw = Math.random() * Math.PI * 2;
            const pitch = (Math.random() - 0.5) * Math.PI;
            bot.look(yaw, pitch, false);
        }
    });

    // --- 7. HATA VE ATILMA YÖNETİMİ ---
    bot.on('kicked', reason => {
        console.log("\n[HATA - SUNUCUDAN ATILDI]");
        console.log("Sebep: " + reason);
        console.log("--------------------------\n");
    });

    bot.on('error', err => {
        console.log("[SİSTEM HATASI] " + err.message);
    });

    // Bağlantı koparsa veya sunucu kapanırsa asla pes etmez, tekrar dener
    bot.on('end', () => {
        console.log("[BAĞLANTI KOPTU] 15 saniye sonra sunucuya tekrar bağlanılacak...");
        setTimeout(createPerfectBot, 15000); // 15 saniye bekleme
    });
}

// Sistemi Başlat
createPerfectBot();
