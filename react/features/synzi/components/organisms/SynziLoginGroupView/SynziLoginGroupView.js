import React, { Component } from 'react'
import {
  View,
  TouchableOpacity,
  TextInput,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native'
import NativeAuthService from '../../../services/SynziAuthService'

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
}

export default class SynziLoginGroupView extends Component {
  constructor(props) {
    super(props)

    this.handleSigninClick = this.handleSigninClick.bind(this)
    this.handleSignOutClick = this.handleSignOutClick.bind(this)

    this.state = {
      userName: '',
      passWord: '',
      signingIn: false,
      signedIn: false,
    }
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

  /** Sign In */
  async handleSigninClick() {
    this.setState({
      signingIn: true,
      signedIn: false,
    })
    const { userName, passWord } = this.state
    const response = await SynziAuthService.login(userName, passWord)

    if (response.status === 200) {
      this.setState({
        signedIn: true,
        signingIn: false,
      })
    } else {
      this.setState({
        signedIn: false,
        signingIn: false,
      })
      Alert.alert(
        'Sign In Error',
        'The username / password was not recognized',
        [{ text: 'Ok', onPress: () => null }],
        { cancelable: false }
      )
    }
  }

  /** Sign Out */
  handleSignOutClick() {
    SynziAuthService.logout()
    this.setState({
      signedIn: false,
      signingIn: false,
      userName: '',
      passWord: '',
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
        <Text
          style={{
            fontWeight: 'bold',
            fontSize: 14,
            textAlign: 'center',
          }}>
          {'Signed in as\n'}
          <Text
            style={{
              fontWeight: 'normal',
              fontSize: 24,
              marginBottom: 30,
              opacity: 0.9,
              textAlign: 'center',
            }}>
            {this.state.userName}
          </Text>
        </Text>
        <TouchableOpacity
          disabled={false}
          onPress={this.props.handleCall}
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
    this.validInput = this.isValidInput()
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
          style={
            this.validInput
              ? styles.buttonEnabledStyle
              : styles.buttonDisabledStyle
          }>
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
