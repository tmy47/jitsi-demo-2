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
    Image,
    Button,
    StatusBar
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
import SynziInput from '../../synzi/SynziInput';
import io from 'socket.io-client'





const containerStyle = {
  container: {
    backgroundColor:'#7f99ce',
    flex: 1,
    flexDirection: 'column',
    marginTop: 0
  },
  synziButtonStyle:{
    backgroundColor:'#ffb100',
    width: 200, 
    height: 40,
    padding: 5,
    borderRadius: 10,
    alignItems:'center',
    marginBottom: 20
  },
  synziButtonStyleDisabled:{
    backgroundColor:'#cccccc',
    width: 200, 
    height: 40,
    padding: 5,
    borderRadius: 10,
    alignItems:'center',
    marginBottom: 20,
    opacity:0.2
  },
  synziButtonText:{
    justifyContent: 'center',
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold', 
    marginTop:0
  },
  synziLoggedInUser:{
    justifyContent: 'center',
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold', 
    marginBottom:10
  }
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

        this.state.userName = '';
        this.state.password = '';
        this.state.typedRoomName = '';
        this.state._fieldFocused = false;
        this.state.hintBoxAnimation = new Animated.Value(0);
        this.state.modalVisible = false;

        // Bind event handlers so they are only bound once per instance.
        this._getHintBoxStyle = this._getHintBoxStyle.bind(this);
        this._onFieldFocusChange = this._onFieldFocusChange.bind(this);
        this._onShowSideBar = this._onShowSideBar.bind(this);
        this._renderHintBox = this._renderHintBox.bind(this);


        //Socket IO
        const connectionOptions = {
            jsonp: false,
            secure: true,
            transports: ['websocket'],
          }
      
        this.socket = io('https://api-dev.synzi.com', connectionOptions)


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
        const loginButtonDisabled = () => (this.state.userName.length === 0 || this.state.password.length === 0);
        const joinRoomButtonDisabled = () => this.state.typedRoomName.length === 0;


        return (

            <View style={containerStyle.container}>

                <View style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexDirection: 'column',
                        alignContent: 'stretch',
                        marginTop:0
                    }}>
         
                    <SynziHeader style={{
                            alignSelf: "stretch"
                        }} 
                        headerText={'Virtual Care'} />

                    <View style={{
                            backgroundColor:'#677288',
                            width: 300, 
                            height: 280,
                            padding: 10,
                            borderRadius: 10,
                            alignItems:'center'
                        }}>
                        <Text style={containerStyle.synziLoggedInUser}>
                            Sign In
                        </Text>
                        <View style={{height: 20}}/>
                        <SynziInput
                            placeholder="username"
                            label="User"
                            value={this.state.userName}
                            onChangeText={userName => this.setState({ userName })}
                        />
                        <SynziInput
                            placeholder="password"
                            label="Password"
                            value={this.state.password}
                            onChangeText={password => this.setState({ password })}
                        />
                        <View style={{height: 20}}/>
                        <TouchableHighlight 
                        style={loginButtonDisabled() ? containerStyle.synziButtonStyleDisabled : containerStyle.synziButtonStyle}
                            onPress={() => {
                                this.setModalVisible(true);
                            }}>
                            <Text style={containerStyle.synziButtonText}>
                                Sign In
                            </Text>
                        </TouchableHighlight>
                    </View>
                    <View>
                        <Image
                            style={{
                                width: 150, 
                                height: 30,
                                marginBottom: 10,
                            }}
                            resizeMode="contain"
                            source={require('../../synzi/images/poweredBySynzi.png')}
                        />

                        <Text style={{
                                justifyContent: 'center',
                                fontSize: 12,
                                color: 'black',
                                textAlign: 'center',
                                marginTop:0}}>
                                v2.0
                        </Text>
                    </View>
                </View>
                
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.modalVisible}
                    style={{
                        marginTop:20,
                    }}>

                        <View style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexDirection: 'column',
                            alignContent: 'stretch',
                            backgroundColor:'#7f99ce',
                        }}>
                            <SynziHeader style={{
                                alignSelf: "stretch"
                            }} 
                            headerText={'Virtual Care'} />

                            <View style={{
                                backgroundColor:'#677288',
                                width: 300, 
                                height: 280,
                                padding: 10,
                                borderRadius: 10,
                                alignItems: 'center'}}>

                                 <Text style={containerStyle.synziLoggedInUser}>
                                    {'Logged In: ' + this.state.userName}
                                </Text>
                                
                                <TouchableHighlight 
                                    style={containerStyle.synziButtonStyle}
                                    onPress={() => {
                                        this.setState({userName:'', password:''})
                                        this.setModalVisible(false);
                                    }}>
                                    <Text style={containerStyle.synziButtonText}>
                                        Sign Out
                                    </Text>
                                </TouchableHighlight>

                                <View style={{height: 20}}/>
                                
                                <Text style={containerStyle.synziLoggedInUser}>
                                    Enter a room name
                                </Text>
                                <SynziInput style={{width: 200, textAlign:'center'}}
                                    placeholder="room name"
                                    label="Room Name"
                                    value={this.state.typedRoomName}
                                    onChangeText={typedRoomName => this.setState({ typedRoomName })}
                                />
                                
                                <TouchableHighlight 
                                    style={joinRoomButtonDisabled() ? containerStyle.synziButtonStyleDisabled : containerStyle.synziButtonStyle}
                                    onPress={() => {
                                        this._onJoin();
                                    }}>
                                    <Text style={containerStyle.synziButtonText}>
                                        Join Room
                                    </Text>
                                </TouchableHighlight>

                            </View>

                            <View>
                                <Image
                                    style={{
                                        width: 150, 
                                        height: 30,
                                        marginBottom: 10,
                                    }}
                                    resizeMode="contain"
                                    source={require('../../synzi/images/poweredBySynzi.png')}
                                />

                                <Text style={{
                                        justifyContent: 'center',
                                        fontSize: 12,
                                        color: 'black',
                                        textAlign: 'center',
                                        marginTop:0}}>
                                        v2.0
                                </Text>
                            </View>
                        </View>
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
