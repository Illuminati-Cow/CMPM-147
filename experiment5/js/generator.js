/* exported p4_inspirations, p4_initialize, p4_render, p4_mutate */


function getInspirations() {
    return [
      {
        name: "San Sebastian", 
        assetUrl: "img/san-sebastian.png",
        credit: "San Sebastian, Peeter Viisimaa, 2018"
      },
      {
        name: "Soviet-Era Women's Empowerment Poster", 
        assetUrl: "img/soviet-poster.jpg",
        credit: "Glory to female soviet workers!, Grinshtein, Isaak Khaskelevich, 1960"
      },
    ];
  }
  
  function initDesign(inspiration) {
    // set the canvas size based on the container
    let canvasContainer = $('#active'); // Select the container using jQuery
    let canvasWidth = canvasContainer.width(); // Get the width of the container
    let aspectRatio = inspiration.image.height / inspiration.image.width;
    let canvasHeight = canvasWidth * aspectRatio; // Calculate the height based on the aspect ratio
    resizeCanvas(canvasWidth, canvasHeight);
    currentInspirationImage = createImage(currentInspiration.image.width, currentInspiration.image.height);
    currentInspirationImage.copy(currentInspiration.image, 0, 0, currentInspiration.image.width, currentInspiration.image.height, 0, 0, currentInspiration.image.width, currentInspiration.image.height);
    currentInspirationImage.resize(imageWidth, imageHeight);
    $(".caption").text(inspiration.credit); // Set the caption text
  
    // add the original image to #original
    $('#original').attr('src', `${inspiration.assetUrl}`)
  
    
    currentInspirationImage.loadPixels();
    let design = {
      img: null,
      score: Number.NEGATIVE_INFINITY
    }
    for (let i = 0; i < populationSize; i++) {
      let seq = createGeneticSequence();
      population.push(seq);
    }
    let best = createNewGeneration(0);
    design.score = best.score;
    design.img = best.img;
    return design;
  }
  
  function renderDesign(design) {
    background(0);
    image(design.img, 0, 0, currentInspirationImage.width, currentInspirationImage.height);
    scale(4);
  }
  
  function createNewGeneration(rate) {
    rate = 50
    console.log(typeof rate, rate)
    currentInspirationImage.loadPixels();
    let truthPixels = currentInspirationImage.pixels;
    let nBest = nBestSequences(survivorCount, population, truthPixels);
    // Cross best sequences
    let newPopulation = [];
    let j = 0;
    for(let i = 0; i < population.length; i++) {
      let seq1 = nBest[j++ % nBest.length];
      let seq2 = nBest[j++ % nBest.length];
      let newSequence = crossSequences(seq1, seq2);
      mutateSequence(newSequence, rate);
      newPopulation.push(newSequence);
    }
    // Debug
    let isPopulationEqual = JSON.stringify(population) === JSON.stringify(newPopulation);
    console.log("Is population equal to newPopulation?", isPopulationEqual);
    population = newPopulation;
    return nBest[0];
  }

  function crossSequences(seq1, seq2) {
    let sequence = [];
    for(let i = 0; i < shapeCount; i++) {
      let gene = random(1) > 0.5 ? seq1[i] : seq2[i];
      sequence.push(gene);
    }
    return sequence;
  }

  // Mutate genetic sequence passed in as reference
  function mutateSequence(sequence, rate) {
    console.log(typeof rate, rate)
    for(let i = 0; i < sequence.length; i++) {
      if (random(100) < rate) {
        let gene = sequence[i];
        let newGene = {
          x: mut(gene.x, 0, imageWidth, rate),
          y: mut(gene.y, 0, imageHeight, rate),
          w: mut(gene.w, shapeMinSize, shapeMaxSize, rate),
          h: mut(gene.h, shapeMinSize, shapeMaxSize, rate),
          fill: mutColor(gene.fill, rate)
        }
        sequence[i] = newGene;
      }
    }
  }

function createGeneticSequence() {
  let sequence = [];
  for(let i = 0; i < shapeCount; i++) {
    let gene = {
      x: int(random(imageWidth)),
      y: int(random(imageHeight)),
      w: int(random(shapeMinSize, shapeMaxSize)),
      h: int(random(shapeMinSize, shapeMaxSize)),
      fill: {r: int(random(255)), g: int(random(255)), b: int(random(255)), a: 255}
    }
    sequence.push(gene);
  }
  return sequence;
}


function nBestSequences(n, population, truthPixels) {
  let scores = [];
  for(let i = 0; i < population.length; i++) {
    let [score, img] = evaluateSequence(population[i], truthPixels);
    scores.push({score: score, index: i, img: img});
  }
  scores.sort((a, b) => b.score - a.score);
  let best = [];
  for(let i = 0; i < n; i++) {
    best.push(population[scores[i].index]);
    best[i].score = scores[i].score;
    best[i].img = scores[i].img;
  }
  return best;
}


function evaluateSequence(sequence, truthPixels) {
  let seqImg = renderSequence(sequence);
  seqImg.loadPixels();
  let score = evaluate(seqImg.pixels, truthPixels);
  return [score, seqImg];
}

function renderSequence(sequence) {
  let seqImg = createImage(imageWidth, imageHeight);
  seqImg.loadPixels();
  for (let gene of sequence) {
    renderGene(gene, seqImg.pixels);
  }
  seqImg.updatePixels();
  return seqImg;
}

function renderGene(gene, pixels) {
  let x1 = constrain(gene.x, 0, imageWidth);
  let y1 = constrain(gene.y, 0, imageHeight);
  let x2 = constrain(gene.x + gene.w, 0, imageWidth);
  let y2 = constrain(gene.y + gene.h, 0, imageHeight);
  for(let y = y1; y < y2; y++) {
    for(let x = x1; x < x2; x++) {
      let i = (y * imageWidth + x) * 4;
      pixels[i] = gene.fill.r;
      pixels[i + 1] = gene.fill.g;
      pixels[i + 2] = gene.fill.b;
      pixels[i + 3] = gene.fill.a;
    }
  }
}

// Helper functions for mutation

function mut(num, min, max, rate) {
  return int(constrain(randomGaussian(num, (rate * (max - min)) / 10), min, max));
}

function mutColor(color, rate) {
  return {
  r: mut(color.r, 0, 255, rate),
  g: mut(color.g, 0, 255, rate),
  b: mut(color.b, 0, 255, rate),
  a: 255
  }
}

function getAverageColor(pixels) {
  let r = 0;
  let g = 0;
  let b = 0;
  let n = pixels.length;
  for (let i = 0; i < n; i+=4) {
    r += pixels[i];
    g += pixels[i + 1];
    b += pixels[i + 2];
  }
  return {r: r/n, g: g/n, b: b/n, a: 255}
}

function evaluate(imagePixels, truthPixels) {
  let error = 0;
  let n = imagePixels.length;
  
  for (let i = 0; i < n; i+=4) {
    // Source https://www.compuphase.com/cmetric.htm
    let rmean = (imagePixels[i] + truthPixels[i]) / 2;
    let r = imagePixels[i] - truthPixels[i];
    let g = imagePixels[i + 1] - truthPixels[i + 1];
    let b = imagePixels[i + 2] - truthPixels[i + 2];
    let sq = (x) => x * x;
    error += sqrt((2 + rmean / 256) * sq(r) + 4 * sq(g) + (2 + (255 - rmean) / 256) * sq(b));
  }
  return 1/(1+error/n);
}