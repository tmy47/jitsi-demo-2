import React, { Component } from 'react'
import { AppRegistry, View, Text, StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  size: {
    width: 250,
    height: 40,
    alignItems: 'center',
  },
})

export default class AppNameLabelView extends Component {
  render() {
    return (
      <View style={styles.size}>
        <Text style={{ color: 'white', fontWeight: 'normal', fontSize: 30 }}>
          Virtual
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 30 }}>
            Care
          </Text>
        </Text>
      </View>
    )
  }
}

// Register the component
AppRegistry.registerComponent('AppNameLabelView', () => AppNameLabelView)
