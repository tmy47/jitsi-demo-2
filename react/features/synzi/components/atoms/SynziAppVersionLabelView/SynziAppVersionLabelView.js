import React, { Component } from 'react'
import { View, Text, StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  size: {
    width: 250,
    height: 18,
    alignItems: 'center',
  },
})

/** This version number will come from native bundle eventually  */

export default class AppVersionLabelView extends Component {
  render() {
    return (
      <View style={styles.size}>
        <Text style={{ color: 'black', fontWeight: 'normal', fontSize: 14 }}>
          2.0.0.6
        </Text>
      </View>
    )
  }
}
