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

/*
client creates stream 
all stream tracks are added to peerConnection
--negotiationneeded event triggered
sdp offer is created and set as localDescription
--onsignalingstatechange triggered (becomes "have-local-offer")
sdp offer is sent to receiver through signalling server
onicegatheringstatechange,oniceCandidate events triggered

receiver receives client sdp in video offer
sets client sdp as RTCSessionDescription which is set as remoteDescription
--onsignalingstatechange triggered (becomes "have-remote-offer")
--ontrack event triggered
--receiver also starts receiving ice candidates sent by client until client stops sending
when receiver shares a screen, sdp answer is created and set as localDescription
the sdp answer is then sent to client

client receives receiver's sdp in video answer
sets receivers sdp as remoteDescription
--onsignalingstatechange triggered (becomes "state")
--ontrack event triggered and receivers media is added to client
--oniceconnectionstatechange triggered which changes to "checking" and then to "connected"



*/