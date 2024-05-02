"use strict";

/* global XXH */
/* exported --
    p3_preload
    p3_setup
    p3_worldKeyChanged
    p3_tileWidth
    p3_tileHeight
    p3_tileClicked
    p3_drawBefore
    p3_drawTile
    p3_drawSelectedTile
    p3_drawAfter
*/

function p3_preload() {}

function p3_setup() {}

var pg = new p5((sketch) => {
  sketch.setup = () => {
    sketch.noiseDetail(oreNoiseOctaves, 0.25);
  };
});

let worldSeed;
const gap_px = 2;
var tileWidth = 32;
var tileHeight = 16;
let buffer = [];

function p3_worldKeyChanged(key) {
  worldSeed = XXH.h32(key, 0);
  p0.noiseSeed(worldSeed);
  p0.randomSeed(worldSeed);
}

function p3_tileWidth() {
  return tileWidth;
}
function p3_tileHeight() {
  return tileHeight;
}

let [tw, th] = [tileWidth, tileHeight];

let clicks = {};

function p3_tileClicked(i, j) {
  let key = [i, j];
  clicks[key] = 1 + (clicks[key] | 0);
}

function p3_drawBefore() {
  [tw, th] = [tileWidth * cameraZoom, tileHeight * cameraZoom];
}

function p3_drawTile(i, j, tileData) {
  p0.noStroke();
  let hash = XXH.h32(`${i}_${j}`, worldSeed);

  p0.push();

  let tile = tileData

  if (isGround(i, j)) {
    p0.fill(tileTypes.ground.upFaceColor);
    if(!isGround(i, j + 1))
      p0.fill(tileTypes.ground.southFaceColor);
    p0.beginShape();
    p0.vertex(-tw - gap_px, -gap_px / 2);
    p0.vertex(0, th);
    p0.vertex(tw + gap_px, 0 - gap_px / 2); 
    p0.vertex(0 + gap_px, -th - gap_px / 2);
    p0.vertex(0, -th);
    p0.vertex(0 - gap_px, -th - gap_px / 2);
    p0.endShape(p0.CLOSE);
    p0.pop();
    drawDwarve(i, j);
    return;
  }
  else if (tile.description == "Ground") {
    tile = tileTypes.stone;
  }
  
  let gapw_w = 0, gaph_w = 0, gapw_s = 0, gaph_s = 0;
  // Draw west and south faces
  p0.fill(baseColor)
  p0.beginShape();

  // If no wall to west then draw gap
  if (isGround(i + 1, j)) {
    gapw_w = gap_px;
    gaph_w = -gap_px / 2;
    p0.fill(tile.westFaceColor)
  }

  // If no wall to south then draw gap
  if (isGround(i, j + 1)) {
    gapw_s = -gap_px;
    gaph_s = -gap_px/2;
  }

  // Base lower center vertex
  p0.vertex(0 + gapw_w + gapw_s, th + gaph_w + gaph_s);

  // Draw west face
  p0.vertex(-tw + gapw_w, gaph_w);
  p0.vertex(-tw + gapw_w, -2*th + gaph_w);
  p0.vertex(0 + gapw_w + gapw_s, -th + gaph_w + gaph_s);
  p0.vertex(0 + gapw_w + gapw_s, th + gaph_w + gaph_s);
  p0.endShape(p0.CLOSE);
  
  // Draw south face
  p0.beginShape();
  // If corridor gap then draw lighter to simulate light
  if (gapw_s != 0) {
    p0.fill(tile.southFaceColor);
  }
  p0.vertex(0 + gapw_w + gapw_s, th + gaph_w + gaph_s);
  p0.vertex(0 + gapw_w + gapw_s, -2*th + gaph_s);
  p0.vertex(tw + gapw_s, -2*th + gaph_s);
  p0.vertex(tw + gapw_s, gaph_s);
  p0.endShape(p0.CLOSE);

  // Draw top face
  p0.fill(tile.upFaceColor);
  p0.beginShape();
  p0.vertex(gapw_w + gapw_s, -th + gaph_w + gaph_s);
  p0.vertex(-tw + gapw_w, -2*th + gaph_w);
  p0.vertex(0, -3*th);
  p0.vertex(tw + gapw_s, -2*th + gaph_s);
  p0.endShape(p0.CLOSE);

  drawDwarve(i, j);
  p0.pop();
}

function p3_drawSelectedTile(i, j, tileData) {
  p0.noFill();
  p0.stroke("hsl(40, 44%, 57%)");

  p0.beginShape();
  p0.vertex(-tw, 0);
  p0.vertex(0, th);
  p0.vertex(tw, 0);
  p0.vertex(0, -th);
  p0.endShape(p0.CLOSE);

  p0.noStroke();
  p0.fill(0);
  let type = generateTileData([i, j]);
  if (tileData != null)
    type = type.description;
  if (isGround(i, j)) {
    type = "Ground";
  }
  else if (type == "Ground" && !isGround(i, j)) {
    type = "Stone";
  }
  p0.text("tile " + [i, j, " " + type], p3_tileWidth(), p3_tileHeight());
}

function isGround(i, j) {
  let tile = generateTileData([i, j]);
  let clicked = (clicks[[i, j]] | 0) % 2 == 1;
  let ground = tile.description == "Ground";
  return (!clicked && ground) || (clicked && !ground);
}

function getTile(i, j) {
  let tile = generateTileData([i, j]);
  if (tile.description == "Ground" && !isGround(i, j)) {
    return tileTypes.stone;
  }
  else if (isGround(i, j)) {
    return tileTypes.ground;
  }
  return tile.description.toLowerCase();
}

function p3_drawAfter() {
  
}

function drawDwarve(i, j) {
  for (let clan of activeClans) {
    for (let dwarf of Dwarf.clanKnowledge[clan]["dwarf"]) {
      if (dwarf.position.x == i && dwarf.position.y == j) {
        dwarf.draw();
        dwarf.update();
      }
    }
  }
}
