var tileCodes = {
    empty: ".",
    floor: "#",
    door: "+",
    water: "~",
    mud: "-",
    shrub: "*",
    tree: "t",
    mountain: "^",
};

var tiles = {};
var lookup = {};

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
    lookup[tileCodes[code]] = {};
    // w prefix for world tiles to avoid conflicts with dungeon tiles
    lookup[tileCodes["w" + code]] = {};
}

// Randomized tiles
lookup[tileCodes.empty] = {x1: 1, y1: 21, x2: 1, y2: 21};
lookup["w"+tileCodes.empty] = {x1: 0, y1: 3, x2: 3, y2: 3};
lookup[tileCodes.floor] = {x1: 0, y1: 15, x2: 3, y2: 15};
lookup[tileCodes.door] = {x1: 6, y1: 25, x2: 7, y2: 27};
lookup["w"+tileCodes.water] = {x1: 0, y1: 13, x2: 3, y2: 13};
lookup["w"+tileCodes.shrub] = {x1: 1, y1: 7, x2: 1, y2: 8};

// Logic tiles
// 4 24
// x1: 5, y1: 21, x2: 7, y2: 21
lookup[tileCodes.empty][tileCodes.floor] = {
    1: {x: 1, y: 21}, 2: {x: 2, y: 21}, 4: {x: 3, y: 21},
    8: {x: 3, y: 21}, 16: {x: 3, y: 23},
    32: {x: 1, y: 23}, 64: {x: 2, y: 23}, 128: {x: 3, y: 23}
};
lookup[tileCodes.mud][tileCodes.water] = {
    1: {x: 9, y: 15}, 2: {x: 10, y: 15}, 4: {x: 11, y: 15},
    8: {x: 9, y: 16}, 16: {x: 11, y: 16},
    32: {x: 9, y: 17}, 64: {x: 10, y: 17}, 128: {x: 11, y: 17}
};



function generateDungeon(x, y) {
    tiles[tileCodes.empty].x = 0;
    tiles[tileCodes.empty].y = 22;
    tiles[tileCodes.floor].x = 0;
    tiles[tileCodes.floor].y = 23;
    bitRooms.fill(0);
    bitRoomPlacement.fill(0);
    bitCorridors.fill(0);
    bitWalls.fill(0);
    rooms = [];
    let grid = new Array(x);
    for (let i = 0; i < x; i++) {
        let row = new Array(y);
        for (let j = 0; j < y; j++) {
            row[j] = tileCodes.empty;
        }
        grid[i] = row;
    }
    generateRooms(grid);
    printBitGrid(bitRooms);
    generateCorridors(grid);
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === tileCodes.door) { continue; }
            if (bitRooms[i] & 1 << j)
                grid[i][j] = tileCodes.floor;
            if (bitCorridors[i] & 1 << j)
                grid[i][j] = tileCodes.floor;
        }
    }
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
            if (grid[i][j] === tileCodes.empty) {
                let code = neighborCode(grid, i, j, tileCodes.floor);
                let tile = null;
                if (code === 0) {
                    tile = tiles[tileCodes.empty]
                    placeTile(i, j, tile.x, tile.y);
                }
                else {
                    tile = tiles[tileCodes.floor];
                    placeTile(i, j, tile.x, tile.y);
                    tile = lookup[tileCodes.empty][tileCodes.floor][code];
                    placeTile(i, j, tile.x, tile.y);
                }
            }
            else if (grid[i][j] === tileCodes.floor) {
                tile = lookup[tileCodes.floor];
                placeTile(i, j, randi(tile.x1, tile.x2 + 1), randi(tile.y1, tile.y2 + 1));
            }
            else if (grid[i][j] === tileCodes.door) {
                tile = lookup[tileCodes.door];
                placeTile(i, j, randi(tile.x1, tile.x2 + 1), randi(tile.y1, tile.y2 + 1));
            }
            else {
                placeTile(i, j, tile.x, tile.y);
            }
        }
    }
}

function neighborCode(grid, i, j, tile) {
    let code = 0;
    if (i > 0 && grid[i - 1][j] === tile) code += 2;
    else if (j < grid[i].length - 1 && grid[i][j + 1] === tile) code += 8;
    else if (i < grid.length - 1 && grid[i + 1][j] === tile) code += 64;
    else if (j > 0 && grid[i][j - 1] === tile) code += 16;
    return code;
}

function generateRooms(grid) {
    let numRooms = floor(random(ROOM_MIN_COUNT, ROOM_MAX_COUNT));
    for (let i = 0; i < numRooms; i++) {
        rooms.push(createRoom(grid));
    }
    console.log(rooms);
}

