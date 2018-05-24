/* @flow */

import _ from 'lodash';

import { _CONFIG_STORE_PREFIX } from './constants';
import parseURLParams from './parseURLParams';

declare var $: Object;

/**
 * The config keys to whitelist, the keys that can be overridden.
 * Currently we can only whitelist the first part of the properties, like
 * 'p2p.useStunTurn' and 'p2p.enabled' we whitelist all p2p options.
 * The whitelist is used only for config.js.
 *
 * @private
 * @type Array
 */
const WHITELISTED_KEYS = [
    '_peerConnStatusOutOfLastNTimeout',
    '_peerConnStatusRtcMuteTimeout',
    'abTesting',
    'alwaysVisibleToolbar',
    'autoRecord',
    'autoRecordToken',
    'avgRtpStatsN',
    'callStatsConfIDNamespace',
    'callStatsID',
    'callStatsSecret',
    'callUUID',
    'channelLastN',
    'constraints',
    'debug',
    'debugAudioLevels',
    'defaultLanguage',
    'desktopSharingChromeDisabled',
    'desktopSharingChromeExtId',
    'desktopSharingChromeMinExtVersion',
    'desktopSharingChromeSources',
    'desktopSharingFrameRate',
    'desktopSharingFirefoxDisabled',
    'desktopSharingSources',
    'disable1On1Mode',
    'disableAEC',
    'disableAGC',
    'disableAP',
    'disableAudioLevels',
    'disableDesktopSharing',
    'disableDesktopSharing',
    'disableH264',
    'disableHPF',
    'disableNS',
    'disableRemoteControl',
    'disableRtx',
    'disableSuspendVideo',
    'displayJids',
    'enableDisplayNameInStats',
    'enableLipSync',
    'enableLocalVideoFlip',
    'enableRecording',
    'enableRemb',
    'enableStatsID',
    'enableTalkWhileMuted',
    'enableTcc',
    'enableUserRolesBasedOnToken',
    'etherpad_base',
    'failICE',
    'firefox_fake_device',
    'forceJVB121Ratio',
    'gatherStats',
    'googleApiApplicationClientID',
    'hiddenDomain',
    'hosts',
    'iAmRecorder',
    'iAmSipGateway',
    'iceTransportPolicy',
    'ignoreStartMuted',
    'minParticipants',
    'nick',
    'openBridgeChannel',
    'p2p',
    'preferH264',
    'recordingType',
    'requireDisplayName',
    'resolution',
    'startAudioMuted',
    'startAudioOnly',
    'startBitrate',
    'startScreenSharing',
    'startVideoMuted',
    'startWithAudioMuted',
    'startWithVideoMuted',
    'testing',
    'useIPv6',
    'useNicks',
    'useStunTurn',
    'webrtcIceTcpDisable',
    'webrtcIceUdpDisable'
];

const logger = require('jitsi-meet-logger').getLogger(__filename);

// XXX The functions getRoomName and parseURLParams are split out of
// functions.js because they are bundled in both app.bundle and
// do_external_connect, webpack 1 does not support tree shaking, and we don't
// want all functions to be bundled in do_external_connect.
export { default as getRoomName } from './getRoomName';
export { parseURLParams };

/**
 * Sends HTTP POST request to specified {@code endpoint}. In request the name
 * of the room is included in JSON format:
 * {
 *     "rooomName": "someroom12345"
 * }.
 *
 * @param {string} endpoint - The name of HTTP endpoint to which to send
 * the HTTP POST request.
 * @param {string} roomName - The name of the conference room for which config
 * is requested.
 * @param {Function} complete - The callback to invoke upon success or failure.
 * @returns {void}
 */
export function obtainConfig(
        endpoint: string,
        roomName: string,
        complete: Function) {
    logger.info(`Send config request to ${endpoint} for room: ${roomName}`);
    $.ajax(
        endpoint,
        {
            contentType: 'application/json',
            data: JSON.stringify({ roomName }),
            dataType: 'json',
            method: 'POST',

            error(jqXHR, textStatus, errorThrown) {
                logger.error('Get config error: ', jqXHR, errorThrown);
                complete(false, `Get config response status: ${textStatus}`);
            },
            success(data) {
                const { config, interfaceConfig, loggingConfig } = window;

                try {
                    overrideConfigJSON(
                        config, interfaceConfig, loggingConfig,
                        data);
                    complete(true);
                } catch (e) {
                    logger.error('Parse config error: ', e);
                    complete(false, e);
                }
            }
        }
    );
}

/* eslint-disable max-params, no-shadow */

