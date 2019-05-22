require('dotenv').config()
require('./db')

const responseError = require('./responseError')
const app = require('express')()
const server = require('http').Server(app)

//
// ─── MIDDLEWARES ────────────────────────────────────────────────────────────────
//

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const bearerToken = require('express-bearer-token')

app.use(cors())
app.use(bearerToken())
app.use(bodyParser.json())
app.use(cookieParser())
app.use((req, res, next) => {
   res.type('json')
   req.eita = 'hehehe'
   next()
})
app.use(function(error, req, res, next) {
   if (error instanceof SyntaxError) {
      res.status(400).send({ msg: 'Something went really really wrong with the syntax (probably broken JSON).' })
   } else {
      next()
   }
})

//
// ─── ROUTES ─────────────────────────────────────────────────────────────────────
//

app.get('/', (req, res) => res.send('Hello World!'))

app.use(require('./api/user/routes'))
app.use(require('./api/world/routes'))
// app.use(require('./api/message/routes'))

app.all('*', (req, res) => res.status(404).send({ msg: 'not found' }))

//
// ─── SOCKETIO ───────────────────────────────────────────────────────────────────
//

const io = require('socket.io')(server)
const worldServices = require('./api/world/services')
const nsp = io.of('/gateway')

nsp.on('connection', socket => {
   socket.emit('hello', { message: 'connected!' })

   socket.on('enter-room', async roomId => {
      if(!await worldServices.fetchWorld(roomId)) return socket.emit('error', responseError('world-not-found', 'The world was not found.'))
      console.log(`The socket ${socket.id} joined the room ${roomId}`)
      socket.join(roomId)
   })

   socket.on('leave-room', async roomId => {
      // if(!await worldServices.fetchWorld()) return socket.emit('error', responseError('world-not-found', 'The world was not found.'))
      console.log(`The socket ${socket.id} left the room ${roomId}`)
      socket.leave(roomId)
   })

   socket.on('message', async (room, msg) => {
      socket.broadcast.to(room).emit('message', msg)
   })
})

//
// ─── INITIALIZATION ─────────────────────────────────────────────────────────────
//

const port = 3000
server.listen(port, () => console.log(`Example app listening on port ${port}!`))
