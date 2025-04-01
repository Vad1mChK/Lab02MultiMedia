const audioState = {
    trackIdList: [],
    trackCount: 0,
    currentTrackIndex: 0,
    currentTrackId: 0,
    currentTrackPath: null,
    currentAudioTime: 0,
    currentAudioProgress: 0,
    isPlaying: false,
    playAudio: () => {},
    pauseAudio: () => {},
    toggleAudio: (audioElement, alsoDo) => {},
    setCurrentTrackIndex: (index) => {},
    setPreviousTrackIndex: () => {},
    setNextTrackIndex: () => {},
    loadAudioById: (id) = {},
};

audioState.playAudio = (audioElement) => {
    audioState.isPlaying = true;
    audioElement.play();
};

audioState.pauseAudio = (audioElement) => {
    audioState.isPlaying = false;
    audioElement.pause();
};

audioState.toggleAudio = (audioElement, alsoDo) => {
    if (audioState.isPlaying) {
        audioState.pauseAudio(audioElement);
    } else {
        audioState.playAudio(audioElement);
    }

    alsoDo(audioState.isPlaying);
};

audioState.loadAudioById = (id, data, audioElement, alsoDo) => {
    const track = data.tracks[id];
    audioElement.src = track.music;
    alsoDo(track);
};

const formatTime = (time) => {
    const hours = Math.round(time / 3600);
    const minutes = Math.round(time % 3600 / 60);
    const seconds = Math.round(time % 60);

    return (hours !== 0) ?
        `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}` :
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const onAudioInit = (data, audioElement, alsoDo) => {
    const indexParsed = parseInt(localStorage.getItem('baseIndex') ?? '');
    const index = (!isNaN(indexParsed)) ? indexParsed : 0;
    audioState.currentTrackIndex = index;
    audioState.currentTrackId = data.ids[index];
    audioState.loadAudioById(audioState.currentTrackId, data, audioElement, alsoDo);
};

document.addEventListener('DOMContentLoaded', () => {
    const dataElement = document.getElementById('data');
    const audioElement = document.getElementById('audio');
    const playPauseButton = document.getElementById('play_pause_button');
    const trackNameElement = document.getElementById('track_name');
    const trackPerformerElement = document.getElementById('track_performer');
    const currentTimeElement = document.getElementById('audio_time');
    const durationTimeElement = document.getElementById('audio_duration_time');
    const seekerElement = document.getElementById('audio_seeker');

    const data = loadData(dataElement);
    audioState.trackCount = data.ids.length;
    audioState.trackIdList = data.ids;
    audioState.currentTrackIndex = localStorage.getItem('baseIndex') ?? 0;
    audioState.currentTrackId = data.ids[audioState.currentTrackId];
    audioState.setCurrentTrackIndex(audioState.currentTrackIndex);

    playPauseButton.addEventListener('click', () => {
        audioState.toggleAudio(
            audioElement,
            (isPlaying) => {
                playPauseButton.src = isPlaying ? 'res/img/icons/pause.svg' : 'res/img/icons/play.svg'
            }
        );
    });

    audioElement.addEventListener('loadedmetadata', () => {
        durationTimeElement.textContent = formatTime(audioElement.duration);
    })

    onAudioInit(
        data,
        audioElement,
        (track) => {
            if (track.track_name) trackNameElement.textContent = track.track_name;
            if (track.track_performer) trackPerformerElement.textContent = track.track_performer;
        }
    )
});