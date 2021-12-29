import io from 'socket.io-client'
import authentication from '../auth/auth-helper'
export const socket = io('http://localhost:3000/', {
    auth: {
        user: authentication.isAuthenticated()?.user
    }
})