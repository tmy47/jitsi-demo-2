import React from 'react';
import { TextInput, View, Text } from 'react-native';
import { connect } from 'react-redux';
import { translate } from '../base/i18n';

const SynziInput = ({ label, value, onChangeText, placeholder, secureTextEntry }) => {
  const { inputStyle, labelStyle, containerStyle } = styles;

  return (
    <View style={containerStyle}>
      
      <TextInput
        secureTextEntry={secureTextEntry}
        placeholder={placeholder}
        autoCorrect={false}
        style={inputStyle}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

const styles = {
  inputStyle: {
    color: '#000',
    paddingRight: 5,
    paddingLeft: 5,
    fontSize: 18,
    lineHeight: 23,
    flex: 2,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    height: 40
  },
  containerStyle: {
    height: 20,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 5,
    marginBottom: 0,
    marginLeft: 20,
    marginRight: 20
  }
};



function _mapStateToProps(state) {

  return {

  };
}
export default connect(_mapStateToProps)(translate(SynziInput));

