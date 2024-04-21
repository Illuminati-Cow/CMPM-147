/* exported preload, setup, draw, placeTile */

/* global generateGrid drawGrid */

let seed = 0;
let tilesetImage;
let currentGrid = [];
let numRows, numCols;
var canvasContainer;
var TILE_SIZE = 8;
var scaleFactor = 2;

function preload() {
  tilesetImage = loadImage(
    "./img/tilesetP8.png"
  );
}

function generateGrid(numCols, numRows) {
    return generateDungeon(numCols, numRows);
}
  
function drawGrid(grid) {
    background(128);
    drawDungeon(grid);
}

function reseed() {
  seed = (seed | 0) + 1109;
  randomSeed(seed);
  noiseSeed(seed);
  select("#reseed-report").html("seed " + seed);
  regenerateGrid();
}

function regenerateGrid() {
  select("#asciiBox").value(gridToString(generateGrid(numCols, numRows)));
  reparseGrid();
}

function reparseGrid() {
  currentGrid = stringToGrid(select("#asciiBox").value());
}

function gridToString(grid) {
  let rows = [];
  for (let i = 0; i < grid.length; i++) {
    rows.push(grid[i].join(""));
  }
  return rows.join("\n");
}

function stringToGrid(str) {
  let grid = [];
  let lines = str.split("\n");
  for (let i = 0; i < lines.length; i++) {
    let row = [];
    let chars = lines[i].split("");
    for (let j = 0; j < chars.length; j++) {
      row.push(chars[j]);
    }
    grid.push(row);
  }
  return grid;
}

function resizeScreen() {
    // Calculate the scale factor
    console.log("Resizing...");
    size = floor(min(canvasContainer.width(), canvasContainer.height()) / 2) * 2;
    let w = size;
    let h = size;
    scaleFactor = size / (numCols * TILE_SIZE);
    console.log("Scale factor: " + scaleFactor);
    console.log("New width: " + w + ", new height: " + h);
    resizeCanvas(w, h, false);
  }

function setup() {
    numCols = select("#asciiBox").attribute("rows") | 0;
    numRows = select("#asciiBox").attribute("cols") | 0;

    // resize canvas is the page is resized
    $(window).resize(function() {
        resizeScreen();
    });

    console.log(select("#asciiBox"))
    canvasContainer = $("#canvas-container");
    let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
    resizeScreen();
    canvas.parent("canvas-container");
    select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;

    select("#reseed-button").mousePressed(reseed);
    select("#asciiBox").input(reparseGrid);

    generateGrid(numCols, numRows);
    reseed();
}


function draw() {
    randomSeed(seed);
    drawGrid(currentGrid);
}