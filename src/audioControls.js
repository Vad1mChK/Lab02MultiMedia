// audioControls.js

// Audio state object containing all control methods
const audioState = {
    trackIdList: [],
    trackCount: 0,
    currentTrackIndex: 0,
    currentTrackId: '',
    isPlaying: false,
    p5Sound: null,
    p5LoadSoundFunc: (url) => {
        // Do not place loadSound here by default; but it will be assigned here during p5 setup
    },

    playAudio(audioElement) {
        this.isPlaying = true;
        audioElement.play();
    },

    pauseAudio(audioElement) {
        this.isPlaying = false;
        audioElement.pause();
    },

    toggleAudio(audioElement, callback = () => {}) {
        if (this.isPlaying) {
            this.pauseAudio(audioElement);
        } else {
            this.playAudio(audioElement);
        }
        callback(this.isPlaying);
    },

    loadAudioById(id, data, audioElement, callback = () => {}) {
        const track = data.tracks[id];
        if (track) {
            audioElement.src = track.music;
            callback(track);
        } else {
            console.error(`Track with id "${id}" not found.`);
        }
    },

    setCurrentTrackIndex(index, audioElement, data, updateTrackInfo = () => {}) {
        if (index >= 0 && index < this.trackCount) {
            this.currentTrackIndex = index;
            localStorage.setItem('baseIndex', index); // Persist current track index
            this.currentTrackId = this.trackIdList[index];
            this.loadAudioById(this.currentTrackId, data, audioElement, updateTrackInfo);
        } else {
            console.error("Index out of bounds");
        }
    },

    setPreviousTrackIndex(audioElement, data, updateTrackInfo = () => {}) {
        let newIndex = this.currentTrackIndex - 1;
        if (newIndex < 0) {
            newIndex = this.trackCount - 1; // Loop to last track
        }
        this.setCurrentTrackIndex(newIndex, audioElement, data, updateTrackInfo);
        this.projectWideOnTrackIndexChange(newIndex);
    },

    setNextTrackIndex(audioElement, data, updateTrackInfo = () => {}) {
        let newIndex = this.currentTrackIndex + 1;
        if (newIndex >= this.trackCount) {
            newIndex = 0; // Loop to first track
        }
        this.setCurrentTrackIndex(newIndex, audioElement, data, updateTrackInfo);
        this.projectWideOnTrackIndexChange(newIndex);
    },

    projectWideOnTrackIndexChange(index) {}
};

