require('dotenv').config()
const db = require('./db')

const responseError = require('./responseError')
const app = require('express')()
const server = require('http').Server(app)
const io = (module.exports.io = require('socket.io')(server))

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
app.use(require('./api/message/routes'))

app.all('*', (req, res) => res.status(404).send({ msg: 'not found' }))

//
// ─── SOCKETIO ───────────────────────────────────────────────────────────────────
//

const worldServices = require('./api/world/services')
// const messageServices = require('./api/message/services')
const userServices = require('./api/user/services')

io.on('connection', socket => {
   console.log(`The socket ${socket.id} connected`)
   socket.emit('hello', { message: 'connected!' })

   socket.on('enter-room', async roomId => {
      const foundWorld = await worldServices.fetchWorld(roomId)
      const userId = await userServices.findUser({ currentSocket: socket.id })._id

      // if (!foundWorld) {return socket.emit('oops', responseError('world-not-found', 'The world was not found.'))}
      if (!foundWorld) console.log(responseError('world-not-found', 'The world was not found.'))
      // if (!foundWorld.members.includes(userId)) return socket.emit('oops', responseError('not-a-member', 'You are not in this world.'))
      if (!foundWorld.members.includes(userId)) console.log('oops', responseError('not-a-member', 'You are not in this world.'))

      console.log(userId)
      if(userId) await worldServices.modifyWorld(roomId, { $push: { activeMembers: userId } })

      console.log(`The socket ${socket.id} joined the room ${roomId}`)
      return socket.join(roomId)
   })

   socket.on('leave-room', async roomId => {
      const foundWorld = await worldServices.fetchWorld(roomId)
      const userId = await userServices.findUser({ currentSocket: socket.id })._id

      if (!foundWorld) return socket.emit('oops', responseError('world-not-found', 'The world was not found.'))

      await worldServices.modifyWorld(roomId, { $pull: { activeMembers: userId } })

      console.log(`The socket ${socket.id} left the room ${roomId}`)
      return socket.leave(roomId)
   })

   socket.on('authenticate', async token => {
      try {
         const decodedToken = await userServices.decodeToken(token)
         await userServices.modifyUser(decodedToken._id, { currentSocket: socket.id })
      } catch (err) {
         console.log(err.message)
      }
   })

   socket.on('disconnect', async () => {
      try {
         const foundUser = await userServices.findUser({ currentSocket: socket.id })
         await userServices.modifyUser(foundUser._id, { currentSocket: null })
      } catch (err) {
         console.log(err.message)
      }
   })
})

//
// ─── INITIALIZATION ─────────────────────────────────────────────────────────────
//

const port = 3000
server.listen(port, () => console.log(`Example app listening on port ${port}!`))

//
// ─── SHUTDOWN TASK ─────────────────────────────────────────────────────────────
//

const disconnectEveryoneFromEverything = require('./tasks/disconnectEveryoneFromEverything')

const shutDown = async () => {
   await disconnectEveryoneFromEverything()
   console.log('Received kill signal, shutting down gracefully');
   server.close(() => {
       console.log('Closed out remaining connections');
   });
   db.connection.close(function () {
      console.log('Mongoose default connection disconnected through app termination');
   });

   // setTimeout(() => {
   //     console.error('Could not close connections in time, forcefully shutting down');
   //     throw new Error(0)
   // }, 10000);
}

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);
