// index.js - purpose and description here
// Author: Your Name
// Date:

// make sure document is ready
$(document).ready(function() {
  console.log("Document ready.")

  // Constants

  // Functions

  // this is an example function and this comment tells what it doees and what parameters are passed to it.
  function myFunction(param1, param2) {
    // some code here
    // return results;
  }

  function main() {
    console.log("Main function started.");
    // the code that makes everything happen

    // Put the canvas in fullscreen mode
    $('#fullscreen').click(function() {
      console.log("Going fullscreen.")
      let fs = fullscreen();
      fullscreen(!fs);
    });

    // Listen for fullscreen change events
    $(document).on('fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange', function() {
      if (!fullscreen()) {
        // User has exited fullscreen mode
        $('body').removeClass('is-fullscreen');
      } else {
        // User has entered fullscreen mode
        $('body').addClass('is-fullscreen');
      }
    });
  }


  // Select the element with id "main-nav"
  const mainNav = document.querySelector("#main-nav");
  const homeNav = document.querySelector("#home-nav");


  // Create an array of links
  const links = [
    { text: "Home", url: "./index.html" },
    { text: "Experiment 1", url: "./experiment1/index.html" },
    { text: "Experiment 2", url: "./experiment2/index.html" },
    { text: "Experiment 3", url: "./experiment3/index.html" },
    { text: "Experiment 4", url: "./experiment4/index.html" },
    { text: "Experiment 5", url: "./experiment5/index.html" },
  ];

  // Generate the HTML for the links
  const linksHTML = links.map(link => `<a href=".${link.url}">${link.text}</a>`).join("");
  const homeLinksHTML = links.map(link => `<a href="${link.url}">${link.text}</a>`).join("");

  // Add the links to the innerHTML of the mainNav element
  if (mainNav) 
    mainNav.innerHTML = linksHTML;
  if (homeNav)
    homeNav.innerHTML = homeLinksHTML;

  // Co-Pilot and ...
  // Source: https://stackoverflow.com/a/26230865
  function correctIndentation() {
    let codeNodes = document.querySelectorAll("code");
    console.log("Correcting Code Block Indentation...");
    codeNodes.forEach(function($code) {
        let lines = $code.textContent.split('\n');

        if (lines[0] === '') {
            lines.shift();
        }

        let matches;
        let indentation = (matches = /^[\s\t]+/.exec(lines[0])) !== null ? matches[0] : null;
        if (!!indentation) {
            lines = lines.map(function(line) {
                line = line.replace(indentation, '');
                return line.replace(/\t/g, '    ');
            });

            $code.textContent = lines.join('\n').trim();
        }
    });
    console.log("Corrections Done.");
  }

  document.addEventListener("DOMContentLoaded", correctIndentation);

  // let's get this party started
  main();

})
