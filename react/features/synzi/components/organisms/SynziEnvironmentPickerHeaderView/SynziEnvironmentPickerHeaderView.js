import React, { Component } from 'react'
import { View, TouchableHighlight, Text } from 'react-native'

const styles = {
  headerContainerStyle: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#231F20',
    alignContent: 'flex-start',
  },
  closeTextStyle: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    fontWeight: 'bold',
    color: '#ffb100',
  },
  headerTextStyle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  dummyViewStyle: {
    width: 45,
    height: 60,
  },
}

export default class EnvironmentPickerHeaderView extends Component {
  render() {
    return (
      <View style={styles.headerContainerStyle}>
        <View>
          <TouchableHighlight
            activeOpacity={50}
            underlayColor={'#231F20'}
            onPress={this.props.pickerCancelled}>
            <Text style={styles.closeTextStyle}>Cancel</Text>
          </TouchableHighlight>
        </View>
        <Text style={styles.headerTextStyle}>Environments</Text>
        <View style={styles.dummyViewStyle} />
      </View>
    )
  }
}
