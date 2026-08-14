# Aternos AFK Bot

Aternos Minecraft sunucularında AFK kalan, Render'a (web service) uyumlu bir bot. Aynı zamanda botun durumunu gösteren bir web sayfası sunar.

- Minecraft **1.21.11** sürümünü kullanır
- Varsayılan sunucu: `PcdyfyNetwork.aternos.me:19444`
- Bağlantı koparsa 15 saniye sonra otomatik yeniden bağlanır
- Web sayfası `/` adresinde **"Aternos AFK Bot Çalışıyor"** durumunu gösterir

## Ayarlar

`config.json` dosyasından düzenlenir:

```json
{
  "ip": "PcdyfyNetwork.aternos.me",
  "port": "19444",
  "name": "afk_bot"
}
```

## Render'a Deploy Etme

1. Bu repoyu GitHub'a yükleyin (örn. `afk-bot`).
2. [render.com](https://render.com) hesabınıza girin.
3. **New > Blueprint** seçip GitHub reponuzu bağlayın — hazır olan `render.yaml` ile servis otomatik kurulur (Frankfurt bölgesinde). Ya da **New > Web Service** seçip:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Deploy edin. Bot, Render tarafından verilen `PORT` değişkenini kullanır (web sayfası otomatik yayınlanır).

> **Önemli:** Servisi **Frankfurt** bölgesinde oluşturun. Aternos sunucuları Almanya'da barındırılır; uzak bölgelerden TCP bağlantısı engellenebilir (`connect ETIMEDOUT`). Render bölgeyi sonradan değiştirmez — yanlış bölgedeyse servisi silip Frankfurt'ta yeniden oluşturun.

> **Aternos bot koruması:** Aternos, datacenter IP'lerini ve bot bağlantılarını engelleyebilir (SYN paketleri sessizce düşürülür → `connect ETIMEDOUT`). Bot bir kez girdiyse sonra engelliyse, Render servisini **silip yeniden oluşturun** (taze IP alırsınız). Bot artık 30 saniyeden başlayıp en fazla 5 dakikaya kadar üstel geri çekilmeyle yeniden dener — engel süresi dolduğunda tekrar girebilir, ancak sürekli denemeyle engeli uzatmaz.

## Kapanmaması İçin (Keep Alive)

Render'ın ücretsiz planı, 15 dakika istek gelmezse servisi uyutur. Kapanmaması için bir monitor (ör. [UptimeRobot](https://uptimerobot.com)) ile sitenize her 5 dakikada bir ping atın. Böylece servis sürekli ayakta kalır.

## Çalıştırma (yerel)

```
npm install
npm start
```

Web sayfası: `http://localhost:2323` (veya `PORT` ayarlanmışsa o port). JSON durumu: `http://localhost:2323/status`

> Not: Aternos sunucusu botun adını kabul etmiyorsa (login/whitelist eklentisi), botu beyaz listeye ekleyin.