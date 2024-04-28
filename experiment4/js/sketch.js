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

let worldSeed;
const gap_px = 2;

function p3_worldKeyChanged(key) {
  worldSeed = XXH.h32(key, 0);
  p0.noiseSeed(worldSeed);
  p0.randomSeed(worldSeed);
}

function p3_tileWidth() {
  return 32;
}
function p3_tileHeight() {
  return 16;
}

let [tw, th] = [p3_tileWidth(), p3_tileHeight()];

let clicks = {};

function p3_tileClicked(i, j) {
  let key = [i, j];
  clicks[key] = 1 + (clicks[key] | 0);
}

function p3_drawBefore() {}

function p3_drawTile(i, j) {
  p0.noStroke();

  
  p0.push();

  if (XXH.h32("tile:" + [i, j], worldSeed) % 4 == 0) {
    p0.fill(240, 200);
  } else {
    p0.fill(255, 200);
  }
  p0.beginShape();
  p0.vertex(-tw, 0);
  p0.vertex(0, th);
  p0.vertex(tw, 0);
  p0.vertex(0, -th);
  p0.endShape(p0.CLOSE);
  
  let n = clicks[[i, j]] | 0;
  if (n % 2 == 1) {
    let gapw_w = gap_px;
    let gaph_w = -gap_px / 2;
    let gapw_s = -gap_px;
    let gaph_s = -gap_px/2;
    // Draw west and south faces
    p0.fill(100, 100, 100, 255);
    p0.beginShape();

    // If no wall to west then draw gap
    let west = clicks[[i + 1, j]] | 0;
    let west2 = clicks[[i + 2, j]] | 0;
    if ((west % 2 == 1 || west2 % 2 == 0)) {
      gapw_w = 0;
      gaph_w = 0;
    }

    // If no wall to south then draw gap
    let south = clicks[[i, j + 1]] | 0;
    let south2 = clicks[[i , j + 2]] | 0;
    let east = clicks[[i - 1, j]] | 0;
    if ((south % 2 == 1 || south2 % 2 == 0)) {
        gapw_s = 0;
        gaph_s = 0;
    }

    // Base lower center vertex
    p0.vertex(0 + gapw_w + gapw_s, th + gaph_w + gaph_s);

    // Draw west face
    p0.vertex(-tw + gapw_w, gaph_w);
    p0.vertex(-tw + gapw_w, -2*th + gaph_w);
    
    // Base upper center vertex
    p0.vertex(0 + gapw_w + gapw_s, -th + gaph_w + gaph_s);
    
    // Draw south face
    p0.vertex(tw + gapw_s, -2*th + gaph_s);
    p0.vertex(tw + gapw_s, gaph_s);
    p0.endShape(p0.CLOSE);
    // Draw top face
    p0.fill(150, 150, 150, 255);
    p0.beginShape();
    p0.vertex(gapw_w + gapw_s, -th + gaph_w + gaph_s);
    p0.vertex(-tw + gapw_w, -2*th + gaph_w);
    p0.vertex(0, -3*th);
    p0.vertex(tw + gapw_s, -2*th + gaph_s);
    p0.endShape(p0.CLOSE);
  }

  p0.pop();
}

function p3_drawSelectedTile(i, j) {
  p0.noFill();
  p0.stroke(0, 255, 0, 128);

  p0.beginShape();
  p0.vertex(-tw, 0);
  p0.vertex(0, th);
  p0.vertex(tw, 0);
  p0.vertex(0, -th);
  p0.endShape(p0.CLOSE);

  p0.noStroke();
  p0.fill(0);
  p0.text("tile " + [i, j], 0, 0);
}

function p3_drawAfter() {}
