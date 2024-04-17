class StaticOverlay {
    constructor() {
        this.static = createImage(Math.floor(width), Math.floor(height / 3))
        this.static.loadPixels()
    }

    draw() {
        this.drawStatic(0.1, 0.9, 0.015, 150)
    }

    drawStatic(threshold, whiteCutoff, blend, yDepth) {
        this.static.pixels.fill(color(0))
        noiseSeed(Date.now())
        for (let y = 0; y < yDepth; y++) {
            threshold += (1 - threshold) * blend
            for (let x = 0; x < width - 3; x += Math.floor(random(1, 20))) {
                let c = noise(x, y) > threshold ? noise(x, y) : 0
                if (c === 0) continue
                if (c > whiteCutoff) 
                    c = color(255)
                else
                    c = color(0)
                this.static.set(x, y, c)
            }
        }
        this.static.updatePixels()
        image(this.static, 0, 0, width, yDepth);
    }
}