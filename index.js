const mineflayer = require('mineflayer')
const fs = require('fs');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Pcdyfy Network Güvenlik Sistemi Aktif'));
app.listen(2323, () => console.log("Web arayüzü hazır."));

let rawdata = fs.readFileSync('config.json');
let data = JSON.parse(rawdata);

// IPv6 Görünümlü Gizli Şifre
const secretPassword = "2001:0db8:85a3:0000:0000:8a2e:0370:7334";

var bot = mineflayer.createBot({
  host: data["ip"],
  port: parseInt(data["port"]),
  username: data["name"],
  version: "1.20.1" 
});

var lasttime = -1;
var moving = 0;
var actions = ['forward', 'back', 'left', 'right']
var pi = 3.14159;

console.log("Bağlantı kuruluyor: " + data["ip"]);

bot.on('spawn', function() {
    console.log("Bot dünyada doğdu!");
    
    // AuthMe Protokolü
    setTimeout(() => {
        // Hem kayıt hem giriş komutunu arka arkaya gönderir
        bot.chat(`/register ${secretPassword} ${secretPassword}`);
        console.log("Kayıt denendi.");
        
        setTimeout(() => {
            bot.chat(`/login ${secretPassword}`);
            console.log("Giriş denendi.");
        }, 1500);
    }, 2000);
});

bot.on('time', function() {
    if (lasttime < 0) {
        lasttime = bot.time.age;
    } else {
        var interval = 60 + Math.random() * 100; // Hareket sıklığı
        if (bot.time.age - lasttime > interval) {
            if (moving == 1) {
                bot.setControlState(actions[Math.floor(Math.random() * actions.length)], false);
                moving = 0;
                lasttime = bot.time.age;
            } else {
                var yaw = Math.random() * pi;
                var pitch = (Math.random() - 0.5) * pi;
                bot.look(yaw, pitch, false);
                bot.setControlState(actions[Math.floor(Math.random() * actions.length)], true);
                moving = 1;
                lasttime = bot.time.age;
            }
        }
    }
});

bot.on('error', err => console.log("Hata: " + err));
bot.on('kicked', reason => console.log("Atıldı: " + reason));
bot.on('end', () => console.log("Bağlantı bitti."));

