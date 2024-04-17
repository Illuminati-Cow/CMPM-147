// building layer 1
class Buildings01 {
    constructor() {
        this.buildings = [];
        this.numBuildings = random(8, 12);
        // generate the random buildings
        for (let i=0; i<this.numBuildings; i++) {
            // generating positions with amount of randomness
            let x_pos = map(i, 0, this.numBuildings, 0, width*1.05);
            // let y_pos = map(i, 0, 5, height/2, height/4);
            let y_pos = map(i, 0, this.numBuildings, height/4, height/2);

            x_pos = x_pos * random(0.8, 1.2);
            y_pos = y_pos * random(0.8, 1.2);

            let building = new BuildingV1(x_pos, y_pos, 1, 50, 30, 7, 30);
            this.buildings.push(building);
        }
    }

    // update for layer, drawing each building as needed
    draw() {
        this.buildings.forEach(building => {
            building.draw();

            let moveOffset = map(mouseX, 0, width, -width/32, width/32)
            building.move(moveOffset);
        });
    }
}