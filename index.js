const mineflayer = require('mineflayer')
const fs = require('fs');
const express = require('express');
const app = express();

// --- RENDER AYARI: Web sunucusu sayesinde botun kapanmaz ---
app.get('/', (req, res) => res.send('Pcdyfy Güvenlik ve AFK Sistemi Aktif!'));
const port = process.env.PORT || 2323;
app.listen(port, () => console.log(`Web paneli ${port} portunda hazır.`));

// --- AYARLAR: config.json dosyasından bilgileri okur ---
let rawdata = fs.readFileSync('config.json');
let data = JSON.parse(rawdata);

// IPv6 Görünümlü Gizli Şifre
const secretPassword = "fe80:0000:0000:0000:0204:61ff:fe9d:f156";

function createMyBot() {
    const bot = mineflayer.createBot({
        host: data["ip"],
        port: parseInt(data["port"]),
        username: data["name"],
        version: "1.20.1" // Sunucu sürümün 1.20.1 değilse burayı değiştir
    });

    console.log(`Bağlantı kuruluyor: ${data["ip"]}:${data["port"]}`);

    // --- ÖNEMLİ: Texture Pack (Kaynak Paketi) İsteğini Kabul Etme ---
    bot.on('resource_pack', () => {
        console.log("Sunucu paket gönderdi, kabul ediliyor...");
        bot.acceptResourcePack();
    });

    // --- AUTHME: Giriş ve Kayıt Protokolü ---
    bot.on('spawn', function() {
        console.log("Bot dünyaya indi. AuthMe işlemi başlatılıyor...");
        
        setTimeout(() => {
            // Önce Kayıt (İlk giriş için)
            bot.chat(`/register ${secretPassword} ${secretPassword}`);
            console.log("Kayıt denendi.");
            
            setTimeout(() => {
                // Sonra Giriş
                bot.chat(`/login ${secretPassword}`);
                console.log("Giriş denendi.");
            }, 3000);
        }, 5000); 
    });

    // --- İNSAN TAKLİDİ: Aternos'un AFK atmasını engeller ---
    let lasttime = -1;
    let moving = 0;
    const actions = ['forward', 'back', 'left', 'right'];
    const pi = 3.14159;

    bot.on('time', function() {
        if (lasttime < 0) {
            lasttime = bot.time.age;
        } else {
            // Her 5-10 saniyede bir ufak hareketler yapar
            let interval = 100 + Math.random() * 100; 
            if (bot.time.age - lasttime > interval) {
                if (moving == 1) {
                    actions.forEach(a => bot.setControlState(a, false));
                    moving = 0;
                    lasttime = bot.time.age;
                } else {
                    // Sağa sola bakma
                    let yaw = Math.random() * pi * 2;
                    let pitch = (Math.random() - 0.5) * pi;
                    bot.look(yaw, pitch, false);
                    
                    // Rastgele bir yöne yürüme
                    let randomAction = actions[Math.floor(Math.random() * actions.length)];
                    bot.setControlState(randomAction, true);
                    moving = 1;
                    lasttime = bot.time.age;
                    bot.activateItem(); // Elindekini kullanma taklidi
                }
            }
        }
    });

    // --- HATA VE YENİDEN BAĞLANMA ---
    bot.on('error', err => console.log("Hata oluştu: " + err));
    
    bot.on('kicked', reason => {
        console.log("Sunucudan atıldı! Sebep: " + reason);
    });

    bot.on('end', () => {
        console.log("Bağlantı kesildi. 1 dakika sonra tekrar denenecek...");
        setTimeout(createMyBot, 60000);
    });
}

// Botu başlat
createMyBot();
