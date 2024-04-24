const RIVER_MIN_THICKNESS = 2;
const RIVER_MAX_THICKNESS = 6;
const CANYON_MIN_WIDTH = 20;
const CANYON_MAX_WIDTH = 40;

let riverEndpoints = [];
var offset = new Array(32).fill().map(() => Array(32).fill(0));
function generateWorld(x, y) {
    tiles[tileCodes.empty].x = 0;
    tiles[tileCodes.empty].y = 3;
    tiles[tileCodes.water].x = 0;
    tiles[tileCodes.water].y = 13;
    tiles[tileCodes.mud].x = 0;
    tiles[tileCodes.mud].y = 4;
    tiles[tileCodes.shrub].x = 1;
    tiles[tileCodes.shrub].y = 7;
    tiles[tileCodes.tree].x = 16;
    tiles[tileCodes.tree].y = 7;
    tiles[tileCodes.mountain].x = 0;
    tiles[tileCodes.mountain].y = 19;

    let grid = new Array(x);
    
    for (let i = 0; i < x; i++) {
      let row = new Array(y);
      for (let j = 0; j < y; j++) {
        row[j] = tileCodes.empty;
      }
      grid[i] = row;
    }

    generateRiver(grid);
    generateTrees(grid);
    generateCanyon(grid);

    return grid;
}

function drawWorld(grid) {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            let tileCode = grid[i][j];
            let tile;
            if (tileCode === tileCodes.empty) {
                tile = lookup["w"+tileCodes.empty];
                placeTile(i, j, randi(tile.x1, tile.x2 + 1), randi(tile.y1, tile.y2 + 1));
            }
            if (tileCode === tileCodes.water) {
                if (random() < 0.1) {
                    offset[i][j] = floor(random(0, 4));
                }
                let tile = lookup["w"+tileCodes.water];
                let x = clamp(tile.x2 - offset[i][j], tile.x1, tile.x2);
                let y = clamp(tile.y2 - offset[i][j], tile.y1, tile.y2);
                placeTile(i, j, x, y);
            }
            else {
                tile = tiles[tileCode];
                placeTile(i, j, tile.x, tile.y);
            }
        }
    }
}

// Copilot base - modified to use perlin noise on canyon walls
function generateCanyon(grid) {
    const canyonWidth = randi(CANYON_MIN_WIDTH, CANYON_MAX_WIDTH); // Adjust this value to control the width of the canyon
    const riverStart = riverEndpoints[0];
    const riverEnd = riverEndpoints[1];

    // Calculate the direction vector of the river
    const direction = {
        x: riverEnd.x - riverStart.x,
        y: riverEnd.y - riverStart.y
    };

    // Calculate the perpendicular vector to the river direction
    const perpendicular = {
        x: -direction.y,
        y: direction.x
    };

    // Normalize the perpendicular vector
    const length = Math.sqrt(perpendicular.x * perpendicular.x + perpendicular.y * perpendicular.y);
    perpendicular.x /= length;
    perpendicular.y /= length;

    // Calculate the offset for the parallel lines
    const offset = canyonWidth / 2;

    // Generate the parallel lines
    noiseDetail(6, 0.5 / canyonWidth);
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            const distance = (i - riverStart.x) * perpendicular.x + (j - riverStart.y) * perpendicular.y;
            if (abs(distance) > offset) {
                if (floor(abs(distance)) <= offset) {
                    let n = noise(i, j);
                    if (n < 0.1) {
                        grid[i][j] = tileCodes.mountain;
                    }
                }
                else {
                    grid[i][j] = tileCodes.mountain;
                }
            }
        }
    }
}

function generateTrees(grid) {
    let seeds = [];
    // Plant tree seeds
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === tileCodes.empty && 
                    isNeighboring(grid, i, j, [tileCodes.mud, tileCodes.water], [tileCodes.shrub])) {
                if (random() < 0.15) {
                    grid[i][j] = tileCodes.tree;
                    seeds.push({x: i, y: j});
                }
            }
        }
    }
    // Grow thicket from tree seeds
    for (let i = 0; i < seeds.length; i++) {
        generateThicket(grid, seeds[i].x, seeds[i].y);
    }
}

function generateThicket(grid, x, y) {
    let stack = [...getNeighbors(grid, x, y)];
    let chance = 1;
    let current = {x, y};
    let visited = new Array(grid.length).fill().map(() => new Array(grid[0].length).fill(false));
    while (stack.length > 0 && chance > 0) {
        visited[current.x][current.y] = true;
        if (Math.random() < chance) {
            grid[current.x][current.y] = tileCodes.tree;
            chance -= 0.05;
            current = stack.pop();
            let neighbors = getNeighbors(grid, current.x, current.y);
            neighbors = neighbors.filter(neighbor => 
                grid[neighbor.x][neighbor.y] === tileCodes.empty && 
                !(visited[neighbor.x][neighbor.y]));
            shuffle(neighbors, true);
            stack.push(...neighbors);
        }
        else {
            current = stack.pop();
        }
    }
}

// Copilot
function getNeighbors(grid, x, y) {
    let neighbors = [];
    if (x > 0) {
        neighbors.push({x: x - 1, y});
    }
    if (x < grid.length - 1) {
        neighbors.push({x: x + 1, y});
    }
    if (y > 0) {
        neighbors.push({x, y: y - 1});
    }
    if (y < grid[0].length - 1) {
        neighbors.push({x, y: y + 1});
    }
    return neighbors;
}

