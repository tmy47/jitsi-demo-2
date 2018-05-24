// FIXME The bundler-related (and the browser-related) polyfills were born at
// the very early days of prototyping the execution of lib-jitsi-meet on
// react-native. Today, the feature base/lib-jitsi-meet should not be
// responsible for such polyfills because it is not the only feature relying on
// them. Additionally, the polyfills are usually necessary earlier than the
// execution of base/lib-jitsi-meet (which is understandable given that the
// polyfills are globals). The remaining problem to be solved here is where to
// collect the polyfills' files.
import './features/base/lib-jitsi-meet/native/polyfills-bundler';

// FIXME: Remove once react-native-webrtc and react-native-prompt import
// PropTypes from 'prop-types' instead of 'react'.
import './features/base/react/prop-types-polyfill';

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { AppRegistry, Linking, NativeModules } from 'react-native';

import { App } from './features/app';
import { equals } from './features/base/redux';

/**
 * React Native doesn't support specifying props to the main/root component (in
 * the JS/JSX source code). So create a wrapper React Component (class) around
 * features/app's App instead.
 *
 * @extends Component
 */
class Root extends Component {
    /**
     * {@code Root} component's property types.
     *
     * @static
     */
    static propTypes = {
        /**
         * The URL, if any, with which the app was launched.
         */
        url: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.string
        ]),

        /**
         * Whether the Welcome page is enabled. If {@code true}, the Welcome
         * page is rendered when the {@link App} is not at a location (URL)
         * identifying a Jitsi Meet conference/room.
         */
        welcomePageEnabled: PropTypes.bool
    };

    /**
     * Initializes a new {@code Root} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        /**
         * The initial state of this Component.
         *
         * @type {{
         *     url: object|string
         * }}
         */
        this.state = {
            /**
             * The URL, if any, with which the app was launched.
             *
             * @type {object|string}
             */
            url: this.props.url
        };

        // Handle the URL, if any, with which the app was launched. But props
        // have precedence.
        if (typeof this.props.url === 'undefined') {
            this._getInitialURL()
                .then(url => {
                    if (typeof this.state.url === 'undefined') {
                        this.setState({ url });
                    }
                })
                .catch(err => {
                    console.error('Failed to get initial URL', err);

                    if (typeof this.state.url === 'undefined') {
                        // Start with an empty URL if getting the initial URL
                        // fails; otherwise, nothing will be rendered.
                        this.setState({ url: null });
                    }
                });
        }
    }

    /**
     * Gets the initial URL the app was launched with. This can be a universal
     * (or deep) link, or a CallKit intent in iOS. Since the native
     * {@code Linking} module doesn't provide a way to access intents in iOS,
     * those are handled with the {@code LaunchOptions} module, which
     * essentially provides a replacement which takes that into consideration.
     *
     * @private
     * @returns {Promise} - A promise which will be fulfilled with the URL that
     * the app was launched with.
     */
    _getInitialURL() {
        if (NativeModules.LaunchOptions) {
            return NativeModules.LaunchOptions.getInitialURL();
        }

        return Linking.getInitialURL();
    }

    /**
     * Implements React's {@link Component#componentWillReceiveProps()}.
     *
     * New props can be set from the native side by setting the appProperties
     * property (on iOS) or calling setAppProperties (on Android).
     *
     * @inheritdoc
     */
    componentWillReceiveProps({ url }) {
        equals(this.props.url, url) || this.setState({ url: url || null });
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { url } = this.state;

        // XXX We don't render the App component until we get the initial URL.
        // Either it's null or some other non-null defined value.
        if (typeof url === 'undefined') {
            return null;
        }

        const {
            // The following props are forked in state:
            url: _, // eslint-disable-line no-unused-vars

            // The remaining props are passed through to App.
            ...props
        } = this.props;

        return (
            <App
                { ...props }
                url = { url } />
        );
    }
}

// Register the main/root Component.
AppRegistry.registerComponent('App', () => Root);
