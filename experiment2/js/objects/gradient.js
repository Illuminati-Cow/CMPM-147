class Gradient {
    constructor(width, height, startColor, endColor) {
        this.width = width
        this.height = height
        this.startColor = startColor
        this.endColor = endColor
        this.buffer
        this.weight = 1
        this.regenerate()
    }

    setWeight(weight) {
        this.weight = weight
        this.regenerate()
    }

    // Function via ChatGPT
    regenerate() {
        let gradient = createGraphics(this.width, this.height);
        gradient.noFill();
        for (let i = 0; i < this.height; i++) {
            let inter = map(i, 0, this.height * this.weight, 0, 1);
            let c = lerpColor(this.startColor, this.endColor, inter);
            gradient.stroke(c);
            gradient.line(0, i, this.width, i);
        }
        this.buffer = gradient
    }

    draw(x=0, y=0) {
        image(this.buffer, x, y, this.width, this.height)
    }
}