/**
 * Overrides JSON properties in {@code config} and
 * {@code interfaceConfig} Objects with the values from {@code newConfig}.
 * Overrides only the whitelisted keys.
 *
 * @param {Object} config - The config Object in which we'll be overriding
 * properties.
 * @param {Object} interfaceConfig - The interfaceConfig Object in which we'll
 * be overriding properties.
 * @param {Object} loggingConfig - The loggingConfig Object in which we'll be
 * overriding properties.
 * @param {Object} json - Object containing configuration properties.
 * Destination object is selected based on root property name:
 * {
 *     config: {
 *         // config.js properties here
 *     },
 *     interfaceConfig: {
 *         // interface_config.js properties here
 *     },
 *     loggingConfig: {
 *         // logging_config.js properties here
 *     }
 * }.
 * @returns {void}
 */
export function overrideConfigJSON(
        config: ?Object, interfaceConfig: ?Object, loggingConfig: ?Object,
        json: Object) {
    for (const configName of Object.keys(json)) {
        let configObj;

        if (configName === 'config') {
            configObj = config;
        } else if (configName === 'interfaceConfig') {
            configObj = interfaceConfig;
        } else if (configName === 'loggingConfig') {
            configObj = loggingConfig;
        }
        if (configObj) {
            const configJSON
                = _getWhitelistedJSON(configName, json[configName]);

            if (!_.isEmpty(configJSON)) {
                logger.info(
                    `Extending ${configName} with: ${
                        JSON.stringify(configJSON)}`);

                // eslint-disable-next-line arrow-body-style
                _.mergeWith(configObj, configJSON, (oldValue, newValue) => {

                    // XXX We don't want to merge the arrays, we want to
                    // overwrite them.
                    return Array.isArray(oldValue) ? newValue : undefined;
                });
            }
        }
    }
}

/* eslint-enable max-params, no-shadow */

/**
 * Whitelist only config.js, skips this for others configs
 * (interfaceConfig, loggingConfig).
 * Only extracts overridden values for keys we allow to be overridden.
 *
 * @param {string} configName - The config name, one of config,
 * interfaceConfig, loggingConfig.
 * @param {Object} configJSON - The object with keys and values to override.
 * @private
 * @returns {Object} - The result object only with the keys
 * that are whitelisted.
 */
function _getWhitelistedJSON(configName, configJSON) {
    if (configName !== 'config') {
        return configJSON;
    }

    return _.pick(configJSON, WHITELISTED_KEYS);
}

/**
 * Restores a Jitsi Meet config.js from {@code localStorage} if it was
 * previously downloaded from a specific {@code baseURL} and stored with
 * {@link storeConfig}.
 *
 * @param {string} baseURL - The base URL from which the config.js was
 * previously downloaded and stored with {@code storeConfig}.
 * @returns {?Object} The Jitsi Meet config.js which was previously downloaded
 * from {@code baseURL} and stored with {@code storeConfig} if it was restored;
 * otherwise, {@code undefined}.
 */
export function restoreConfig(baseURL: string): ?Object {
    let storage;
    const key = `${_CONFIG_STORE_PREFIX}/${baseURL}`;

    try {
        // XXX Even reading the property localStorage of window may throw an
        // error (which is user agent-specific behavior).
        storage = window.localStorage;

        const config = storage.getItem(key);

        if (config) {
            return JSON.parse(config) || undefined;
        }
    } catch (e) {
        // Somehow incorrect data ended up in the storage. Clean it up.
        storage && storage.removeItem(key);
    }

    return undefined;
}

/* eslint-disable max-params */

/**
 * Inspects the hash part of the location URI and overrides values specified
 * there in the corresponding config objects given as the arguments. The syntax
 * is: {@code https://server.com/room#config.debug=true
 * &interfaceConfig.showButton=false&loggingConfig.something=1}.
 *
 * In the hash part each parameter will be parsed to JSON and then the root
 * object will be matched with the corresponding config object given as the
 * argument to this function.
 *
 * @param {Object} config - This is the general config.
 * @param {Object} interfaceConfig - This is the interface config.
 * @param {Object} loggingConfig - The logging config.
 * @param {URI} location - The new location to which the app is navigating to.
 * @returns {void}
 */
export function setConfigFromURLParams(
        config: ?Object,
        interfaceConfig: ?Object,
        loggingConfig: ?Object,
        location: Object) {
    const params = parseURLParams(location);
    const json = {};

    // At this point we have:
    // params = {
    //     "config.disableAudioLevels": false,
    //     "config.channelLastN": -1,
    //     "interfaceConfig.APP_NAME": "Jitsi Meet"
    // }
    // We want to have:
    // json = {
    //     config: {
    //         "disableAudioLevels": false,
    //         "channelLastN": -1
    //     },
    //     interfaceConfig: {
    //         "APP_NAME": "Jitsi Meet"
    //     }
    // }
    config && (json.config = {});
    interfaceConfig && (json.interfaceConfig = {});
    loggingConfig && (json.loggingConfig = {});

    for (const param of Object.keys(params)) {
        let base = json;
        const names = param.split('.');
        const last = names.pop();

        for (const name of names) {
            base = base[name] = base[name] || {};
        }

        base[last] = params[param];
    }

    overrideConfigJSON(config, interfaceConfig, loggingConfig, json);
}

/* eslint-enable max-params */
