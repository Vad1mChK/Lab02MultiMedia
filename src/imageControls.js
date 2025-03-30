const imageState = {
    baseImageIndex: 0,
    currentImageIndex: 0,
    imageCount: 0,
    autoSwitchEnabled: false,
    autoSwitchIntervalMs: 1000,
    autoSwitchIntervalId: null,
    imageList: [],
    setBaseImageIndex: (index) => {},
    setCurrentImageIndex: (index) => {},
    setPreviousImageIndex: () => {},
    setNextImageIndex: () => {},
    setPreviousBaseImageIndex: () => {},
    setNextBaseImageIndex: () => {},
    reloadImage: () => {}
};

const onImageInit = (imageElement) => {
    const indexParsed = parseInt(localStorage.getItem('baseIndex') ?? '');
    const index = (!isNaN(indexParsed)) ? indexParsed : 0;
    imageState.setBaseImageIndex(index);
}

const onAutoSwitchEnabledInit = (checkboxElement, otherActions) => {
    let enabled = false;
    try {
        // Use default value if parsing fails or key doesn't exist
        enabled = JSON.parse(localStorage.getItem('autoSwitchEnabled')) ?? false;
    } catch (e) {
        console.error('Error parsing autoSwitchEnabled:', e);
    }
    imageState.autoSwitchEnabled = enabled;
    checkboxElement.checked = enabled;
    if (otherActions) otherActions(enabled);
}

const onAutoSwitchEnabledChange = (checkboxElement, otherActions) => {
    const enabled = checkboxElement.checked; // Use current checkbox state
    localStorage.setItem('autoSwitchEnabled', JSON.stringify(enabled));
    imageState.autoSwitchEnabled = enabled;
    // checkboxElement.checked is already correct; no need to set it
    if (otherActions) otherActions(enabled);
}

imageState.setBaseImageIndex = (index) => {
    imageState.baseImageIndex = index;
    imageState.setCurrentImageIndex(index);
}

imageState.setPreviousImageIndex = () => {
    const index = imageState.currentImageIndex;
    const newIndex = (index + imageState.imageCount - 1) % imageState.imageCount;
    imageState.setCurrentImageIndex(newIndex);
}

imageState.setNextImageIndex = () => {
    const index = imageState.currentImageIndex;
    const newIndex = (index + 1) % imageState.imageCount;
    imageState.setCurrentImageIndex(newIndex);
}

imageState.setPreviousBaseImageIndex = () => {
    const index = imageState.baseImageIndex;
    const newIndex = (index + imageState.imageCount - 1) % imageState.imageCount;
    imageState.setBaseImageIndex(newIndex);
}

imageState.setNextBaseImageIndex = () => {
    const index = imageState.baseImageIndex;
    const newIndex = (index + imageState.imageCount - 1) % imageState.imageCount;
    imageState.setBaseImageIndex(newIndex);
}


const toggleInterval = (enabled) => {
    if (enabled) {
        imageState.autoSwitchIntervalId = setInterval(
            () => imageState.setNextImageIndex(),
            imageState.autoSwitchIntervalMs
        );
    } else {
        clearInterval(imageState.autoSwitchIntervalId);
        imageState.autoSwitchIntervalId = null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const autoSwitchEnabledCheckbox = document.getElementById('settings-auto-switch-enabled');
    const autoSwitchEnabledLabel = document.getElementById('settings-auto-switch-enabled-label');
    const autoSwitchIntervalSpinner = document.getElementById('settings-auto-switch-interval');
    const autoSwitchIntervalLabel = document.getElementById('settings-auto-switch-interval-label');
    const nextImageButton = document.getElementById('character-image-next');
    const previousImageButton = document.getElementById('character-image-prev');
    const imageElement = document.getElementById('character-large-image');
    const dataElement = document.getElementById('data');

    // Initialize interval from localStorage
    const savedInterval = localStorage.getItem('autoSwitchIntervalMs');
    if (savedInterval !== null) {
        imageState.autoSwitchIntervalMs = parseInt(savedInterval, 10);
        autoSwitchIntervalSpinner.value = imageState.autoSwitchIntervalMs;
    }

    onAutoSwitchEnabledInit(
        autoSwitchEnabledCheckbox,
        (enabled) => {
            autoSwitchEnabledLabel.classList.toggle('disabled', !enabled);
            autoSwitchIntervalSpinner.disabled = !enabled;
            toggleInterval(enabled);
        }
    );

    // Use 'change' event instead of 'click'
    autoSwitchEnabledCheckbox.addEventListener('change', () =>
        onAutoSwitchEnabledChange(
            autoSwitchEnabledCheckbox,
            (enabled) => {
                autoSwitchEnabledLabel.classList.toggle('disabled', !enabled);
                autoSwitchIntervalSpinner.disabled = !enabled;
                // Implement interval start/stop here
                toggleInterval(enabled);
            }
        )
    );

    // Handle interval changes
    autoSwitchIntervalSpinner.addEventListener('change', (e) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value > 0) {
            imageState.autoSwitchIntervalMs = value;
            localStorage.setItem('autoSwitchIntervalMs', value.toString());
            // Restart interval if enabled
            if (imageState.autoSwitchEnabled) {
                clearInterval(imageState.autoSwitchIntervalId);
                imageState.autoSwitchIntervalId = setInterval(
                    () => imageState.setNextImageIndex(),
                    imageState.autoSwitchIntervalMs
                );
            }
        }
    });

    previousImageButton.addEventListener('click', imageState.setPreviousImageIndex);
    nextImageButton.addEventListener('click', imageState.setNextImageIndex);

    imageState.setCurrentImageIndex = (index) => {
        imageState.currentImageIndex = index;
        imageState.reloadImage();
    }

    imageState.reloadImage = () => {
        imageElement.src = imageState.imageList[imageState.currentImageIndex];
    }

    const data = loadData(dataElement);
    imageState.imageList = data.images;
    imageState.imageCount = data.images.length;

    onImageInit(imageElement);
});