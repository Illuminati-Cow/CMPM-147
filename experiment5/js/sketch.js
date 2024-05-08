// sketch.js - Procedural Texture Generator
// Author: Cole Falxa-Sturken
// Date: 5/7/2024

/* exported preload, setup, draw */
/* global memory, dropper, restart, rate, slider, activeScore, bestScore, fpsCounter */

let bestDesign;
let currentDesign;
let currentScore;
let currentInspiration;
let currentInspirationIndex;
let currentCanvas;
let currentInspirationImage;
let next;
let prev;
let memory;
let rate;
let slider;
let activeScore, bestScore, nextScore, fpsCounter;
let allInspirations;

// Gen Vars
let population = [];
let populationSize = 50;
let shapeCount = 100;
let shapeMaxSize = 100;
let shapeMinSize = 5;
let survivorCount = 10;
let imageWidth = 160;
let imageHeight = 90;

function preload() {
  
  allInspirations = getInspirations();
  console.log(allInspirations)
  for (let i = 0; i < allInspirations.length; i++) {
    let insp = allInspirations[i];
    insp.image = loadImage(insp.assetUrl);
  }
  next = document.getElementById("next");
  prev = document.getElementById("prev");
  memory = document.getElementById("memory");
  slider = document.getElementById("rate");
  activeScore = $('#activeScore');
  bestScore = $('#bestScore');
  fpsCounter = $('#fpsCounter');
  rate = 0;
  let wrap = (d) => {
    let x = currentInspirationIndex
    if (x + d >= allInspirations.length)
      currentInspirationIndex = x + d - allInspirations.length;
    else if (x + d < 0)
      currentInspirationIndex = x + d + allInspirations.length;
    else
      currentInspirationIndex = x + d;
    return currentInspirationIndex;
  }
  currentInspirationIndex = 0;
  currentInspiration = allInspirations[0];
  next.onclick = e => inspirationChanged(allInspirations[wrap(1)]);
  prev.onclick = e => inspirationChanged(allInspirations[wrap(-1)])
  restart = document.getElementById("restart");
  restart.onclick = () =>
    inspirationChanged(allInspirations[currentInspirationIndex]);
}

function inspirationChanged(nextInspiration) {
  console.log("Inspiration changed")
  console.log(currentInspirationIndex, nextInspiration)
  currentInspiration = nextInspiration;
  currentDesign = undefined;
  memory.innerHTML = "";
  setup();
}

function setup() {
  console.log("Setting up")
  currentCanvas = createCanvas(width, height);
  currentCanvas.parent(document.getElementById("active"));
  currentScore = Number.NEGATIVE_INFINITY;
  currentDesign = initDesign(currentInspiration);
  bestDesign = currentDesign;
  currentInspirationImage = createImage(currentInspiration.image.width, currentInspiration.image.height);
  currentInspirationImage.copy(currentInspiration.image, 0, 0, currentInspiration.image.width, currentInspiration.image.height, 0, 0, currentInspiration.image.width, currentInspiration.image.height);
  currentInspirationImage.resize(width, height);
}

function memorialize() {
  let url = currentCanvas.canvas.toDataURL();

  let img = document.createElement("img");
  img.classList.add("memory");
  img.src = url;
  img.width = width;
  img.height = height;
  img.title = currentScore;

  document.getElementById("best").innerHTML = "";
  document.getElementById("best").appendChild(img.cloneNode());

  img.width = width / 4;
  img.height = height / 4;

  memory.insertBefore(img, memory.firstChild);

  if (memory.childNodes.length > memory.dataset.maxItems) {
    memory.removeChild(memory.lastChild);
  }
}

let mutationCount = 0;

function draw() {
  
  if(!currentDesign) {
    return;
  }
  randomSeed(mutationCount++);
  rate = Number(slider.value);
  let best = createNewGeneration(population, 100);
  currentDesign.score = best.score
  currentDesign.img = best.img;
  randomSeed(0);
  renderDesign(currentDesign);
  nextScore = currentDesign.score;
  activeScore.html(nextScore.toFixed(8).padEnd(8, '0'));
  if (nextScore > currentScore) {
    currentScore = nextScore;
    bestDesign = currentDesign;
    memorialize();
    bestScore.html(currentScore.toFixed(8).padEnd(8, '0'));
  }
  
  fpsCounter.html(Math.round(frameRate()));
}