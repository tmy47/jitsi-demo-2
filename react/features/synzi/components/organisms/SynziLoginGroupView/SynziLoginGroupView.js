import React, { Component } from 'react'
import {
  View,
  TouchableOpacity,
  TextInput,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native'
import SynziAuthService from '../../../services/SynziAuthService'
import SynziSocketServiceView from '../SynziSocketServiceView/SynziSocketServiceView'
import io from 'socket.io-client'



const styles = {
  mainContainerStyle: {
    backgroundColor: '#6c7ea9',
    height: 250,
    width: 300,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signingInContainerStyle: {
    backgroundColor: '#8099cf',
    height: 250,
    width: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signingInTextStyle: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  texInputContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  textInputStyle: {
    backgroundColor: 'white',
    width: 260,
    height: 40,
    marginBottom: 20,
    borderRadius: 7,
    justifyContent: 'center',
    textAlign: 'center',
  },
  buttonDisabledStyle: {
    marginTop: 30,
    width: 260,
    height: 40,
    backgroundColor: '#ffb100',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.3,
  },
  buttonEnabledStyle: {
    marginTop: 30,
    width: 260,
    height: 40,
    backgroundColor: '#ffb100',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1.0,
  },
  buttonTextEnabledStyle: {
    fontWeight: 'bold',
  },
  buttonTextDiabledStyle: {
    fontWeight: 'bold',
  },
  loggedInTextStyleDark: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    color: 'black'
  },
  loggedInTextStyleLight: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    color: 'white'
  }
}

export default class SynziLoginGroupView extends Component {
  constructor(props) {
    super(props)

      //Bindings
      this.handleSigninClick = this.handleSigninClick.bind(this)
      this.handleSignOutClick = this.handleSignOutClick.bind(this)
      this.sendSocketMessage = this.sendSocketMessage.bind(this)
      this.handleFavoriteClick = this.handleFavoriteClick.bind(this)
      this.handleIgnoreCall = this.handleIgnoreCall.bind(this)
      this.handleAnswerCall = this.handleAnswerCall.bind(this)
      this.handleHangup = this.handleHangup.bind(this)
      this.callFromBob = this.callFromBob.bind(this)

      //Initial State
      this.state = {
        userName: '',
        passWord: '',
        signingIn: false,
        signedIn: false,
        socketOn: false,
        startingCall: false,
        personCalled: '',
        targetCaller: '',
        callIncoming: false,
        callerName: '',
      }

      //Socket Connection
      const connectionOptions = {
        jsonp: false,
        secure: true,
        transports: ['websocket']
      }
  
      this.socket = io('https://dev-stg-api.synzi.com', connectionOptions)
  }


  componentDidMount() {

      this.socket.on('connect_failed', () => {
          console.log('connect_failed')
          this.showSocketOfflineMessage()
          this.setState({
              socketConnected: false,
              socketError: true
          })
      })

      this.socket.on('connect', () => {
          console.log('connected')
          this.setState({
              socketConnected: true,
              socketError: false
          })
      })

      this.socket.on('INCOMING-CALL', name => {
          console.log('INCOMING-CALL')
          this.callIncoming(name)
      })

      this.socket.on('CALL-CANCELED', () => {
          console.log('CALL-CANCELED')
          //this.setState({ callIncoming: false })
      })

      this.socket.on('CALL-IGNORED', () => {
          console.log('CALL-IGNORED')
          this.setState({ startingCall: false })
      })

      this.socket.on('CALL-ACCEPTED', () => {
          console.log('CALL-ACCEPTED')
          //this.setState({ startVideo: true })
          this.props.handleCall()
      })

      this.socket.on('CALL-COMPLETE', () => {
          console.log('CALL-COMPLETE')
          this.setState({
            startingCall: false
          })
      })

      this.socket.on('disconnect', () => {
          console.log('disconnect')
          this.setState({
              socketConnected: false,
              socketError: false,
              startingCall: false
          })
      })
  }

  componentWillUnmount() {
      this.socket.close()
  }

  /** Text Input Validation */
  validateUserName(text) {
    this.setState({ userName: text })
  }

  validatePassword(text) {
    this.setState({ passWord: text })
  }

  isValidInput() {
    if (this.state.userName !== '' && this.state.passWord !== '') {
      return true
    }
    return false
  }


  /** Socket Related */
  cancelCall() {
    this.sendSocketMessage('CANCEL-CALL', this.state.personCalled)
    this.setState({ startingCall: false })
  }

  handleIgnoreCall() {
    this.sendSocketMessage('IGNORE-CALL', this.state.callerName)
    this.setState({ callIncoming: false })
  }

  handleAnswerCall() {
    this.sendSocketMessage('ANSWER-CALL', this.state.callerName)
    this.setState({ answerCall: true })
  }

  handleHangup() {
    this.sendSocketMessage('HANGUP', this.state.callerName)
    this.setState({ startingCall: false })
  }

  callIncoming(data) {
    if (this.state.startingCall) {
      return
    } else {
      console.log('Incoming Call: ' + data)
      // we are recieving a call
      this.setState({ callIncoming: true, callerName: data })

      Alert.alert(
        'Incoming Call',
        'Call from ' + data,
        [
          { text: 'Reject', onPress: () => this.handleIgnoreCall() },
          { text: 'Accept', onPress: () => this.handleAnswerCall() },
        ],
        { cancelable: false }
      )
    }
  }

  sendSocketMessage(message, data) {
      if (this.socket.connected) {
          this.socket.emit(message, data)
          return true
      } else {
          this.showSocketOfflineMessage()
          return false
      }
  }

  showSocketOfflineMessage() {
      Alert.alert(
          'Network Issue',
          'Sorry, the service is currently offline, please try again later.',
          [{ text: 'OK', onPress: () => null }],
          { cancelable: false }
      )
  }


  handleFavoriteClick(name) {
    if (this.sendSocketMessage('TICKLE', name)) {
      this.setState({
        startingCall: true,
        personCalled: name,
      })
    }
  }

  callFromBob(){
    this.handleFavoriteClick(this.state.userName)
  }



  /** Sign In */
  async handleSigninClick() {

    this.setState({
      signedIn: true,
      signingIn: false,
    })

    if(this.state.userName === ''){
        this.setState({
          userName: "Bob"
      })
    }

    //this.socketservice.connect()

    // this.setState({
    //   signingIn: true,
    //   signedIn: false,
    // })
    // const { userName, passWord } = this.state
    // const response = await SynziAuthService.login(userName, passWord)

    // if (response.status === 200) {
    //   this.setState({
    //     signedIn: true,
    //     signingIn: false,
    //   })
    // } else {
    //   this.setState({
    //     signedIn: false,
    //     signingIn: false,
    //   })
    //   Alert.alert(
    //     'Sign In Error',
    //     'The username / password was not recognized',
    //     [{ text: 'Ok', onPress: () => null }],
    //     { cancelable: false }
    //   )
    // }
  }

  /** Sign Out */
  handleSignOutClick() {
    SynziAuthService.logout()
    this.setState({
        userName: '',
        passWord: '',
        signingIn: false,
        signedIn: false,
        socketOn: false,
        startingCall: false,
        personCalled: '',
        targetCaller: '',
        callIncoming: false,
        callerName: '',
    })
  }

  renderComponentUI() {
    if (this.state.signingIn) {
      return this.renderSigningInUI()
    } else if (this.state.signedIn) {
      return this.renderSignedInUI()
    } else {
      return this.renderSignInForm()
    }
  }

  renderSignedInUI() {
    return (
      <View style={styles.signingInContainerStyle}>
        <SynziSocketServiceView 
          socketOn={this.state.socketConnected}
          socketError={this.state.socketError}
        />
        <Text
          style={styles.loggedInTextStyleDark}>
          {'RoomName: '}
          <Text
            style={styles.loggedInTextStyleLight}>
            {'synzi-test\n'}
          </Text>
          <Text
            style={styles.loggedInTextStyleDark}>
            {'User: '}
          </Text>
          <Text
            style={styles.loggedInTextStyleLight}>
            {this.state.userName}
          </Text>
        </Text>
        <TouchableOpacity
          disabled={false}
          onPress={this.callFromBob}
          style={styles.buttonEnabledStyle}>
          <Text style={styles.buttonTextDiabledStyle}>CALL</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={false}
          onPress={this.handleSignOutClick}
          style={styles.buttonEnabledStyle}>
          <Text style={styles.buttonTextDiabledStyle}>SIGN OUT</Text>
        </TouchableOpacity>
      </View>
    )
  }

  renderSigningInUI() {
    return (
      <View style={styles.signingInContainerStyle}>
        <Text
          style={{
            fontWeight: 'bold',
            fontSize: 24,
            marginBottom: 30,
            opacity: 0.9,
          }}>
          Signing In
        </Text>
        <ActivityIndicator
          size="large"
          color="white"
          animating={this.state.signingIn}
        />
        <Text
          style={{
            fontWeight: 'bold',
            fontSize: 14,
            marginTop: 30,
            opacity: 0.7,
          }}>
          Please wait...
        </Text>
      </View>
    )
  }

  renderSignInForm() {
    //this.validInput = this.isValidInput()
    this.validInput = true
    console.log("Valid: "+ this.validInput)
    return (
      <View>
        <TextInput
          autoCapitalize={'none'}
          onChangeText={text => this.setState({ userName: text })}
          placeholder="Username"
          style={styles.textInputStyle}
        />
        <TextInput
          onChangeText={text => this.setState({ passWord: text })}
          placeholder="Password"
          secureTextEntry={true}
          style={styles.textInputStyle}
        />
        <TouchableOpacity
          disabled={this.validInput ? false : true}
          onPress={this.handleSigninClick}
          style={this.validInput ? styles.buttonEnabledStyle : styles.buttonDisabledStyle}>
          <Text style={styles.buttonTextDiabledStyle}>SIGN IN</Text>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.mainContainerStyle}>{this.renderComponentUI()}</View>
    )
  }
}
