import React from 'react';
import {
    Animated,
    Keyboard,
    TouchableHighlight,
    View
} from 'react-native';
import { connect } from 'react-redux';

import { translate } from '../../base/i18n';
import { MEDIA_TYPE } from '../../base/media';
import { Header, LoadingIndicator, Text } from '../../base/react';
import { ColorPalette } from '../../base/styles';
import {
    createDesiredLocalTracks,
    destroyLocalTracks
} from '../../base/tracks';

import { AbstractWelcomePage, _mapStateToProps } from './AbstractWelcomePage';
import { setSideBarVisible } from '../actions';
import LocalVideoTrackUnderlay from './LocalVideoTrackUnderlay';
import styles, { PLACEHOLDER_TEXT_COLOR } from './styles';
import SynziHomeContainerView from '../../synzi/components/views/SynziHomeContainerView/SynziHomeContainerView'





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

        this.state._fieldFocused = false;
        this.state.hintBoxAnimation = new Animated.Value(0);
        this.state.typedRoomName = 'synzi-test';

        // Bind event handlers so they are only bound once per instance.
        this._getHintBoxStyle = this._getHintBoxStyle.bind(this);
        this._onFieldFocusChange = this._onFieldFocusChange.bind(this);
        this._onShowSideBar = this._onShowSideBar.bind(this);
        this._renderHintBox = this._renderHintBox.bind(this);

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

        /** Entry Point for Synzi App */
        return (
            <SynziHomeContainerView joinHandler={this._onJoin}
            />
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
