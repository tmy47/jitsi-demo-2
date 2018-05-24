/* global $ */
import SmallVideo from '../videolayout/SmallVideo';

const logger = require('jitsi-meet-logger').getLogger(__filename);

/**
 *
 */
export default function SharedVideoThumb(url, videoType, VideoLayout) {
    this.id = url;

    this.url = url;
    this.setVideoType(videoType);
    this.videoSpanId = 'sharedVideoContainer';
    this.container = this.createContainer(this.videoSpanId);
    this.$container = $(this.container);
    this.container.onclick = this.videoClick.bind(this);
    this.bindHoverHandler();
    SmallVideo.call(this, VideoLayout);
    this.isVideoMuted = true;
}
SharedVideoThumb.prototype = Object.create(SmallVideo.prototype);
SharedVideoThumb.prototype.constructor = SharedVideoThumb;

/**
 * hide display name
 */
// eslint-disable-next-line no-empty-function
SharedVideoThumb.prototype.setDeviceAvailabilityIcons = function() {};

// eslint-disable-next-line no-empty-function
SharedVideoThumb.prototype.avatarChanged = function() {};

SharedVideoThumb.prototype.createContainer = function(spanId) {
    const container = document.createElement('span');

    container.id = spanId;
    container.className = 'videocontainer';

    // add the avatar
    const avatar = document.createElement('img');

    avatar.className = 'sharedVideoAvatar';
    avatar.src = `https://img.youtube.com/vi/${this.url}/0.jpg`;
    container.appendChild(avatar);

    const displayNameContainer = document.createElement('div');

    displayNameContainer.className = 'displayNameContainer';
    container.appendChild(displayNameContainer);

    const remotes = document.getElementById('filmstripRemoteVideosContainer');


    return remotes.appendChild(container);
};

/**
 * The thumb click handler.
 */
SharedVideoThumb.prototype.videoClick = function() {
    this.VideoLayout.handleVideoThumbClicked(this.url);
};

/**
 * Removes RemoteVideo from the page.
 */
SharedVideoThumb.prototype.remove = function() {
    logger.log('Remove shared video thumb', this.id);

    // Make sure that the large video is updated if are removing its
    // corresponding small video.
    this.VideoLayout.updateAfterThumbRemoved(this.id);

    // Remove whole container
    if (this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
    }
};

/**
 * Sets the display name for the thumb.
 */
SharedVideoThumb.prototype.setDisplayName = function(displayName) {
    if (!this.container) {
        logger.warn(`Unable to set displayName - ${this.videoSpanId
        } does not exist`);

        return;
    }

    this.updateDisplayName({
        displayName: displayName || '',
        elementID: `${this.videoSpanId}_name`,
        participantID: this.id
    });
};
