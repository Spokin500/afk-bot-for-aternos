const mineflayer = require('mineflayer')
const fs = require('fs');
const express = require('express');
const app = express();

// Render'ın "Service Live" kalması için gereken web sunucusu
app.get('/', (req, res) => res.send('Pcdyfy Network Sistemleri Aktif'));
app.listen(2323, () => console.log("Web arayüzü 2323 portunda hazır."));

// Config dosyasından IP, Port ve Bot İsmini çeker
let rawdata = fs.readFileSync('config.json');
let data = JSON.parse(rawdata);

// Senin istediğin IPv6 görünümlü gizli şifre
const secretPassword = "fe80:0000:0000:0000:0204:61ff:fe9d:f156";

var lasttime = -1;
var moving = 0;
var actions = ['forward', 'back', 'left', 'right'];
const pi = 3.14159;

function createMyBot() {
    const bot = mineflayer.createBot({
        host: data["ip"],
        port: parseInt(data["port"]),
        username: data["name"],
        version: "1.20.1" // Sunucun farklıysa burayı değiştirebilirsin
    });

    console.log("Bağlantı kuruluyor: " + data["ip"]);

    // AUTHME GİRİŞ SİSTEMİ
    bot.on('spawn', function() {
        console.log("Bot dünyada doğdu, AuthMe bekleniyor...");
        
        // 5 saniye bekle (Sunucu botu tam yüklemesi için)
        setTimeout(() => {
            // Önce kayıt denemesi (Eğer ilk kez giriyorsa)
            bot.chat(`/register ${secretPassword} ${secretPassword}`);
            console.log("Kayıt komutu gönderildi.");
            
            // 3 saniye sonra giriş denemesi (Zaten kayıtlıysa)
            setTimeout(() => {
                bot.chat(`/login ${secretPassword}`);
                console.log("Giriş komutu gönderildi.");
            }, 3000);
        }, 5000); 
    });

    // İNSAN TAKLİDİ (AFK havuzuna itmediysen bile Aternos'u kandırır)
    bot.on('time', function() {
        if (lasttime < 0) {
            lasttime = bot.time.age;
        } else {
            // Her 4-8 saniyede bir hareket et
            var interval = 80 + Math.random() * 80; 
            if (bot.time.age - lasttime > interval) {
                if (moving == 1) {
                    bot.setControlState(actions[Math.floor(Math.random() * actions.length)], false);
                    moving = 0;
                    lasttime = bot.time.age;
                } else {
                    // Rastgele sağa sola ve yukarı aşağı bak
                    var yaw = Math.random() * pi * 2;
                    var pitch = (Math.random() - 0.5) * pi;
                    bot.look(yaw, pitch, false);
                    
                    // Rastgele bir yöne adım at
                    let randomAction = actions[Math.floor(Math.random() * actions.length)];
                    bot.setControlState(randomAction, true);
                    moving = 1;
                    lasttime = bot.time.age;
                    bot.activateItem(); // Elindeki eşyayı kullanıyormuş gibi yapar
                }
            }
        }
    });

    // HATA YÖNETİMİ (Bot düşerse otomatik geri bağlanır)
    bot.on('error', err => console.log("Hata: " + err));
    
    bot.on('kicked', (reason) => {
        console.log("Sunucudan atıldı: " + reason);
    });

    bot.on('end', () => {
        console.log("Bağlantı kesildi. 1 dakika sonra tekrar denenecek...");
        setTimeout(createMyBot, 60000); // Sunucu kapalıysa 60 sn sonra tekrar dener
    });
}

// Başlat
createMyBot();
