const express = require('express')

function keepAlive(getStatus) {
  const app = express()
  const port = process.env.PORT || 2323

  app.get('/', (req, res) => {
    res.send(renderPage(getStatus()))
  })

  app.get('/status', (req, res) => {
    const s = getStatus()
    res.json({
      online: s.online,
      server: s.server,
      username: s.username,
      version: s.version,
      connectedAt: s.connectedAt,
      lastEvent: s.lastEvent,
      lastError: s.lastError,
      uptimeSeconds: Math.floor((Date.now() - s.startedAt.getTime()) / 1000)
    })
  })

  app.listen(port, () => {
    console.log(`Web server is listening on port ${port}`)
  })
}

function formatDate(date) {
  if (!date) return '-'
  return date.toLocaleString('tr-TR')
}

function formatUptime(seconds) {
  if (!seconds || seconds < 0) return '-'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return h + ' saat ' + m + ' dakika ' + s + ' saniye'
}

function renderPage(s) {
  const online = s.online
  const badgeText = online ? 'ÇALIŞIYOR' : 'KAPALI'
  const badgeColor = online ? '#22c55e' : '#ef4444'
  const uptime = Math.floor((Date.now() - s.startedAt.getTime()) / 1000)

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="30">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Aternos AFK Bot</title>
<style>
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at 20% 20%, #1e293b, #0f172a 70%);
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    color: #e2e8f0;
  }
  .card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 16px;
    padding: 40px 48px;
    max-width: 480px;
    width: 90%;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, .6);
    text-align: center;
  }
  h1 {
    font-size: 1.6rem;
    margin: 0 0 6px;
  }
  .sub {
    color: #94a3b8;
    margin-bottom: 24px;
  }
  .badge {
    display: inline-block;
    padding: 8px 20px;
    border-radius: 999px;
    font-weight: 700;
    letter-spacing: .06em;
    color: #fff;
    background: ${badgeColor};
    margin-bottom: 24px;
    box-shadow: 0 0 20px ${badgeColor}66;
  }
  .rows {
    text-align: left;
  }
  .row {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #334155;
    font-size: .95rem;
  }
  .row:last-child {
    border-bottom: none;
  }
  .label {
    color: #94a3b8;
  }
  .value {
    font-weight: 600;
    word-break: break-all;
    text-align: right;
    padding-left: 16px;
  }
  .error {
    color: #f87171;
    font-weight: 600;
  }
  footer {
    margin-top: 20px;
    font-size: .8rem;
    color: #64748b;
  }
</style>
</head>
<body>
  <div class="card">
    <h1>&#9935; Aternos AFK Bot</h1>
    <div class="sub">Minecraft sunucusunda çalışıyor</div>
    <div class="badge">${badgeText}</div>
    <div class="rows">
      <div class="row"><span class="label">Durum</span><span class="value">${badgeText}</span></div>
      <div class="row"><span class="label">Sunucu</span><span class="value">${s.server}</span></div>
      <div class="row"><span class="label">Bot Adı</span><span class="value">${s.username}</span></div>
      <div class="row"><span class="label">Minecraft Sürümü</span><span class="value">${s.version}</span></div>
      <div class="row"><span class="label">Son Olay</span><span class="value">${s.lastEvent || '-'}</span></div>
      <div class="row"><span class="label">Bağlantı Zamanı</span><span class="value">${formatDate(s.connectedAt)}</span></div>
      <div class="row"><span class="label">Çalışma Süresi</span><span class="value">${formatUptime(uptime)}</span></div>
      <div class="row"><span class="label">Son Hata</span><span class="value error">${s.lastError || '-'}</span></div>
    </div>
    <footer>Sayfa her 30 saniyede bir yenilenir</footer>
  </div>
</body>
</html>`
}

module.exports = { keepAlive }