const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Globale Konstanten für Schriftgröße und vertikale Positionierung
let fontSize = 20;
spacing = fontSize / 2; // Abstand für den Punkt
const lineOffset = 10; // Abstand vom Bruchstrich
const numYOffset = -fontSize / 3 - lineOffset; // Zähler oberhalb der Mitte
const denYOffset = fontSize + lineOffset;  // Nenner unterhalb der Mitte

let numerator = [
    { value: 22, x: 0, y: 0 },
    { value: 36, x: 0, y: 0 },
    { value: 35, x: 0, y: 0 }
];

let denominator = [
    { value: 20, x: 0, y: 0 },
    { value: 28, x: 0, y: 0 },
    { value: 72, x: 0, y: 0 }
];
let selected = { num: null, den: null };

// Globale Variablen zur Speicherung der berechneten Werte
let maxFactors, boxWidth, boxHeight, totalWidth, startX;

// Schriftgröße anpassen
const increaseFontBtn = document.querySelector('#increaseFontBtn');
const decreaseFontBtn = document.querySelector('#decreaseFontBtn');

increaseFontBtn.addEventListener('click', () => {
    fontSize += 2;
    updatePositions();
    drawFraction();
});

decreaseFontBtn.addEventListener('click', () => {
    fontSize = Math.max(10, fontSize - 2); // Mindestgröße 10
    updatePositions();
    drawFraction();
});

// Tastatursteuerung
document.addEventListener('keydown', (e) => {
    if (e.key === '+') {
        fontSize += 2;
        updatePositions();
        drawFraction();
    }
    if (e.key === '-') {
        fontSize = Math.max(10, fontSize - 2);
        updatePositions();
        drawFraction();
    }
});


function newTask() {
    // Beispielaufgabe
    numerator = [
        { value: 22, x: 0, y: 0 },
        { value: 36, x: 0, y: 0 },
        { value: 35, x: 0, y: 0 }
    ];

    denominator = [
        { value: 20, x: 0, y: 0 },
        { value: 42, x: 0, y: 0 },
        { value: 128, x: 0, y: 0 },
        { value: 72, x: 0, y: 0 }
    ];

    // Werte berechnen und in globale Variablen speichern
    maxFactors = Math.max(numerator.length, denominator.length);
    boxWidth = Math.max(getMaxWidth(numerator), getMaxWidth(denominator)) + 20;
    totalWidth = maxFactors * boxWidth;
    startX = (canvas.width - totalWidth) / 2;

    // Positionen berechnen
    updatePositions();

    // Bruch zeichnen
    drawFraction();
}

function updatePositions() {
    boxHeight = fontSize * 1.5; // Dynamische Box-Höhe
    const offsetY = fontSize; // Vertikaler Abstand von der Mitte

    // Dynamische Werte basierend auf den aktuellen Faktoren berechnen
    const maxFactors = Math.max(numerator.length, denominator.length);
    boxWidth = Math.max(getMaxWidth(numerator), getMaxWidth(denominator)) + 20;
    const totalWidth = maxFactors * boxWidth;
    const startX = (canvas.width - totalWidth) / 2;

    // Zentrierte Startpositionen für Zähler und Nenner
    let numStartX = startX + (maxFactors - numerator.length) * boxWidth / 2 - (numerator.length - 1) * spacing / 2;
    let denStartX = startX + (maxFactors - denominator.length) * boxWidth / 2 - (denominator.length - 1) * spacing / 2;


    numerator.forEach((item, i) => {
        item.x = numStartX + i * (boxWidth + spacing);
        item.y = canvas.height / 2 - offsetY - boxHeight / 2;
    });

    denominator.forEach((item, i) => {
        item.x = denStartX + i * (boxWidth + spacing);
        item.y = canvas.height / 2 + offsetY / 2;
    });

    console.log("Numerator", numerator);
}


