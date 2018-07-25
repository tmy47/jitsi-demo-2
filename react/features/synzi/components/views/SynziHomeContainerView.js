import React, { Component } from 'react'
import {
  AppRegistry,
  View,
  StatusBar,
  TouchableHighlight,
  Modal,
  Alert,
} from 'react-native'


const styles = {
    mainContainerStyle: {
      backgroundColor: '#8099cf',
      flex: 1,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    appNameContainerStyle: {
      width: 250,
      height: 100,
    },
    appVersionContainerStyle: {
      paddingBottom: 10,
    },
    loginGroupContainerStyle: {
      flex: 2,
    },
    dummyBottomView: {
      width: 300,
      height: 10,
    },
  }

  export default class SynziHomeContainerView extends Component {
    constructor(props) {
      super(props)
  
      this.state = {
        count: 0,
        modalPickerVisible: false,
        modalCallUIVisible: false,
        startingCall: false,
        targetCaller: '',
        callIncoming: false,
        personCalled: '',
        callerName: '',
        startVideo: false,
        showNotification: false,
        notificationTitle: '',
        notificationMessage: '',
        navigateToLogin: false,
      }

    }


    render() {
        /** Only effects iOS */
        StatusBar.setBarStyle('dark-content', true)
    
        return (
          <View style={styles.mainContainerStyle}>
          </View>
        )
      }
    }
    
    AppRegistry.registerComponent('SynziHomeContainerView', () => SynziHomeContainerView)