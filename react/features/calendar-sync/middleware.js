// @flow

import RNCalendarEvents from 'react-native-calendar-events';

import { APP_WILL_MOUNT } from '../app';
import { ADD_KNOWN_DOMAINS, addKnownDomains } from '../base/known-domains';
import { MiddlewareRegistry } from '../base/redux';
import { APP_LINK_SCHEME, parseURIString } from '../base/util';
import { APP_STATE_CHANGED } from '../mobile/background';

import { setCalendarAuthorization, setCalendarEvents } from './actions';
import { REFRESH_CALENDAR } from './actionTypes';
import { CALENDAR_ENABLED } from './constants';

const logger = require('jitsi-meet-logger').getLogger(__filename);

/**
 * The number of days to fetch.
 */
const FETCH_END_DAYS = 10;

/**
 * The number of days to go back when fetching.
 */
const FETCH_START_DAYS = -1;

/**
 * The max number of events to fetch from the calendar.
 */
const MAX_LIST_LENGTH = 10;

CALENDAR_ENABLED
    && MiddlewareRegistry.register(store => next => action => {
        switch (action.type) {
        case ADD_KNOWN_DOMAINS: {
            // XXX Fetch new calendar entries only when an actual domain has
            // become known.
            const { getState } = store;
            const oldValue = getState()['features/base/known-domains'];
            const result = next(action);
            const newValue = getState()['features/base/known-domains'];

            oldValue === newValue || _fetchCalendarEntries(store, false, false);

            return result;
        }

        case APP_STATE_CHANGED: {
            const result = next(action);

            _maybeClearAccessStatus(store, action);

            return result;
        }

        case APP_WILL_MOUNT: {
            // For legacy purposes, we've allowed the deserialization of
            // knownDomains and now we're to translate it to base/known-domains.
            const state = store.getState()['features/calendar-sync'];

            if (state) {
                const { knownDomains } = state;

                Array.isArray(knownDomains)
                    && knownDomains.length
                    && store.dispatch(addKnownDomains(knownDomains));
            }

            const result = next(action);

            _fetchCalendarEntries(store, false, false);

            return result;
        }

        case REFRESH_CALENDAR: {
            const result = next(action);

            _fetchCalendarEntries(store, true, action.forcePermission);

            return result;
        }
        }

        return next(action);
    });

/**
 * Ensures calendar access if possible and resolves the promise if it's granted.
 *
 * @param {boolean} promptForPermission - Flag to tell the app if it should
 * prompt for a calendar permission if it wasn't granted yet.
 * @param {Function} dispatch - The Redux dispatch function.
 * @private
 * @returns {Promise}
 */
function _ensureCalendarAccess(promptForPermission, dispatch) {
    return new Promise((resolve, reject) => {
        RNCalendarEvents.authorizationStatus()
            .then(status => {
                if (status === 'authorized') {
                    resolve(true);
                } else if (promptForPermission) {
                    RNCalendarEvents.authorizeEventStore()
                        .then(result => {
                            dispatch(setCalendarAuthorization(result));
                            resolve(result === 'authorized');
                        })
                        .catch(reject);
                } else {
                    resolve(false);
                }
            })
            .catch(reject);
    });
}

/**
 * Reads the user's calendar and updates the stored entries if need be.
 *
 * @param {Object} store - The redux store.
 * @param {boolean} maybePromptForPermission - Flag to tell the app if it should
 * prompt for a calendar permission if it wasn't granted yet.
 * @param {boolean|undefined} forcePermission - Whether to force to re-ask for
 * the permission or not.
 * @private
 * @returns {void}
 */
