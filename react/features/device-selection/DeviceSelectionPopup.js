/* global JitsiMeetJS */

import { AtlasKitThemeProvider } from '@atlaskit/theme';
import Logger from 'jitsi-meet-logger';
import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';

import {
    PostMessageTransportBackend,
    Transport
} from '../../../modules/transport';
import { parseURLParams } from '../base/config';

import DeviceSelectionDialogBase from './components/DeviceSelectionDialogBase';

const logger = Logger.getLogger(__filename);

/**
 * Implements a class that renders the React components for the device selection
 * popup page and handles the communication between the components and Jitsi
 * Meet.
 */
export default class DeviceSelectionPopup {
    /**
     * Initializes a new DeviceSelectionPopup instance.
     *
     * @param {Object} i18next - The i18next instance used for translation.
     */
    constructor(i18next) {
        this.close = this.close.bind(this);
        this._setVideoInputDevice = this._setVideoInputDevice.bind(this);
        this._setAudioInputDevice = this._setAudioInputDevice.bind(this);
        this._setAudioOutputDevice = this._setAudioOutputDevice.bind(this);
        this._i18next = i18next;
        const { scope } = parseURLParams(window.location);

        this._transport = new Transport({
            backend: new PostMessageTransportBackend({
                postisOptions: {
                    scope,
                    window: window.opener
                }
            })
        });

        this._transport.on('event', event => {
            if (event.name === 'deviceListChanged') {
                this._updateAvailableDevices();

                return true;
            }

            return false;
        });

        this._dialogProps = {
            availableDevices: {},
            currentAudioInputId: '',
            currentAudioOutputId: '',
            currentVideoInputId: '',
            disableAudioInputChange: true,
            disableDeviceChange: true,
            hasAudioPermission: JitsiMeetJS.mediaDevices
                .isDevicePermissionGranted.bind(null, 'audio'),
            hasVideoPermission: JitsiMeetJS.mediaDevices
                .isDevicePermissionGranted.bind(null, 'video'),
            hideAudioInputPreview: !JitsiMeetJS.isCollectingLocalStats(),
            hideAudioOutputSelect: true
        };
        this._initState();
    }

    /**
     * Sends event to Jitsi Meet to close the popup dialog.
     *
     * @returns {void}
     */
    close() {
        this._transport.sendEvent({
            type: 'devices-dialog',
            name: 'close'
        });
    }

    /**
     * Changes the properties of the react component and re-renders it.
     *
     * @param {Object} newProps - The new properties that will be assigned to
     * the current ones.
     * @returns {void}
     */
    _changeDialogProps(newProps) {
        this._dialogProps = {
            ...this._dialogProps,
            ...newProps
        };
        this._render();
    }

    /**
     * Returns Promise that resolves with result an list of available devices.
     *
     * @returns {Promise}
     */
    _getAvailableDevices() {
        return this._transport.sendRequest({
            type: 'devices',
            name: 'getAvailableDevices'
        }).catch(e => {
            logger.error(e);

            return {};
        });
    }

    /**
     * Returns Promise that resolves with current selected devices.
     *
     * @returns {Promise}
     */
    _getCurrentDevices() {
        return this._transport.sendRequest({
            type: 'devices',
            name: 'getCurrentDevices'
        }).catch(e => {
            logger.error(e);

            return {};
        });
    }

    /**
     * Initializes the state.
     *
     * @returns {void}
     */
    _initState() {
        return Promise.all([
            this._getAvailableDevices(),
            this._isDeviceListAvailable(),
            this._isDeviceChangeAvailable(),
            this._isDeviceChangeAvailable('output'),
            this._getCurrentDevices(),
            this._isMultipleAudioInputSupported()
        ]).then(([
            availableDevices,
            listAvailable,
            changeAvailable,
            changeOutputAvailable,
            currentDevices,
            multiAudioInputSupported
        ]) => {
            this._changeDialogProps({
                availableDevices,
                currentAudioInputId: currentDevices.audioInput,
                currentAudioOutputId: currentDevices.audioOutput,
                currentVideoInputId: currentDevices.videoInput,
                disableAudioInputChange: !multiAudioInputSupported,
                disableDeviceChange: !listAvailable || !changeAvailable,
                hideAudioOutputSelect: !changeOutputAvailable
            });
        });
    }

    /**
     * Returns Promise that resolves with true if the device change is available
     * and with false if not.
     *
     * @param {string} [deviceType] - Values - 'output', 'input' or undefined.
     * Default - 'input'.
     * @returns {Promise}
     */
    _isDeviceChangeAvailable(deviceType) {
        return this._transport.sendRequest({
            deviceType,
            type: 'devices',
            name: 'isDeviceChangeAvailable'
        }).catch(e => {
            logger.error(e);

            return false;
        });
    }

    /**
     * Returns Promise that resolves with true if the device list is available
     * and with false if not.
     *
     * @returns {Promise}
     */
    _isDeviceListAvailable() {
        return this._transport.sendRequest({
            type: 'devices',
            name: 'isDeviceListAvailable'
        }).catch(e => {
            logger.error(e);

            return false;
        });
    }

    /**
     * Returns Promise that resolves with true if the device list is available
     * and with false if not.
     *
     * @returns {Promise}
     */
    _isMultipleAudioInputSupported() {
        return this._transport.sendRequest({
            type: 'devices',
            name: 'isMultipleAudioInputSupported'
        }).catch(e => {
            logger.error(e);

            return false;
        });
    }

    /**
     * Renders the React components for the popup page.
     *
     * @returns {void}
     */
    _render() {
        const props = {
            ...this._dialogProps,
            closeModal: this.close,
            disableBlanketClickDismiss: true,
            setAudioInputDevice: this._setAudioInputDevice,
            setAudioOutputDevice: this._setAudioOutputDevice,
            setVideoInputDevice: this._setVideoInputDevice
        };

        ReactDOM.render(
            <I18nextProvider
                i18n = { this._i18next }>
                <AtlasKitThemeProvider mode = 'dark'>
                    <DeviceSelectionDialogBase { ...props } />
                </AtlasKitThemeProvider>
            </I18nextProvider>,
            document.getElementById('react'));
    }

    /**
     * Sets the audio input device to the one with the id that is passed.
     *
     * @param {string} id - The id of the new device.
     * @returns {Promise}
     */
    _setAudioInputDevice(id) {
        return this._setDevice({
            id,
            kind: 'audioinput'
        });
    }

    /**
     * Sets the audio output device to the one with the id that is passed.
     *
     * @param {string} id - The id of the new device.
     * @returns {Promise}
     */
    _setAudioOutputDevice(id) {
        return this._setDevice({
            id,
            kind: 'audiooutput'
        });
    }

    /**
     * Sets the currently used device to the one that is passed.
     *
     * @param {Object} device - The new device to be used.
     * @returns {Promise}
     */
    _setDevice(device) {
        return this._transport.sendRequest({
            type: 'devices',
            name: 'setDevice',
            device
        });
    }

    /**
     * Sets the video input device to the one with the id that is passed.
     *
     * @param {string} id - The id of the new device.
     * @returns {Promise}
     */
    _setVideoInputDevice(id) {
        return this._setDevice({
            id,
            kind: 'videoinput'
        });
    }

    /**
     * Updates the available devices.
     *
     * @returns {void}
     */
    _updateAvailableDevices() {
        this._getAvailableDevices().then(devices =>
            this._changeDialogProps({ availableDevices: devices })
        );
    }
}
