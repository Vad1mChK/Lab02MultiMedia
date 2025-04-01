// src/visualization.js

let particles = [];
const MAX_PARTICLES_PER_FRAME = 512;

// Helper function to compute average energy between two frequencies (in Hz)
function getEnergyRange(lowFreq, highFreq) {
    let spectrum = fftAnalyzer.analyze();
    let nyquist = sampleRate() / 2;
    let binCount = spectrum.length;
    let freqPerBin = nyquist / binCount;
    let lowIndex = floor(lowFreq / freqPerBin);
    let highIndex = floor(highFreq / freqPerBin);
    let sum = 0;
    let count = 0;
    for (let i = lowIndex; i <= highIndex; i++) {
        sum += spectrum[i];
        count++;
    }
    return count > 0 ? sum / count : 0;
}

class Particle {
    constructor(x, y, colPrimary, type, initialSize, velocityMagnitude) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.colPrimary = colPrimary;
        this.maxLifespan = (type === 'demoman') ? 256 :
            (type === 'soldier') ? 512 :
                1024;
        this.lifespan = this.maxLifespan;
        this.initialSize = initialSize; // size based on volume at creation
        this.size = initialSize;
        // Set velocity based on frequency: random direction scaled by velocityMagnitude
        let angle = (type === 'demoman') ? random(TWO_PI) :
            (type === 'soldier') ? (PI / 4 + random(PI / 12)) :
                (0);
        this.vx = cos(angle) * velocityMagnitude;
        this.vy = -sin(angle) * velocityMagnitude;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.lifespan -= 4;
        // Lifetime size change: shrink over time based on remaining lifespan
        this.size = this.initialSize * (this.lifespan / this.maxLifespan);
    }

    display() {
        noStroke();
        fill(color(this.colPrimary));

        // Render different shapes based on track type
        switch (this.type) {
            case 'demoman':
                // Bombs: circles
                ellipse(this.x, this.y, this.size);
                break;
            case 'soldier':
                // Rockets: triangles
                push();
                translate(this.x, this.y);
                rotate(atan2(this.vy, this.vx) + HALF_PI);
                triangle(0, -this.size / 2, -this.size / 2, this.size / 2, this.size / 2, this.size / 2);
                pop();
                break;
            case 'engineer':
                // Cogs: hexagons
                push();
                translate(this.x, this.y);
                beginShape();
                for (let i = 0; i < 6; i++) {
                    const angle = TWO_PI / 6 * i;
                    vertex(cos(angle) * this.size / 2, sin(angle) * this.size / 2);
                }
                endShape(CLOSE);
                pop();
                break;
            default:
                ellipse(this.x, this.y, this.size);
        }
    }

    isDead() {
        return this.lifespan <= 0;
    }
}

function emitParticles() {
    if (currentSound && currentSound.isPlaying()) {
        const trackKey = trackIds[currentTrackIndex];
        const trackData = tracks[trackKey];

        // Get the current amplitude (volume) level
        let level = amplitudeAnalyzer.getLevel();
        if (level > 0.01) {
            // Map volume to an initial size between 16 and 80
            let sizeVal = map(level, 0, 0.5, 16, 80);
            // Use actual frequency ranges:
            // Bass: 20Hz to 250Hz, Mid: 250Hz to 2000Hz, Treble: 2000Hz to 20000Hz
            let bassEnergy = getEnergyRange(20, 250);
            let midEnergy = getEnergyRange(250, 2000);
            let trebleEnergy = getEnergyRange(2000, 20000);

            // Map energy values to velocity magnitudes; you may need to adjust the ranges
            let velocityMagBass = map(bassEnergy, 0, 255, 1, 5);
            let velocityMagMid = map(midEnergy, 0, 255, 1, 5);
            let velocityMagTreble = map(trebleEnergy, 0, 255, 1, 5);

            let x = random(width);
            let y = random(height);

            // Emit three particles with different color and velocity settings
            particles.push(new Particle(
                x, y, trackData.colors.primary, trackKey, sizeVal, velocityMagTreble
            ));
            particles.push(new Particle(
                x, y + sizeVal, trackData.colors.secondary, trackKey, sizeVal, velocityMagBass
            ));
            particles.push(new Particle(
                x, y + 2 * sizeVal, trackData.colors.tertiary || trackData.colors.primary, trackKey, sizeVal, velocityMagMid
            ));
            if (particles.length > MAX_PARTICLES_PER_FRAME) {
                particles = particles.slice(-MAX_PARTICLES_PER_FRAME);
            }
        }
    }
}

function updateAndDisplayParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].display();
        if (particles[i].isDead()) {
            particles.splice(i, 1);
        }
    }
}
