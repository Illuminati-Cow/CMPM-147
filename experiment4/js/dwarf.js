"use strict"

var modifiedTiles = {};

class Dwarf {
    static dwarfNames = []
    static clanKnowledge = {};
    static easystar = new EasyStar.js();
    static searchRadius = 30;
    static updateInterval = 1000;
    static sightRadius = 20;
    static _ = (() => {
        fetch("./js/dwarfNames.json")
            .then(response => response.json())
            .then(json => {
                Dwarf.dwarfNames = json;
            });
    })();

    constructor(x, y, clan) {
        this.name = Dwarf.dwarfNames[Math.floor(Math.random() * Dwarf.dwarfNames.length)];
        this.clan = clan;
        this.state = "idle";
        if (!Dwarf.clanKnowledge[clan]) {
            Dwarf.clanKnowledge[clan] = {};
            Dwarf.clanKnowledge[clan]["dwarf"] = [];
            this.createHall(x, y);
            this.state = "inactive";
            Dwarf.setClanActive(clan, false);
        }
        Dwarf.clanKnowledge[clan]["dwarf"].push(this);
        this.knowledge = Dwarf.clanKnowledge[clan];
        this.position = {x: x, y: y};
        this.spawn = {x: x, y: y};
        this.target = null;
        this.path = null;
        this.lastUpdate = p0.millis();
        Dwarf.easystar.setIterationsPerCalculation(1000);
    };

    draw() {
        p0.fill("hsl(24, 60%, 50%)");
        // p0.translate(this.position.x * tw, this.position.y * th);
        let x = 0;
        let y = 0;
        p0.ellipse(x, y -th/1.5, th, th);
        p0.ellipse(x, y, th, th * 1.25);
        p0.fill("hsl(0, 100%, 98%)");
        p0.text(this.name, x -this.name.length * 3, y -th * 2.2);
        if (cameraZoom > 0.9) {
            let statusText = this.state + " " + `${this.position.x}, ${this.position.y}`
            p0.text(statusText, x -statusText.length * 2, y -th * 1.5);
        }
    }

