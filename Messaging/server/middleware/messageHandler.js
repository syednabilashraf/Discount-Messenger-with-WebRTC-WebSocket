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
        query["senderId"] = {$in: [senderId, receiverId] }
        query["receiverId"] = {$in: [senderId, receiverId] }

        console.log(senderId, receiverId)
        const messages = await Message.find(query)
        callback(messages)
        // console.log(messages)

    }

    socket.on('joinRoom', joinRoom)
    socket.on('sendMessage', sendMessage)
    socket.on('disconnect', () => {
        console.log('disconnected', io.of('/').adapter.sids)
    })

    socket.on('getMessages', getMessages)
}

export default messageHandlers




























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
