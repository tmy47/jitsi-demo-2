import React from 'react';
import {
    Animated,
    Keyboard,
    SafeAreaView,
    TextInput,
    TouchableHighlight,
    TouchableOpacity,
    View,
    Modal,
    StyleSheet,
    Platform,
    Image
} from 'react-native';
import { connect } from 'react-redux';

import { translate } from '../../base/i18n';
import { Icon } from '../../base/font-icons';
import { MEDIA_TYPE } from '../../base/media';
import { Header, LoadingIndicator, Text } from '../../base/react';
import { ColorPalette } from '../../base/styles';
import {
    createDesiredLocalTracks,
    destroyLocalTracks
} from '../../base/tracks';
import { SettingsView } from '../../settings';

import { AbstractWelcomePage, _mapStateToProps } from './AbstractWelcomePage';
import { setSideBarVisible } from '../actions';
import LocalVideoTrackUnderlay from './LocalVideoTrackUnderlay';
import styles, { PLACEHOLDER_TEXT_COLOR } from './styles';
import VideoSwitch from './VideoSwitch';
import WelcomePageLists from './WelcomePageLists';
import SynziHeader from '../../synzi/SynziHeader';



const containerStyle = {
  container: {
    backgroundColor:'#505050',
    flex: 1,
    flexDirection: 'column',
    ...Platform.select({
      ios: {
        marginTop:0
      },
      android: {
        marginTop:0
      }
    }),
  },
};


/**
 * The native container rendering the welcome page.
 *
 * @extends AbstractWelcomePage
 */
class WelcomePage extends AbstractWelcomePage {


