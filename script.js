const data = {
    "tracks": [
        {
            "trackId": "edgeworth",
            "trackName": "Miles Edgeworth ~ Objection 2009",
            "trackPerformer": "Ace Attorney Investigations: Miles Edgeworth",
            "trackAudioUrl": "./resources/music/edgeworth.mp3",
            "trackColor": "#D6001E",
            "trackImages": {
                "mugshotImageUrl": "./resources/img/mugshot/edgeworth.png",
                "largeImageUrls": [
                    "./resources/img/large/edgeworth/edgeworth.webp",
                    "./resources/img/large/edgeworth/edgeworth_trilogy.webp",
                    "./resources/img/large/edgeworth/edgeworth_rookie.webp"
                ]
            }
        },
        {
            "trackId": "franziska",
            "trackName": "Franziska von Karma ~ Great Revival",
            "trackPerformer": "Phoenix Wright: Ace Attorney - Justice for All",
            "trackAudioUrl": "./resources/music/franziska.mp3",
            "trackColor": "#2ACDE8",
            "trackImages": {
                "mugshotImageUrl": "./resources/img/mugshot/franziska.webp",
                "largeImageUrls": [
                    "./resources/img/large/franziska/franziska.webp",
                    "./resources/img/large/franziska/franziska_whip.webp",
                    "./resources/img/large/franziska/franziska_young.webp"
                ]
            }
        },
        {
            "trackId": "lang",
            "trackName": "Shi-Long Lang ~ Lang Zi Says!",
            "trackPerformer": "Ace Attorney Investigations: Miles Edgeworth",
            "trackAudioUrl": "./resources/music/lang.mp3",
            "trackColor": "#F8C718",
            "trackImages": {
                "mugshotImageUrl": "./resources/img/mugshot/lang.webp",
                "largeImageUrls": [
                    "./resources/img/large/lang/lang.webp",
                    "./resources/img/large/lang/lang_with_assistant.webp"
                ]
            }
        },
        {
            "trackId": "gumshoe",
            "trackName": "Detective Gumshoe ~ You Can Count on Me, Pal!",
            "trackPerformer": "Ace Attorney Investigations: Miles Edgeworth",
            "trackAudioUrl": "./resources/music/gumshoe.mp3",
            "trackColor": "#808452",
            "trackImages": {
                "mugshotImageUrl": "./resources/img/mugshot/gumshoe.webp",
                "largeImageUrls": [
                    "./resources/img/large/gumshoe/gumshoe.webp",
                    "./resources/img/large/gumshoe/gumshoe_young.webp"
                ]
            }
        },

        {
            "trackId": "kay",
            "trackName": "Kay Faraday ~ The Great Truth Thief",
            "trackPerformer": "Ace Attorney Investigations: Miles Edgeworth",
            "trackAudioUrl": "./resources/music/kay.mp3",
            "trackColor": "#D82E8D",
            "trackImages": {
                "mugshotImageUrl": "./resources/img/mugshot/kay.webp",
                "largeImageUrls": [
                    "./resources/img/large/kay/kay.webp",
                    "./resources/img/large/kay/kay_young.webp"
                ]
            }
        }
    ]
};

let currentTrack = null;
let currentImageIndex = 0;
let imageAutoSwitcherId = null;
let imageAutoSwitcherTimeout = 500;
let audioContext = null;

function updateLargeImage(track, index) {
    let largeImageElement = document.getElementById("cc-tc-img");
    largeImageElement.src = track.trackImages.largeImageUrls[index];
    currentImageIndex = index;

    if (track) {
        let imageNumberText = document.getElementById("cc-tc-ic-text");
        imageNumberText.innerText = `Image ${
            index + 1
        } of ${
            track.trackImages.largeImageUrls.length
        }`
    }
}

function previousImage() {
    updateLargeImage(
        currentTrack,
        (currentTrack.trackImages.largeImageUrls.length + currentImageIndex - 1)
            % currentTrack.trackImages.largeImageUrls.length
    );
}

function nextImage() {
    updateLargeImage(
        currentTrack,
        (currentImageIndex + 1) % currentTrack.trackImages.largeImageUrls.length
    );
}

function openSettingsWindow() {
    let settingsWindow = document.getElementById("settings");
    settingsWindow.hidden = false;
}

function closeSettingsWindow() {
    let settingsWindow = document.getElementById("settings");
    settingsWindow.hidden = true;
}

function stopImageAutoSwitcher() {
    clearInterval(imageAutoSwitcherId);
    imageAutoSwitcherId = null;
}

function startImageAutoSwitcher(timeout) {
    imageAutoSwitcherTimeout = timeout;
    stopImageAutoSwitcher();
    imageAutoSwitcherId = setInterval(nextImage, imageAutoSwitcherTimeout);
}