    update() {
        if (this.state === "inactive") {
            return;
        }

        if (p0.millis() - this.lastUpdate < Dwarf.updateInterval) {
            return;
        }
        this.lastUpdate = p0.millis();

        let surroundingTiles = this.getSurroundingTiles();
        this.seeNearbyOres();
        this.learn(...surroundingTiles);
        if (this.state === "searching") {
            Dwarf.easystar.calculate();
        }
        else if (this.state === "idle") {	
            if (surroundingTiles.some(tile => tile.type == "ore")) {
                let tile = surroundingTiles.find(tile => tile.type == "ore");
                this.path = null;
                this.mine(tile, true);
                this.learn(...this.identifyVein(this.position));
            }
            else if (this.recall("ore").some(tile => this.distanceTo(tile) < Dwarf.searchRadius)) {
                this.changeState("pathfinding");
                this.path = null;
                this.target = this.recall("ore").find(tile => this.distanceTo(tile) < Dwarf.searchRadius);
                console.log("Found ore vein at " + this.target.x + ", " + this.target.y + " " + this.target.type);
            }
            else {
                let tiles = surroundingTiles;
                if (this.path != null && this.path.length > 0)
                    tiles = surroundingTiles.filter((node) => {
                        return !this.path.some(pathNode => pathNode.x === node.x && pathNode.y === node.y);
                    });
                let tile = tiles[Math.floor(Math.random() * tiles.length)] || surroundingTiles[0];
                if (tile.type === "stone") {
                    this.mine(tile, false);
                }
                else {
                    this.position = {x: tile.x, y: tile.y};
                }
                // Track path to not backtrack
                if (this.path == null)
                    this.path = [tile]
                else
                    this.path.push(tile);
            }
        }
        else if (this.state === "pathfinding") {
            if (this.path === null) {
            // Create a grid for the pathfinding algorithm
            Dwarf.easystar.setGrid(Dwarf.createGrid(this.position, this.target));
            // Make ground walkable and stone mineable
            Dwarf.easystar.setAcceptableTiles([0, 1]);
            // Make mining walls expensive so that they prefer pre-carved tunnels
            Dwarf.easystar.setTileCost(1, 3);
            let [w, h] = Dwarf.gridSize(this.position, this.target);
            let [x, y] = Dwarf.worldToGrid(this.position, this.target, w, h);
            let [tx, ty] = Dwarf.worldToGrid(this.target, this.target, w, h);
            Dwarf.easystar.findPath(x, y, tx, ty, (path) => {
                if (path === null) {
                    this.changeState("idle");
                    console.log("No path was found!");
                    return;
                }
                this.path = path.map((node) => { 
                    let [x, y] = Dwarf.gridToWorld({x: node.x, y: node.y}, this.target, w, h);
                    return {x: x, y: y, type: getTile(x, y)};
                });
                console.log("Path found!" + " " + this.path);
                if (this.target.type == "hall")
                    this.changeState("hauling");
                else
                    this.changeState("mining");
                });
            }
            this.changeState("searching");
        }
        else if (this.state === "hauling") {
            if (this.distanceTo(this.target) <= 1) {
                this.changeState("idle");
                this.path = null;
                return;
            }
            let tile = this.getNextTile();
            if (tile.type === "ground" || tile.type === "hall") {
                this.position = {x: tile.x, y: tile.y};
            }
            else {
                this.mine(tile, false);
            }
        }
        else if (this.state === "mining") {
            if (this.distanceTo(this.target) <= 1) {
                this.changeState("idle");
                this.path = null;
                return;
            }
            let tile = this.getNextTile();
            if (tile.type === "ground" || tile.type === "hall") {
                this.position = {x: tile.x, y: tile.y};
            }
            else {
                this.mine(tile, false);
            }
        }
    }

    getSurroundingTiles() {
        let tiles = [];
        tiles.push({x: this.position.x + 1, y: this.position.y, type: getTile(this.position.x + 1, this.position.y)});
        tiles.push({x: this.position.x - 1, y: this.position.y, type: getTile(this.position.x - 1, this.position.y)});
        tiles.push({x: this.position.x, y: this.position.y + 1, type: getTile(this.position.x, this.position.y + 1)});
        tiles.push({x: this.position.x, y: this.position.y - 1, type: getTile(this.position.x, this.position.y - 1)});
        return tiles;
    }

    seeNearbyOres() {
        let ores = [];
        let rayCast = (x0, y0, x1, y1) => {
            let x = x0;
            let y = y0;
            while (x !== x1 || y !== y1) {
                if (getTile(x, y) === "stone") {
                    return false;
                }
                if (getTile(x, y) === "ore") {
                    return getTile(x, y);
                }
                if (x < x1) {
                    x++;
                } else if (x > x1) {
                    x--;
                }
                if (y < y1) {
                    y++;
                } else if (y > y1) {
                    y--;
                }
            }
        }
        for (let i = -Dwarf.sightRadius; i <= Dwarf.sightRadius; i++) {
            for (let j = -Dwarf.sightRadius; j <= Dwarf.sightRadius; j++) {
                if (i == 0 && j == 0) {
                    continue;
                }
                let tile = {x: this.position.x + i, y: this.position.y + j, type: getTile(this.position.x + i, this.position.y + j)};
                if (tile.type === "ore") {
                    let ore = rayCast(this.position.x, this.position.y, tile.x, tile.y);
                    if (ore)
                        ores.push(this.identifyVein(tile));
                }
            }
        }
        let uniqueOres = ores
        uniqueOres.push(...(this.knowledge["ore"] || []))
        uniqueOres = uniqueOres.filter((ore, index, self) => {
            return index === self.findIndex((o) => (
                o.x === ore.x && o.y === ore.y
            ));
        }).flat();
        if (uniqueOres.length > 0)
            this.learn(...uniqueOres);
    }
    
