import React, { Component } from 'react'
import {
  AppRegistry,
  View,
  StatusBar,
  TouchableHighlight,
  Modal,
  Alert,
} from 'react-native';
import { connect } from 'react-redux';
import { translate } from '../../../../../features/base/i18n';
import SynziLogoView from '../../atoms/SynziLogoView/SynziLogoView'
import SynziAppNameLabelView from '../../atoms/SynziAppNameLabelView/SynziAppNameLabelView'
import SynziEnvironmentContainerView from '../SynziEnvironmentContainerView/SynziEnvironmentContainerView'
import SynziAppVersionLabelView from '../../atoms/SynziAppVersionLabelView/SynziAppVersionLabelView'
import SynziLoginGroupView from '../../organisms/SynziLoginGroupView/SynziLoginGroupView'

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

      this.pickerCancelled = this.pickerCancelled.bind(this)

    }

    /** Environment Picker Support */
    resetCount() {
        this.setState({
            count: 0,
        })
    }
    
    openEnvironmentPicker() {
        this.setState({
            modalPickerVisible: true,
        })
        this.resetCount()
    }
    
    closeEnvironmentPicker() {
        this.setState({
            modalPickerVisible: false,
        })
    }
    
    pickerCancelled() {
        this.closeEnvironmentPicker()
    }

    onPress = () => {
        /** ST-70 - 5 quick taps on the main logo will enable the environment picker
         * This is used by QA and Deveopment to point the app to the correct environment
         */
    
        this.setState({ count: this.state.count + 1 })
        clearTimeout(this.timerId)
        this.timerId = setTimeout(() => this.resetCount(), 500)
        if (this.state.count === 4) {
            this.openEnvironmentPicker()
        }
    }

    renderModal() {
        return (
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.modalPickerVisible}
            onRequestClose={() => console.log('Picker Modal Closed')}>
            <SynziEnvironmentContainerView pickerCancelled={this.pickerCancelled} />
          </Modal>
        )
    }


    /** Initial Render */
    render() {
        /** Only effects iOS */
        StatusBar.setBarStyle('light-content', true)
    
        return (
            <View style={styles.mainContainerStyle}>
                {this.renderModal()}
                <View />
                <TouchableHighlight onPress={this.onPress} activeOpacity={100}>
                    <View style={styles.appNameContainerStyle}>
                        <SynziLogoView />
                        <SynziAppNameLabelView />
                    </View>
                </TouchableHighlight>
                <SynziLoginGroupView
                    style={styles.loginGroupContainerStyle}
                    handleCall={this.props.joinHandler}
                />
                <View style={styles.dummyBottomView} />
                <View style={styles.appVersionContainerStyle}>
                    <SynziAppVersionLabelView />
                </View>
            </View>
        )
      }
    }

    // export function _mapStateToProps(state: Object) {
    //     return {
    //         _typedRoomName: ''
    //     };
    // }
    
    // export default translate(connect(_mapStateToProps)(SynziHomeContainerView));