function _fetchCalendarEntries(
        store,
        maybePromptForPermission,
        forcePermission) {
    const { dispatch, getState } = store;
    const promptForPermission
        = (maybePromptForPermission
                && !getState()['features/calendar-sync'].authorization)
            || forcePermission;

    _ensureCalendarAccess(promptForPermission, dispatch)
        .then(accessGranted => {
            if (accessGranted) {
                const startDate = new Date();
                const endDate = new Date();

                startDate.setDate(startDate.getDate() + FETCH_START_DAYS);
                endDate.setDate(endDate.getDate() + FETCH_END_DAYS);

                RNCalendarEvents.fetchAllEvents(
                        startDate.getTime(),
                        endDate.getTime(),
                        [])
                    .then(_updateCalendarEntries.bind(store))
                    .catch(error =>
                        logger.error('Error fetching calendar.', error));
            } else {
                logger.warn('Calendar access not granted.');
            }
        })
        .catch(reason => logger.error('Error accessing calendar.', reason));
}

/**
 * Retrieves a Jitsi Meet URL from an event if present.
 *
 * @param {Object} event - The event to parse.
 * @param {Array<string>} knownDomains - The known domain names.
 * @private
 * @returns {string}
 */
function _getURLFromEvent(event, knownDomains) {
    const linkTerminatorPattern = '[^\\s<>$]';
    const urlRegExp
        = new RegExp(
            `http(s)?://(${knownDomains.join('|')})/${linkTerminatorPattern}+`,
            'gi');
    const schemeRegExp
        = new RegExp(`${APP_LINK_SCHEME}${linkTerminatorPattern}+`, 'gi');
    const fieldsToSearch = [
        event.title,
        event.url,
        event.location,
        event.notes,
        event.description
    ];

    for (const field of fieldsToSearch) {
        if (typeof field === 'string') {
            const matches = urlRegExp.exec(field) || schemeRegExp.exec(field);

            if (matches) {
                const url = parseURIString(matches[0]);

                if (url) {
                    return url.toString();
                }
            }
        }
    }

    return null;
}

/**
 * Clears the calendar access status when the app comes back from the
 * background. This is needed as some users may never quit the app, but puts it
 * into the background and we need to try to request for a permission as often
 * as possible, but not annoyingly often.
 *
 * @param {Object} store - The redux store.
 * @param {Object} action - The Redux action.
 * @private
 * @returns {void}
 */
function _maybeClearAccessStatus(store, { appState }) {
    appState === 'background'
        && store.dispatch(setCalendarAuthorization(undefined));
}

/**
 * Updates the calendar entries in Redux when new list is received.
 *
 * @param {Object} event - An event returned from the native calendar.
 * @param {Array<string>} knownDomains - The known domain list.
 * @private
 * @returns {CalendarEntry}
 */
function _parseCalendarEntry(event, knownDomains) {
    if (event) {
        const url = _getURLFromEvent(event, knownDomains);

        if (url) {
            const startDate = Date.parse(event.startDate);
            const endDate = Date.parse(event.endDate);

            if (isNaN(startDate) || isNaN(endDate)) {
                logger.warn(
                    'Skipping invalid calendar event',
                    event.title,
                    event.startDate,
                    event.endDate
                );
            } else {
                return {
                    endDate,
                    id: event.id,
                    startDate,
                    title: event.title,
                    url
                };
            }
        }
    }

    return null;
}

/**
 * Updates the calendar entries in redux when new list is received.
 *
 * XXX The function's {@code this} is the redux store.
 *
 * @param {Array<CalendarEntry>} events - The new event list.
 * @private
 * @returns {void}
 */
function _updateCalendarEntries(events) {
    if (events && events.length) {
        // eslint-disable-next-line no-invalid-this
        const { dispatch, getState } = this;

        const knownDomains = getState()['features/base/known-domains'];
        const eventList = [];

        const now = Date.now();

        for (const event of events) {
            const calendarEntry = _parseCalendarEntry(event, knownDomains);

            calendarEntry
                && calendarEntry.endDate > now
                && eventList.push(calendarEntry);
        }

        dispatch(
            setCalendarEvents(
                eventList
                    .sort((a, b) => a.startDate - b.startDate)
                    .slice(0, MAX_LIST_LENGTH)));
    }
}
