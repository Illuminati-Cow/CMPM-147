// sketch.js - purpose and description here
// Author: Jaxon Ruiz and Cole Falxa-Sturken

// Date:

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file
const VALUE1 = 1;
const VALUE2 = 2;
const FRAMERATE = 20

// Globals
let myInstance;
let canvasContainer;
var centerHorz, centerVert;
let layersToMake = [Background, Buildings04, Buildings03, Buildings02, Buildings01, Street, River, StaticOverlay];

class LayerManager {
  constructor() {
    this.layers = [];
    layersToMake.forEach((layer) => {
      this.layers.push(new layer());  
    });
  }
  fullDraw() {
    this.layers.forEach((layer) => layer.draw());
  }
}

function resizeScreen() {
  centerHorz = canvasContainer.width() / 2; // Adjusted for drawing logic
  centerVert = canvasContainer.height() / 2; // Adjusted for drawing logic
  console.log("Resizing...");
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
  // redrawCanvas(); // Redraw everything based on new size
}

// setup() function is called once when the program starts
function setup() {
  // place our canvas, making it fit our container
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");
  // resize canvas is the page is resized
  $(window).resize(function() {
    resizeScreen();
  });
  resizeScreen();

  LM = new LayerManager();

  // Set Framerate
  frameRate(FRAMERATE);
}

// draw() function is called repeatedly, it's the main animation loop
function draw() {
  background(220);
  noStroke();
  LM.fullDraw();
}

// mousePressed() function is called once after every time a mouse button is pressed
function mousePressed() {
    // code to run when mouse is pressed
}