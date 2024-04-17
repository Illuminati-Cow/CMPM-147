class River {
    constructor() {
        this.alphaFence = 235   
        this.alphaRiver = 150
        this.river = new Gradient(
            width * 2, height / 20, 
            color(252, 212, 252, this.alphaRiver), 
            color(206, 39, 192, this.alphaRiver)
        );
        this.river.setWeight(1)
    }

    draw() {
        angleMode(DEGREES)
        let rotation = 183
        rotate(rotation)
        this.river.draw(-width - 100, -height + 100)
        fill(241, 112, 195, this.alphaFence)
        let fence = rect(-width - 100, -height + 130, width * 2, height / 20)
        stroke(51, 5, 51, this.alphaRiver)
        strokeWeight(4)
        line(-width - 100, -height + 130, width + 100, -height + 130)
        stroke(255, 255, 255, 250)
        strokeWeight(2)
        line(-width - 100, -height + 100, width + 100, -height + 100)
        rotate(-rotation)
    }
}