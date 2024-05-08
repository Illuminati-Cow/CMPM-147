// sketch.js - purpose and description here
// Author: Your Name
// Date:

/* exported preload, setup, draw */
/* global memory, dropper, restart, rate, slider, activeScore, bestScore, fpsCounter */

let bestDesign;
let currentDesign;
let currentScore;
let currentInspiration;
let currentInspirationIndex;
let currentCanvas;
let currentInspirationPixels;
let next;
let prev;
let memory;
let rate;
let slider;
let activeScore, bestScore, nextScore;

function preload() {
  
  let allInspirations = getInspirations();
  console.log(allInspirations)
  for (let i = 0; i < allInspirations.length; i++) {
    let insp = allInspirations[i];
    insp.image = loadImage(insp.assetUrl);
  }
  next = $('#next');
  prev = $('#prev');
  memory = document.getElementById("memory")
  slider = $('slider');
  activeScore = $('#activeScore');
  bestScore = $('bestScore');
  rate = 0;
  let wrap = (d) => {
    let x = currentInspiration
    if (x + d >= allInspirations.length)
      currentInspiration = x + d - allInspirations.length;
    else if (x + d < 0)
      currentInspiration = x + d + allInspirations.length;
    else
      currentInspiration = x + d;
    return currentInspiration;
  }
  next.onclick = e => inspirationChanged(allInspirations[wrap(currentInspirationIndex, 1)]);
  prev.onclick = e => inspirationChanged(allInspirations[wrap(currentInspirationIndex, -1)])
  currentInspiration = allInspirations[0];

  restart.onclick = () =>
    inspirationChanged(allInspirations[currentInspirationIndex]);
}

function inspirationChanged(nextInspiration) {
  currentInspiration = nextInspiration;
  currentDesign = undefined;
  memory.innerHTML = "";
  setup();
}

function setup() {
  currentCanvas = createCanvas(width, height);
  currentCanvas.parent(document.getElementById("active"));
  currentScore = Number.NEGATIVE_INFINITY;
  currentDesign = initDesign(currentInspiration);
  bestDesign = currentDesign;
  image(currentInspiration.image, 0,0, width, height);
  loadPixels();
  currentInspirationPixels = pixels;
}

function evaluate() {
  loadPixels();

  let error = 0;
  let n = pixels.length;
  
  for (let i = 0; i < n; i++) {
    error += sq(pixels[i] - currentInspirationPixels[i]);
  }
  return 1/(1+error/n);
}

function memorialize() {
  let url = currentCanvas.canvas.toDataURL();

  let img = document.createElement("img");
  img.classList.add("memory");
  img.src = url;
  img.width = width;
  img.heigh = height;
  img.title = currentScore;

  document.getElementById("best").innerHTML = "";
  document.getElementById("best").appendChild(img.cloneNode());

  img.width = width / 2;
  img.height = height / 2;

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
  currentDesign = JSON.parse(JSON.stringify(bestDesign));
  ($('#rate')).innerHTML = slider.value;
  mutateDesign(currentDesign, currentInspiration, slider.value/100.0);
  
  randomSeed(0);
  renderDesign(currentDesign, currentInspiration);
  let nextScore = evaluate();
  activeScore.innerHTML = nextScore;
  if (nextScore > currentScore) {
    currentScore = nextScore;
    bestDesign = currentDesign;
    memorialize();
    bestScore.innerHTML = currentScore;
  }
  
  fpsCounter.innerHTML = Math.round(frameRate());
}