function drawFraction() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Bruchstrich zeichnen
    const lineY = canvas.height / 2;

    // Berechne die maximale Anzahl an Spacings (Abstände zwischen den Boxen)
    const maxSpacingCount = Math.max(numerator.length, denominator.length) - 1;
    const totalSpacing = maxSpacingCount * spacing;

    // Berechne die tatsächliche Breite des Bruchstrichs
    const maxWidth = Math.max(
        numerator.length * boxWidth + totalSpacing,
        denominator.length * boxWidth + totalSpacing
    );

    const lineStartX = (canvas.width - maxWidth) / 2;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lineStartX, lineY);
    ctx.lineTo(lineStartX + maxWidth, lineY);
    ctx.stroke();

    // Zähler zeichnen
    for (let i = 0; i < numerator.length; i++) {
        const item = numerator[i];
        drawBox(item.x, item.y, boxWidth, boxHeight, item.value, selected.num === i);

        // Punkt zwischen den Boxen zeichnen
        if (i < numerator.length - 1) {
            ctx.beginPath();
            ctx.arc(item.x + boxWidth + spacing / 2, item.y + boxHeight / 2, fontSize / 8, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    // Nenner zeichnen
    for (let i = 0; i < denominator.length; i++) {
        const item = denominator[i];
        drawBox(item.x, item.y, boxWidth, boxHeight, item.value, selected.den === i);

        // Punkt zwischen den Boxen zeichnen
        if (i < denominator.length - 1) {
            ctx.beginPath();
            ctx.arc(item.x + boxWidth + spacing / 2, item.y + boxHeight / 2, fontSize / 8, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}

function drawBox(x, y, width, height, value, isSelected) {
    ctx.save();
    ctx.font = `${fontSize}px Arial`;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Rahmen zeichnen, wenn ausgewählt
    if (isSelected) {
        console.log("Rect", x, y, width, height);
        ctx.strokeRect(x, y, width, height);
    }

    //console.log("Zahl zeichnen:", value);
    //console.log(`x: ${x}, y: ${y}, value: ${value}`);
    //console.log(`Font size: ${fontSize}`);


    // Zahl zentriert im Kasten anzeigen
    ctx.fillStyle = "black"; // Textfarbe auf Schwarz setzen
    ctx.fillText(value, Math.round(x + width / 2), Math.round(y + height / 2));
    ctx.restore();
}


function openInputDialog() {
    // Overlay erstellen
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'flex-start';
    overlay.style.paddingTop = '20vh';
    overlay.style.zIndex = '1000'; // Über allem

    // Dialog erstellen
    const dialog = document.createElement('div');
    dialog.innerHTML = `
      <label for="factorInput">Teiler eingeben:</label>
      <input type="number" id="factorInput" min="1">
      <button id="confirmBtn">Bestätigen</button>
    `;
    dialog.style.background = 'white';
    dialog.style.padding = '20px';
    dialog.style.border = '1px solid black';
    dialog.style.borderRadius = '10px';
    dialog.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    overlay.appendChild(dialog);

    // Overlay zum DOM hinzufügen
    document.body.appendChild(overlay);

    // Input-Feld fokussieren
    const input = dialog.querySelector('#factorInput');
    input.focus();

    // Bestätigungsfunktion
    function closeAndProcess() {
        const factor = parseInt(input.value, 10);
        if (!isNaN(factor)) {
            reduceFraction(factor);
            document.body.removeChild(overlay);
        }
    }

    // Event-Listener für Button und Enter-Taste
    dialog.querySelector('#confirmBtn').addEventListener('click', closeAndProcess);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') closeAndProcess();
    });

    // Schließen bei Klick außerhalb des Dialogs
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
}

function reduceFraction(factor) {
    if (selected.num !== null && selected.den !== null) {
        if (numerator[selected.num].value % factor === 0 && denominator[selected.den].value % factor === 0) {
            numerator[selected.num].value /= factor;
            denominator[selected.den].value /= factor;
            numerator = removeOnes(numerator);
            denominator = removeOnes(denominator);
            updatePositions();
        } else {
            alert('Ungültige Kürzung!');
        }
        selected = { num: null, den: null };
        drawFraction();
    }
}

function removeOnes(list) {
    const originalLength = list.length;
    list = list.filter(item => item.value !== 1);

    // Falls sich etwas geändert hat, Positionen aktualisieren
    if (list.length !== originalLength) {
        console.log("Eine 1 wurde herausgenommen", JSON.stringify(list));
    }
    return list;
}


// Gibt die maximale Breite eines Faktors aus der übergebenen Zahlenliste zurück.
function getMaxWidth(numbers) {
    ctx.font = `${fontSize}px Arial`; // Aktualisiere die Schriftgröße
    return numbers.reduce((max, num) => {
        const width = ctx.measureText(num.value).width;
        return Math.max(max, width);
    }, 0);
}


canvas.addEventListener('click', (e) => {
    const { offsetX, offsetY } = e;

    // Prüfe Zähler
    numerator.forEach((num, i) => {
        if (
            offsetX >= num.x &&
            offsetX <= num.x + boxWidth &&
            offsetY >= num.y &&
            offsetY <= num.y + boxHeight
        ) {
            selected.num = selected.num === i ? null : i; // Toggle Auswahl
        }
    });

    // Prüfe Nenner
    denominator.forEach((den, i) => {
        if (
            offsetX >= den.x &&
            offsetX <= den.x + boxWidth &&
            offsetY >= den.y &&
            offsetY <= den.y + boxHeight
        ) {
            selected.den = selected.den === i ? null : i; // Toggle Auswahl
            console.log("Selected: ", den, i);
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
