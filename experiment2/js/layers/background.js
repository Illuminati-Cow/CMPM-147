class Background {
    constructor() {
        this.sky = new Gradient(width, height, color("#100f39"), color("#9b72da"))
        this.lights = createGraphics(Math.floor(width - 20), Math.floor(height / 3))
        this.createLights(0.67, height / 4)
    }

    draw() {
        this.sky.draw()
        this.drawLights()
    }

    createLights(threshold, yDepth) {
        this.lights.noFill()
        for (let y = 5; y < yDepth - 5; y += random(3, 5)) {
            for (let x = 5; x < width - 5; x += random(0, 20)) {
                let c = noise(x, y) > threshold ? noise(x, y) : 0
                if (c === 0) continue
                this.lights.strokeWeight(3)
                map(c, threshold, 1, 150, 255)
                this.lights.stroke(lerpColor(color(255, 255, 255, 0), color(255, 255, 255, 255), c));
                this.lights.line(x, y, x, y);
                // Prevent lights from spawning too close
                x += 10
            }
        }
        image(this.lights, 0, 0, width, yDepth);
    }
    
    drawLights() {
        image(this.lights, 10, Math.floor(this.lights.height / 2));
    }
}