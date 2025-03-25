let data;
let currentMode = 'demoman';

document.addEventListener('DOMContentLoaded', () => {
    data = JSON.parse(document.getElementById('data').textContent);
})

const sketch = (p) => {
    let particles = [];

    p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.id('p5-canvas');
        p.noStroke();

        // Initialize particles
        for(let i = 0; i < 100; i++) {
            particles.push({
                x: p.random(p.width),
                y: p.random(p.height),
                size: p.random(5, 15),
                speed: p.random(1, 3)
            });
        }
    };

    p.draw = () => {
        p.background(25, 25);

        particles.forEach(part => {
            p.fill(
                p.map(p.mouseX, 0, p.width, 0, 255),
                p.map(p.mouseY, 0, p.height, 0, 255),
                150
            );
            p.ellipse(part.x, part.y, part.size);

            part.y -= part.speed;
            if(part.y < -part.size) part.y = p.height + part.size;
        });
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        particles = particles.map(part => ({
            ...part,
            x: p.random(p.width),
            y: p.random(p.height)
        }));
    };
};

// Initialize p5 instance
new p5(sketch);