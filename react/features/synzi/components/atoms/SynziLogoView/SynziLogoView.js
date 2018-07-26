import React, { Component } from 'react'
import { View, Image, StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  size: {
    width: 250,
    height: 60,
  },
})

export default class SynziLogoView extends Component {
  render() {
    return (
      <View>
        <Image
          style={styles.size}
          resizeMode={'contain'}
          source={require('../../../images/synzi_logo_600.png')}
        />
      </View>
    )
  }
}
