const mineflayer = require('mineflayer')
const fs = require('fs');
const express = require('express'); // keep_alive yerine daha sağlam express kullandık
const app = express();

// RENDER'IN KAPANMAMASI İÇİN WEB SUNUCUSU
app.get('/', (req, res) => res.send('Sistem Aktif!'));
app.listen(2323, () => console.log("Web arayüzü hazır."));

// AYARLARI DOSYADAN OKU
let rawdata = fs.readFileSync('config.json');
let data = JSON.parse(rawdata);

var lasttime = -1;
var moving = 0;
var actions = ['forward', 'back', 'left', 'right']
var lastaction;
var pi = 3.14159;
var moveinterval = 2; 
var maxrandom = 5; 

// BOTU OLUŞTUR (Port eklendi!)
var bot = mineflayer.createBot({
  host: data["ip"],
  port: parseInt(data["port"]), // Port numarasını buradan okur
  username: data["name"],
  version: "1.20.1" // Sunucu sürümüne göre burayı değiştirebilirsin
});

console.log("Sunucuya bağlanılmaya çalışılıyor: " + data["ip"]);

bot.on('login', function() {
    console.log("Bot sunucuya giriş yaptı (Login)!");
});

// AUTHME GİRİŞİ VE HAREKET BAŞLATMA
bot.on('spawn', function() {
    console.log("Bot dünyada doğdu (Spawn)!");
    
    // AuthMe şifreni buraya yaz (123456 kısmını değiştir)
    setTimeout(() => {
        bot.chat('/login 123456'); 
        console.log("Giriş komutu gönderildi.");
    }, 2000);
});

bot.on('time', function() {
    if (lasttime < 0) {
        lasttime = bot.time.age;
    } else {
        var randomadd = Math.random() * maxrandom * 20;
        var interval = moveinterval * 20 + randomadd;
        if (bot.time.age - lasttime > interval) {
            if (moving == 1) {
                bot.setControlState(lastaction, false);
                moving = 0;
                lasttime = bot.time.age;
            } else {
                var yaw = Math.random() * pi - (0.5 * pi);
                var pitch = Math.random() * pi - (0.5 * pi);
                bot.look(yaw, pitch, false);
                lastaction = actions[Math.floor(Math.random() * actions.length)];
                bot.setControlState(lastaction, true);
                moving = 1;
                lasttime = bot.time.age;
                bot.activateItem();
            }
        }
    }
});

// HATA OLURSA BOTUN KAPANMASINI ENGELLER
bot.on('error', err => console.log("Hata: " + err));
bot.on('kicked', reason => console.log("Sunucudan atıldı: " + reason));
bot.on('end', () => console.log("Bağlantı kesildi."));

