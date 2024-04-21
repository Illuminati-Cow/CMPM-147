var tileCodes = {
    empty: "_",
    wall: "#",
    floor: "."
};

var tiles = {};

for (let code in tileCodes) {
    tiles[tileCodes[code]] = {};
}

tiles[tileCodes.empty].x = 0;
tiles[tileCodes.empty].y = 23;

function generateDungeon(x, y) {
    // Create a grid of size x by y and fill with default value
    let grid = new Array(x);
    for (let i = 0; i < x; i++) {
      let row = new Array(y);
      for (let j = 0; j < y; j++) {
        row[j] = tileCodes.empty;
      }
      grid[i] = row;
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
        placeTile(i, j, tile.x, tile.y);
      }
    }
}

function createRoom() {
    let room = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };
    room.width = floor(random(5, 10));
    room.height = floor(random(5, 10));
    room.x = floor(random(0, numCols - room.width));
    room.y = floor(random(0, numRows - room.height));
    return room;
}

function createCorridor(start, end) {
    let corridor = {
        start: start,
        end: end
    };
    return corridor;
}
