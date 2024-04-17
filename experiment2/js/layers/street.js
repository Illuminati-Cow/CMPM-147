class Street {
    constructor() {
        let alpha = 230
        this.street = new Gradient(width * 2, height / 6, color(24, 0, 56, alpha), color(209, 95, 211, alpha))
        this.street.setWeight(1.25)
    }

    draw() {
        angleMode(DEGREES)
        let rotation = 183
        rotate(rotation)
        this.street.draw(-width - 100, -height)
        rotate(-rotation)
    }
}