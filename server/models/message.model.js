import mongoose from 'mongoose'

const MessageSchema = new mongoose.Schema({

    senderId: {
        type: mongoose.ObjectId,
        required : true
    },
    receiverId: {
        type: mongoose.ObjectId,
        required : true
    },
    message: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})
console.log('nani')
console.log('commit')
console.log('commit')

export default mongoose.model('Message', MessageSchema)