// building layer 2
class Buildings02 {
    constructor() {
        this.buildings = [];
        this.numBuildings = random(10, 13);
        // generate the random buildings
        for (let i=0; i<this.numBuildings; i++) {
            // generating positions with amount of randomness
            let x_pos = map(i, 0, this.numBuildings, 0, width);
            let y_pos = map(i, 0, this.numBuildings, height/5.5, height/2.2);
            x_pos = x_pos * random(0.9, 1.1);
            y_pos = y_pos * random(0.8, 1.3);

            let building = new BuildingV1(x_pos, y_pos, 2, 60, 40, 7, 30);
            this.buildings.push(building);
        }
    }

    // update for layer, drawing each building as needed
    draw() {
        this.buildings.forEach(building => {
            building.draw();

            let moveOffset = map(mouseX, 0, width, -width/42, width/42)
            building.move(moveOffset);
        });
    }
}