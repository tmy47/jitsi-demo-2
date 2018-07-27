import React, { Component } from 'react'
import {
    AppRegistry,
    View,
    StatusBar,
    TouchableHighlight,
    Modal,
    Alert,
    Text
  } from 'react-native';


const styles = {
    socketIndicatorBackground: {
      flex: 1,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'space-between',
      width:200,
    },
    socketIndicatorWrapper:{
        flex: 1,
        flexDirection: 'row',
    },
    socketIndicatorOn:{
        backgroundColor: 'green',
        width:20,
        height:20,
        borderRadius: 20,
        marginRight: 7
    },
    socketIndicatorOff:{
        backgroundColor: 'gray',
        width:20,
        height:20,
        borderRadius: 20,
        marginRight: 7
    },
    socketIndicatorError:{
        backgroundColor: 'red',
        width:20,
        height:20,
        borderRadius: 20,
        marginRight: 7
    }
}


export default class SynziSocketServiceView extends Component {
    constructor(props) {
        super(props)
    }

    renderSocketIndicator(){
        if(this.props.socketOn){
            return (
                <View style={styles.socketIndicatorWrapper}>
                    <View style={styles.socketIndicatorOn}/>
                    <Text>Connected</Text>
                </View>
            )
        }else{
            if(this.props.socketError){
                return (
                    <View style={styles.socketIndicatorWrapper}>
                        <View style={styles.socketIndicatorError}/>
                        <Text>Socket Error</Text>
                    </View>
                )
            }else{
                return (
                    <View style={styles.socketIndicatorWrapper}>
                        <View style={styles.socketIndicatorOff}/>
                        <Text>Not Connected</Text>
                    </View>
                )
            }
        }
    }

    render() {
        return (
            <View style={styles.socketIndicatorBackground}>
               {this.renderSocketIndicator()}
            </View>
        )
      
    }

}
