// Import libraries for making a component
import React from 'react';
import { Text, View, Platform } from 'react-native';
import { connect } from 'react-redux';
import { translate } from '../base/i18n';

// Make a component
const SynziHeader = (props) => {
  const { textStyle, viewStyle } = styles;

  return (
    <View style={viewStyle}>
      <Text style={textStyle}>{props.headerText}</Text>
    </View>
  );
};



const styles = {
  viewStyle: {
    alignSelf: "stretch",
    backgroundColor: '#181818',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 2,
    position: 'relative',
    height: 60,
    marginTop:0
  },
  textStyle: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    ...Platform.select({
      ios: {
        marginTop:-10,
      },
      android: {
        marginTop:-15,
      }
    }),
  }
};



function _mapStateToProps(state) {

  return {
      /**
       * The indicator which determines whether the local participant is a
       * guest in the conference.
       *
       * @private
       * @type {boolean}
       */
      _headerText: ''
  };
}

export default connect(_mapStateToProps)(translate(SynziHeader));
