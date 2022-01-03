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
// import {socket} from './../service/socket';
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



console.log("yeehoo")

export default function Chat() {
  console.log("starting")
  const myPeerConnection = useRef()
  const socket = useRef()
  const [textMessage, setTextMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [screenStream, setScreenStream] = useState("")
  const localScreenStreamRef = useRef()
  const remoteScreenStreamRef = useRef()
  const classes = useStyles()
  const dataChannel = useRef()
  const [users, setUsers] = useState([])

  const [sender, setSender] = useState('')
  const [receiver, setReceiver] = useState('')
  const mediaConstraints = {
    video: {
      cursor: 'always' | 'motion' | 'never',
      displaySurface: 'application' | 'browser' | 'monitor' | 'window'

    }
  }
  const stunServers = {
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
  }

  const handleFileOfferMsg = async (senderId, receiverId, sdp) => {
    console.log("received file offer");
    createPeerConnectionForFile();
    await myPeerConnection.current.setRemoteDescription(sdp);
    console.log("remote desc set");
    // createDataChannel()
    const answer = await myPeerConnection.current.createAnswer();
    console.log("answer created")
    await myPeerConnection.current.setLocalDescription(answer);
    socket.current.emit("sendFileAnswer", receiverId, senderId, myPeerConnection.current.localDescription)
    console.log("sdp sent to caller")
  }

  const handleVideoOfferMsg = async (senderId, receiverId, sdp) => {
    console.log("received video offer")
    createPeerConnectionForVideo()
    await myPeerConnection.current.setRemoteDescription(sdp);
    console.log("remote desc set", sdp)
    const stream = await navigator.mediaDevices.getDisplayMedia(mediaConstraints);
    stream.getTracks().forEach(track => {
      myPeerConnection.current.addTrack(track, stream)
    })
    localScreenStreamRef.current.srcObject = stream
    const answer = await myPeerConnection.current.createAnswer();
    console.log("answer created")
    await myPeerConnection.current.setLocalDescription(answer);
    socket.current.emit("sendVideoAnswer", receiverId, senderId, myPeerConnection.current.localDescription)
    console.log("sdp sent to caller")
  }

  const handleReceiveNewIceCandidate = async (candidate) => {
    // var iceCandidate = new RTCIceCandidate(candidate)
    try {
      await myPeerConnection.current.addIceCandidate(candidate)
      console.log("adding IceCandidate", candidate)

    }
    catch (err) {
      reportError(err)
    }
  }

  const handleReceiveVideoAnswer = async (sender, receiver, sdp) => {
    console.log("*** Call recipient has accepted our call");

    // Configure the remote description, which is the SDP payload
    // in our "video-answer" message.

    // var desc = new RTCSessionDescription(sdp);
    try {
      if (myPeerConnection.current.localDescription) {
        console.log("myPeerConnection", myPeerConnection)
        await myPeerConnection.current.setRemoteDescription(sdp)
        console.log("remote desc added", myPeerConnection.current)
      }
    }
    catch (err) {
      reportError(err)
    }
  }
  const handleReceiveFileAnswer = async (sender, receiver, sdp) => {
    console.log("*** Call recipient accepted our file");
    try {
      if (myPeerConnection.current.localDescription) {
        console.log("myPeerConnection", myPeerConnection)
        await myPeerConnection.current.setRemoteDescription(sdp)
        console.log("remote desc added", myPeerConnection.current)
      }
    }
    catch (err) {
      reportError(err)
    }
  }

  const handleDataChannel = async (e) => {
    console.log("datachannel received")
    dataChannel.current = e.channel
    console.log("data channel ", dataChannel.current);

    dataChannel.current.onerror = function (error) {
      console.log("DC Error:", error);
    };

    dataChannel.current.onmessage = function (event) {
      console.log("DC Message:", event.data);
    };

    dataChannel.current.onopen = function () {
      console.log("sending data")
      dataChannel.current.send(" Sending 123 ");  // you can add file here in either strings/blob/array bufers almost anyways
    };

    dataChannel.current.onclose = function () {
      console.log("DC is Closed");
    };
  }

  useEffect(() => {
    console.log("rendering")

    myPeerConnection.current = new RTCPeerConnection(stunServers)

    const jwt = auth.isAuthenticated();
    const user = jwt?.user;

    socket.current = io('http://localhost:3000/', {
      auth: {
        user
      }
    })

    socket.current.on('connect', () => {
      console.log('connected')
    })

    socket.current.on('receiveMessage', (message) => {
      // console.log(messages.concat(message))
      setMessages(messages.concat(message))
      console.log(messages)
    })

    socket.current.on('receiveVideoOffer', handleVideoOfferMsg)

    socket.current.on('receiveNewIceCandidate', handleReceiveNewIceCandidate)

    socket.current.on('receiveHangUp', () => { closeVideoCall() })

    socket.current.on('receiveVideoAnswer', handleReceiveVideoAnswer)
    socket.current.on('receiveFileOffer', handleFileOfferMsg);
    socket.current.on('receiveFileAnswer', handleReceiveFileAnswer)
    list().then(data => {
      console.log(data)
      setUsers(data.filter((u) => {
        return u._id != user._id
      }))
    })
    // const { user } = JSON.parse(sessionStorage.getItem('jwt'))
    setSender(user?._id)


    console.log(user)





    return function cleanup() {
      socket.current.disconnect()
    }
  }, [])



  const handleReceiverSelection = (user) => () => {
    console.log(sender, user._id)
    console.log("sender", sender)
    console.log("receiver", receiver)
    if (sender != user._id) {
      socket.current.emit('getMessages', sender, user._id, (messages) => {
        console.log('messages', messages)
        setMessages(messages)
      })
      console.log('clicked', user)
      setReceiver(user._id)
    }
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


  const handleSendMessage = () => {
    console.log(messages)
    console.log(textMessage)
    const messageDetails = {

      senderId: sender,
      receiverId: receiver,
      message: textMessage,
      createdAt: Date.now()

    }
    socket.current.emit('sendMessage', messageDetails)
    setMessages([...messages, messageDetails])
    setTextMessage('')
  }

  const handleTextMessage = (e) => {
    setTextMessage(e.target.value)
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


  const createDataChannel = () => {
    dataChannel.current = myPeerConnection.current.createDataChannel("DC1");
    console.log("channel created", dataChannel.current);

    dataChannel.current.onerror = function (error) {
      console.log("DC Error:", error);
    };

    dataChannel.current.onmessage = function (event) {
      console.log("DC Message:", event.data);
    };

    dataChannel.current.onopen = function () {
      console.log("sending data")
      dataChannel.current.send(" Sending 123 ");  // you can add file here in either strings/blob/array bufers almost anyways
    };

    dataChannel.current.onclose = function () {
      console.log("DC is Closed");
    };

  }



  const handleFileUpload = async (e) => {

    // var dataChannelOptions = {
    //   ordered: false, // unguaranted sequence
    //   maxRetransmitTime: 2000, // 2000 miliseconds is the maximum time to try and retrsanmit failed messages 
    //   maxRetransmits : 5  // 5 is the number of times to try to retransmit failed messages , other options are negotiated , id , protocol   
    // };

    if (e.target.files.length > 0) {
      createPeerConnectionForFile()
      console.log("peer connection created", myPeerConnection.current)
      const file = e.target.files[0]
      console.log('e', file)
      createDataChannel()
      console.log("returned to fileupload after channel creation")
    }
    // socket.current.emit('fileUpload', file)
  }


  const createPeerConnectionForVideo = () => {

    myPeerConnection.current.onicecandidate = handleICECandidateEvent;
    myPeerConnection.current.ontrack = handleTrackEvent;
    myPeerConnection.current.onnegotiationneeded = handleNegotiationNeededEvent;
    // myPeerConnection.onremovetrack = handleRemoveTrackEvent;
    myPeerConnection.current.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
    myPeerConnection.current.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
    myPeerConnection.current.onsignalingstatechange = handleSignalingStateChangeEvent;





  }


  const createPeerConnectionForFile = () => {

    myPeerConnection.current.onicecandidate = handleICECandidateEvent;
    myPeerConnection.current.ontrack = handleTrackEvent;
    myPeerConnection.current.onnegotiationneeded = handleNegotiationForFile;
    // myPeerConnection.onremovetrack = handleRemoveTrackEvent;
    myPeerConnection.current.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
    myPeerConnection.current.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
    myPeerConnection.current.onsignalingstatechange = handleSignalingStateChangeEvent;
    // myPeerConnection.current.addEventListener('datachannel', handleDataChannel)
    myPeerConnection.current.ondatachannel = handleDataChannel




  }
  const handleScreenShare = async (e) => {

    if (myPeerConnection?.localDescription) {
      console.log("You are already connected")
    }
    else {
      //create peerconnection
      //get stream and append all track in stream to the peerConnection
      //
      createPeerConnectionForVideo()
      console.log("Screen sharing")
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia(mediaConstraints)
        localScreenStreamRef.current.srcObject = stream;
        stream.getTracks().forEach((track) => {
          myPeerConnection.current.addTrack(track, stream);
        })
        console.log("all tracks added")
        console.log("screenshare myPeer", myPeerConnection.current)
      }
      catch (err) {
        handleGetUserMediaError(err)
      }
    }

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

  const handleNegotiationNeededEvent = async () => {
    console.log("starting negotiation for video", sender, receiver)
    try {
      const offer = await myPeerConnection.current.createOffer()
      await myPeerConnection.current.setLocalDescription(offer);
      socket.current.emit("sendVideoOffer", sender, receiver, myPeerConnection.current.localDescription)
      console.log("peerConnection after negot", myPeerConnection.current.current)
    }
    catch (err) {
      reportError(err)
    }
  }

  const handleNegotiationForFile = async () => {
    console.log("starting negotiation for file", sender, receiver)
    try {
      const offer = await myPeerConnection.current.createOffer()
      await myPeerConnection.current.setLocalDescription(offer);
      socket.current.emit("sendFileOffer", sender, receiver, myPeerConnection.current.localDescription)
      console.log("peerConnection after negot", myPeerConnection.current)
    }
    catch (err) {
      reportError(err)
    }
  }

  function reportError(errMessage) {
    console.log(`Error ${errMessage.name}: ${errMessage.message}`);
  }

  function handleICECandidateEvent(event) {
    console.log("handleICECandidateEvent")

    if (event.candidate) {
      console.log("*** Outgoing ICE candidate: ");
      socket.current.emit("sendNewIceCandidate", receiver, event.candidate)
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
    console.log("*** ICE connection state changed to " + myPeerConnection.current?.iceConnectionState);

    switch (myPeerConnection.current?.iceConnectionState) {
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
    console.log("*** ICE gathering state changed to: " + myPeerConnection.current?.iceGatheringState);
  }

  function handleSignalingStateChangeEvent(event) {
    console.log("*** WebRTC signaling state changed to: " + myPeerConnection.current?.signalingState);
    switch (myPeerConnection.current?.signalingState) {
      case "closed":
        closeVideoCall();
        break;
    }
  }

  const handleStopScreenShare = () => {
    closeVideoCall()
    socket.current.emit('sendHangUp', sender, receiver)
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
          <video width="100%" height="250" autoPlay playsInline controls="false" ref={localScreenStreamRef}

          ></video>
          <Typography>Remote screen</Typography>

          <video width="100%" height="250" autoPlay playsInline controls="false" ref={remoteScreenStreamRef}

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
                  <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} id="uploadButton" />

                  <AttachFileIcon /></label>
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

