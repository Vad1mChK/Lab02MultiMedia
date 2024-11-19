class AudioController {
    constructor(audioElementId) {
        this.audioElement = document.getElementById(audioElementId);

        if (!this.audioElement) {
            throw new Error(`Audio element with ID '${audioElementId}' not found.`);
        }

        // Initialize AudioContext
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Set up nodes
        this.source = this.audioContext.createMediaElementSource(this.audioElement);
        this.gainNode = this.audioContext.createGain();
        this.monoAnalyzer = this.audioContext.createAnalyser();
        this.splitter = this.audioContext.createChannelSplitter(2);
        this.leftAnalyzer = this.audioContext.createAnalyser();
        this.rightAnalyzer = this.audioContext.createAnalyser();
        this.merger = this.audioContext.createChannelMerger(2);
        this.output = this.audioContext.destination;

        // Configure Analyzers
        this.monoAnalyzer.fftSize = 128;
        this.leftAnalyzer.fftSize = 128;
        this.rightAnalyzer.fftSize = 128;

        // Connect nodes
        this.source.connect(this.gainNode);
        this.gainNode.connect(this.monoAnalyzer);
        this.gainNode.connect(this.splitter);

        this.splitter.connect(this.leftAnalyzer, 0); // Left channel to left analyzer
        this.splitter.connect(this.rightAnalyzer, 1); // Right channel to right analyzer

        this.leftAnalyzer.connect(this.merger, 0, 0); // Merge left channel
        this.rightAnalyzer.connect(this.merger, 0, 1); // Merge right channel

        this.merger.connect(this.output);
    }

    /**
     * Sets the gain value (volume)
     * @param {number} value - Gain value between 0 and 1
     */
    setGain(value) {
        this.gainNode.gain.value = Math.min(Math.max(value, 0), 1); // Clamp value between 0 and 1
    }

    /**
     * Gets the frequency data for the mono analyzer
     * @returns {Uint8Array} Frequency data
     */
    getMonoFrequencyData() {
        const data = new Uint8Array(this.monoAnalyzer.frequencyBinCount);
        this.monoAnalyzer.getByteFrequencyData(data);
        return data;
    }

    /**
     * Gets the frequency data for the left analyzer
     * @returns {Uint8Array} Frequency data
     */
    getLeftFrequencyData() {
        const data = new Uint8Array(this.leftAnalyzer.frequencyBinCount);
        this.leftAnalyzer.getByteFrequencyData(data);
        return data;
    }

    /**
     * Gets the frequency data for the right analyzer
     * @returns {Uint8Array} Frequency data
     */
    getRightFrequencyData() {
        const data = new Uint8Array(this.rightAnalyzer.frequencyBinCount);
        this.rightAnalyzer.getByteFrequencyData(data);
        return data;
    }
}

let audioController;