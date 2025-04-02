// src/imageSwitcher.js

let autoSwitchIntervalId = null;

function switchImage(direction) {
    // Change the current image index circularly (-1: previous, 1: next)
    currentImageIndex = (currentImageIndex + direction + images.length) % images.length;
    updateCharacterImage();
}

function enableAutoSwitch(intervalMs) {
    disableAutoSwitch(); // Ensure any existing interval is cleared
    autoSwitchIntervalId = setInterval(() => {
        switchImage(1);
    }, intervalMs);
}

function disableAutoSwitch() {
    if (autoSwitchIntervalId !== null) {
        clearInterval(autoSwitchIntervalId);
        autoSwitchIntervalId = null;
    }
}

// Attach listeners for the arrow buttons
document.getElementById('character-image-prev').addEventListener('click', () => {
    switchImage(-1);
});
document.getElementById('character-image-next').addEventListener('click', () => {
    switchImage(1);
});

// Handle auto switch controls
document.getElementById('settings-auto-switch-enabled').addEventListener('change', function() {
    const autoSwitchInput = document.getElementById('settings-auto-switch-interval');
    if (this.checked) {
        autoSwitchInput.disabled = false;
        const interval = parseInt(autoSwitchInput.value);
        enableAutoSwitch(interval);
    } else {
        autoSwitchInput.disabled = true;
        disableAutoSwitch();
    }
});

document.getElementById('settings-auto-switch-interval').addEventListener('change', function() {
    if (document.getElementById('settings-auto-switch-enabled').checked) {
        const interval = parseInt(this.value);
        enableAutoSwitch(interval);
    }
});
