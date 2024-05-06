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