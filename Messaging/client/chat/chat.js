import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import unicornbikeImg from './../assets/images/unicornbike.jpg'
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Fab from '@material-ui/core/Fab';
import SendIcon from '@material-ui/icons/Send';
import { io } from 'socket.io-client'
import { list } from '../user/api-user'
import { Button } from '@material-ui/core'

// const useStyles = makeStyles(theme => ({
//   card: {
//     maxWidth: 600,
//     margin: 'auto',
//     marginTop: theme.spacing(5),
//     marginBottom: theme.spacing(5)
//   },
//   title: {
//     padding:`${theme.spacing(3)}px ${theme.spacing(2.5)}px ${theme.spacing(2)}px`,
//     color: theme.palette.openTitle
//   },
//   media: {
//     minHeight: 400
//   },
//   credit: {
//     padding: 10,
//     textAlign: 'right',
//     backgroundColor: '#ededed',
//     borderBottom: '1px solid #d0d0d0',
//     '& a':{
//       color: '#3f4771'
//     } 
//   }
// }))

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  chatSection: {
    width: '100%',
    height: '80vh'
  },
  headBG: {
    backgroundColor: '#e0e0e0'
  },
  borderRight500: {
    borderRight: '1px solid #e0e0e0'
  },
  messageArea: {
    height: '70vh',
    overflowY: 'auto'
  }
});

export default function Chat() {

  const [textMessage, setTextMessage] = useState('')
  const [socketInstance, setSocketInstance] = useState()
  useEffect(() => {
    list().then(data => {
      console.log(data)
      setUsers(data)
    })
    const { user } = JSON.parse(sessionStorage.getItem('jwt'))
    setSender(user._id)
    console.log(user)

    const socket = io('http://localhost:3000/', {
      auth: {
        user
      }
    });


    setSocketInstance(socket)
    socket.on('connect', () => {
      console.log('connected')
    })

    socket.on('receiveMessage', (message) => {
      console.log(messages.concat(message))
      setMessages(messages.concat(message))
    })


    return function cleanup() {
      socket.disconnect()
    }
  }, [])

  const handleSendMessage = () => {
    console.log(textMessage)
    const messageDetails = {

      senderId: sender,
      receiverId: receiver,
      message: textMessage,
      createdAt: Date.now()

    }
    socketInstance?.emit('sendMessage', messageDetails)
    setMessages(messages.concat(messageDetails))
    setTextMessage('')
  }

  const handleTextMessage = (e) => {
    setTextMessage(e.target.value)
  }

  const classes = useStyles()

  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([{
    senderId: 1,
    receiverId: 2,
    message: "Hey man, What's up ?",
  }, {
    senderId: 2,
    receiverId: 1,
    message: "Hey, I am Good! What about you ?",
  }, {
    senderId: 1,
    receiverId: 2,
    message: "Cool. i am good, let's catch up!",
  }, {
    senderId: 2,
    receiverId: 1,
    message: "chotto mattee",
  }])

  const [sender, setSender] = useState('')
  const [receiver, setReceiver] = useState('')
  // const sample = [{
  //   senderId: 1,
  //   receiverId: 2,
  //   message: "Hey man, What's up ?",
  // }, {
  //   senderId: 2,
  //   receiverId: 1,
  //   message: "Hey, I am Good! What about you ?",
  // }, {
  //   senderId: 1,
  //   receiverId: 2,
  //   message: "Cool. i am good, let's catch up!",
  // }, {
  //   senderId: 2,
  //   receiverId: 1,
  //   message: "chotto mattee",
  // }
  // ]



  const handleReceiverSelection = (user) => () => {
    console.log(sender, user._id)
    if (sender != user._id) {
      socketInstance.emit('getMessages', sender, user._id, (messages) => {
        console.log('messages', messages)
        setMessages(messages)
      })
      console.log('clicked', user)
      setReceiver(user._id)
    }
  }

  return (
    <div>
      <Grid container>
        <Grid item xs={12} >
          <Typography variant="h5" className="header-message">TechHack</Typography>
        </Grid>
      </Grid>
      <Grid container component={Paper} className={classes.chatSection}>
        <Grid item xs={3} className={classes.borderRight500}>
          <List>
            {users.map((user, index) =>
              <ListItem key={index} onClick={handleReceiverSelection(user)}>
                <ListItemIcon>
                  <Avatar alt="Remy Sharp" src="https://material-ui.com/static/images/avatar/1.jpg" />
                </ListItemIcon>
                <ListItemText >{user.name}</ListItemText>
                <ListItemText secondary="online" align="right"></ListItemText>
              </ListItem>
            )}
          </List>
          {/* <Divider />
                <Grid item xs={12} style={{padding: '10px'}}>
                    <TextField id="outlined-basic-email" label="Search" variant="outlined" fullWidth />
                </Grid>
                <Divider /> */}

        </Grid>
        <Grid item xs={9}>
          <List className={classes.messageArea}>
            {messages.map((message, index) => {
              return <ListItem key={index}>
                <Grid container>
                  <Grid item xs={12}>
                    <ListItemText align={message.senderId == sender ? "right" : "left"} primary={message.message}></ListItemText>
                  </Grid>
                  <Grid item xs={12}>
                    <ListItemText align={message.senderId == sender ? "right" : "left"} secondary="09:30"></ListItemText>
                  </Grid>
                </Grid>
              </ListItem>
            })}

          </List>
          <Divider />
          <Grid container style={{ padding: '20px' }}>
            <Grid item xs={11}>
              <TextField id="outlined-basic-email" label="Type Something" fullWidth
                value={textMessage} onChange={handleTextMessage}
              />
            </Grid>
            <Grid xs={1} align="right">
              <Fab color="primary" aria-label="add" onClick={handleSendMessage}><SendIcon /></Fab>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