function generateRiver(grid) {
    // N S E W
    let direction = Math.floor(Math.random() * 4);
    let start = {
        x: 0,
        y: 0,
    };
    let end = {
        x: 0,
        y: 0,
    };

    if (direction === 0 || direction === 1) {
        start.x = Math.floor(Math.random() * grid.length);
        end.x = Math.floor(Math.random() * grid.length);
        end.y = grid[0].length - 1;
    } else if (direction === 2 || direction === 3) {
        start.y = Math.floor(Math.random() * grid[0].length);
        end.y = Math.floor(Math.random() * grid[0].length);
        end.x = grid[0].length - 1;
    }    

    console.log(start, end);

    walkSplineCurve(grid, start, end, randi(RIVER_MIN_THICKNESS, RIVER_MAX_THICKNESS));

    for (let i = 0; i < 32; i++) {
        for (let j = 0; j < 32; j++) {
            if (grid[i][j] === tileCodes.empty) {
                if (isNeighboring(grid, i, j, [tileCodes.water], [tileCodes.mud])) {
                    if (Math.random() < 0.3) {
                        grid[i][j] = tileCodes.shrub;
                    }
                    else if ((Math.random() < 0.25)) {
                        grid[i][j] = tileCodes.mud;
                    }
                    
                }
            }
        }
    }
}


// Copilot base - modified to round instead of floor to avoid gaps and to use the
// control point to generate a curve
function walkSplineCurve(grid, start, end, thickness) {
    // Generate spline curve points
    let control = {x: 0, y: 0};
    control.x = start.x + (end.x - start.x) / 2 + randi(-5, 5);
    control.y = start.y + (end.y - start.y) / 2 + randi(-5, 5);
    riverEndpoints = [start, end];
    let points = generateSplineCurve(start, control, end, thickness);
    console.log(points);

    // Walk over each point in the spline curve
    for (let i = 0; i < points.length; i++) {
        let point = points[i];
        let x = Math.round(point.x);
        let y = Math.round(point.y);

        // Set the neighboring cells as mud
        if (grid[clamp32(x + 1)][y] === tileCodes.empty) { grid[clamp32(x + 1)][y] = tileCodes.mud; }
        if (grid[clamp32(x - 1)][y] === tileCodes.empty) { grid[clamp32(x - 1)][y] = tileCodes.mud; }
        if (grid[x][clamp32(y + 1)] === tileCodes.empty) { grid[x][clamp32(y + 1)] = tileCodes.mud; }
        if (grid[x][clamp32(y - 1)] === tileCodes.empty) { grid[x][clamp32(y - 1)] = tileCodes.mud; }

        // Set the grid cell as water
        grid[x][y] = tileCodes.water;

    }

    return grid;
}

// Copilot base - modified to generate a line with thickness and remove duplicates
function generateSplineCurve(start, control, end, thickness) {
    let points = [];

    // Calculate the distance between start and end points
    let distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));

    // Calculate the number of points to generate based on the distance and thickness
    let numPoints = Math.ceil(distance * thickness);

    // Calculate the step size for each point
    let stepSize = 1 / numPoints;

    // Generate points along the spline curve
    for (let t = 0; t <= 1; t += stepSize) {
        let x = Math.pow(1 - t, 2) * start.x + 2 * (1 - t) * t * control.x + Math.pow(t, 2) * end.x;
        let y = Math.pow(1 - t, 2) * start.y + 2 * (1 - t) * t * control.y + Math.pow(t, 2) * end.y;
        points.push({ x, y });
        for (let i = 1; i <= thickness; i++) {
            points.push({ x: x + i, y });
            points.push({ x: x - i, y });
            points.push({ x, y: y + i });
            points.push({ x, y: y - i });
        }
    }

    // Clamp points using clamp32
    points = points.map(point => ({
        x: clamp32(point.x),
        y: clamp32(point.y),
    }));

    // Filter out duplicates
    points = points.filter((point, index) => {
        const { x, y } = point;
        return (
            points.findIndex(p => p.x === x && p.y === y) === index
        );
    });

    return points;
}

// Copilot base - modified to check for excluded tiles and required included tiles
// Excluded tiles will disqualify a cell from being a neighbor to included tiles
// Included tiles will qualify a cell as a neighbor to included tiles
// This function is used to determine if a cell is neighboring a specific included tile set
// and not neighboring a specific excluded tile set
function isNeighboring(grid, x, y, excludedTiles = [], includedTiles = []) {

    let isneighbor = false;
    const neighbors = [
        { dx: -1, dy: 0 }, // left
        { dx: 1, dy: 0 }, // right
        { dx: 0, dy: -1 }, // top
        { dx: 0, dy: 1 }, // bottom
    ];

    for (const neighbor of neighbors) {
        const nx = x + neighbor.dx;
        const ny = y + neighbor.dy;

        if (nx < 0 || nx >= grid.length || ny < 0 || ny >= grid[0].length) {
            continue; // Neighbor is out of bounds
        }
        if (includedTiles.includes(grid[nx][ny])) { isneighbor = true; } // Neighbor is included
        else if (excludedTiles.includes(grid[nx][ny])) { return false; } // Neighbor is excluded
    }

    return isneighbor;
}

// Weighted random function COPILOT
function weightedRandom(rangeStart, rangeEnd, weight) {
    // Calculate the total weight
    const totalWeight = rangeEnd - rangeStart;

    // Calculate the weighted value
    const weightedValue = rangeStart + (totalWeight * weight);

    // Generate a random number between the range start and end
    const randomNum = Math.random() * totalWeight + rangeStart;

    // Return the value based on the random number and weighted value
    if (randomNum <= weightedValue) {
        return rangeStart;
    } else {
        return rangeEnd;
    }
}