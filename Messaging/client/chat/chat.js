import React, { useEffect, useState, useRef } from 'react'
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
import { Button, IconButton } from '@material-ui/core'
import AttachFileIcon from '@material-ui/icons/AttachFile';
import CallIcon from '@material-ui/icons/Call';
import VideoCallIcon from '@material-ui/icons/VideoCall';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import StopScreenShareIcon from '@material-ui/icons/StopScreenShare';
import auth from '../auth/auth-helper'
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

// const user = {
//   "_id": "61c810a14c1d8410ccfe2fc0",
//   "name": "ashraf",
//   "email": "ashraf@gmail.com"
// }


export default function Chat() {
  let socketInstance = null;
  console.log("starting")
  let myPeerConnection;

  const [textMessage, setTextMessage] = useState('')
  const [socket, setSocket] = useState()
  const [messages, setMessages] = useState([])
  const [screenStream, setScreenStream] = useState("")
  const localScreenStreamRef = useRef()
  const remoteScreenStreamRef = useRef()







  useEffect(() => {
    const jwt = auth.isAuthenticated()
    const user = jwt?.user
    socketInstance = io('http://localhost:3000/', {
      auth: {
        user
      }
    });
    setSocket(socketInstance)
    // const jwt = auth.isAuthenticated()
    list().then(data => {
      console.log(data)
      setUsers(data)
    })
    // const { user } = JSON.parse(sessionStorage.getItem('jwt'))
    setSender(user._id)


    console.log(user)





    return function cleanup() {
      socket.disconnect()
    }
  }, [])

  const handleVideoOfferMsg = (senderId, receiverId, sdp) => {
    console.log("received video offer")
    // var localStream = null;

    let targetId = senderId;
    if (!myPeerConnection) {
      createPeerConnection();
    }


    var desc = new RTCSessionDescription(sdp);
    console.log("RTCSessionDescription desc", desc)
    var localStream;

    /*
    .then(function () {
          return navigator.mediaDevices.getDisplayMedia(mediaConstraints);
        })
          .then(function (stream) {
            localStream = stream;
            localScreenStreamRef.current.srcObject = localStream
            localStream.getTracks().forEach(track => myPeerConnection?.addTrack(track, localStream));
            console.log("all tracks added")
    
          })
    */
    // navigator.mediaDevices.getDisplayMedia(mediaConstraints).
    //   then(function (stream) {

    //     console.log("receiver's stream", stream)
    //     localScreenStreamRef.current.srcObject = stream
    //     stream.getTracks().forEach(track => myPeerConnection?.addTrack(track, stream));
    //     console.log("all tracks added")

    //   }).
    if (myPeerConnection?.signalingState != "stable") {
      console.log("making stable")
      myPeerConnection.setLocalDescription({ type: "rollback" }).then(function () {
        return myPeerConnection.setRemoteDescription(desc)
      }).catch(handleGetUserMediaError)
    }
    else {
      myPeerConnection?.setRemoteDescription(desc)
        .then(function () {
          return navigator.mediaDevices.getDisplayMedia(mediaConstraints);
        })
        .then(function (stream) {
          console.log("receivers stream", stream)
          localStream = stream;
          localScreenStreamRef.current.srcObject = localStream
          localStream.getTracks().forEach(track => {
            myPeerConnection?.addTrack(track, localStream)
            console.log("receivers track", track)
          });
          console.log("all tracks added")

        }).then(function () {
          console.log("remoteDesc added")
          return myPeerConnection?.createAnswer();
        }).then(function (answer) {
          return myPeerConnection?.setLocalDescription(answer)
        }).then(function () {
          // var msg = {
          //   name: myUsername,
          //   target: targetUsername,
          //   type: "video-answer",
          //   sdp: myPeerConnection?.localDescription
          // };

          // sendToServer(msg);
          socket.emit("sendVideoAnswer", sender, targetId, myPeerConnection?.localDescription)

        }).catch(handleGetUserMediaError);
    }


    // myPeerConnection?.setRemoteDescription(desc)
    //   .then(function () {
    //     return navigator.mediaDevices.getDisplayMedia(mediaConstraints);
    //   })
    //   .then(function (stream) {

    //     console.log("receiver's stream", stream)
    //     localScreenStreamRef.current.srcObject = stream
    //     stream.getTracks().forEach(track => myPeerConnection?.addTrack(track, stream));
    //     console.log("all tracks added")

    //   })
    //   .then(function () {
    //     return myPeerConnection?.createAnswer();
    //   })
    //   .then(function (answer) {
    //     return myPeerConnection?.setLocalDescription(answer);
    //   })
    //   .then(function () {
    //     // var msg = {
    //     //   name: myUsername,
    //     //   target: targetUsername,
    //     //   type: "video-answer",
    //     //   sdp: myPeerConnection?.localDescription
    //     // };

    //     // sendToServer(msg);
    //     socket.emit("sendVideoAnswer", sender, targetId, myPeerConnection?.localDescription)

    //   })
    //   .catch(handleGetUserMediaError);
  }

  const handleReceiveNewIceCandidate = (candidate) => {
    console.log("adding IceCandidate", candidate)
    var iceCandidate = new RTCIceCandidate(candidate)
    myPeerConnection?.addIceCandidate(iceCandidate).catch(reportError)
  }

  function closeVideoCall() {
    // var localVideo = document.getElementById("local_video");

    console.log("Closing the call");

    // Close the RTCPeerConnection

    if (myPeerConnection) {
      console.log("--> Closing the peer connection");

      // Disconnect all our event listeners; we don't want stray events
      // to interfere with the hangup while it's ongoing.

      myPeerConnection.ontrack = null;
      myPeerConnection.onnicecandidate = null;
      myPeerConnection.oniceconnectionstatechange = null;
      myPeerConnection.onsignalingstatechange = null;
      myPeerConnection.onicegatheringstatechange = null;
      myPeerConnection.onnotificationneeded = null;

      // Stop all transceivers on the connection

      myPeerConnection.getTransceivers().forEach(transceiver => {
        transceiver.stop();
      });

      // Stop the webcam preview as well by pausing the <video>
      // element, then stopping each of the getUserMedia() tracks
      // on it.

      if (remoteScreenStreamRef.current.srcObject) {

        remoteScreenStreamRef.current.srcObject.getTracks().forEach(track => {
          track.stop();
        });
      }

      if (localScreenStreamRef.current.srcObject) {

        localScreenStreamRef.current.srcObject.getTracks().forEach(track => {
          track.stop();
        });
      }

      // Close the peer connection

      myPeerConnection.close();
      myPeerConnection = null;
      // webcamStream = null;
    }

    // Disable the hangup button

    // document.getElementById("hangup-button").disabled = true;
    // targetUsername = null;
  }

  const handleReceiveVideoAnswer = (sender, receiver, sdp) => {
    console.log("*** Call recipient has accepted our call");

    // Configure the remote description, which is the SDP payload
    // in our "video-answer" message.

    var desc = new RTCSessionDescription(sdp);
    myPeerConnection?.setRemoteDescription(desc).catch(reportError);
  }


  if (socket) {
    socket.on('connect', () => {
      console.log('connected')
    })

    socket.on('receiveMessage', (message) => {
      // console.log(messages.concat(message))
      setMessages(messages.concat(message))
      console.log(messages)
    })

    socket.on('receiveVideoOffer', handleVideoOfferMsg)

    socket.on('receiveNewIceCandidate', handleReceiveNewIceCandidate)

    socket.on('receiveHangUp', () => { closeVideoCall() })

    socket.on('receiveVideoAnswer', handleReceiveVideoAnswer)
  }

  const handleSendMessage = () => {
    console.log(messages)
    console.log(textMessage)
    const messageDetails = {

      senderId: sender,
      receiverId: receiver,
      message: textMessage,
      createdAt: Date.now()

    }
    socket.emit('sendMessage', messageDetails)
    setMessages([...messages, messageDetails])
    setTextMessage('')
  }

  const handleTextMessage = (e) => {
    setTextMessage(e.target.value)
  }

  const classes = useStyles()

  const [users, setUsers] = useState([])

  const [sender, setSender] = useState('')
  const [receiver, setReceiver] = useState('')
  const mediaConstraints = {
    video: {
      cursor: 'always' | 'motion' | 'never',
      displaySurface: 'application' | 'browser' | 'monitor' | 'window'

    }
  }
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
      socket.emit('getMessages', sender, user._id, (messages) => {
        console.log('messages', messages)
        setMessages(messages)
      })
      console.log('clicked', user)
      setReceiver(user._id)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    socket.emit('fileUpload', file)
  }






  const createPeerConnection = () => {

    myPeerConnection = new RTCPeerConnection({
      iceServers: [
        // {
        //   urls: "stun:stun.stunprotocol.org"
        // }
        {
          "urls": [
          "turn:13.250.13.83:3478?transport=udp"
          ],
          "username": "YzYNCouZM1mhqhmseWk6",
          "credential": "YzYNCouZM1mhqhmseWk6"
          }
      ]
      // "iceServers": [{ "url": "stun:stun.1.google.com:19302" }]
    });

    myPeerConnection.onicecandidate = handleICECandidateEvent;
    myPeerConnection.ontrack = handleTrackEvent;
    myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
    myPeerConnection.onremovetrack = handleRemoveTrackEvent;
    myPeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
    myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
    myPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
  }

  const handleScreenShare = (e) => {

    if (myPeerConnection) {
      console.log("You are already connected")
    }
    else {
      //create peerconnection
      //get stream and append all track in stream to the peerConnection
      //
      createPeerConnection()
      console.log("Screen sharing")


    }
    var localStream;
    navigator.mediaDevices.getDisplayMedia(mediaConstraints).then(stream => {
      localStream = stream;
      localScreenStreamRef.current.srcObject = localStream

      console.log("sender's stream", localStream)
      // stream.getTracks().forEach(track => myPeerConnection?.addTrack(track, stream))
      localStream.getTracks().forEach(track => {
        myPeerConnection?.addTrack(track, localStream)
        console.log("sender's track", track)

      });
      console.log("all tracks added")

    }).catch(handleGetUserMediaError);
  }

  function handleGetUserMediaError(e) {
    console.log(e)
    switch (e.name) {
      case "NotFoundError":
        alert("Unable to open your call because no camera and/or microphone" +
          "were found.");
        break;
      case "SecurityError":
      case "PermissionDeniedError":
        // Do nothing; this is the same as the user cancelling the call.
        break;
      default:
        alert("Error opening your camera and/or microphone: " + e.message);
        break;
    }

    closeVideoCall();
  }

  const handleNegotiationNeededEvent = () => {
    console.log("starting negotiation")

    myPeerConnection?.createOffer().then(function (offer) {
      if(myPeerConnection.signalingState != "stable"){
        console.log("connection unstable, should return")
      }
      return myPeerConnection?.setLocalDescription(offer);
    })
      .then(function () {
        socket.emit("sendVideoOffer", sender, receiver, myPeerConnection?.localDescription)
        // sendToServer({
        //   name: sender,
        //   target: receiver,
        // type: "video-offer",
        //   sdp: myPeerConnection.localDescription
        // });
        console.log("offer sent")
      })
      .catch(reportError);
  }

  function reportError(errMessage) {
    console.log(`Error ${errMessage.name}: ${errMessage.message}`);
  }

  function handleICECandidateEvent(event) {
    console.log("handleICECandidateEvent")

    if (event.candidate) {
      // console.log("*** Outgoing ICE candidate: " + event.candidate.candidate);
      console.log("*** Outgoing ICE candidate: ");

      socket.emit("sendNewIceCandidate", receiver, event.candidate)
      // sendToServer({
      //   type: "new-ice-candidate",
      //   target: targetUsername,
      //   candidate: event.candidate
      // });
    }
  }

  function handleTrackEvent(event) {
    console.log("*** Track event", event);

    // document.getElementById("received_video").srcObject = event.streams[0];
    remoteScreenStreamRef.current.srcObject = event.streams[0]
    // localScreenStreamRef.current.srcObject = event.streams[0]


    // document.getElementById("hangup-button").disabled = false;
  }

  function handleICEConnectionStateChangeEvent(event) {
    console.log("*** ICE connection state changed to " + myPeerConnection?.iceConnectionState);

    switch (myPeerConnection?.iceConnectionState) {
      case "closed":
      case "failed":
      case "disconnected":
        closeVideoCall();
        break;
    }
  }
  function handleRemoveTrackEvent(event) {
    var stream = remoteScreenStreamRef.current.srcObject;
    var trackList = stream.getTracks();

    if (trackList.length == 0) {
      closeVideoCall();
    }
  }


  function handleICEGatheringStateChangeEvent(event) {
    console.log("*** ICE gathering state changed to: " + myPeerConnection?.iceGatheringState);
  }

  function handleSignalingStateChangeEvent(event) {
    console.log("*** WebRTC signaling state changed to: " + myPeerConnection?.signalingState);
    switch (myPeerConnection?.signalingState) {
      case "closed":
        closeVideoCall();
        break;
    }
  }

  const handleStopScreenShare = () => {
    closeVideoCall()
    socket.emit('sendHangUp', sender, receiver)
  }

  return (
    <div>

      <Grid container>
        <Grid item xs={12} >
          <Typography variant="h5" className="header-message">TechHack</Typography>
        </Grid>
      </Grid>
      <Grid container component={Paper} className={classes.chatSection}>
        <Grid item xs={2} className={classes.borderRight500}>
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
          <Typography>Local screen</Typography>
          <video width="100%" height="250" autoPlay playsInline ref={localScreenStreamRef}

          ></video>
          <Typography>Remote screen</Typography>

          <video width="100%" height="250" autoPlay playsInline ref={remoteScreenStreamRef}

          ></video>

          {/* <Divider />
                <Grid item xs={12} style={{padding: '10px'}}>
                    <TextField id="outlined-basic-email" label="Search" variant="outlined" fullWidth />
                </Grid>
                <Divider /> */}

        </Grid>
        {/* <video>working</video> */}

        <Grid item xs={10}>
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
            <Grid item xs={10}>
              <TextField id="outlined-basic-email" label="Type Something" fullWidth
                value={textMessage} onChange={handleTextMessage}
              />
            </Grid>
            <Grid xs={2} align="left">
              <Fab color="primary"
              >
                <label htmlFor='uploadButton'>
                  <input type="file" style={{ display: 'none' }} id="uploadButton" />

                  <AttachFileIcon onClick={handleFileUpload} /></label>
              </Fab>

              <Fab color="primary" aria-label="add" onClick={handleScreenShare}><ScreenShareIcon /></Fab>
              <Fab color="primary" aria-label="add" onClick={handleStopScreenShare}><StopScreenShareIcon /></Fab>


              <Fab color="primary" aria-label="add" onClick={handleSendMessage}><SendIcon /></Fab>

            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

