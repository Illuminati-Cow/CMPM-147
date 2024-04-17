// building layer 3
class Buildings03 {
    constructor() {
        this.buildings = [];
        this.numBuildings = random(8, 10);
        // generate the random buildings
        for (let i=0; i<this.numBuildings; i++) {
            // generating positions with amount of randomness
            let x_pos = map(i, 0, this.numBuildings, 0, width);
            let y_pos = map(i, 0, this.numBuildings, height/8, height/4);
            x_pos = x_pos * random(0.8, 1.2);
            y_pos = y_pos * random(0.8, 1.2);

            let building = new BuildingV1(x_pos, y_pos, 3, 50, 30, 7, 30);
            this.buildings.push(building);
        }
    }

    // update for layer, drawing each building as needed
    draw() {
        this.buildings.forEach(building => {
            building.draw();

            let moveOffset = map(mouseX, 0, width, -width/64, width/64)
            building.move(moveOffset);
        });
    }
}