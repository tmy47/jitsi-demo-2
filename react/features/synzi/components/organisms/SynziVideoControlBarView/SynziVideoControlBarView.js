import React, { Component } from 'react'
import { View, TouchableHighlight, Text, Image } from 'react-native'

const styles = {
  videoControlBarStyle: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#cccccc',
    justifyContent: 'center',
    height: 60,
  },
  iconSize: {
    width: 40,
    height: 40,
  },
}

export default class VideoControlBarView extends Component {
  constructor(props) {
    super(props)
    this.endCall = this.endCall.bind(this)
  }

  endCall() {
    this.props.handleHangup()
  }

  render() {
    return (
      <View style={styles.videoControlBarStyle}>
        <TouchableHighlight
          activeOpacity={50}
          underlayColor={'white'}
          onPress={this.endCall}>
          <Image
            style={styles.iconSize}
            resizeMode={'contain'}
            source={require('../../../images/videoEndIcon.png')}
          />
        </TouchableHighlight>
      </View>
    )
  }
}
