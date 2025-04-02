// src/audioManager.js

// Global variables for the current p5.Sound object and analyzers
let currentSound;
let amplitudeAnalyzer;
let fftAnalyzer;

function loadTrack(trackKey) {
    const track = tracks[trackKey];

    // Stop any current track
    if (currentSound) {
        currentSound.stop();
    }

    // Load the new track (using p5.js loadSound)
    currentSound = loadSound(track.music, () => {
        console.log(`Loaded track: ${track.track_name}`);
    });

    // Setup analyzers for visualization
    fftAnalyzer = new p5.FFT();
    fftAnalyzer.setInput(currentSound);
    amplitudeAnalyzer = new p5.Amplitude();
    amplitudeAnalyzer.setInput(currentSound);

    // Update DOM elements for track information
    document.getElementById('track_name').textContent = track.track_name;
    document.getElementById('track_performer').textContent = track.track_performer;
}

function playPauseTrack() {
    if (currentSound.isPlaying()) {
        currentSound.pause();
        return false;
    } else {
        currentSound.play();
        return true;
    }
}

const isPlaying = () => currentSound.isPlaying();

function seekTrack(positionPercent) {
    if (currentSound && currentSound.isLoaded()) {
        const duration = currentSound.duration();
        currentSound.jump((positionPercent / 100) * duration);
    }
}

function getTrackDuration() {
    return currentSound && currentSound.isLoaded() ? currentSound.duration() : 0;
}

function getCurrentTime() {
    return currentSound && currentSound.isLoaded() ? currentSound.currentTime() : 0;
}

// Switch tracks circularly (-1: previous, 1: next)
function switchTrack(direction) {
    currentTrackIndex = (currentTrackIndex + direction + trackIds.length) % trackIds.length;
    const newTrackKey = trackIds[currentTrackIndex];
    loadTrack(newTrackKey);

    // When track changes, update image base id to match the track’s default image index.
    currentImageIndex = tracks[newTrackKey].default_image_index;
    updateCharacterImage();
}

// Utility: update the character image from the images array
function updateCharacterImage() {
    const imgEl = document.getElementById('character-large-image');
    imgEl.src = images[currentImageIndex];

    const descrEl = document.getElementById('character-description');
    descrEl.textContent = appData.descriptions[trackIds[currentImageIndex]];
}
