const mineflayer = require('mineflayer');
const fs = require('fs');
const express = require('express');

// --- 1. RENDER 7/24 TUTMA SİSTEMİ (EXPRESS) ---
const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.send('PcdyfyNetwork Mehmet Botu 7/24 Aktif!');
});

app.listen(port, () => {
    console.log(`[WEB] Render web servisi ${port} portunda dinleniyor.`);
});

// --- 2. AYARLARI OKU ---
const rawdata = fs.readFileSync('config.json');
const config = JSON.parse(rawdata);

const botPassword = "boti"; // Senin belirlediğin şifre

// --- 3. BOT OLUŞTURMA FONKSİYONU ---
function createBot() {
    console.log(`[SİSTEM] ${config.ip}:${config.port} adresine bağlanılıyor...`);

    const bot = mineflayer.createBot({
        host: config.ip,
        port: parseInt(config.port),
        username: config.name, // "Mehmet" olarak config.json'dan çekecek
        version: "1.21.1",     // İstediğin sürüm
        hideErrors: false
    });

    // --- 4. AUTHME (LOGİN / REGİSTER) SİSTEMİ ---
    // Bot sohbete gelen mesajları her zaman tarar
    bot.on('message', (message) => {
        const msg = message.toString().toLowerCase(); // Mesajı küçük harfe çevirip okuyoruz

        // Eğer chatte register (kayıt ol) kelimesi geçerse
        if (msg.includes('/register')) {
            console.log("[AUTHME] Kayıt olunuyor...");
            bot.chat(`/register ${botPassword} ${botPassword}`);
        }
        
        // Eğer chatte login (giriş yap) kelimesi geçerse
        if (msg.includes('/login')) {
            console.log("[AUTHME] Giriş yapılıyor...");
            bot.chat(`/login ${botPassword}`);
        }
    });

    // --- 5. OYUNA BAŞARIYLA GİRİŞ ---
    bot.on('spawn', () => {
        console.log("========================================");
        console.log(`[BAŞARILI] Bot ${bot.username} oyuna girdi!`);
        console.log("========================================");
        // Bot sadece yerinde duracak, hareket kodları eklenmedi (sen halledeceksin)
    });

    // --- 6. HATA VE YENİDEN BAĞLANMA YÖNETİMİ ---
    bot.on('kicked', (reason) => {
        console.log(`[SUNUCUDAN ATILDI] Sebep: ${reason}`);
    });

    bot.on('error', (err) => {
        console.log(`[HATA OLUŞTU] ${err.message}`);
    });

    bot.on('end', () => {
        console.log("[BAĞLANTI KOPTU] Sunucu kapandı veya bot düştü.");
        console.log("[SİSTEM] 15 saniye içinde tekrar bağlanmaya çalışılacak...");
        setTimeout(createBot, 15000); // 15 saniye sonra createBot fonksiyonunu tekrar çağırır
    });
}

// Botu ilk defa başlat
createBot();
