import React, { Component } from 'react'
import {
  View,
  FlatList,
  Text,
  Platform,
  TouchableHighlight,
  Image,
} from 'react-native'
import SynziEnvironmentPickerHeaderView from '../../organisms/SynziEnvironmentPickerHeaderView/SynziEnvironmentPickerHeaderView'

const styles = {
  pickerItemWrapperStyle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pickerItemStyle: {
    backgroundColor: 'white',
    height: 60,
    justifyContent: 'center',
    flex: 1,
  },
  pickerItemHeaderTextStyle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginLeft: 10,
  },
  pickerItemSubHeaderTextStyle: {
    fontSize: 12,
    fontWeight: 'normal',
    color: 'gray',
    marginLeft: 10,
    backgroundColor: 'white',
  },
  pickerItemCheckMark: {
    height: 60,
    width: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerCheckMarkImage: {
    height: 30,
    width: 30,
  },
}

export default class SynziEnvironmentPickerView extends Component {
  renderSeparator = () => {
    return (
      <View
        style={{
          height: Platform.OS === 'ios' ? 1 : 0.5,
          width: '100%',
          backgroundColor: '#CED0CE',
        }}
      />
    )
  }

  renderImage = selected => {
    if (selected) {
      return (
        <Image
          style={styles.pickerCheckMarkImage}
          resizeMode={'center'}
          source={require('../../../images/checkmark.png')}
        />
      )
    }
    return null
  }

  renderItem = ({ item, index, separators }) => {
    return (
      <TouchableHighlight
        onPress={() => this.props.pickerRowSelected(index)}
        onShowUnderlay={separators.highlight}
        onHideUnderlay={separators.unhighlight}
        activeOpacity={90}>
        <View style={styles.pickerItemWrapperStyle}>
          <View style={styles.pickerItemStyle}>
            <Text style={styles.pickerItemHeaderTextStyle}>{item.name}</Text>
            <Text style={styles.pickerItemSubHeaderTextStyle}>{item.url}</Text>
          </View>
          <View style={styles.pickerItemCheckMark}>
            {this.renderImage(item.selected)}
          </View>
        </View>
      </TouchableHighlight>
    )
  }

  render() {
    return (
      <View>
        <SynziEnvironmentPickerHeaderView
          pickerCancelled={this.props.pickerCancelled}
        />
        <FlatList
          ItemSeparatorComponent={this.renderSeparator}
          data={this.props.pickerData}
          keyExtractor={item => item.name}
          renderItem={rowData => this.renderItem(rowData)}
        />
      </View>
    )
  }
}
