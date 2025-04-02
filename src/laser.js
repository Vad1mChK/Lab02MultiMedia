// src/laser.js

new p5(function(p) {
    let canvas;

    // Define an array of laser sources with origins and colors.
    const lasers = () => [
        {
            origin: { x: 0, y: p.height / 2 },
            color: { r: 184, g: 56, b: 59 }
        },
        {
            origin: { x: p.width / 2, y: 0 },
            color: { r: 88, g: 133, b: 162 }
        },
        // {
        //     origin: { x: p.width, y: p.height / 2 },
        //     color: { r: 184, g: 128, b: 53 }
        // }
    ];

    p.setup = function() {
        canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        // Set absolute positioning and layering
        canvas.style('position', 'absolute');
        canvas.style('top', '0');
        canvas.style('left', '0');
        canvas.style('pointer-events', 'none');
        canvas.style('z-index', '100');
        // Also set mix-blend-mode via style
        canvas.style('mix-blend-mode', 'screen');

        p.strokeWeight(4);
        p.blendMode(p.SCREEN);
    };

    p.draw = function() {
        p.clear();
        p.blendMode(p.SCREEN);

        // Loop over each laser and draw its fading beam
        for (let laser of lasers()) {
            let ctx = p.drawingContext;

            // Create a linear gradient from the laser's origin to the mouse position.
            let gradient = ctx.createLinearGradient(laser.origin.x, laser.origin.y, p.mouseX, p.mouseY);
            // Fully opaque at the origin...
            gradient.addColorStop(0, `rgba(${laser.color.r}, ${laser.color.g}, ${laser.color.b}, 1)`);
            // ...and fully transparent at the mouse.
            gradient.addColorStop(1, `rgba(${laser.color.r}, ${laser.color.g}, ${laser.color.b}, 0)`);

            // Use the gradient for the stroke style.
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(laser.origin.x, laser.origin.y);
            ctx.lineTo(p.mouseX, p.mouseY);
            ctx.stroke();

            // Draw a circle at the end of the beam (the mouse position)
            // Here we draw it with a solid fill using the laser's color.
            p.noStroke();
            p.fill(laser.color.r, laser.color.g, laser.color.b);
            let circleDiameter = 10;
            p.ellipse(p.mouseX, p.mouseY, circleDiameter, circleDiameter);
        }
    };

    p.windowResized = function() {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
});
