var tileCodes = {
    empty: ".",
    wall: "=",
    floor: "#"
};

var tiles = {};

var bitRooms = new Uint32Array(32)
var bitRoomPlacement = new Uint32Array(32)
var bitCorridors = new Uint32Array(32)
var bitWalls = new Uint32Array(32)

for (let code in tileCodes) {
    tiles[tileCodes[code]] = {};
}

tiles[tileCodes.empty].x = 0;
tiles[tileCodes.empty].y = 23;
tiles[tileCodes.wall].x = 0;
tiles[tileCodes.wall].y = 0;
tiles[tileCodes.floor].x = 0;
tiles[tileCodes.floor].y = 24;

function generateDungeon(x, y) {
    bitRooms.fill(0);
    bitRoomPlacement.fill(0);
    bitCorridors.fill(0);
    bitWalls.fill(0);
    generateRooms();
    let grid = new Array(x);
    for (let i = 0; i < x; i++) {
      let row = new Array(y);
      for (let j = 0; j < y; j++) {
        if (bitRooms[i] & (1 << j)) {
            row[j] = tileCodes.floor;
        } else {
            row[j] = tileCodes.empty;
        }
      }
      grid[i] = row;
    }
    printBitGrid(bitRoomPlacement);
    return grid;
}

function placeTile(i, j, ti, tj) {
    let scaledTileSize = TILE_SIZE * scaleFactor;
    image(
        tilesetImage, 
        scaledTileSize * j, 
        scaledTileSize * i, 
        scaledTileSize, 
        scaledTileSize, 
        TILE_SIZE * ti, 
        TILE_SIZE * tj, 
        TILE_SIZE, 
        TILE_SIZE
    );
}

function drawDungeon(grid) {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            let tile = tiles[grid[i][j]];
            placeTile(i, j, tile.x, tile.y);
        }
    }
}

function generateRooms() {
    let numRooms = floor(random(3, 9));
    for (let i = 0; i < numRooms; i++) {
        createRoom();
    }
}

function createRoom() {
    let x, y, w, h;
    let loopGuard = 0;
    do {
        x = randi(0, 28);
        y = randi(0, 28);
        w = clamp32(randi(3, 8));
        h = clamp32(randi(3, 8));
        loopGuard++;
        if (loopGuard >= 1000) {
            console.log("Loop guard tripped");
            return;
        }
    }
    while (!bitsOpen(x, y, w, h, bitRoomPlacement));
    setRoomMask(x, y, w, h, bitRooms);
    // Create placement mask one tile larger in each direction than the room
    setRoomMask(clamp32(x - 1), clamp32(y - 1), clamp32(w + 2), clamp32(h + 2), bitRoomPlacement);
}

function createCorridor(start, end) {
    let corridor = {
        start: start,
        end: end
    };
    return corridor;
}


// Utility functions

function randi(min, max) {
    return floor(random(min, max));
}

// Copilot
function findMSB32(num) {
    return 31 - Math.clz32(num);
}

// Copilot
function createBitmask(start, end) {
    let mask = 0;
    for (let i = start; i <= end; i++) {
        mask |= 1 << i;
    }
    return mask;
}

function setRoomMask(x, y, w, h, bitGrid) {
    console.log(`Setting room mask at (${x}, ${y}) with dimensions ${w}x${h}`);
    for (let i = y; i < y + h; i++) {
        bitGrid[i] |= createBitmask(x, x + w - 1);
    }
}

function bitsOpen(x, y, w, h, bitGrid) {
    for (let i = y; i < y + h; i++) {
        let mask = createBitmask(x, x + w - 1);
        if (bitGrid[i] & mask) {
            console.log(`Room at (${x}, ${y}) with dimensions ${w}x${h} overlaps with existing room`);
            return false;
        }
    }
    console.log(`Room at (${x}, ${y}) with dimensions ${w}x${h} is open`);
    return true;
}

// Clamp value to [0, 31]
function clamp32(x) {
    return max(0, min(x, 31));
}

// Copilot
function printBitGrid(bitGrid) {
    for (let i = 0; i < bitGrid.length; i++) {
        console.log(i.toString(10).padStart(2, 0) + 
            bitGrid[i].toString(2).padStart(32, '0').replace(/0/g, '. ').replace(/1/g, '# ')
            .split('').reverse().join(''));
    }
}

function scanRow(x, y, radius, bitGrid) {
    let row = bitGrid[y];
    let e = x + 1;
    let w = x - 1;
    while (w >= 0 || e < 32) {
        if (w >= 0 && row & (1 << w)) { return w; } else { w--; }
        if (e < 32 && row & (1 << e)) { return e; } else { e++; }
    }
    return false;
}

function scanColumn(x, y, bitGrid) {
    let hmask = (1 << x)
    let s = y + 1;
    let n = y - 1;
    while (n >= 0 || s < 32) {
        if (n >= 0 && bitGrid[n] & hmask) { return n; } else { n--; }
        if (s < 32 && bitGrid[s] & hmask) { return s; } else { s++; }
    }
    return false;
}