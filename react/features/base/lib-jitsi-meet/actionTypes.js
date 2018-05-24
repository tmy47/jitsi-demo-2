/**
 * The type of Redux action which signals that {@link JitsiMeetJS} was disposed.
 *
 * {
 *     type: LIB_DID_DISPOSE
 * }
 */
export const LIB_DID_DISPOSE = Symbol('LIB_DID_DISPOSE');

/**
 * The type of Redux action which signals that {@link JitsiMeetJS.init()} was
 * invoked and completed successfully.
 *
 * {
 *     type: LIB_DID_INIT
 * }
 */
export const LIB_DID_INIT = Symbol('LIB_DID_INIT');

/**
 * Action to signal that lib-jitsi-meet initialized failed with error.
 *
 * {
 *     type: LIB_INIT_ERROR,
 *     error: Error
 * }
 */
export const LIB_INIT_ERROR = Symbol('LIB_INIT_ERROR');

/**
 * Action to dispatch the promise returned by JitsiMeetJS.init.
 *
 * {
 *     type: LIB_INIT_PROMISE_CREATED,
 *     initPromise: Promise
 * }
 */
export const LIB_INIT_PROMISE_CREATED = Symbol('LIB_INIT_PROMISE_CREATED');

/**
 * The type of Redux action which signals that {@link JitsiMeetJS} will be
 * disposed.
 *
 * {
 *     type: LIB_WILL_DISPOSE
 * }
 */
export const LIB_WILL_DISPOSE = Symbol('LIB_WILL_DISPOSE');

/**
 * The type of Redux action which signals that {@link JitsiMeetJS.init()} will
 * be invoked.
 *
 * {
 *     type: LIB_WILL_INIT
 * }
 */
export const LIB_WILL_INIT = Symbol('LIB_WILL_INIT');

/**
 * The type of Redux action which indicates whether WebRTC is ready.
 *
 * {
 *     type: SET_WEBRTC_READY,
 *     webRTCReady: boolean | Promise
 * }
 */
export const SET_WEBRTC_READY = Symbol('SET_WEBRTC_READY');
