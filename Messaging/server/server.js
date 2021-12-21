import config from './../config/config'
import app from './express'
import mongoose from 'mongoose'
import http from 'http'
import { Server } from 'socket.io'
import registerMessageHandlers from './middleware/messageHandler'

// Connection URL
mongoose.Promise = global.Promise
mongoose.connect(config.mongoUri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${config.mongoUri}`)
})

const httpServer = http.createServer(app)
const io = new Server(httpServer)
const onConnection = async (socket) => {
  registerMessageHandlers(io, socket)
  const userInfo = socket.handshake.auth.user
  console.log('userinfo', userInfo._id)
  socket.join(`${userInfo._id}`)
  console.log('rooms',io.of('/').adapter.rooms.entries())
}

io.on("connection", onConnection)



httpServer.listen(config.port, (err) => {
  if (err) {
    console.log(err)
  }
  console.info('Server started on port %s.', config.port)
})


//  {room : socketId}
//  