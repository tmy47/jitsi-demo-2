// @flow

import { CONNECTION_WILL_CONNECT } from '../connection';
import { JitsiConferenceErrors } from '../lib-jitsi-meet';
import { assign, ReducerRegistry, set } from '../redux';
import { LOCKED_LOCALLY, LOCKED_REMOTELY } from '../../room-lock';

import {
    CONFERENCE_FAILED,
    CONFERENCE_JOINED,
    CONFERENCE_LEFT,
    CONFERENCE_WILL_JOIN,
    CONFERENCE_WILL_LEAVE,
    LOCK_STATE_CHANGED,
    P2P_STATUS_CHANGED,
    SET_AUDIO_ONLY,
    SET_DESKTOP_SHARING_ENABLED,
    SET_FOLLOW_ME,
    SET_PASSWORD,
    SET_RECEIVE_VIDEO_QUALITY,
    SET_ROOM,
    SET_SIP_GATEWAY_ENABLED,
    SET_START_MUTED_POLICY
} from './actionTypes';
import { VIDEO_QUALITY_LEVELS } from './constants';
import { isRoomValid } from './functions';

/**
 * Listen for actions that contain the conference object, so that it can be
 * stored for use by other action creators.
 */
ReducerRegistry.register('features/base/conference', (state = {}, action) => {
    switch (action.type) {
    case CONFERENCE_FAILED:
        return _conferenceFailed(state, action);

    case CONFERENCE_JOINED:
        return _conferenceJoined(state, action);

    case CONFERENCE_LEFT:
        return _conferenceLeft(state, action);

    case CONFERENCE_WILL_JOIN:
        return _conferenceWillJoin(state, action);

    case CONFERENCE_WILL_LEAVE:
        return _conferenceWillLeave(state, action);

    case CONNECTION_WILL_CONNECT:
        return set(state, 'authRequired', undefined);

    case LOCK_STATE_CHANGED:
        return _lockStateChanged(state, action);

    case P2P_STATUS_CHANGED:
        return _p2pStatusChanged(state, action);

    case SET_AUDIO_ONLY:
        return _setAudioOnly(state, action);

    case SET_DESKTOP_SHARING_ENABLED:
        return _setDesktopSharingEnabled(state, action);

    case SET_FOLLOW_ME:
        return {
            ...state,
            followMeEnabled: action.enabled
        };

    case SET_PASSWORD:
        return _setPassword(state, action);

    case SET_RECEIVE_VIDEO_QUALITY:
        return _setReceiveVideoQuality(state, action);

    case SET_ROOM:
        return _setRoom(state, action);

    case SET_SIP_GATEWAY_ENABLED:
        return _setSIPGatewayEnabled(state, action);

    case SET_START_MUTED_POLICY:
        return {
            ...state,
            startAudioMutedPolicy: action.startAudioMutedPolicy,
            startVideoMutedPolicy: action.startVideoMutedPolicy
        };
    }

    return state;
});

/**
 * Reduces a specific Redux action CONFERENCE_FAILED of the feature
 * base/conference.
 *
 * @param {Object} state - The Redux state of the feature base/conference.
 * @param {Action} action - The Redux action CONFERENCE_FAILED to reduce.
 * @private
 * @returns {Object} The new state of the feature base/conference after the
 * reduction of the specified action.
 */
function _conferenceFailed(state, { conference, error }) {
    // The current (similar to getCurrentConference in
    // base/conference/functions.js) conference which is joining or joined:
    const conference_ = state.conference || state.joining;

    if (conference_ && conference_ !== conference) {
        return state;
    }

    let authRequired;
    let passwordRequired;

    switch (error.name) {
    case JitsiConferenceErrors.AUTHENTICATION_REQUIRED:
        authRequired = conference;
        break;

    case JitsiConferenceErrors.PASSWORD_REQUIRED:
        passwordRequired = conference;
        break;
    }

    return assign(state, {
        authRequired,
        conference: undefined,
        error,
        joining: undefined,
        leaving: undefined,

        /**
         * The indicator of how the conference/room is locked. If falsy, the
         * conference/room is unlocked; otherwise, it's either
         * {@code LOCKED_LOCALLY} or {@code LOCKED_REMOTELY}.
         *
         * @type {string}
         */
        locked: passwordRequired ? LOCKED_REMOTELY : undefined,
        password: undefined,

        /**
         * The JitsiConference instance which requires a password to join.
         *
         * @type {JitsiConference}
         */
        passwordRequired
    });
}

