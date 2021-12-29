import React, { useState, useEffect, useRef } from 'react'
import { Grid } from '@material-ui/core';

export default function localVideoStream() {
    let pc1;
    let pc2;
    const pc1Local = useRef()
    const pc1Remote = useRef()
    const pc2Local = useRef()
    const pc2Remote = useRef()


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
    const mediaConstraints = {
        video: {
            cursor: 'always' | 'motion' | 'never',
            displaySurface: 'application' | 'browser' | 'monitor' | 'window'

        }
    }
    pc1 = new RTCPeerConnection(stunServers);
    pc2 = new RTCPeerConnection(stunServers);


    // const handleNegotiationNeededEvent = () => {
    //     console.log("starting negotiation")

    //     myPeerConnection?.createOffer().then(function (offer) {
    //         if (myPeerConnection.signalingState != "stable") {
    //             console.log("connection unstable, should return")
    //         }
    //         return myPeerConnection?.setLocalDescription(offer);
    //     })
    //         .then(function () {
    //             socket.emit("sendVideoOffer", sender, receiver, myPeerConnection?.localDescription)

    //             console.log("offer sent")
    //         })
    //         .catch(reportError);
    // }

    // function reportError(errMessage) {
    //     console.log(`Error ${errMessage.name}: ${errMessage.message}`);
    // }

    // function handleICECandidateEvent(event) {
    //     console.log("handleICECandidateEvent")

    //     if (event.candidate) {
    //         console.log("*** Outgoing ICE candidate: ");

    //         socket.emit("sendNewIceCandidate", receiver, event.candidate)

    //     }
    // }

    // function handleTrackEvent(event) {
    //     console.log("*** Track event", event);

    //     remoteScreenStreamRef.current.srcObject = event.streams[0]

    // }

    // if (event.candidate) {
    //     // console.log("*** Outgoing ICE candidate: " + event.candidate.candidate);
    //     console.log("*** Outgoing ICE candidate: ");

    //     socket.emit("sendNewIceCandidate", receiver, event.candidate)
    //     // sendToServer({
    //     //   type: "new-ice-candidate",
    //     //   target: targetUsername,
    //     //   candidate: event.candidate
    //     // });
    //   }
    // }

    function gotRemoteStream(e) {
        console.log("***Track event", e)
        pc2Remote.current.srcObject = e.streams[0];
    }

    const handleIceCandiadate = (e) => {
        console.log("***handleIceCandidate")
        pc2.addIceCandidate(e.candidate)
    }

    pc2.ontrack = gotRemoteStream;
    pc1.onicecandidate = handleIceCandiadate
    pc1.ontrack = (e) => { pc1Remote.current.srcObject = e.streams[0] }
    pc1.onnegotiationneeded = async (e) => {
        console.log("***Negotiation needed")
        
        
    }

    const handleStartStream = async () => {

        const pc1Stream = await navigator.mediaDevices.getDisplayMedia(mediaConstraints)
        pc1Local.current.srcObject = pc1Stream
        pc1Stream.getTracks().forEach(track => pc1.addTrack(track, pc1Stream))
        console.log("added all tracks")
        const pc1Offer = await pc1.createOffer();
        console.log("created offer")
        await pc1.setLocalDescription(pc1Offer);
        console.log("set local desc")
        //offer reaches pc2
 
        await pc2.setRemoteDescription(pc1.localDescription)
        console.log("set remote desc for pc2")
        const pc2Stream = await navigator.mediaDevices.getDisplayMedia(mediaConstraints)
        pc2Stream.getTracks().forEach(track => pc2.addTrack(track, pc2Stream))
        const answer = await pc2.createAnswer()
        await pc2.setLocalDescription(answer);
        pc1.setRemoteDescription(pc2.localDescription)
    }

    useEffect(() => {

    }, [])
    return (
        <Grid container style={{ justifyContent: 'center' }}>

            <Grid item md={6} lg={6}>
                <h1>PC1</h1>
                <h2>Local</h2>
                <video width="50%" height="250" autoPlay playsInline controls="false" ref={pc1Local}></video>
                <h2>Remote</h2>
                <video width="50%" height="250" autoPlay playsInline controls="false" ref={pc1Remote}></video>

            </Grid>
            <Grid item md={6} lg={6}>
                <h1>PC2</h1>
                <h2>Local</h2>
                <video width="50%" height="250" autoPlay playsInline controls="false" ref={pc2Local}></video>
                <h2>Remote</h2>
                <video width="50%" height="250" autoPlay playsInline controls="false" ref={pc2Remote}></video>

            </Grid>
            <button onClick={handleStartStream}>Start stream</button>


        </Grid>
    )

}