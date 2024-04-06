// sketch.js
/**
 * This project is a remix of the provided Bad Quest Generator. Instead of generating bad
 * quests, it generates bad political manifestos left after a revolutionary act. The
 * vocabulary lends itself to funny results though some combinations can be a little dark.
 * I was inspired by Mad Libs I used to do as a kid which pushed me towards humorous results.
 * Whenever I did a Mad Libs I would always try to come up with funny and absurd words that
 * would still create a (somewhat) cohesive narrative. The project that I remixed was similar
 * to a Mad Lib already so I only had to make a few alterations to the generation code in order
 * to produce a good output. As for the content, I wrote my own set of filler words that would
 * fall into slots that corresponded to verbs, nouns, idioms, and short phrases. This gives it
 * a bit of a Mad Libs feel as you can tell where a word has been slotted into place.
 */
// Author: Cole Falxa-Sturken
// Date: 4/5/2024

let fillers = {
  introState: [
    "dead",
    "flattened like a pancake",
    "marked for death",
    "sipping margaritas in the Philippines",
    "in hiding",
    "being mocked by the establishment",
    "tied upside down to a flagpole",
    "covered in pigs blood in the depths of their Temple"
  ],
  opressors: [
    "Facists",
    "Neo-Liberals",
    "Shadow Wizards",
    "Falun Gong",
    "Old Brexit Geezers",
    "Top 1%",
    "Capitalists",
    "Small Business Owners",
    "Evangelicals",
    "True Souls"
  ],
  oppressorsPosv: [
    "Facist",
    "Neo-Liberal",
    "Shadow Wizard",
    "Falun Gong\'s",
    "Old Brexit Geezers\'",
    "Top 1%\'s",
    "Capitalists'",
    "Small Business Owners\'",
    "Evangelicals\'",
    "True Souls\'"
  ],
  regimeStyle: [
    "Regime",
    "Cult",
    "Tyranny",
    "Oligarchy",
    "Monarchy",
    "Empire",
    "Republic",
    "Gang",
    "Cabal",
  ],
  positiveAdj: [
    "honest",
    "hard-working",
    "brave",
    "radical",
    "pious",
    "righteous",
  ],
  us: [
    "Patriots",
    "Workers",
    "Citizens"
  ],
  opressionVerb: [
    "muzzled",
    "strangled",
    "supressed",
    "under their yoke",
    "bruised and battered",
    "whipped",
    "under water",
    "in the underdark",
    "struggling",
    "living paycheck to paycheck",
    "under their boot",
    "gagged",
    "coddled",
    "cucked",
    "blinded",
    "in the salt mines"
    
  ],
  difficultyAdj: [
    "desperate",
    "dire",
    "impossible",
    "difficult",
    "whimsical",
    "strenous",
    "radical",
    "lax",
    "bad-vibe",
  ],
  idleVerb: [
    "sit",
    "lull about",
    "list about",
    "walk",
    "stand",
    "continue"
  ],
  aggressiveVerb: [
    "stomp on",
    "chain",
    "beat",
    "steal",
    "pilfer",
    "bully",
    "intimidate",
  ],
  valuableNoun: [
    "money",
    "wallets",
    "children",
    "elderly",
    
  ],
  usPronoun: [
    "brothers",
    "sisters",
    "fellows",
    "folx",
    "bretheren"
  ],
  startExpr: [
    "taken the first step",
    "planted the seed",
  ],
  destructiveVerb: [
    "blown up",
    "leveled",
    "nuclear bombed",
    "burned down",
    "sieged",
    "ransacked",
    "buried",
    "knocked down"
  ],
  importantPlace: [
    "White House",
    "Grand Temple",
    "Trade Center",
    "Pentagon",
    "Capitol Building",
  ],
  moderates: [
    "moderates",
    "middle class",
    "centrists",
    "liberals",
    "conservatives"
  ],
  defensiveIdiom: [
    "pearl-clutch",
    "talk in circles",
    "bury their heads in the sand",
    "balk at radical change",
    "wring their hands"
  ],
  yieldVerb: [
    "yield",
    "bend",
    "give in",
    "submit",
    "prostrate"
  ],
  revoltMetaphor: [
    "Rise up",
    "Revolt",
    "Buck their yoke",
  ],
  violentVerb: [
    "tear down",
    "body slam",
    "karate chop",
    "roundhouse kick",
    "slam dunk",
    "raze",
    "crush",
    "squish"
  ],
};

// Object deep copy from Copilot
const fillersTruth = JSON.parse(JSON.stringify(fillers));
const template = `If you are reading this then I am $introState. The $oppressorsPosv $regimeStyle has kept $positiveAdj $us $opressionVerb for far too long.

$up $difficultyAdj times call for $difficultyAdj measures. I could not $idleVerb idly while these $opressors $aggressiveVerb our $valuableNoun.

If we rise up the $opressors cannot stand against us!

Now is our time $usPronoun. I have $startExpr and $destructiveVerb the $importantPlace.

The $moderates will $defensiveIdiom and call for reform, but we the $us know that the $regimeStyle will never $yieldVerb to our demands.

Do not let my act be in vain. $revoltMetaphor and $violentVerb the $opressors and the the $oppressorsPosv $regimeStyle.
`;

// STUDENTS: You don't need to edit code below this line.

const slotPattern = /\$(\w+)/;
let capitalizeNextWord = false;

function replacer(match, name) {
  let options = fillers[name];
  if (name in fillers && options) {
    let index = Math.floor(Math.random() * options.length)
    let selection = options[index];
    fillers[name] = [selection];
    if (capitalizeNextWord) {
      selection = selection[0].toUpperCase() + selection.substring(1);
      capitalizeNextWord = false;
    }
    return selection;
  } 
  else if (name == 'up') {
    capitalizeNextWord = true;
    return '';
  }
    else {
    return `<UNKNOWN:${name}>`;
  }
}

function generate() {
  let story = template;
  fillers = JSON.parse(JSON.stringify(fillersTruth));
  console.log(fillers);
  while (story.match(slotPattern)) {
    story = story.replace(slotPattern, replacer);
  }
  // Split the story into paragraphs and wrap each in <p> tags. From copilot
  let paragraphs = story.split('\n').map(p => `<p>${p}</p>`).join('');
  $('#story').html(paragraphs);
}

// Add event handler to button
// Credit to Copilot for the jQuery code
$(document).ready(function() {
  $('#generate').click(function() {
    generate();
  });
});

generate();