function applySettings() {
    const settingsForm = document.forms['settings-form'];
    const switchEnabled = settingsForm['switch-enabled'].checked;
    const switchTimeout = parseInt(settingsForm['switch-timeout'].value, 10);

    if (switchEnabled) {
        startImageAutoSwitcher(switchTimeout);
    } else {
        stopImageAutoSwitcher();
    }
}

function revertInputsToStored() {
    const settingsForm = document.forms['settings-form'];
    const switchEnabled = imageAutoSwitcherId !== null;
    const switchTimeout = imageAutoSwitcherTimeout;

    settingsForm['switch-enabled'].checked = switchEnabled;
    settingsForm['switch-timeout'].value = switchTimeout;
}

function calculateMarqueeDuration(element) {
    const containerWidth = element.parentElement.clientWidth;
    const contentWidth = element.scrollWidth;
    const distance = contentWidth + containerWidth;
    const speed = 100; // pixels per second
    return distance / speed;
}

function updateTrackNameAndPerformer(trackName, trackPerformer) {
    let trackNameContainerElement = document.getElementById("cc-tc-track-name-container");
    let trackNameElement = document.getElementById("cc-tc-track-name");
    let trackPerformerContainerElement = document.getElementById(
        "cc-tc-track-performer-container"
    );
    let trackPerformerElement = document.getElementById("cc-tc-track-performer");

    trackNameElement.innerText = trackName;
    trackPerformerElement.innerText = trackPerformer;

    if (trackNameElement.clientWidth > trackNameContainerElement.clientWidth) {
        trackNameElement.classList.add("marquee");
        const duration = calculateMarqueeDuration(trackNameElement);
        trackNameElement.style.animationDuration = `${duration}s`;
    } else {
        trackNameElement.classList.remove("marquee");
    }

    if (trackPerformerElement.clientWidth > trackPerformerContainerElement.clientWidth) {
        trackPerformerElement.classList.add("marquee");
        const duration = calculateMarqueeDuration(trackPerformerElement);
        trackPerformerElement.style.animationDuration = `${duration}s`;
    } else {
        trackPerformerElement.classList.remove("marquee");
    }
}

function selectTrack(track) {
    const mugshotGallery = document.getElementById("cc-mugshot-gallery");
    [...mugshotGallery.children].forEach((item) => item.classList.remove("selected"));
    const mugshot = document.getElementById(`cc-mg-mugshot-${track.trackId}`);
    mugshot.classList.add("selected");

    updateTrackNameAndPerformer(track.trackName, track.trackPerformer);

    currentTrack = track;
    updateLargeImage(track, 0);
}

function previousTrack() {
    currentTrackIndex = data.tracks.indexOf(currentTrack);
    trackCount = data.tracks.length;

    if (currentTrackIndex !== -1) {
        selectTrack(data.tracks[(currentTrackIndex + trackCount - 1) % trackCount]);
    }
}

function nextTrack() {
    currentTrackIndex = data.tracks.indexOf(currentTrack);
    trackCount = data.tracks.length;

    if (currentTrackIndex !== -1) {
        selectTrack(data.tracks[(currentTrackIndex + 1) % trackCount]);
    }
}

function addMugshot(mugshotGallery, track) {
    const mugshot = document.createElement("img");
    mugshot.id = `cc-mg-mugshot-${ track.trackId }`;
    mugshot.classList.add("cc-mg-mugshot");
    mugshot.src = track.trackImages.mugshotImageUrl;
    mugshot.alt = track.trackName;
    mugshot.title = track.trackName;
    mugshot.addEventListener("click", () => selectTrack(track));
    mugshotGallery.appendChild(mugshot);
}

document.addEventListener("DOMContentLoaded", () => {
    const mugshotGallery = document.getElementById("cc-mugshot-gallery");

    data.tracks.forEach((track) => addMugshot(mugshotGallery, track));
    selectTrack(data.tracks[0]);

    document.getElementById("cc-tc-ic-prev").addEventListener('click', previousImage);
    document.getElementById("cc-tc-ic-settings").addEventListener('click', openSettingsWindow);
    document.getElementById("cc-tc-ic-next").addEventListener('click', nextImage);

    [...document.querySelectorAll("input[type=range]")].forEach((elem) => {
        elem.addEventListener("input", (event) => {
            const tempSliderValue = event.target.value;
            const progress = (tempSliderValue / elem.max) * 100;
            elem.style.background =
                `linear-gradient(to right, 
                var(--light-submit-color) ${progress}%, var(--translucent-text-color) ${progress}%)`;
        })
    });

    document.getElementById("cc-tc-ac-prev").addEventListener('click', previousTrack);
    document.getElementById("cc-tc-ac-next").addEventListener('click', nextTrack);

    const settingsForm = document.forms['settings-form'];
    settingsForm.addEventListener('submit', (ev) => {
        ev.preventDefault();
        applySettings();
        closeSettingsWindow();
    });
    document.getElementById('se-wi-tr-close-button').addEventListener('click', () => {
        revertInputsToStored();
        closeSettingsWindow();
    });
});