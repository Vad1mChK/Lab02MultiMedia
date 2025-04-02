// src/main.js

const updateSeekerBar = (seekerBar, currentTime, duration) => {
    const fillColor = '#078BC9';
    const fillHighlightColor = '#2ACDE8';
    const emptyColor = '#F4F4F440';


    const progressPercentage = (currentTime / duration) * 100;
    // The first color represents the played part; the second is the remaining part.
    seekerBar.style.background = `linear-gradient(
            to right,
            ${fillColor} 0%,
            ${(progressPercentage > 20) ? `${fillColor} ${progressPercentage - 20}%,` : ''}
            ${fillHighlightColor} ${progressPercentage}%,
            ${emptyColor} ${progressPercentage}%,
            ${emptyColor} 100%
        )`;
};

function setup() {
    // frameRate(30);

    // Create a full-window canvas placed behind the DOM elements
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);
    canvas.style('z-index', '-1');

    // Load the initial track based on currentTrackIndex
    loadTrack(trackIds[currentTrackIndex]);

    // Hook up control buttons
    const playPauseButton = document.getElementById('play_pause_button');
    playPauseButton.addEventListener('click', () => {
        playPauseTrack();
        playPauseButton.src = isPlaying() ? 'res/img/icons/pause.svg' : 'res/img/icons/play.svg';
    });

    document.getElementById('previous_button').addEventListener('click', () => {
        switchTrack(-1);
        playPauseButton.src = isPlaying() ? 'res/img/icons/pause.svg' : 'res/img/icons/play.svg';
    });
    document.getElementById('next_button').addEventListener('click', () => {
        switchTrack(1);
        playPauseButton.src = isPlaying() ? 'res/img/icons/pause.svg' : 'res/img/icons/play.svg';
    });

    // Setup the audio seeker
    const audioSeeker = document.getElementById('audio_seeker');

    audioSeeker.addEventListener('input', function() {
        const currentTime = parseInt(this.value);
        const duration = parseInt(this.max);

        seekTrack(currentTime);
        updateSeekerBar(audioSeeker, currentTime, duration);
    });
}

function draw() {
    // Use the current track's secondary color for the background
    let currentTrackKey = trackIds[currentTrackIndex];
    let trackData = tracks[currentTrackKey];
    background(trackData.colors.background);

    // Emit particles if the track is playing
    if (currentSound && currentSound.isPlaying()) {
        emitParticles();
    }

    updateAndDisplayParticles();

    // Update seeker slider and time displays if track is loaded
    if (currentSound && currentSound.isLoaded()) {
        const duration = getTrackDuration();
        const currentTime = getCurrentTime();
        const audioSeeker = document.getElementById('audio_seeker');
        audioSeeker.value = (currentTime / duration) * 100;
        updateSeekerBar(audioSeeker, currentTime, duration);

        // Format times as mm:ss
        document.getElementById('audio_time').textContent = formatTime(currentTime);
        document.getElementById('audio_duration_time').textContent = formatTime(duration);
    }
}

function formatTime(seconds) {
    let min = floor(seconds / 60);
    let sec = floor(seconds % 60);
    return nf(min, 2) + ':' + nf(sec, 2);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
