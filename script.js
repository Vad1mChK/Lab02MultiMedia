const initialData = {
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

let data = initialData;
let isPlaying = false;

let currentTrack = null;
let currentImageIndex = 0;
let imageAutoSwitcherId = null;
let imageAutoSwitcherTimeout = 500;

let waveformColor = { r: 0, g: 0, b: 0 };

let audioContext = null;
let analyserNode;
let sourceNode;
let animationId;

/**
 * Formats a time value in seconds to "mm:ss" format.
 * @param {number} seconds - The time in seconds.
 * @returns {string} - The formatted time string.
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Updates the large image displayed in the UI.
 * @param {Object} track - The current track object.
 * @param {number} index - The index of the image to display.
 */
function updateLargeImage(track, index) {
    const largeImageElement = document.getElementById("cc-tc-img");
    largeImageElement.src = track.trackImages.largeImageUrls[index];
    currentImageIndex = index;

    if (track) {
        const imageNumberText = document.getElementById("cc-tc-ic-text");
        imageNumberText.innerText = `Image ${index + 1} of ${track.trackImages.largeImageUrls.length}`;
    }
}

/** Shows the previous image in the track's image list. */
function previousImage() {
    const totalImages = currentTrack.trackImages.largeImageUrls.length;
    const newIndex = (totalImages + currentImageIndex - 1) % totalImages;
    updateLargeImage(currentTrack, newIndex);
}

/** Shows the next image in the track's image list. */
function nextImage() {
    const totalImages = currentTrack.trackImages.largeImageUrls.length;
    const newIndex = (currentImageIndex + 1) % totalImages;
    updateLargeImage(currentTrack, newIndex);
}

/** Opens the settings window in the UI. */
function openSettingsWindow() {
    const settingsWindow = document.getElementById("settings");
    settingsWindow.hidden = false;
}

/** Closes the settings window in the UI. */
function closeSettingsWindow() {
    const settingsWindow = document.getElementById("settings");
    settingsWindow.hidden = true;
}

/** Stops the image auto-switcher interval. */
function stopImageAutoSwitcher() {
    clearInterval(imageAutoSwitcherId);
    imageAutoSwitcherId = null;
}

/**
 * Starts the image auto-switcher with a given timeout.
 * @param {number} timeout - The interval in milliseconds between image switches.
 */
function startImageAutoSwitcher(timeout) {
    imageAutoSwitcherTimeout = timeout;
    stopImageAutoSwitcher();
    imageAutoSwitcherId = setInterval(nextImage, imageAutoSwitcherTimeout);
}

/** Applies the settings from the settings form to the application. */
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

/** Reverts the settings form inputs to the stored values. */
function revertInputsToStored() {
    const settingsForm = document.forms['settings-form'];
    const switchEnabled = imageAutoSwitcherId !== null;
    const switchTimeout = imageAutoSwitcherTimeout;

    settingsForm['switch-enabled'].checked = switchEnabled;
    settingsForm['switch-timeout'].value = switchTimeout;
}

/**
 * Calculates the duration needed for a marquee animation based on element widths.
 * @param {HTMLElement} element - The element to calculate duration for.
 * @returns {number} - The duration in seconds.
 */
function calculateMarqueeDuration(element) {
    const containerWidth = element.parentElement.clientWidth;
    const contentWidth = element.scrollWidth;
    const distance = contentWidth + containerWidth;
    const speed = 100; // pixels per second
    return distance / speed;
}

/**
 * Updates the track name and performer in the UI, adding marquee effect if necessary.
 * @param {string} trackName - The name of the track.
 * @param {string} trackPerformer - The performer of the track.
 */
function updateTrackNameAndPerformer(trackName, trackPerformer) {
    const trackNameContainer = document.getElementById("cc-tc-track-name-container");
    const trackNameElement = document.getElementById("cc-tc-track-name");
    const trackPerformerContainer = document.getElementById("cc-tc-track-performer-container");
    const trackPerformerElement = document.getElementById("cc-tc-track-performer");

    trackNameElement.innerText = trackName;
    trackPerformerElement.innerText = trackPerformer;

    if (trackNameElement.clientWidth > trackNameContainer.clientWidth) {
        trackNameElement.classList.add("marquee");
        const duration = calculateMarqueeDuration(trackNameElement);
        trackNameElement.style.animationDuration = `${duration}s`;
    } else {
        trackNameElement.classList.remove("marquee");
        trackNameElement.style.animationDuration = '';
    }

    if (trackPerformerElement.clientWidth > trackPerformerContainer.clientWidth) {
        trackPerformerElement.classList.add("marquee");
        const duration = calculateMarqueeDuration(trackPerformerElement);
        trackPerformerElement.style.animationDuration = `${duration}s`;
    } else {
        trackPerformerElement.classList.remove("marquee");
        trackPerformerElement.style.animationDuration = '';
    }
}

/**
 * Updates the waveform color based on the track's color.
 * @param {string} color - The hexadecimal color string.
 */
function updateWaveformColorFromTrack(color) {
    const colorNumber = parseInt(color.replace(/#/, ''), 16);
    waveformColor = {
        r: (colorNumber >> 16) & 0xFF,
        g: (colorNumber >> 8) & 0xFF,
        b: colorNumber & 0xFF
    };
    setWaveformColorToSliders();
    updateWaveformColorAndPreviewFromInputs();
}

/** Updates the waveform color and preview based on the slider inputs. */
function updateWaveformColorAndPreviewFromInputs() {
    const redSlider = document.getElementById('cc-wf-cs-red');
    const greenSlider = document.getElementById('cc-wf-cs-green');
    const blueSlider = document.getElementById('cc-wf-cs-blue');
    const colorPreviewBox = document.getElementById('cc-wf-cpr-box');
    const colorPreviewText = document.getElementById('cc-wf-cpr-text');
    updateWaveformColor(redSlider, greenSlider, blueSlider, colorPreviewBox, colorPreviewText);
}

/**
 * Selects a track, updating the UI to reflect the current track.
 * @param {Object} track - The track object to select.
 */
function selectTrack(track) {
    const mugshotGallery = document.getElementById("cc-mugshot-gallery");
    [...mugshotGallery.children].forEach((item) => item.classList.remove("selected"));

    const mugshot = document.getElementById(`cc-mg-mugshot-${track.trackId}`);
    mugshot.classList.add("selected");

    const audioTag = document.getElementById('cc-tc-ac-audio');
    audioTag.src = track.trackAudioUrl;

    updateTrackNameAndPerformer(track.trackName, track.trackPerformer);

    currentTrack = track;
    updateLargeImage(track, 0);

    updateWaveformColorFromTrack(track.trackColor);

    if (isPlaying) {
        audioTag.play();
    }

    // Remove setupAudioVisualization() from here
    // It will be called when the user clicks play
}

/** Selects the previous track in the track list. */
function previousTrack() {
    const currentTrackIndex = data.tracks.indexOf(currentTrack);
    const trackCount = data.tracks.length;

    if (currentTrackIndex !== -1) {
        const newIndex = (currentTrackIndex + trackCount - 1) % trackCount;
        selectTrack(data.tracks[newIndex]);
    }
}

/** Selects the next track in the track list. */
function nextTrack() {
    const currentTrackIndex = data.tracks.indexOf(currentTrack);
    const trackCount = data.tracks.length;

    if (currentTrackIndex !== -1) {
        const newIndex = (currentTrackIndex + 1) % trackCount;
        selectTrack(data.tracks[newIndex]);
    }
}

/**
 * Adds a mugshot image to the mugshot gallery for a given track.
 * @param {HTMLElement} mugshotGallery - The mugshot gallery element.
 * @param {Object} track - The track object.
 */
function addMugshot(mugshotGallery, track) {
    const mugshot = document.createElement("img");
    mugshot.id = `cc-mg-mugshot-${track.trackId}`;
    mugshot.classList.add("cc-mg-mugshot");
    mugshot.src = track.trackImages.mugshotImageUrl;
    mugshot.alt = track.trackName;
    mugshot.title = track.trackName;
    mugshot.addEventListener("click", () => selectTrack(track));
    mugshotGallery.appendChild(mugshot);
}

/**
 * Updates the waveform color based on slider values and updates the preview.
 * @param {HTMLInputElement} redSlider - The red color slider.
 * @param {HTMLInputElement} greenSlider - The green color slider.
 * @param {HTMLInputElement} blueSlider - The blue color slider.
 * @param {HTMLElement} previewBox - The color preview box element.
 * @param {HTMLElement} previewText - The color preview text element.
 */
function updateWaveformColor(redSlider, greenSlider, blueSlider, previewBox, previewText) {
    waveformColor = {
        r: redSlider.value,
        g: greenSlider.value,
        b: blueSlider.value,
    };
    previewBox.style.backgroundColor = `rgb(${waveformColor.r}, ${waveformColor.g}, ${waveformColor.b})`;
    const colorHex = ((parseInt(waveformColor.r) << 16) +
        (parseInt(waveformColor.g) << 8) +
        parseInt(waveformColor.b))
        .toString(16).padStart(6, '0');
    previewText.innerText = `#${colorHex}`;
}

/** Sets the waveform color sliders to match the current waveform color. */
function setWaveformColorToSliders() {
    const redSlider = document.getElementById('cc-wf-cs-red');
    const greenSlider = document.getElementById('cc-wf-cs-green');
    const blueSlider = document.getElementById('cc-wf-cs-blue');

    redSlider.value = waveformColor.r;
    greenSlider.value = waveformColor.g;
    blueSlider.value = waveformColor.b;

    updateSliderBackground(redSlider);
    updateSliderBackground(greenSlider);
    updateSliderBackground(blueSlider);
}

/**
 * Updates the background of a slider to reflect its value.
 * @param {HTMLInputElement} elem - The slider element.
 */
function updateSliderBackground(elem) {
    const value = elem.value;
    const progress = (value / elem.max) * 100;
    const direction = elem.classList.contains('vertical-slider') ? 'to top' : 'to right';
    elem.style.background = `linear-gradient(${direction}, var(--track-color, var(--light-submit-color)) ${progress}%, var(--translucent-text-color) ${progress}%)`;
}

/**
 * Toggles the audio playback and updates the play/pause button.
 * @param {HTMLAudioElement} audioElement - The audio element.
 * @param {HTMLImageElement} playPauseButton - The play/pause button element.
 */
function togglePlayAudio(audioElement, playPauseButton) {
    if (isPlaying) {
        playPauseButton.src = '/resources/img/icons/play.svg';
        audioElement.pause();
    } else {
        playPauseButton.src = '/resources/img/icons/pause.svg';
        audioElement.play();

        // Create or resume AudioContext after user interaction
        if (!audioContext) {
            setupAudioVisualization();
        } else if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }
    isPlaying = !isPlaying;
}

function setupAudioVisualization() {
    // Clean up previous audio context if exists
    if (audioContext) {
        audioContext.close();
        cancelAnimationFrame(animationId);
    }

    // Create a new audio context
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const audioElement = document.getElementById('cc-tc-ac-audio');
    const track = audioContext.createMediaElementSource(audioElement);

    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 128;

    // Connect the audio graph
    track.connect(analyserNode);
    analyserNode.connect(audioContext.destination);

    visualize();
}

function visualize() {
    const canvas = document.getElementById('cc-wf-canvas');
    const canvasCtx = canvas.getContext('2d');

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    function draw() {
        animationId = requestAnimationFrame(draw);

        analyserNode.getByteFrequencyData(dataArray);

        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

        // const barWidth = (WIDTH / bufferLength);
        // let barHeight;
        // let x = 0;
        let barWidth;
        const barHeight = HEIGHT / bufferLength;
        let y = 0;

        for (let i = 0; i < bufferLength; i++) {
            // barHeight = dataArray[i] / 255 * HEIGHT;
            //
            // // Create gradient color between left (red), right (blue), and middle (green)
            // let red = waveformColor.r;
            // let green = waveformColor.g;
            // let blue = waveformColor.b;
            //
            // // Interpolate colors
            // const ratio = i / bufferLength;
            // red = red * (1 - ratio) + 0 * ratio;
            // green = green * (1 - ratio) + 255 * ratio;
            // blue = blue * (1 - ratio) + 255 * ratio;
            //
            // canvasCtx.fillStyle = `rgb(${Math.floor(red)}, ${Math.floor(green)}, ${Math.floor(blue)})`;
            // canvasCtx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
            //
            // x += barWidth + 1;

            barWidth = dataArray[i] / 255 * WIDTH;

            // Create gradient color between left (red), right (blue), and middle (green)
            let red = waveformColor.r;
            let green = waveformColor.g;
            let blue = waveformColor.b;

            // Interpolate colors
            const ratio = i / bufferLength;
            red = red * (1 - ratio) + 0 * ratio;
            green = green * (1 - ratio) + 255 * ratio;
            blue = blue * (1 - ratio) + 255 * ratio;

            canvasCtx.fillStyle = `rgb(${Math.floor(red)}, ${Math.floor(green)}, ${Math.floor(blue)})`;
            canvasCtx.fillRect(WIDTH - barWidth, y, barWidth, barHeight);

            y += barHeight + 1;
        }
    }

    draw();
}

document.addEventListener('DOMContentLoaded', () => {
    const audioControlButtons = {
        previous: document.getElementById('cc-tc-ac-prev'),
        playPause: document.getElementById('cc-tc-ac-play'),
        next: document.getElementById('cc-tc-ac-next'),
    };
    const audioElement = document.getElementById('cc-tc-ac-audio');
    const seekBar = document.getElementById('cc-tc-ac-seek-bar');
    const currentTimeDisplay = document.getElementById('cc-tc-ac-du-t-current');
    const totalDurationDisplay = document.getElementById('cc-tc-ac-du-t-total');

    audioControlButtons.playPause.addEventListener('click', () => {
        togglePlayAudio(audioElement, audioControlButtons.playPause);
    });
    audioControlButtons.previous.addEventListener('click', previousTrack);
    audioControlButtons.next.addEventListener('click', nextTrack);

    audioElement.addEventListener('loadedmetadata', () => {
        seekBar.max = audioElement.duration;
        totalDurationDisplay.innerText = formatTime(audioElement.duration);
    });

    audioElement.addEventListener('timeupdate', () => {
        seekBar.value = audioElement.currentTime;
        currentTimeDisplay.innerText = formatTime(audioElement.currentTime);
        updateSliderBackground(seekBar);
    });

    audioElement.addEventListener('ended', () => {
        nextTrack();
        if (isPlaying) {
            audioElement.play();
        }
    });

    seekBar.addEventListener('input', () => {
        audioElement.currentTime = seekBar.value;
        updateSliderBackground(seekBar);
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const mugshotGallery = document.getElementById("cc-mugshot-gallery");

    data.tracks.forEach((track) => addMugshot(mugshotGallery, track));
    selectTrack(data.tracks[0]);

    document.getElementById("cc-tc-ic-prev").addEventListener('click', previousImage);
    document.getElementById("cc-tc-ic-settings").addEventListener('click', openSettingsWindow);
    document.getElementById("cc-tc-ic-next").addEventListener('click', nextImage);

    document.querySelectorAll("input[type=range]").forEach((elem) => {
        const progress = (elem.value / elem.max) * 100;
        const direction = elem.classList.contains('vertical-slider') ? 'to top' : 'to right';
        elem.style.background = `linear-gradient(${direction}, var(--track-color, var(--light-submit-color)) ${progress}%, var(--translucent-text-color) ${progress}%)`;
        elem.addEventListener("input", () => {
            updateSliderBackground(elem);
        });
    });

    // Initialize waveform color preview
    updateWaveformColorAndPreviewFromInputs();
    const redSlider = document.getElementById('cc-wf-cs-red');
    const greenSlider = document.getElementById('cc-wf-cs-green');
    const blueSlider = document.getElementById('cc-wf-cs-blue');

    [redSlider, greenSlider, blueSlider].forEach((elem) => {
        elem.addEventListener("input", () => {
            updateWaveformColorAndPreviewFromInputs();
        });
    });

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
