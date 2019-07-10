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

   socket.on('authenticate', async (token, cb) => {
      try {
         const decodedToken = await userServices.decodeToken(token)
         await userServices.modifyUser(decodedToken._id, { currentSocket: socket.id })
         cb(true)
         console.log(`User ${decodedToken._id} authenticated and updated with socket ${socket.id}`)
      } catch (err) {
         console.log(err.message)
      }
   })

   socket.on('enter-room', async roomId => {
      const foundWorld = await worldServices.fetchWorld(roomId)
      const user = await userServices.findUser({ currentSocket: socket.id })
      const userId = user._id.toString()

      if (!foundWorld) return console.log(responseError('world-not-found', 'The world was not found.'))
      if (!foundWorld.members.some(member => member.user._id.toString() === userId)) {
         return console.log(responseError('not-a-member', 'You are not in this world.'))
      }

      const subdocumentId = foundWorld.members.find(member => member.user._id.toString() === userId)._id
      foundWorld.members.id(subdocumentId).online = true
      await foundWorld.save()

      const privateUser = Object.assign({}, user._doc)
      delete privateUser.password
      delete privateUser.email

      socket.broadcast.to(roomId).emit('joining-player', { player: userId, room: roomId })

      console.log(`The socket ${socket.id} joined the room ${roomId}`)
      return socket.join(roomId)
   })

   socket.on('leave-room', async roomId => {
      try {
         const foundWorld = await worldServices.fetchWorld(roomId)
         const user = await userServices.findUser({ currentSocket: socket.id })
         const userId = user._id.toString()

         if (!foundWorld) return socket.emit('oops', responseError('world-not-found', 'The world was not found.'))

         const subdocumentId = foundWorld.members.find(member => member.user._id.toString() === userId)._id
         foundWorld.members.id(subdocumentId).online = false
         await foundWorld.save()

         socket.broadcast.to(roomId).emit('leaving-player', { player: userId, room: roomId })

         console.log(`The socket ${socket.id} left the room ${roomId}`)
         return socket.leave(roomId)
      } catch (error) {
         console.log(error)
      }
   })

   socket.on('disconnect', async () => {
      console.log(`The socket ${socket.id} disconnected`)
      try {
         const foundUser = await userServices.findUser({ currentSocket: socket.id })
         const worldsUserIsIn = await worldServices.fetchWorlds({ 'members.user': foundUser._id }, 0, 1000)

         await userServices.modifyUser(foundUser._id, { currentSocket: null })
         await worldServices.modifyWorlds({ 'members.user': foundUser._id }, { 'members.$.online': false })

         worldsUserIsIn.forEach(world => {
            socket.broadcast.to(world._id).emit('leaving-player', { player: foundUser._id, room: world._id })
         })
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

const gracefulShutdown = async (finalKillMsg, cb) => {
   const shutdownTimeout = setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down')
      process.exit(1)
   }, 5000)

   try {
      console.log('Received kill signal, shutting down gracefully')
      await disconnectEveryoneFromEverything()
      await server.close()
      console.log('Closed out remaining connections')
      await db.connection.close()
      console.log('Mongoose default connection disconnected through app termination')
      console.log(`Type of termination: ${finalKillMsg}`)
      clearTimeout(shutdownTimeout)
      cb()
   } catch (error) {
      console.error(error, 'Error during stop.')
      process.exit(1)
   }
}

// For nodemon restarts
process.once('SIGUSR2', () => {
   gracefulShutdown('Nodemon restart', () => {
      process.kill(process.pid, 'SIGUSR2')
   })
})
// For app termination
process.once('SIGINT', () => {
   gracefulShutdown('App termination', () => {
      process.kill(process.pid, 'SIGINT')
   })
})
// For Heroku app termination
process.once('SIGTERM', () => {
   gracefulShutdown('Heroku app termination', () => {
      process.kill(process.pid, 'SIGTERM')
   })
})