/**
 * Reduces a specific Redux action CONFERENCE_JOINED of the feature
 * base/conference.
 *
 * @param {Object} state - The Redux state of the feature base/conference.
 * @param {Action} action - The Redux action CONFERENCE_JOINED to reduce.
 * @private
 * @returns {Object} The new state of the feature base/conference after the
 * reduction of the specified action.
 */
function _conferenceJoined(state, { conference }) {
    // FIXME The indicator which determines whether a JitsiConference is locked
    // i.e. password-protected is private to lib-jitsi-meet. However, the
    // library does not fire LOCK_STATE_CHANGED upon joining a JitsiConference
    // with a password.
    const locked = conference.room.locked ? LOCKED_REMOTELY : undefined;

    return assign(state, {
        authRequired: undefined,

        /**
         * The JitsiConference instance represented by the Redux state of the
         * feature base/conference.
         *
         * @type {JitsiConference}
         */
        conference,
        joining: undefined,
        leaving: undefined,

        /**
         * The indicator which determines whether the conference is locked.
         *
         * @type {boolean}
         */
        locked,
        passwordRequired: undefined,

        /**
         * The current resolution restraint on receiving remote video. By
         * default the conference will send the highest level possible.
         *
         * @type number
         */
        receiveVideoQuality: VIDEO_QUALITY_LEVELS.HIGH
    });
}

/**
 * Reduces a specific Redux action CONFERENCE_LEFT of the feature
 * base/conference.
 *
 * @param {Object} state - The Redux state of the feature base/conference.
 * @param {Action} action - The Redux action CONFERENCE_LEFT to reduce.
 * @private
 * @returns {Object} The new state of the feature base/conference after the
 * reduction of the specified action.
 */
function _conferenceLeft(state, { conference }) {
    let nextState = state;

    if (state.authRequired === conference) {
        nextState = set(nextState, 'authRequired', undefined);
    }
    if (state.conference === conference) {
        nextState = assign(nextState, {
            conference: undefined,
            joining: undefined,
            leaving: undefined,

            // XXX Clear/unset locked & password here for a conference which has
            // been LOCKED_LOCALLY.
            locked: undefined,
            password: undefined
        });
    }
    if (state.passwordRequired === conference) {
        nextState = assign(nextState, {
            // XXX Clear/unset locked & password here for a conference which has
            // been LOCKED_REMOTELY.
            locked: undefined,
            password: undefined,
            passwordRequired: undefined
        });
    }

    return nextState;
}

/**
 * Reduces a specific Redux action CONFERENCE_WILL_JOIN of the feature
 * base/conference.
 *
 * @param {Object} state - The Redux state of the feature base/conference.
 * @param {Action} action - The Redux action CONFERENCE_WILL_JOIN to reduce.
 * @private
 * @returns {Object} The new state of the feature base/conference after the
 * reduction of the specified action.
 */
function _conferenceWillJoin(state, { conference }) {
    return assign(state, {
        error: undefined,
        joining: conference
    });
}

/**
 * Reduces a specific Redux action CONFERENCE_WILL_LEAVE of the feature
 * base/conference.
 *
 * @param {Object} state - The Redux state of the feature base/conference.
 * @param {Action} action - The Redux action CONFERENCE_WILL_LEAVE to reduce.
 * @private
 * @returns {Object} The new state of the feature base/conference after the
 * reduction of the specified action.
 */
function _conferenceWillLeave(state, { conference }) {
    if (state.conference !== conference) {
        return state;
    }

    return assign(state, {
        authRequired: undefined,
        joining: undefined,

        /**
         * The JitsiConference instance which is currently in the process of
         * being left.
         *
         * @type {JitsiConference}
         */
        leaving: conference,
        passwordRequired: undefined
    });
}

/**
 * Reduces a specific Redux action LOCK_STATE_CHANGED of the feature
 * base/conference.
 *
 * @param {Object} state - The Redux state of the feature base/conference.
 * @param {Action} action - The Redux action LOCK_STATE_CHANGED to reduce.
 * @private
 * @returns {Object} The new state of the feature base/conference after the
 * reduction of the specified action.
 */
