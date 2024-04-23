var tileCodes = {
    empty: ".",
    wall: "=",
    floor: "#"
};

var tiles = {};

class Room {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

var rooms = [];
var bitRooms = new Uint32Array(32)
var bitRoomPlacement = new Uint32Array(32)
var bitCorridors = new Uint32Array(32)
var bitWalls = new Uint32Array(32)
const ROOM_MIN_SIZE = 3;
const ROOM_MAX_SIZE = 10;
const ROOM_MIN_COUNT = 5;
const ROOM_MAX_COUNT = 10;

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
    generateCorridors();
    let grid = new Array(x);
    for (let i = 0; i < x; i++) {
      let row = new Array(y);
      for (let j = 0; j < y; j++) {
        if (bitRooms[i] & (1 << j)) {
            row[j] = tileCodes.floor;
        } else if (bitCorridors[i] & (1 << j)) {
            row[j] = tileCodes.floor;
        } else {
            row[j] = tileCodes.empty;
        }

      }
      grid[i] = row;
    }
    printBitGrid(bitRooms);
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
    let numRooms = floor(random(ROOM_MIN_COUNT, ROOM_MAX_COUNT));
    for (let i = 0; i < numRooms; i++) {
        rooms.push(createRoom());
    }
}

function createRoom() {
    let x, y, w, h;
    let loopGuard = 0;
    do {
        x = randi(1, 32 - ROOM_MIN_SIZE - 1);
        y = randi(1, 32 - ROOM_MIN_SIZE - 1);
        w = clamp32(randi(ROOM_MIN_SIZE, ROOM_MAX_SIZE));
        h = clamp32(randi(ROOM_MIN_SIZE, ROOM_MAX_SIZE));
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
    return new Room(x, y, w, h);
}

function generateCorridors() {
    for (let room of rooms) {
        createCorridor(room);        
    }
}

function createCorridor(room) { 
    for (let d = 2; d < 32; d *= 2) {
        let adjacentRoom = findAdjacentRoom(room, d);
        if (adjacentRoom) {
            let sx = adjacentRoom.sx - room.x > room.w / 2 ? room.x + room.w - 1 : room.x + 1;
            let sy = adjacentRoom.sy - room.y > room.h / 2 ? room.y + room.h - 1 : room.y + 1;
            let dx = adjacentRoom.dx;
            let dy = adjacentRoom.dy;
            let dir = {x: Math.sign(dx - sx), y: Math.sign(dy - sy)};

            // Create the corridor
            console.log(`Creating corridor from (${sx}, ${sy}) to (${dx}, ${dy})`);
            let path = createBitPath(sx, sy, dx, dy);
            bitCorridors = bitCorridors.map((row, i) => row | (path[i] & ~bitRooms[i]));
            printBitGrid(path);
            return;
        }
    }
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

// Copilot
function createBitPath(x1, y1, x2, y2, obstacles = bitRooms) {
    let path = new Uint32Array(32).fill(0);
    obstacles[y1] &= ~(1 << x1);
    obstacles[y2] &= ~(1 << x2);
    let x = x1;
    let y = y1;
    while (gridDist(x, y, x2, y2) > 1) {
        openDirs = {n: false, s: false, e: false, w: false};
        if (x + 1 < 32 && !(obstacles[y] & (1 << (x + 1)))) { openDirs.e = true; }
        if (x - 1 >= 0 && !(obstacles[y] & (1 << (x - 1)))) { openDirs.w = true; }
        if (y + 1 < 32 && !(obstacles[y + 1] & (1 << x))) { openDirs.s = true; }
        if (y - 1 >= 0 && !(obstacles[y - 1] & (1 << x))) { openDirs.n = true; }
        let options = []
        for (let dir in openDirs) {
            if (!openDirs[dir]) { continue; }
            let nx = x;
            let ny = y;
            let oDistance = gridDist(x, y, x2, y2);
            switch (dir) {
                case "n":
                    ny--;
                    break;
                case "s":
                    ny++;
                    break;
                case "e":
                    nx++;
                    break;
                case "w":
                    nx--;
                    break;
            }
            let nDistance = gridDist(nx, ny, x2, y2);
            if (nDistance < oDistance) {
                options.unshift({dir, nx, ny});
            } else {
                options.push({dir, nx, ny});
            }
        }

        if (options.length == 0) {
            console.log(`No open directions from (${x}, ${y}) to (${x2}, ${y2})`);
            return path;
        }

        let choice = options[0];
        x = choice.nx;
        y = choice.ny;
        path[y] |= 1 << x;
    }
    return path;
}

function setRoomMask(x, y, w, h, bitGrid, unset = false) {
    console.log(`${unset ? "Unsetting" : "Setting"} room mask at (${x}, ${y}) with dimensions ${w}x${h}`);
    for (let i = y; i < y + h; i++) {
        if (unset) { bitGrid[i] &= ~createBitmask(x, x + w - 1); } 
        else { bitGrid[i] |= createBitmask(x, x + w - 1); }
    }
}

function createRoomMask(x, y, w, h) {
    let mask = new Uint32Array(32);
    for (let i = y; i < y + h; i++) {
        mask[i] |= createBitmask(x, x + w - 1);
    }
    return mask;
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
    for (let i = -1; i < bitGrid.length; i++) {
        if (i == -1) {
            console.log("   " + Array(32).fill().map((_, i) => i.toString(10).padStart(2, 0)).join(' '));
            continue;
        }
        console.log(i.toString(10).padStart(2, 0) + 
            bitGrid[i].toString(2).padStart(32, '0').replace(/0/g, '.  ').replace(/1/g, '#  ')
            .split('').reverse().join(''));
    }
}

function scanRow(x, y, bitGrid) {
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


/**
 * Finds the adjacent room to the given room in the dungeon grid.
 * 
 * @returns {Object} - The adjacent room object with its coordinates.
 * {sx, sy, dx, dy} - The source and destination coordinates of the corridor.
 */
function findAdjacentRoom(room, maxDistance = 10000) {
    // Create a masked grid with the current room removed
    let maskedGrid = [...bitRooms];
    setRoomMask(room.x, room.y, room.w, room.h, maskedGrid, true);

    // If room width is even, check for corridor along the off-center row
    if (room.w % 2 == 0) {
        let x = ceil(room.x + room.w / 2)
        let y = scanColumn(x, room.y, maskedGrid);
        if (y && gridDist(room.x, room.y, x, y) <= maxDistance) {
            return {sx: x, sy: room.y, dx: x, dy: y};
        }
    }

    // If room height is even, check for corridor along the off-center column
    if (room.h % 2 == 0) {
        let y = ceil(room.y + room.h / 2)
        let x = scanRow(room.x, y, maskedGrid);
        if (x && gridDist(room.x, room.y, x, y) <= maxDistance) {
            return {sx: room.x, sy: y, dx: x, dy: y};
        }
    }

    // Check for room within rows and cols of room
    let x1, y1, x2, y2;
    x1 = floor(room.x + room.w / 2);
    y1 = floor(room.y + room.h / 2);
    x2 = x1;
    y2 = y1;

    while (x1 >= 0 || x2 < 32) {
        if (x1 >= 0) {
            let y = scanColumn(x1, room.y, maskedGrid);
            if (y && gridDist(x1, room.y, x1, y) <= maxDistance) {
                return {sx: x1, sy: room.y, dx: x1, dy: y};
            }
            x1--;
        }
        if (x2 < 32) {
            let y = scanColumn(x2, room.y, maskedGrid);
            if (y && gridDist(x2, room.y, x2, y) <= maxDistance) {
                return {sx: x2, sy: room.y, dx: x2, dy: y};
            }
            x2++;
        }
    }

    while (y1 >= 0 || y2 < 32) {
        if (y1 >= 0) {
            let x = scanRow(room.x, y1, maskedGrid);
            if (x && gridDist(room.x, y1, x, y1) <= maxDistance) {
                return {sx: room.x, sy: y1, dx: x, dy: y1};
            }
            y1--;
        }
        if (y2 < 32) {
            let x = scanRow(room.x, y2, maskedGrid);
            if (x && gridDist(room.x, y2, x, y2) <= maxDistance) {
                return {sx: room.x, sy: y2, dx: x, dy: y2};
            }
            y2++;
        }
    }

    return false;
}

function gridDist(x1, y1, x2, y2) {
    return abs(x1 - x2) + abs(y1 - y2);
}

function clamp(x, min, max) {
    return Math.min(Math.max(x, min), max);
}