// src/config.js

// Get the configuration from the <script id="data">
const appData = JSON.parse(document.getElementById('data').textContent);
const trackIds = appData.ids;
const tracks = appData.tracks;
const images = appData.images;

// Global state for current track and image
let currentTrackIndex = 0;
let currentImageIndex = 0;
