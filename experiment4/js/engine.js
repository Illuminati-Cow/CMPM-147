"use strict";

/* global p5 */
/* exported preload, setup, draw, mouseClicked */
// Project base code provided by {amsmith,ikarth}@ucsc.edu


let tile_width_step_main; // A width step is half a tile's width
let tile_height_step_main; // A height step is half a tile's height

// Global variables. These will mostly be overwritten in setup().
let tile_rows, tile_columns;
let camera_offset;
let camera_velocity;
let instanceCount = 0;
var tileTypes = {};
var baseColor;
var noiseScale = 0.1;
var noiseLevel = 2;
var oreNoiseScale = 0.25;
var oreNoiseLevel = 1;
var oreNoiseOctaves = 5;
var cameraZoom = 1;
var dwarves = {};
var activeClans = [];

/////////////////////////////
// Transforms between coordinate systems
// These are actually slightly weirder than in full 3d...
/////////////////////////////
function worldToScreen([world_x, world_y], [camera_x, camera_y]) {
  let i = (world_x - world_y) * tile_width_step_main;
  let j = (world_x + world_y) * tile_height_step_main;
  return [i + camera_x, j + camera_y];
}

function worldToCamera([world_x, world_y], [camera_x, camera_y]) {
  let i = (world_x - world_y) * tile_width_step_main;
  let j = (world_x + world_y) * tile_height_step_main;
  return [i, j];
}

function tileRenderingOrder(offset) {
  return [offset[1] - offset[0], offset[0] + offset[1]];
}

function screenToWorld([screen_x, screen_y], [camera_x, camera_y]) {
  screen_x -= camera_x;
  screen_y -= camera_y;
  screen_x /= tile_width_step_main * 2;
  screen_y /= tile_height_step_main * 2;
  screen_y += 0.5;
  return [Math.floor(screen_y + screen_x), Math.floor(screen_y - screen_x)];
}

function cameraToWorldOffset([camera_x, camera_y]) {
  let world_x = camera_x / (tile_width_step_main * 2);
  let world_y = camera_y / (tile_height_step_main * 2);
  return { x: Math.round(world_x), y: Math.round(world_y) };
}

function worldOffsetToCamera([world_x, world_y]) {
  let camera_x = world_x * (tile_width_step_main * 2);
  let camera_y = world_y * (tile_height_step_main * 2);
  return new p5.Vector(camera_x, camera_y);
}

function preload() {
  if (window.p3_preload) {
    window.p3_preload();
  }
}

function generateTileData([x, y]) {
    if (modifiedTiles && modifiedTiles[[x, y]]) {
        return modifiedTiles[[x, y]];
    }
    let noise = noiseLevel * pg.noise(x * noiseScale, y * noiseScale);
    //console.log(noise);
    if (noise > 0.97) {
        let x1 = x * oreNoiseScale + noise;
        let y1 = y * oreNoiseScale + noise;
        noise = oreNoiseLevel * pg.noise(x1, y1);
        if (noise > 0.5) {
            return tileTypes.ore;
        }
        return tileTypes.stone;
    }
    else if (noise > 0.75 && noise < 0.7501) {
        let clan = XXH.h32(`${x}_${y}`, worldSeed);
        if (!dwarves[clan]) {
            dwarves[clan] = [];
            dwarves[clan].push(new Dwarf(x, y, clan));
        }
        return tileTypes.hall;
    }
    else if (noise > 0.75) {
        return tileTypes.ground;
    }
    else {
        return tileTypes.stone;
    }
}

