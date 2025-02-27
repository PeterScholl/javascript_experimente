const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Globale Konstanten für Schriftgröße und vertikale Positionierung
const fontSize = 20;
const lineOffset = 10; // Abstand vom Bruchstrich
const numYOffset = -fontSize / 3 - lineOffset; // Zähler oberhalb der Mitte
const denYOffset = fontSize + lineOffset;  // Nenner unterhalb der Mitte

let numerator = [22, 36, 35];
let denominator = [20, 28, 72];
let selected = { num: null, den: null };

// Globale Variablen zur Speicherung der berechneten Werte
let maxFactors, boxWidth, totalWidth, startX;

function newTask() {
    // Beispielaufgabe
    numerator = [22, 35, 36];
    denominator = [7, 24, 72, 12];

    // Werte berechnen und in globale Variablen speichern
    maxFactors = Math.max(numerator.length, denominator.length);
    boxWidth = Math.max(getMaxWidth(numerator), getMaxWidth(denominator)) + 20;
    totalWidth = maxFactors * boxWidth;
    startX = (canvas.width - totalWidth) / 2;

    // Bruch zeichnen
    drawFraction();
}


function drawFraction() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px Arial`;

    const centerY = canvas.height / 2;

    // Berechne den maximalen Platzbedarf
    const numWidth = numerator.length * boxWidth;
    const denWidth = denominator.length * boxWidth;
    const maxWidth = Math.max(numWidth, denWidth);

    // Berechne die Startpositionen für Zähler und Nenner (zentriert relativ zur maximalen Breite)
    const numStartX = (canvas.width - maxWidth) / 2 + (maxWidth - numWidth) / 2;
    const denStartX = (canvas.width - maxWidth) / 2 + (maxWidth - denWidth) / 2;

    // Zähler zeichnen
    numerator.forEach((num, i) => {
        const x = numStartX + i * boxWidth;
        ctx.fillText(num, x + (boxWidth - ctx.measureText(num).width) / 2, centerY + numYOffset);

        if (selected.num === i) {
            ctx.strokeRect(x, centerY + numYOffset - fontSize, boxWidth, fontSize + 5);
        }
    });

    // Bruchstrich
    ctx.fillRect((canvas.width - maxWidth) / 2, centerY, maxWidth, 2);

    // Nenner zeichnen
    denominator.forEach((den, i) => {
        const x = denStartX + i * boxWidth;
        ctx.fillText(den, x + (boxWidth - ctx.measureText(den).width) / 2, centerY + denYOffset);

        if (selected.den === i) {
            ctx.strokeRect(x, centerY + denYOffset - fontSize, boxWidth, fontSize + 5);
        }
    });
}


function openInputDialog() {
    const dialog = document.createElement('div');
    dialog.innerHTML = `
    <label for="factorInput">Teiler eingeben:</label>
    <input type="number" id="factorInput" min="1">
    <button id="confirmBtn">Bestätigen</button>
  `;
    dialog.style.position = 'absolute';
    dialog.style.top = '30%';
    dialog.style.left = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.background = 'white';
    dialog.style.padding = '20px';
    dialog.style.border = '1px solid black';
    document.body.appendChild(dialog);

    const input = dialog.querySelector('#factorInput');
    input.focus();

    const confirmBtn = dialog.querySelector('#confirmBtn');
    confirmBtn.addEventListener('click', () => {
        const factor = parseInt(input.value, 10);
        if (!isNaN(factor)) {
            reduceFraction(factor);
            document.body.removeChild(dialog);
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const factor = parseInt(input.value, 10);
            if (!isNaN(factor)) {
                reduceFraction(factor);
                document.body.removeChild(dialog);
            }
        }
    });
}

function reduceFraction(factor) {
    if (selected.num !== null && selected.den !== null) {
        if (numerator[selected.num] % factor === 0 && denominator[selected.den] % factor === 0) {
            numerator[selected.num] /= factor;
            denominator[selected.den] /= factor;
            selected = { num: null, den: null };
            drawFraction();
        } else {
            alert('Ungültige Kürzung!');
        }
    }
}

// Gibt die maximale Breite eines Faktors aus der übergebenen Zahlenliste zurück.
function getMaxWidth(numbers) {
    return numbers.reduce((max, num) => {
        const width = ctx.measureText(num).width;
        return Math.max(max, width);
    }, 0);
}


canvas.addEventListener('click', (e) => {
    const { offsetX, offsetY } = e;

    // Startpositionen aus der drawFraction-Berechnung
    const numStartX = (canvas.width - Math.max(numerator.length * boxWidth, denominator.length * boxWidth)) / 2 + (Math.max(numerator.length * boxWidth, denominator.length * boxWidth) - numerator.length * boxWidth) / 2;
    const denStartX = (canvas.width - Math.max(numerator.length * boxWidth, denominator.length * boxWidth)) / 2 + (Math.max(numerator.length * boxWidth, denominator.length * boxWidth) - denominator.length * boxWidth) / 2;

    // Prüfe Zähler
    numerator.forEach((num, i) => {
        const x = numStartX + i * boxWidth;
        if (offsetX >= x && offsetX <= x + boxWidth && offsetY >= canvas.height / 2 + numYOffset - fontSize && offsetY <= canvas.height / 2 + numYOffset) {
            selected.num = selected.num === i ? null : i; // Toggle Auswahl
        }
    });

    // Prüfe Nenner
    denominator.forEach((den, i) => {
        const x = denStartX + i * boxWidth;
        if (offsetX >= x && offsetX <= x + boxWidth && offsetY >= canvas.height / 2 + denYOffset - fontSize && offsetY <= canvas.height / 2 + denYOffset) {
            selected.den = selected.den === i ? null : i; // Toggle Auswahl
        }
    });

    // Dialog öffnen, wenn Zähler und Nenner ausgewählt sind
    if (selected.num !== null && selected.den !== null) {
        openInputDialog();
    }

    drawFraction();
});


document.getElementById('newTaskBtn').addEventListener('click', newTask);

newTask();
