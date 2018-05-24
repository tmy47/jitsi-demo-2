/*
 * Copyright @ 2017-present Atlassian Pty Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.jitsi.meet.sdk;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.util.Log;
import android.widget.FrameLayout;

import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactRootView;
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler;
import com.rnimmersive.RNImmersiveModule;

import org.jitsi.meet.sdk.invite.InviteController;

import java.net.URL;
import java.util.Collections;
import java.util.Set;
import java.util.UUID;
import java.util.WeakHashMap;

public class JitsiMeetView extends FrameLayout {
    /**
     * Background color used by {@code JitsiMeetView} and the React Native root
     * view.
     */
    private static final int BACKGROUND_COLOR = 0xFF111111;

    /**
     * The {@link Log} tag which identifies the source of the log messages of
     * {@code JitsiMeetView}.
     */
    private final static String TAG = JitsiMeetView.class.getSimpleName();

    private static final Set<JitsiMeetView> views
        = Collections.newSetFromMap(new WeakHashMap<JitsiMeetView, Boolean>());

    public static JitsiMeetView findViewByExternalAPIScope(
            String externalAPIScope) {
        synchronized (views) {
            for (JitsiMeetView view : views) {
                if (view.externalAPIScope.equals(externalAPIScope)) {
                    return view;
                }
            }
        }

        return null;
    }

    /**
     * Loads a specific URL {@code String} in all existing
     * {@code JitsiMeetView}s.
     *
     * @param urlString he URL {@code String} to load in all existing
     * {@code JitsiMeetView}s.
     * @return If the specified {@code urlString} was submitted for loading in
     * at least one {@code JitsiMeetView}, then {@code true}; otherwise,
     * {@code false}.
     */
    private static boolean loadURLStringInViews(String urlString) {
        synchronized (views) {
            if (!views.isEmpty()) {
                for (JitsiMeetView view : views) {
                    view.loadURLString(urlString);
                }

                return true;
            }
        }

        return false;
    }

    /**
     * Activity lifecycle method which should be called from
     * {@code Activity.onBackPressed} so we can do the required internal
     * processing.
     *
     * @return {@code true} if the back-press was processed; {@code false},
     * otherwise. If {@code false}, the application should call the parent's
     * implementation.
     */
    public static boolean onBackPressed() {
        ReactInstanceManager reactInstanceManager
            = ReactInstanceManagerHolder.getReactInstanceManager();

        if (reactInstanceManager == null) {
            return false;
        } else {
            reactInstanceManager.onBackPressed();
            return true;
        }
    }

    /**
     * Activity lifecycle method which should be called from
     * {@code Activity.onDestroy} so we can do the required internal
     * processing.
     *
     * @param activity {@code Activity} being destroyed.
     */
    public static void onHostDestroy(Activity activity) {
        ReactInstanceManager reactInstanceManager
            = ReactInstanceManagerHolder.getReactInstanceManager();

        if (reactInstanceManager != null) {
            reactInstanceManager.onHostDestroy(activity);
        }
    }

    /**
     * Activity lifecycle method which should be called from
     * {@code Activity.onPause} so we can do the required internal processing.
     *
     * @param activity {@code Activity} being paused.
     */
    public static void onHostPause(Activity activity) {
        ReactInstanceManager reactInstanceManager
            = ReactInstanceManagerHolder.getReactInstanceManager();

        if (reactInstanceManager != null) {
            reactInstanceManager.onHostPause(activity);
        }
    }

    /**
     * Activity lifecycle method which should be called from
     * {@code Activity.onResume} so we can do the required internal processing.
     *
     * @param activity {@code Activity} being resumed.
     */
    public static void onHostResume(Activity activity) {
        onHostResume(activity, new DefaultHardwareBackBtnHandlerImpl(activity));
    }

    /**
     * Activity lifecycle method which should be called from
     * {@code Activity.onResume} so we can do the required internal processing.
     *
     * @param activity {@code Activity} being resumed.
     * @param defaultBackButtonImpl a {@code DefaultHardwareBackBtnHandler} to
     * handle invoking the back button if no {@code JitsiMeetView} handles it.
     */
    public static void onHostResume(
            Activity activity,
            DefaultHardwareBackBtnHandler defaultBackButtonImpl) {
        ReactInstanceManager reactInstanceManager
            = ReactInstanceManagerHolder.getReactInstanceManager();

        if (reactInstanceManager != null) {
            reactInstanceManager.onHostResume(activity, defaultBackButtonImpl);
        }
    }

    /**
     * Activity lifecycle method which should be called from
     * {@code Activity.onNewIntent} so we can do the required internal
     * processing. Note that this is only needed if the activity's "launchMode"
     * was set to "singleTask". This is required for deep linking to work once
     * the application is already running.
     *
     * @param intent {@code Intent} instance which was received.
     */
    public static void onNewIntent(Intent intent) {
        // XXX At least twice we received bug reports about malfunctioning
        // loadURL in the Jitsi Meet SDK while the Jitsi Meet app seemed to
        // functioning as expected in our testing. But that was to be expected
        // because the app does not exercise loadURL. In order to increase the
        // test coverage of loadURL, channel deep linking through loadURL.
        Uri uri;

        if (Intent.ACTION_VIEW.equals(intent.getAction())
                && (uri = intent.getData()) != null
                && loadURLStringInViews(uri.toString())) {
            return;
        }

        ReactInstanceManager reactInstanceManager
            = ReactInstanceManagerHolder.getReactInstanceManager();

        if (reactInstanceManager != null) {
            reactInstanceManager.onNewIntent(intent);
        }
    }

    /**
     * The default base {@code URL} used to join a conference when a partial URL
     * (e.g. a room name only) is specified to {@link #loadURLString(String)} or
     * {@link #loadURLObject(Bundle)}.
     */
    private URL defaultURL;

    /**
     * The unique identifier of this {@code JitsiMeetView} within the process
     * for the purposes of {@link ExternalAPI}. The name scope was inspired by
     * postis which we use on Web for the similar purposes of the iframe-based
     * external API.
     */
    private final String externalAPIScope;

    /**
     * The entry point into the invite feature of Jitsi Meet. The Java
     * counterpart of the JavaScript {@code InviteButton}.
     */
    private final InviteController inviteController;

    /**
     * {@link JitsiMeetViewListener} instance for reporting events occurring in
     * Jitsi Meet.
     */
    private JitsiMeetViewListener listener;

    /**
     * Whether Picture-in-Picture is enabled. If {@code null}, defaults to
     * {@code true} iff the Android platform supports Picture-in-Picture
     * natively.
     */
    private Boolean pictureInPictureEnabled;

    /**
     * React Native root view.
     */
    private ReactRootView reactRootView;

    /**
     * The URL of the current conference.
     */
    // XXX Currently, one thread writes and one thread reads, so it should be
    // fine to have this field volatile without additional synchronization.
    private volatile String url;

    /**
     * Whether the Welcome page is enabled.
     */
    private boolean welcomePageEnabled;

    public JitsiMeetView(@NonNull Context context) {
        super(context);

        setBackgroundColor(BACKGROUND_COLOR);

        ReactInstanceManagerHolder.initReactInstanceManager(
            ((Activity) context).getApplication());

        // Hook this JitsiMeetView into ExternalAPI.
        externalAPIScope = UUID.randomUUID().toString();
        synchronized (views) {
            views.add(this);
        }

        // The entry point into the invite feature of Jitsi Meet. The Java
        // counterpart of the JavaScript InviteButton.
        inviteController = new InviteController(externalAPIScope);
    }

    /**
     * Releases the React resources (specifically the {@link ReactRootView})
     * associated with this view.
     *
     * This method MUST be called when the Activity holding this view is
     * destroyed, typically in the {@code onDestroy} method.
     */
    public void dispose() {
        if (reactRootView != null) {
            removeView(reactRootView);
            reactRootView.unmountReactApplication();
            reactRootView = null;
        }
    }

    /**
     * Gets the default base {@code URL} used to join a conference when a
     * partial URL (e.g. a room name only) is specified to
     * {@link #loadURLString(String)} or {@link #loadURLObject(Bundle)}. If not
     * set or if set to {@code null}, the default built in JavaScript is used:
     * {@link https://meet.jit.si}
     *
     * @return The default base {@code URL} or {@code null}.
     */
    public URL getDefaultURL() {
        return defaultURL;
    }

    /**
     * Gets the {@link InviteController} which represents the entry point into
     * the invite feature of Jitsi Meet and is the Java counterpart of the
     * JavaScript {@code InviteButton}.
     *
     * @return the {@link InviteController} which represents the entry point
     * into the invite feature of Jitsi Meet and is the Java counterpart of the
     * JavaScript {@code InviteButton}
     */
    public InviteController getInviteController() {
        return inviteController;
    }

    /**
     * Gets the {@link JitsiMeetViewListener} set on this {@code JitsiMeetView}.
     *
     * @return The {@code JitsiMeetViewListener} set on this
     * {@code JitsiMeetView}.
     */
    public JitsiMeetViewListener getListener() {
        return listener;
    }

    /**
     * Gets whether Picture-in-Picture is enabled. Picture-in-Picture is
     * natively supported on Android API >= 26 (Oreo), so it should not be
     * enabled on older platform versions.
     *
     * @return If Picture-in-Picture is enabled, {@code true}; {@code false},
     * otherwise.
     */
    public boolean getPictureInPictureEnabled() {
        return
            PictureInPictureModule.isPictureInPictureSupported()
                && (pictureInPictureEnabled == null
                    || pictureInPictureEnabled.booleanValue());
    }

    /**
     * Gets the URL of the current conference.
     *
     * XXX The method is meant for internal purposes only at the time of this
     * writing because there is no equivalent API on iOS.
     *
     * @return the URL {@code String} of the current conference if any;
     * otherwise, {@code null}.
     */
    String getURL() {
        return url;
    }

    /**
     * Gets whether the Welcome page is enabled. If {@code true}, the Welcome
     * page is rendered when this {@code JitsiMeetView} is not at a URL
     * identifying a Jitsi Meet conference/room.
     *
     * @return {@code true} if the Welcome page is enabled; otherwise,
     * {@code false}.
     */
    public boolean getWelcomePageEnabled() {
        return welcomePageEnabled;
    }

    /**
     * Loads a specific {@link URL} which may identify a conference to join. If
     * the specified {@code URL} is {@code null} and the Welcome page is
     * enabled, the Welcome page is displayed instead.
     *
     * @param url The {@code URL} to load which may identify a conference to
     * join.
     */
    public void loadURL(@Nullable URL url) {
        loadURLString(url == null ? null : url.toString());
    }

    /**
     * Loads a specific URL which may identify a conference to join. The URL is
     * specified in the form of a {@link Bundle} of properties which (1)
     * internally are sufficient to construct a URL {@code String} while (2)
     * abstracting the specifics of constructing the URL away from API
     * clients/consumers. If the specified URL is {@code null} and the Welcome
     * page is enabled, the Welcome page is displayed instead.
     *
     * @param urlObject The URL to load which may identify a conference to join.
     */
    public void loadURLObject(@Nullable Bundle urlObject) {
        Bundle props = new Bundle();

        // defaultURL
        if (defaultURL != null) {
            props.putString("defaultURL", defaultURL.toString());
        }

        // externalAPIScope
        props.putString("externalAPIScope", externalAPIScope);

        // inviteController
        InviteController inviteController = getInviteController();

        if (inviteController != null) {
            props.putBoolean(
                "addPeopleEnabled",
                inviteController.isAddPeopleEnabled());
            props.putBoolean(
                "dialOutEnabled",
                inviteController.isDialOutEnabled());
        }

        // pictureInPictureEnabled
        props.putBoolean(
            "pictureInPictureEnabled",
            getPictureInPictureEnabled());

        // url
        if (urlObject != null) {
            props.putBundle("url", urlObject);
        }

        // welcomePageEnabled
        props.putBoolean("welcomePageEnabled", welcomePageEnabled);

        // XXX The method loadURLObject: is supposed to be imperative i.e.
        // a second invocation with one and the same URL is expected to join
        // the respective conference again if the first invocation was followed
        // by leaving the conference. However, React and, respectively,
        // appProperties/initialProperties are declarative expressions i.e. one
        // and the same URL will not trigger componentWillReceiveProps in the
        // JavaScript source code. The workaround implemented bellow introduces
        // imperativeness in React Component props by defining a unique value
        // per loadURLObject: invocation.
        props.putLong("timestamp", System.currentTimeMillis());

        if (reactRootView == null) {
            reactRootView = new ReactRootView(getContext());
            reactRootView.startReactApplication(
                ReactInstanceManagerHolder.getReactInstanceManager(),
                "App",
                props);
            reactRootView.setBackgroundColor(BACKGROUND_COLOR);
            addView(reactRootView);
        } else {
            reactRootView.setAppProperties(props);
        }
    }

    /**
     * Loads a specific URL {@link String} which may identify a conference to
     * join. If the specified URL {@code String} is {@code null} and the Welcome
     * page is enabled, the Welcome page is displayed instead.
     *
     * @param urlString The URL {@code String} to load which may identify a
     * conference to join.
     */
    public void loadURLString(@Nullable String urlString) {
        Bundle urlObject;

        if (urlString == null) {
            urlObject = null;
        } else {
            urlObject = new Bundle();
            urlObject.putString("url", urlString);
        }
        loadURLObject(urlObject);
    }

    /**
     * Activity lifecycle method which should be called from
     * {@code Activity.onUserLeaveHint} so we can do the required internal
     * processing.
     *
     * This is currently not mandatory, but if used will provide automatic
     * handling of the picture in picture mode when user minimizes the app. It
     * will be probably the most useful in case the app is using the welcome
     * page.
     */
    public void onUserLeaveHint() {
        if (getPictureInPictureEnabled() && getURL() != null) {
            PictureInPictureModule pipModule
                = ReactInstanceManagerHolder.getNativeModule(
                        PictureInPictureModule.class);

            if (pipModule != null) {
                try {
                    pipModule.enterPictureInPicture();
                } catch (RuntimeException re) {
                    Log.e(TAG, "onUserLeaveHint: failed to enter PiP mode", re);
                }
            }
        }
    }

    /**
     * Called when the window containing this view gains or loses focus.
     *
     * @param hasFocus If the window of this view now has focus, {@code true};
     * otherwise, {@code false}.
     */
    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);

        // https://github.com/mockingbot/react-native-immersive#restore-immersive-state

        // FIXME The singleton pattern employed by RNImmersiveModule is not
        // advisable because a react-native mobule is consumable only after its
        // BaseJavaModule#initialize() has completed and here we have no
        // knowledge of whether the precondition is really met.
        RNImmersiveModule immersive = RNImmersiveModule.getInstance();

        if (hasFocus && immersive != null) {
            try {
                immersive.emitImmersiveStateChangeEvent();
            } catch (RuntimeException re) {
                // FIXME I don't know how to check myself whether
                // BaseJavaModule#initialize() has been invoked and thus
                // RNImmersiveModule is consumable. A safe workaround is to
                // swallow the failure because the whole full-screen/immersive
                // functionality is brittle anyway, akin to the icing on the
                // cake, and has been working without onWindowFocusChanged for a
                // very long time.
                Log.e(
                    TAG,
                    "RNImmersiveModule#emitImmersiveStateChangeEvent() failed!",
                    re);
            }
        }
    }

    /**
     * Sets the default base {@code URL} used to join a conference when a
     * partial URL (e.g. a room name only) is specified to
     * {@link #loadURLString(String)} or {@link #loadURLObject(Bundle)}. Must be
     * called before {@link #loadURL(URL)} for it to take effect.
     *
     * @param defaultURL The {@code URL} to be set as the default base URL.
     * @see #getDefaultURL()
     */
    public void setDefaultURL(URL defaultURL) {
        this.defaultURL = defaultURL;
    }

    /**
     * Sets a specific {@link JitsiMeetViewListener} on this
     * {@code JitsiMeetView}.
     *
     * @param listener The {@code JitsiMeetViewListener} to set on this
     * {@code JitsiMeetView}.
     */
    public void setListener(JitsiMeetViewListener listener) {
        this.listener = listener;
    }

    /**
     * Sets whether Picture-in-Picture is enabled. Because Picture-in-Picture is
     * natively supported only since certain platform versions, specifying
     * {@code true} will have no effect on unsupported platform versions.
     *
     * @param pictureInPictureEnabled To enable Picture-in-Picture,
     * {@code true}; otherwise, {@code false}.
     */
    public void setPictureInPictureEnabled(boolean pictureInPictureEnabled) {
        this.pictureInPictureEnabled = Boolean.valueOf(pictureInPictureEnabled);
    }

    /**
     * Sets the URL of the current conference.
     *
     * XXX The method is meant for internal purposes only. It does not
     * {@code loadURL}, it merely remembers the specified URL.
     *
     * @param url the URL {@code String} which to be set as the URL of the
     * current conference.
     */
    void setURL(String url) {
        this.url = url;
    }

    /**
     * Sets whether the Welcome page is enabled. Must be called before
     * {@link #loadURL(URL)} for it to take effect.
     *
     * @param welcomePageEnabled {@code true} to enable the Welcome page;
     * otherwise, {@code false}.
     */
    public void setWelcomePageEnabled(boolean welcomePageEnabled) {
        this.welcomePageEnabled = welcomePageEnabled;
    }
}