function createRoom(grid) {
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

function generateCorridors(grid) {
    let sortedRooms = sortRoomsByDistance(rooms);
    for (let i = 1; i < sortedRooms.length; i++) {
        createCorridor(sortedRooms[i - 1], sortedRooms[i], grid);
    }
}

function createCorridor(room, destRoom, grid) {
    let x = clamp32(room.x + floor(room.w / 2));
    let y = clamp32(room.y + floor(room.h / 2));
    let dx = clamp32(destRoom.x + floor(destRoom.w / 2));
    let dy = clamp32(destRoom.y + floor(destRoom.h / 2));

    let doors = { pointA: null, pointB: null };
    doors.pointA = findClosestPoints(room, destRoom).pointA;
    doors.pointB = findClosestPoints(destRoom, room).pointA;

    // Create the corridor
    console.log(`Creating corridor from (${doors.pointA.x}, ${doors.pointA.y}) to (${doors.pointB.x}, ${doors.pointB.x})`);
    let path = createBitPath(doors.pointA.x, doors.pointA.y, doors.pointB.x, doors.pointB.y);
    bitCorridors = bitCorridors.map((row, i) => row | (path[i] & ~bitRooms[i]));
    grid[doors.pointA.y][doors.pointA.x] = tileCodes.door;
    //grid[doors.pointB.y][doors.pointB.x] = tileCodes.door;
    return;
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
    let visited = new Uint32Array(32).fill(0);
    obstacles = [...obstacles];
    let x = x1;
    let y = y1;
    let stack = [];
    while (gridDist(x, y, x2, y2) > 1) {
        visited[y] |= 1 << x;
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
            if (visited[ny] & 1 << nx) { continue; }    
            let nDistance = gridDist(nx, ny, x2, y2);
            if (options.length == 0) { options.push({nx, ny, distance: nDistance}); }
            else {
                for (let i = 0; i < options.length; i++) {
                    if (nDistance < options[i].distance) {
                        options.splice(i, 0, {nx, ny, distance: nDistance});
                        break;
                    } else if (i == options.length - 1) {
                        options.push({nx, ny, distance: nDistance});
                        break;
                    }
                }
            }
        }

        if (options.length == 0) {
            if (stack.length == 0) {
                console.log(`No open directions from (${x}, ${y}) to (${x2}, ${y2})`);
                return path.fill(0);
            }
            obstacles[y] |= 1 << x;
            // console.log(`Backtracking to (${x}, ${y})`);
            path[y] &= x - 1;
            let prev = stack.pop();
            x = prev.x;
            y = prev.y;
            continue;
        }

        let choice = options[0];
        
        x = choice.nx;
        y = choice.ny;
        path[y] |= 1 << x;
        stack.push({x, y});
        // print(`Moving to (${x}, ${y})`);
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


// Copilot - modified
function sortRoomsByDistance(rooms) {    
    // Calculate distances between all pairs of rooms
    let distances = [];
    for (let i = 0; i < rooms.length; i++) {
        distances[i] = [];
        for (let j = 0; j < rooms.length; j++) {
            let roomA = rooms[i];
            let roomB = rooms[j];
            let closestPoints = { pointA: null, pointB: null };
            closestPoints.pointA = findClosestPoints(roomA, roomB).pointA;
            closestPoints.pointB = findClosestPoints(roomB, roomA).pointA;

            let distance = gridDist(closestPoints.pointA.x, closestPoints.pointA.y, closestPoints.pointB.x, closestPoints.pointB.y);
            distances[i][j] = { room: roomB, distance: distance };
        }
    }

    // Create a copy of the distances array
    let remainingDistances = [...distances];

    // Start with the first room as the current room
    let currentRoom = 0;
    let visitedRooms = [rooms[0]];

    // Iterate until all rooms have been visited
    while (visitedRooms.length < distances.length) {
        let closestDistance = Infinity;
        let closestRoom = null;
        let closestIndex = -1;

        // Find the nearest room from the current room
        for (let i = 0; i < remainingDistances[currentRoom].length; i++) {
            let distance = remainingDistances[currentRoom][i].distance;
            let room = remainingDistances[currentRoom][i].room;

            // If the distance is smaller than the current closest distance and the room has not been visited yet, update the closest room
            if (distance < closestDistance && !visitedRooms.includes(room)) {
                closestDistance = distance;
                closestRoom = room;
                closestIndex = i;
            }
        }

        // Add the closest room to the visited rooms and update the current room
        visitedRooms.push(closestRoom);
        currentRoom = closestIndex;
    }

    // Print the path
    console.log("Visited rooms:", visitedRooms);
    let path = visitedRooms.map(room => `(${room.x}, ${room.y})`);
    console.log("Path:", path);

    return visitedRooms;
}

function gridDist(x1, y1, x2, y2) {
    return abs(x1 - x2) + abs(y1 - y2);
}

function clamp(x, min, max) {
    return Math.min(Math.max(x, min), max);
}

function findClosestPoints(roomA, roomB) {
    let closestDistance = Infinity;
    let closestPoints = { pointA: null, pointB: null };

    // Iterate over all points in roomA
    for (let i = roomA.x; i < clamp32(roomA.x + roomA.w); i++) {
        for (let j = roomA.y; j < clamp32(roomA.y + roomA.h); j++) {
            // Calculate the distance between the current point and roomB
            let distance = gridDist(i, j, roomB.x, roomB.y);

            // If the distance is smaller than the current closest distance, update the closest points
            if (distance < closestDistance) {
                closestDistance = distance;
                closestPoints.pointA = { x: i, y: j };
                closestPoints.pointB = { x: roomB.x, y: roomB.y };
            }
        }
    }

    return closestPoints;
}