function _lockStateChanged(state, { conference, locked }) {
    if (state.conference !== conference) {
        return state;
    }

    return assign(state, {
        locked: locked ? state.locked || LOCKED_REMOTELY : undefined,
        password: locked ? state.password : undefined
    });
}

/**
 * Reduces a specific Redux action P2P_STATUS_CHANGED of the feature
 * base/conference.
 *
 * @param {Object} state - The Redux state of the feature base/conference.
 * @param {Action} action - The Redux action P2P_STATUS_CHANGED to reduce.
 * @private
 * @returns {Object} The new state of the feature base/conference after the
 * reduction of the specified action.
 */
function _p2pStatusChanged(state, action) {
    return set(state, 'p2p', action.p2p);
}

/**
 * Reduces a specific Redux action SET_AUDIO_ONLY of the feature
 * base/conference.
 *
 * @param {Object} state - The Redux state of the feature base/conference.
 * @param {Action} action - The Redux action SET_AUDIO_ONLY to reduce.
 * @private
 * @returns {Object} The new state of the feature base/conference after the
 * reduction of the specified action.
 */
function _setAudioOnly(state, action) {
    return set(state, 'audioOnly', action.audioOnly);
}

/**
 * Reduces a specific Redux action SET_DESKTOP_SHARING_ENABLED of the feature
 * base/conference.
 *
 * @param {Object} state - The Redux state of the feature base/conference.
 * @param {Action} action - The Redux action SET_DESKTOP_SHARING_ENABLED to
 * reduce.
 * @private
 * @returns {Object} The new state of the feature base/conference after the
 * reduction of the specified action.
 */
function _setDesktopSharingEnabled(state, action) {
    return set(state, 'desktopSharingEnabled', action.desktopSharingEnabled);
}

/**
 * Reduces a specific Redux action SET_PASSWORD of the feature base/conference.
 *
 * @param {Object} state - The Redux state of the feature base/conference.
 * @param {Action} action - The Redux action SET_PASSWORD to reduce.
 * @private
 * @returns {Object} The new state of the feature base/conference after the
 * reduction of the specified action.
 */
function _setPassword(state, { conference, method, password }) {
    switch (method) {
    case conference.join:
        if (state.passwordRequired === conference) {
            return assign(state, {
                locked: LOCKED_REMOTELY,

                /**
                 * The password with which the conference is to be joined.
                 *
                 * @type {string}
                 */
                password,
                passwordRequired: undefined
            });
        }
        break;

    case conference.lock:
        return assign(state, {
            locked: password ? LOCKED_LOCALLY : undefined,
            password
        });
    }

    return state;
}

/**
 * Reduces a specific Redux action SET_RECEIVE_VIDEO_QUALITY of the feature
 * base/conference.
 *
 * @param {Object} state - The Redux state of the feature base/conference.
 * @param {Action} action - The Redux action SET_RECEIVE_VIDEO_QUALITY to
 * reduce.
 * @private
 * @returns {Object} The new state of the feature base/conference after the
 * reduction of the specified action.
 */
function _setReceiveVideoQuality(state, action) {
    return set(state, 'receiveVideoQuality', action.receiveVideoQuality);
}

/**
 * Reduces a specific Redux action SET_ROOM of the feature base/conference.
 *
 * @param {Object} state - The Redux state of the feature base/conference.
 * @param {Action} action - The Redux action SET_ROOM to reduce.
 * @private
 * @returns {Object} The new state of the feature base/conference after the
 * reduction of the specified action.
 */
function _setRoom(state, action) {
    let { room } = action;

    if (!isRoomValid(room)) {
        // Technically, there are multiple values which don't represent valid
        // room names. Practically, each of them is as bad as the rest of them
        // because we can't use any of them to join a conference.
        room = undefined;
    }

    /**
     * The name of the room of the conference (to be) joined.
     *
     * @type {string}
     */
    return assign(state, {
        error: undefined,
        room
    });
}

/**
 * Reduces a specific Redux action SET_SIP_GATEWAY_ENABLED of the feature
 * base/conference.
 *
 * @param {Object} state - The Redux state of the feature base/conference.
 * @param {Action} action - The Redux action SET_SIP_GATEWAY_ENABLED to reduce.
 * @private
 * @returns {Object} The new state of the feature base/conference after the
 * reduction of the specified action.
 */
function _setSIPGatewayEnabled(state, action) {
    return set(state, 'isSIPGatewayEnabled', action.isSIPGatewayEnabled);
}