    /**
     * Constructor of the Component.
     *
     * @inheritdoc
     */
    constructor(props) {
        super(props);

        this.state.roomName = 'myroom';
        this.state._fieldFocused = false;
        this.state.hintBoxAnimation = new Animated.Value(0);
        this.state.modalVisible = false;

        // Bind event handlers so they are only bound once per instance.
        this._getHintBoxStyle = this._getHintBoxStyle.bind(this);
        this._onFieldFocusChange = this._onFieldFocusChange.bind(this);
        this._onShowSideBar = this._onShowSideBar.bind(this);
        this._renderHintBox = this._renderHintBox.bind(this);
    }

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }

    /**
     * Implements React's {@link Component#componentWillMount()}. Invoked
     * immediately before mounting occurs. Creates a local video track if none
     * is available.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentWillMount() {
        super.componentWillMount();

        const { dispatch } = this.props;

        // if (this.props._profile.startAudioOnly) {
        //     dispatch(destroyLocalTracks());
        // } else {
            dispatch(createDesiredLocalTracks(MEDIA_TYPE.VIDEO));
        //}
    }

    /**
     * Implements React's {@link Component#render()}. Renders a prompt for
     * entering a room name.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { buttonStyle, pageStyle } = Header;
        const { t } = this.props;

        return (

            
            <View style={containerStyle.container}>
                
                <View style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexDirection: 'column',
                        alignContent: 'stretch'
                    }}>

                    <SynziHeader style={{
                            alignSelf: "stretch" 
                        }} 
                        headerText={'Virtual Care'} />

                    <TouchableHighlight style={{
                        backgroundColor:'#ffb100',
                        width: 200, 
                        height: 50,
                        padding: 10,
                        borderRadius: 10,
                        alignItems:'center',
                    }}
                        onPress={() => {
                            this.setModalVisible(true);
                        }}>
                        <Text style={{justifyContent: 'center', marginTop:5}}>Start Conference</Text>
                    </TouchableHighlight>

                    <Image
                        style={{
                            width: 150, 
                            height: 30,
                            marginBottom: 10,
                        }}
                        resizeMode="contain"
                        source={require('../../synzi/images/poweredBySynzi.png')}
                    />
                </View>
                
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                        alert('Modal has been closed.');
                    }}>
                    <LocalVideoTrackUnderlay style = { styles.welcomePage }>
                        <View style = { pageStyle }>
                            <Header style = { styles.header }>
                                <TouchableOpacity 
                                    onPress={() => {
                                        this.setModalVisible(false);
                                    }}>
                                    <Text>Hide Modal</Text>
                                </TouchableOpacity>
                            </Header>
                            <SafeAreaView style = { styles.roomContainer } >
                                <View style = { styles.joinControls } >
                                    <TextInput
                                        accessibilityLabel = { 'Input room name.' }
                                        autoCapitalize = 'none'
                                        autoComplete = { false }
                                        autoCorrect = { false }
                                        autoFocus = { false }
                                        onBlur = { this._onFieldFocusChange(false) }
                                        onChangeText = { this._onRoomChange }
                                        onFocus = { this._onFieldFocusChange(true) }
                                        onSubmitEditing = { this._onJoin }
                                        placeholder = { t('welcomepage.roomname') }
                                        placeholderTextColor = {
                                            PLACEHOLDER_TEXT_COLOR
                                        }
                                        returnKeyType = { 'go' }
                                        style = { styles.textInput }
                                        underlineColorAndroid = 'transparent'
                                        value = { this.state.room } />
                                    {
                                        this._renderHintBox()
                                    }
                                </View>
                            </SafeAreaView>
                            <WelcomePageLists disabled = { this.state._fieldFocused } />
                            <SettingsView />
                        </View>
                    </LocalVideoTrackUnderlay>
                </Modal>
            </View>
        );
    }

    /**
     * Constructs a style array to handle the hint box animation.
     *
     * @private
     * @returns {Array<Object>}
     */
    _getHintBoxStyle() {
        return [
            styles.hintContainer,
            {
                opacity: this.state.hintBoxAnimation
            }
        ];
    }

    /**
     * Callback for when the room field's focus changes so the hint box
     * must be rendered or removed.
     *
     * @private
     * @param {boolean} focused - The focused state of the field.
     * @returns {Function}
     */
    _onFieldFocusChange(focused) {
        return () => {
            focused
                && this.setState({
                    _fieldFocused: true
                });

            Animated.timing(
                this.state.hintBoxAnimation,
                {
                    duration: 300,
                    toValue: focused ? 1 : 0
                })
                .start(animationState =>
                    animationState.finished
                        && !focused
                        && this.setState({
                            _fieldFocused: false
                        }));
        };
    }

    /**
     * Toggles the side bar.
     *
     * @private
     * @returns {void}
     */
    _onShowSideBar() {
        Keyboard.dismiss();
        this.props.dispatch(setSideBarVisible(true));
    }

    /**
     * Renders the hint box if necessary.
     *
     * @private
     * @returns {React$Node}
     */
    _renderHintBox() {
        if (this.state._fieldFocused) {
            const { t } = this.props;

            return (
                <Animated.View style = { this._getHintBoxStyle() }>
                    <View style = { styles.hintTextContainer } >
                        <Text style = { styles.hintText }>
                            { t('welcomepage.roomnameHint') }
                        </Text>
                    </View>
                    <View style = { styles.hintButtonContainer } >
                        { this._renderJoinButton() }
                    </View>
                </Animated.View>
            );
        }

        return null;
    }

    /**
     * Renders the join button.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderJoinButton() {
        let children;

        /* eslint-disable no-extra-parens */

        if (this.state.joining) {
            // TouchableHighlight is picky about what its children can be, so
            // wrap it in a native component, i.e. View to avoid having to
            // modify non-native children.
            children = (
                <View>
                    <LoadingIndicator
                        color = { styles.buttonText.color }
                        size = 'small' />
                </View>
            );
        } else {
            children = (
                <Text style = { styles.buttonText }>
                    { this.props.t('welcomepage.join') }
                </Text>
            );
        }

        /* eslint-enable no-extra-parens */

        const buttonDisabled = this._isJoinDisabled();

        return (
            <TouchableHighlight
                accessibilityLabel = { 'Tap to Join.' }
                disabled = { buttonDisabled }
                onPress = { this._onJoin }
                style = { [
                    styles.button,
                    buttonDisabled ? styles.buttonDisabled : null
                ] }
                underlayColor = { ColorPalette.white }>
                { children }
            </TouchableHighlight>
        );
    }
}

export default translate(connect(_mapStateToProps)(WelcomePage));
