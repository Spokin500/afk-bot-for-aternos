const mineflayer = require('mineflayer')
const fs = require('fs')
const path = require('path')
const { keepAlive } = require('./keep_alive')

let rawdata = fs.readFileSync(path.join(__dirname, 'config.json'))
let data = JSON.parse(rawdata)

const host = data["ip"]
const port = parseInt(data["port"], 10) || 25565
const username = data["name"]
const version = '1.21.11'

const status = {
  online: false,
  server: host + ':' + port,
  username: username,
  version: version,
  startedAt: new Date(),
  connectedAt: null,
  lastEvent: 'Başlatılıyor...',
  lastError: null,
  lastKick: null
}

keepAlive(() => status)

var actions = ['forward', 'back', 'left', 'right']
var pi = 3.14159
var moveinterval = 2
var maxrandom = 5

function createBot() {
  var lasttime = -1
  var moving = 0
  var connected = 0
  var lastaction

  const bot = mineflayer.createBot({
    host: host,
    port: port,
    username: username,
    version: version,
    auth: 'offline'
  })

  bot.on('login', function () {
    console.log('Logged In')
    status.lastEvent = 'Giriş yapıldı'
  })

  bot.on('time', function () {
    if (connected < 1) return
    if (lasttime < 0) {
      lasttime = bot.time.age
    } else {
      var randomadd = Math.random() * maxrandom * 20
      var interval = moveinterval * 20 + randomadd
      if (bot.time.age - lasttime > interval) {
        if (moving === 1) {
          bot.setControlState(lastaction, false)
          moving = 0
          lasttime = bot.time.age
        } else {
          var yaw = Math.random() * pi - (0.5 * pi)
          var pitch = Math.random() * pi - (0.5 * pi)
          bot.look(yaw, pitch, false)
          lastaction = actions[Math.floor(Math.random() * actions.length)]
          bot.setControlState(lastaction, true)
          moving = 1
          lasttime = bot.time.age
          bot.activateItem()
        }
      }
    }
  })

  bot.on('spawn', function () {
    connected = 1
    status.online = true
    status.connectedAt = new Date()
    status.lastError = null
    status.lastKick = null
    status.lastEvent = 'Sunucuda, AFK olarak çalışıyor'
    console.log('Spawned on server, bot is now AFK')
  })

  bot.on('kicked', function (reason) {
    status.online = false
    status.lastKick = typeof reason === 'string' ? reason : JSON.stringify(reason)
    status.lastEvent = 'Sunucudan atıldı'
    console.log('Kicked:', status.lastKick)
  })

  bot.on('error', function (err) {
    status.online = false
    status.lastError = err && err.message ? err.message : String(err)
    status.lastEvent = 'Bağlantı hatası'
    console.log('Error:', status.lastError)
  })

  bot.on('end', function () {
    status.online = false
    status.lastEvent = 'Bağlantı kesildi, 15 saniye sonra yeniden bağlanılıyor...'
    console.log('Disconnected. Reconnecting in 15 seconds...')
    setTimeout(createBot, 15000)
  })
}

createBot()