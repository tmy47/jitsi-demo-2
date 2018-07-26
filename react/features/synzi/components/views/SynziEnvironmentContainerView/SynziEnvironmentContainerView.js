import React, { Component } from 'react'
import { View, Platform } from 'react-native'
import SynziEnvironmentPickerView from '../SynziEnvironmentPickerView/SynziEnvironmentPickerView'

const styles = {
  pickerContainerStyle: {
    backgroundColor: 'white',
    marginTop: Platform.OS === 'ios' ? 22 : 0,
    flex: 1,
  },
}

export default class SynziEnvironmentContainerView extends Component {
  constructor(props) {
    super(props)

    /** Ultimately this state will be in redux and be dynamic, component
     * does not remember last selected environment at this time.
     */

    this.state = {
      data: [
        {
          name: 'Production',
          url: 'https://demo-care.synzi.com',
          selected: true,
        },
        {
          name: 'QA',
          url: 'https://demo-qa-care.synzi.com',
          selected: false,
        },
        {
          name: 'Dev',
          url: 'https://demo-dev-care.synzi.com',
          selected: false,
        },
      ],
    }
  }

  onPressItem = index => {
    this.newState = this.state.data.map((value, i) => {
      value.selected = false
      if (index === i) {
        return { ...value, selected: !value.selected }
      }
      return value
    })
    this.setState({ data: this.newState })
  }

  render() {
    return (
      <View style={styles.pickerContainerStyle}>
        <SynziEnvironmentPickerView
          pickerData={this.state.data}
          pickerRowSelected={this.onPressItem}
          pickerCancelled={this.props.pickerCancelled}
        />
      </View>
    )
  }
}