    learn(...tiles) {
        tiles.forEach(tile => {
            if (tile.type == "stone" || tile.type == "ground")
                return;
            if (!this.knowledge[tile.type]) {
                this.knowledge[tile.type] = [];
            }
            if (!Dwarf.clanKnowledge[this.clan][tile.type]) {
                Dwarf.clanKnowledge[this.clan][tile.type] = [];
            }
            if (this.knowledge[tile.type].some(knowledgeTile => {
                    return knowledgeTile.x === tile.x && knowledgeTile.y === tile.y})) {
                return;
            }
            this.knowledge[tile.type].push(tile);
            Dwarf.clanKnowledge[this.clan][tile.type].push(tile);
        });
    }

    recall(type) {
        if (this.knowledge[type]) {
            return this.knowledge[type];
        }
        else if (Dwarf.clanKnowledge[this.clan][type]) {
            return Dwarf.clanKnowledge[this.clan][type];
        }
        return [];
    }

    distanceTo(tile) {
        return Math.abs(this.position.x - tile.x) + Math.abs(this.position.y - tile.y);
    }

    getNextTile() {
        return this.path.shift();
    }

    // Copilot    
    identifyVein(tile) {
        let vein = [];
        let queue = [tile];
        while (queue.length > 0) {
            let current = queue.pop();
            vein.push(current);
            let surroundingTiles = this.getSurroundingTiles(current);
            surroundingTiles.forEach(tile => {
                if (tile.type === "ore" && !vein.some(v => v.x === tile.x && v.y === tile.y)) {
                    queue.push(tile);
                }
            });
        }
        return vein;
    }

    mine(tile, updateBehavior = true) {
        modifiedTiles[[tile.x, tile.y]] = tileTypes.ground;
        this.position = {x: tile.x, y: tile.y};
        if (tile.type === "ore" && updateBehavior) {
            this.changeState("pathfinding");
            this.target = this.knowledge["hall"][0];
        }
    }

    createHall(_x, _y) {
        modifiedTiles[[_x, _y]] = tileTypes.hall;
        Dwarf.clanKnowledge[this.clan]["hall"] = [{x: _x, y: _y}];
    }

    changeState(state) {
        console.log("Changing state of " + this.name + " from " + this.state + " to " + state);
        this.state = state;
    }

    static setClanActive(clan, isActive) {
        if (isActive) {
            Dwarf.clanKnowledge[clan]["dwarf"].forEach(dwarf => {
                dwarf.changeState("idle");
            });
        }
        else {  
            Dwarf.clanKnowledge[clan]["dwarf"].forEach(dwarf => {
                dwarf.changeState("inactive");
            });
        }
    }

    static isClanActive(clan) {
        return Dwarf.clanKnowledge[clan]["dwarf"].some(dwarf => dwarf.state !== "inactive");
    }

    static gridToWorld(pos, target, width, height) {
        return [pos.x - width + target.x, -pos.y + height + target.y];
    }

    static worldToGrid(pos, target, width, height) {
        return [pos.x + width - target.x, pos.y + height - target.y];
    }

    static createGrid(pos, target) {
        let [w, h] = Dwarf.gridSize(pos, target);
        let grid = Array(2 * h).fill(0);
        for (let iy = 0; iy < 2 * h; iy++) {
            grid[iy] = Array(2 * w).fill(0);
            for (let ix = 0; ix < 2 * w; ix++) {
                let type = getTile(...Dwarf.gridToWorld({x: ix, y: iy}, target, w, h))
                grid[iy][ix] = type === "ground" || type === "hall" ? 0 : 1;
            }
        }
        console.log(grid);
        return grid;
    }

    static gridSize(pos, target) {
        let dx = Math.abs(target.x - pos.x)
        let dy = Math.abs(target.y - pos.y)
        let w = Math.max(dx * 2, 100)
        let h = Math.max(dy * 2, 100)
        return [w, h]
    }
}