// Utility function to format seconds into mm:ss or hh:mm:ss format
const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    return hours > 0
        ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        : `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Initialize the audio seeker (range input) and time display synchronization
const initSeeker = (audioElement, seekerElement, currentTimeElement, durationTimeElement) => {
    // Update the seeker's visual progress using a gradient background
    const fillColor = '#078BC9';
    const fillHighlightColor = '#2ACDE8';
    const emptyColor = '#F4F4F440';

    const updateSeekerBar = (currentTime, duration) => {
        const progressPercentage = (currentTime / duration) * 100;
        // The first color represents the played part; the second is the remaining part.
        seekerElement.style.background = `linear-gradient(
            to right,
            ${fillColor} 0%,
            ${(progressPercentage > 20) ? `${fillColor} ${progressPercentage - 20}%,` : ''}
            ${fillHighlightColor} ${progressPercentage}%,
            ${emptyColor} ${progressPercentage}%,
            ${emptyColor} 100%
        )`;
    };

    // Once metadata is loaded, set the seeker's max value and display total duration
    audioElement.addEventListener('loadedmetadata', () => {
        seekerElement.max = audioElement.duration;
        durationTimeElement.textContent = formatTime(audioElement.duration);
        updateSeekerBar(audioElement.currentTime, audioElement.duration);
    });

    // Update the seeker's value and current time display as the audio plays
    audioElement.addEventListener('timeupdate', () => {
        seekerElement.value = audioElement.currentTime;
        currentTimeElement.textContent = formatTime(audioElement.currentTime);
        updateSeekerBar(audioElement.currentTime, audioElement.duration);
    });

    // When the user interacts with the seeker, update the audio's current time
    seekerElement.addEventListener('input', () => {
        audioElement.currentTime = seekerElement.value;
        updateSeekerBar(audioElement.currentTime, audioElement.duration);
    });
};


// Initialize the audio controls once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Retrieve necessary DOM elements
    const dataElement = document.getElementById('data');
    const audioElement = document.getElementById('audio');
    const playPauseButton = document.getElementById('play_pause_button');
    const trackNameElement = document.getElementById('track_name');
    const trackPerformerElement = document.getElementById('track_performer');
    const currentTimeElement = document.getElementById('audio_time');
    const durationTimeElement = document.getElementById('audio_duration_time');
    const seekerElement = document.getElementById('audio_seeker');

    // Load track data from the embedded JSON
    const data = JSON.parse(dataElement.textContent);
    audioState.trackIdList = data.ids;
    audioState.trackCount = data.ids.length;

    // Retrieve the stored track index from localStorage, or default to 0
    const storedIndex = parseInt(localStorage.getItem('baseIndex'), 10);
    const initialIndex = isNaN(storedIndex) ? 0 : storedIndex;
    audioState.currentTrackIndex = initialIndex;

    // Set the current track based on the stored index and update track info display
    audioState.setCurrentTrackIndex(initialIndex, audioElement, data, (track) => {
        if (track.track_name) {
            trackNameElement.textContent = track.track_name;
        }
        if (track.track_performer) {
            trackPerformerElement.textContent = track.track_performer;
        }
    });

    // Initialize the seeker functionality
    initSeeker(audioElement, seekerElement, currentTimeElement, durationTimeElement);

    // Add event listener for the play/pause button
    playPauseButton.addEventListener('click', () => {
        audioState.toggleAudio(audioElement, (isPlaying) => {
            // Update the button icon based on the playing state
            playPauseButton.src = isPlaying ? 'res/img/icons/pause.svg' : 'res/img/icons/play.svg';
        });
    });

    // Auto-switch to the next track when the current track ends (if enabled)
    audioElement.addEventListener('ended', () => {
        const autoSwitchCheckbox = document.getElementById('settings-auto-switch-enabled');
        const autoSwitchIntervalInput = document.getElementById('settings-auto-switch-interval');
        if (autoSwitchCheckbox && autoSwitchCheckbox.checked) {
            const interval = parseInt(autoSwitchIntervalInput.value, 10) || 0;
            setTimeout(() => {
                audioState.setNextTrackIndex(audioElement, data, (track) => {
                    if (track.track_name) {
                        trackNameElement.textContent = track.track_name;
                    }
                    if (track.track_performer) {
                        trackPerformerElement.textContent = track.track_performer;
                    }
                    // Reset the seeker for the new track
                    seekerElement.value = 0;
                    currentTimeElement.textContent = formatTime(0);
                });
                // Auto-play the new track if the audio was playing
                if (audioState.isPlaying) {
                    audioState.playAudio(audioElement);
                }
            }, interval);
        }
    });

    // Optionally, add event listeners for previous and next buttons if they exist
    const previousButton = document.getElementById('previous_button');
    const nextButton = document.getElementById('next_button');

    const updatePreviousOrNextTrackInfo = (track) => {
        if (track.track_name) {
            trackNameElement.textContent = track.track_name;
        }
        if (track.track_performer) {
            trackPerformerElement.textContent = track.track_performer;
        }
        // Reset the seeker for the new track
        seekerElement.value = 0;
        currentTimeElement.textContent = formatTime(0);
        if (audioState.isPlaying) {
            audioState.playAudio(audioElement);
        }
    };

    if (previousButton) {
        previousButton.addEventListener('click', () =>
            audioState.setPreviousTrackIndex(audioElement, data, updatePreviousOrNextTrackInfo)
        )
    }

    if (nextButton) {
        nextButton.addEventListener('click', () =>
            audioState.setNextTrackIndex(audioElement, data, updatePreviousOrNextTrackInfo)
        )
    }
});
