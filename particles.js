let particleGenerator;

class Particle {
    constructor(x, y, size, color, speedX) {
        this.x = x;
        this.y = y;
        this.size = size; // Particle size
        this.speedX = speedX; // Speed to move left
        this.color = color; // Particle color
        this.life = Math.random() * 50 + 150; // Lifespan
    }

    // Update particle position and life
    update() {
        this.x -= this.speedX; // Move left
        this.life -= 1; // Decrease life
    }

    // Draw the particle
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
}

class ParticleGenerator {
    static MAX_PARTICLE_COUNT = 1024;

    constructor(canvasElement, audioController) {
        this.width = canvasElement.width;
        this.height = canvasElement.height;
        this.context = canvasElement.getContext("2d");
        this.particles = [];
        this.audioController = audioController;

        this.running = false;
        this.color = { r: 50, g: 150, b: 255 }; // Base color for particles
    }

    // Create a particle based on audio frequency data
    createParticleFromAudio(frequency) {
        const size = Math.max(1, frequency / 40); // Scale size based on frequency
        const speedX = Math.max(1, frequency / 30); // Horizontal speed based on frequency
        const randomOffset = () => Math.floor(Math.random() * 65 - 32); // +-32 range
        const r = Math.min(255, Math.max(0, this.color.r + randomOffset()));
        const g = Math.min(255, Math.max(0, this.color.g + randomOffset()));
        const b = Math.min(255, Math.max(0, this.color.b + randomOffset()));
        const color = `rgba(${r}, ${g}, ${b}, ${Math.random() * 0.5 + 0.5})`; // Random transparency

        return new Particle(this.width, Math.random() * this.height, size, color, speedX);
    }

    // Main animation loop
    animate = () => {
        // Clear the canvas
        this.context.fillStyle = "rgba(0, 0, 0, 0.15)";
        this.context.fillRect(0, 0, this.width, this.height);

        // Update existing particles
        for (let i = this.particles.length - 1; i >= 0; --i) {
            const particle = this.particles[i];

            // Remove expired or out-of-bounds particles
            if (particle.life <= 0 || particle.x < 0) {
                this.particles.splice(i, 1);
            } else {
                particle.update();
                particle.draw(this.context);
            }
        }

        // Generate new particles based on audio data
        const frequencies = audioController.getMonoFrequencyData();
        frequencies.forEach((frequency, index) => {
            if (this.particles.length < ParticleGenerator.MAX_PARTICLE_COUNT && frequency > 50) {
                const particle = this.createParticleFromAudio(frequency);
                this.particles.push(particle);
            }
        });

        // Continue animation
        if (this.running) {
            requestAnimationFrame(this.animate);
        }
    };

    // Start the particle animation
    start() {
        if (!this.running) {
            this.running = true;
            this.animate();
        }
    }

    // Stop the particle animation
    stop() {
        this.running = false;
    }

    // Resize canvas and generator dimensions
    resizeCanvas(width, height) {
        this.width = width;
        this.height = height;
    }

    setColor(color) {
        this.color.r = color.r;
        this.color.g = color.g;
        this.color.b = color.b;
        console.log(`color set to ${color.r} ${color.g} ${color.b}`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let particleCanvas = document.getElementById("cc-visualizer");

    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;
        particleGenerator.resizeCanvas(window.innerWidth, window.innerHeight);
    });

    particleGenerator = new ParticleGenerator(particleCanvas);
});