let p0 = new p5((sketch) => {

    sketch.setup = () => {
        let canvasContainer = $("#canvas-container");
        let canvas = sketch.createCanvas(800, 400);
        canvas.parent("canvas-container");
        sketch.select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;

        camera_offset = new p5.Vector(-sketch.width / 2, sketch.height / 2);
        camera_velocity = new p5.Vector(0, 0);

        canvas.mouseWheel((event) => {
            let dy = event.deltaY;
            let oldZoom = cameraZoom;
            cameraZoom += -Math.sign(dy) * 0.1;
            cameraZoom = Math.max(0.25, cameraZoom);
            cameraZoom = Math.min(7, cameraZoom);
            if (oldZoom == cameraZoom)
                return false;
            tile_width_step_main = tileWidth * cameraZoom;
            tile_height_step_main = tileHeight * cameraZoom;
            tile_columns = Math.ceil(sketch.width / (tile_width_step_main * 2));
            tile_rows = Math.ceil(sketch.height / (tile_height_step_main * 2));
            camera_offset.x *= cameraZoom / oldZoom;
            camera_offset.y *= cameraZoom / oldZoom;
        })

        if (window.p3_setup) {
            window.p3_setup();
        }

        let label = sketch.createP();
        label.html("World key: ");
        label.parent("container");

        let input = sketch.createInput("xyzzy");
        input.parent(label);
        input.input(() => {
            rebuildWorld(input.value());
        });

        tileTypes = {
            stone: {
                upFaceColor: sketch.color("hsl(0, 0%, 59%)"),
                westFaceColor: sketch.color("hsl(20, 7%, 36%)"),
                southFaceColor: sketch.color("hsl(20, 7%, 41%)"),
                description: "Stone",
            },
            ground: {
                upFaceColor: sketch.color("hsl(20, 7%, 51%)"),
                westFaceColor: sketch.color("hsl(20, 7%, 51%)"),
                southFaceColor: sketch.color("hsl(20, 7%, 47%)"),
                description: "Ground",
            },
            ore: {
                upFaceColor: sketch.color("hsl(44, 65%, 68%)"),
                westFaceColor: sketch.color("hsl(44, 65%, 48%)"),
                southFaceColor: sketch.color("hsl(44, 65%, 52%)"),
                description: "Ore",
            },
            hall: {
                upFaceColor: sketch.color("hsl(34, 82%, 30%)"),
                westFaceColor: sketch.color("hsl(33, 82%, 15%)"),
                southFaceColor: sketch.color("hsl(34, 82%, 22%)"),
                description: "Hall",
            }
        };

        baseColor = sketch.color("hsl(20, 7%, 36%)");
        
        sketch.createP("Arrow keys scroll. Clicking changes tiles.").parent("container");
        sketch.noiseDetail(1, 0.25);
        rebuildWorld(input.value());
    }

    function rebuildWorld(key) {
        if (window.p3_worldKeyChanged) {
            window.p3_worldKeyChanged(key);
        }
        tile_width_step_main = window.p3_tileWidth ? window.p3_tileWidth() : 32;
        tile_height_step_main = window.p3_tileHeight ? window.p3_tileHeight() : 16;
        tile_columns = Math.ceil(sketch.width / (tile_width_step_main * 2));
        tile_rows = Math.ceil(sketch.height / (tile_height_step_main * 2));
    }

    sketch.mouseClicked = () => {
    let world_pos = screenToWorld(
        [0 - sketch.mouseX, sketch.mouseY],
        [camera_offset.x, camera_offset.y]
    );

    if (window.p3_tileClicked) {
        window.p3_tileClicked(world_pos[0], world_pos[1]);
    }
    return true;
    }

    sketch.draw = () => {
    // Keyboard controls!
    if (sketch.keyIsDown(sketch.LEFT_ARROW)) {
        camera_velocity.x -= 1;
    }
    if (sketch.keyIsDown(sketch.RIGHT_ARROW)) {
        camera_velocity.x += 1;
    }
    if (sketch.keyIsDown(sketch.DOWN_ARROW)) {
        camera_velocity.y -= 1;
    }
    if (sketch.keyIsDown(sketch.UP_ARROW)) {
        camera_velocity.y += 1;
    }
    let camera_delta = new p5.Vector(0, 0);
    camera_velocity.add(camera_delta);
    camera_offset.add(camera_velocity);
    camera_velocity.mult(0.95); // cheap easing
    if (camera_velocity.mag() < 0.01) {
        camera_velocity.setMag(0);
    }

    let world_pos = screenToWorld(
        [0 - sketch.mouseX, sketch.mouseY],
        [camera_offset.x, camera_offset.y]
    );
    let world_offset = cameraToWorldOffset([camera_offset.x, camera_offset.y]);

    sketch. background(100);

    if (window.p3_drawBefore) {
        window.p3_drawBefore();
    }

    let overdraw = 0.1;

    let y0 = Math.min(Math.floor((0 - overdraw) * tile_rows), -20);
    let y1 = Math.max(Math.floor((1 + overdraw) * tile_rows), 20);
    let x0 = Math.min(Math.floor((0 - overdraw) * tile_columns), -20);
    let x1 = Math.max(Math.floor((1 + overdraw) * tile_columns), 20);

    let offset = {
        top_right: {x: world_pos[0] - sketch.width / 4, y: world_pos[1] - sketch.height / 4}, 
        bottom_left: {x: world_pos[0] + sketch.width / 4, y: world_pos[1] + sketch.height / 4}
    }

    //console.log(offset);

    for (let clan in dwarves) {
        if (Dwarf.clanKnowledge[clan]["hall"]) {
            let hall = Dwarf.clanKnowledge[clan]["hall"][0];
            if (hall.x > offset.top_right.x && hall.x < offset.bottom_left.x && 
                    hall.y < offset.bottom_left.y && hall.y > offset.top_right.y) {
                if (!Dwarf.isClanActive(clan)) {
                    Dwarf.setClanActive(clan, true);
                    activeClans.push(clan);
                }
            }
            else {
                if (Dwarf.isClanActive(clan)) {
                    Dwarf.setClanActive(clan, false);
                    activeClans.splice(activeClans.indexOf(clan), 1);
                }
            }
        }
    }

    for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
            let key = tileRenderingOrder([x + world_offset.x, y - world_offset.y]);
            drawTile(key, [
                camera_offset.x, camera_offset.y]
            ); // odd row
        }
        for (let x = x0; x < x1; x++) {
            let key = tileRenderingOrder([x + 0.5 + world_offset.x, y + 0.5 - world_offset.y]);
            drawTile(
                key,
                [camera_offset.x, camera_offset.y]
            ); // even rows are offset horizontally
        }
    }

    describeMouseTile(world_pos, [camera_offset.x, camera_offset.y]);

    if (window.p3_drawAfter) {
        window.p3_drawAfter();
    }
    }

    // Display a discription of the tile at world_x, world_y.
    function describeMouseTile([world_x, world_y], [camera_x, camera_y]) {
        let [screen_x, screen_y] = worldToScreen(
            [world_x, world_y],
            [camera_x, camera_y]
        );
        drawTileDescription([world_x, world_y], [0 - screen_x, screen_y]);
    }

    function drawTileDescription([world_x, world_y], [screen_x, screen_y]) {
        sketch.push();
        sketch.translate(screen_x, screen_y);
        if (window.p3_drawSelectedTile) {
            window.p3_drawSelectedTile(world_x, world_y, generateTileData(tileRenderingOrder([world_x, world_y])));
        }
        sketch.pop();
    }

    // Draw a tile, mostly by calling the user's drawing code.
    function drawTile([world_x, world_y], [camera_x, camera_y]) {
        let [screen_x, screen_y] = worldToScreen(
            [world_x, world_y],
            [camera_x, camera_y]
        );
        sketch.push();
        sketch.translate(0 - screen_x, screen_y);
        if (window.p3_drawTile) {
            window.p3_drawTile(world_x, world_y, generateTileData([world_x, world_y]));
        }
        sketch.pop();
    }
});
