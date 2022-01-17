import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Users from './user/Users'
import Signup from './user/Signup'
import Signin from './auth/Signin'
import EditProfile from './user/EditProfile'
import Profile from './user/Profile'
import PrivateRoute from './auth/PrivateRoute'
import Menu from './core/Menu'
import Chat from './chat/chat'
import LocalVideoStream from './chat/localVideoStream'

const MainRouter = () => {
  return (<div>
    <Menu />
    <Switch>
      <Route exact path="/" component={Chat} />
      <Route path="/users" component={Users} />
      <Route path="/signup" component={Signup} />
      <Route path="/signin" component={Signin} />
      <PrivateRoute path="/user/edit/:userId" component={EditProfile} />
      <Route path="/user/:userId" component={Profile} />
      <Route path="/localvideostream" component={LocalVideoStream} />
    </Switch>
  </div>)
}

export default MainRouter


/*
uploading files:
client uploads file
client clicks send

strat1:
http put request is sent to server with the file and receiver detail 
in a formdata
use multer to read file and upload to aws
emit fileReceive event to the receivers socket with io instance
receiver listens to the event => http get req is sent to retrieve file


strat2:

fileupload event is sent with file
server listens to event => saves file in aws => emits file url
to receiver with a receive event
receiver gets event and sends http get req to server






*/