import Message from "../models/message.model"

const messageHandlers = (io, socket) => {
    const joinRoom = (email) => {
        socket.join(email)
        console.log(email)
    }

    const sendMessage = async (messageDetails) => {
        try {
            console.log(messageDetails)
            io.to(messageDetails.receiverId).emit('receiveMessage', messageDetails)
            const newMessage = new Message(messageDetails)
            const response = await newMessage.save()
            console.log(response)
        }
        catch (err) {
            console.log(err)
        }
    }

    const getMessages = async (senderId, receiverId, callback) => {
        let query = {}
        query["senderId"] = { $in: [senderId, receiverId] }
        query["receiverId"] = { $in: [senderId, receiverId] }

        console.log(senderId, receiverId)
        const messages = await Message.find(query)
        callback(messages)
        // console.log(messages)

    }

    const handleFileUpload = async (file) => {
        console.log(file)
    }

    const handleSendVideoOffer = (sender, receiver, sdp) => {
        console.log(`sending video offer from${sender} to ${receiver}`)
        console.log(sdp)
        io.to(receiver).emit('receiveVideoOffer', sender, receiver, sdp)

    }

    const handleSendVideoAnswer = (sender, receiver, sdp) => {
        console.log(`sending video answer from${sender} to ${receiver}`)
        console.log(sdp)
        io.to(receiver).emit('receiveVideoAnswer',sender, receiver,sdp)

    }

    const handleNewIceCandidate = (receiver, candidate) => {
        console.log(`sending ice candidate to ${receiver}`)
        io.to(receiver).emit("receiveNewIceCandidate", candidate)
        console.log(`icecandidate sent to ${receiver}`, candidate)
    }

    const handleSendHangUp = (sender, receiver) => {
        console.log("hanging up")
        io.to(receiver).emit('receiveHangUp')
    }

    socket.on('joinRoom', joinRoom)
    socket.on('sendMessage', sendMessage)
    socket.on('disconnect', () => {
        console.log('disconnected', io.of('/').adapter.sids)
    })

    socket.on('getMessages', getMessages)
    socket.on('fileUpload', handleFileUpload)
    socket.on('sendVideoOffer', handleSendVideoOffer)
    socket.on('sendVideoAnswer', handleSendVideoAnswer)
    socket.on('sendNewIceCandidate', handleNewIceCandidate)
    socket.on('sendHangUp', handleSendHangUp)

}

export default messageHandlers

/*
---caller side---

create rtc peerConnection with iceServers and add all event handlers (createPeerconnection)
sender gets displayMedia/userMedia and creates stream
stream is added to local video's srcObject with a ref
all tracks in stream are added to peerConnection

After adding all tracks, negotiationNeeded event is triggered on peerConnection
--handle negotiation:
create offer
setLocalDescription as offer
send {sender, receiver, localDescription} to signalling server with "send-video-offer" event
server sends {sender, receiver, localDescription} to receiver in "receive-video-offer" event


---receiver side---

Receiver listens to "receive-video-offer" event which has {sender, receiver, localDescription}
create peerConnection
create RTCSessionDescription object with the caller's sdp
set the object as remoteDescription for peerConnection
receiver gets displayMedia/userMedia and creates stream
stream is added to local video's srcObject with a ref
all tracks in stream are added to peerConnection
peerConnection creates answer
the answer is set as localDescription of peerConnection
send {localDescription,targetId} to signalling server
signalling server sends sdp of receiver to caller in 'receive-video-answer' event

---caller side---
caller receives {localDescription,targetId}
caller creates RTCSessionDescription object with receivers sdp
set object as remoteDescription for peerConnection








*/




























/*
-- client connects to server => 
-- client joins a room
-- server listens to messages from client
-- server saves the message in mongodb with {sender id,receiverid, message, createdTime}
-- if receiver client is online => server sends the messages to receiver client socket room
-- 

-- client1 clicks  client2
-- client1 will then receive all messages from mongodb message collection that has sender/receiver id = client1/client2 id


*/
