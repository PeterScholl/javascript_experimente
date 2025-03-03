//TODO
// 1.) Aufgaben ERstellng mit verschiedenen Schwierigkeitsgeraden
// Primfaktoren min max, anz primzahlen, gleiche Primfaktoren in Zähler und Nenner, Anz Faktoren
// 2.) Timer für 5-10 Aufgaben

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

let successCount = 0;
let errorCount = 0;
let timeElapsed = 0;
let timerRunning = false; // Überwacht den Timer-Status
let timerID = null; //ID für den Timer zum Stoppen


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

// Timer starten
function startTimer() {
    timerID = setInterval(() => {
        timeElapsed += 0.1;
        document.getElementById('timer').textContent = `${timeElapsed.toFixed(1)} s`;
    }, 100);
}

// Erhöht den Zähler
function updateStats(isSuccess) {
    if (isSuccess) {
        successCount++;
        showToast("Erfolg!", "green");
        if (successCount === 5 && timerID) {
            clearInterval(timerID); // Timer stoppen
        }
    } else {
        errorCount++;
        showToast("Fehler!", "red");
    }

    document.getElementById('successCount').textContent = successCount;
    document.getElementById('errorCount').textContent = errorCount;
}


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

    const fraction = generateRandomFraction(20, 8, 8, 3, 2);
    console.log("Random values:", fraction.numerator, fraction.denominator);
    numerator = fraction.numerator;
    denominator = fraction.denominator;

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

    // Dynamische Breite pro Faktor
    boxWidth = Math.max(getMaxWidth(numerator), getMaxWidth(denominator)) + 20;

    // Breite der gesamten Darstellung berechnen
    const totalNumWidth = numerator.length * boxWidth + (numerator.length - 1) * spacing;
    const totalDenWidth = denominator.length * boxWidth + (denominator.length - 1) * spacing;

    // Berechnung der Mitte des Canvas
    const centerX = canvas.offsetWidth / 2;

    // Zentrierte Startposition für Zähler und Nenner
    let numStartX = centerX - totalNumWidth / 2;
    let denStartX = centerX - totalDenWidth / 2;

    // Dynamische Werte basierend auf den aktuellen Faktoren berechnen
    //const maxFactors = Math.max(numerator.length, denominator.length);
    //boxWidth = Math.max(getMaxWidth(numerator), getMaxWidth(denominator)) + 20;
    //const totalWidth = maxFactors * boxWidth;
    //const startX = (canvas.width - totalWidth) / 2;

    // Zentrierte Startpositionen für Zähler und Nenner
    //let numStartX = startX + (maxFactors - numerator.length) * boxWidth / 2 - (numerator.length - 1) * spacing / 2;
    //let denStartX = startX + (maxFactors - denominator.length) * boxWidth / 2 - (denominator.length - 1) * spacing / 2;


    numerator.forEach((item, i) => {
        item.x = numStartX + i * (boxWidth + spacing);
        item.y = canvas.offsetHeight / 2 - offsetY - boxHeight / 2;
    });

    denominator.forEach((item, i) => {
        item.x = denStartX + i * (boxWidth + spacing);
        item.y = canvas.offsetHeight / 2 + offsetY / 2;
    });

    console.log("Numerator", numerator);
}


function drawFraction() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Bruchstrich zeichnen
    const lineY = canvas.offsetHeight / 2;

    // Berechne die maximale Anzahl an Spacings (Abstände zwischen den Boxen)
    const maxSpacingCount = Math.max(numerator.length, denominator.length) - 1;
    const totalSpacing = maxSpacingCount * spacing;

    // Berechne die tatsächliche Breite des Bruchstrichs
    const maxWidth = Math.max(
        numerator.length * boxWidth + totalSpacing,
        denominator.length * boxWidth + totalSpacing
    );

    const lineStartX = (canvas.offsetWidth - maxWidth) / 2;
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
    overlay.style.paddingTop = '5vh';
    overlay.style.zIndex = '1000'; // Über allem

    // Dialog erstellen
    const dialog = document.createElement('div');
    const factorText = `Gemeinsamer Teiler von<br>${numerator[selected["num"]].value} und ${denominator[selected["den"]].value}:`;
    dialog.innerHTML = `
        <p>${factorText}</p>
        <input type="number" id="factorInput" min="1" inputmode="none">
        <div id="numPad">
            <div>${[1, 2, 3].map(n => `<button>${n}</button>`).join('')}</div>
            <div>${[4, 5, 6].map(n => `<button>${n}</button>`).join('')}</div>
            <div>${[7, 8, 9].map(n => `<button>${n}</button>`).join('')}</div>
            <div><button id="del">⌫</button><button>0</button><button id="enter">↵</button></div>
        </div>
        `;
    dialog.style.background = 'white';
    dialog.style.padding = '20px';
    dialog.style.border = '1px solid black';
    dialog.style.borderRadius = '10px';
    dialog.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';

    overlay.appendChild(dialog);

    // Overlay zum DOM hinzufügen
    document.body.appendChild(overlay);


    // Tastatur-Funktionalität
    const input = dialog.querySelector('#factorInput');
    const numPad = dialog.querySelector('#numPad');
    // Prüfen, ob das Gerät mobil ist
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // Nur auf Mobilgeräten readonly setzen
    if (isMobile) {
        input.setAttribute('readonly', true);
    }
    numPad.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            if (e.target.id === 'del') {
                input.value = input.value.slice(0, -1);
            } else if (e.target.id === 'enter') {
                closeAndProcess();
            } else {
                input.value += e.target.textContent;
            }
        }
    });



    // Input-Feld fokussieren
    input.focus();

    // Bestätigungsfunktion
    function closeAndProcess() {
        const factor = parseInt(input.value, 10);
        if (!isNaN(factor)) {
            reduceFraction(factor);
            document.body.removeChild(overlay);
        }
    }

    // Event-Listener für Enter-Taste
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') closeAndProcess();
    });

    // Schließen bei Klick außerhalb des Dialogs
    // overlay.addEventListener('click', (e) => {
    //     if (e.target === overlay) {
    //         document.body.removeChild(overlay);
    //     }
    // });
}

function reduceFraction(factor) {
    if (selected.num !== null && selected.den !== null) {
        if (numerator[selected.num].value % factor === 0 && denominator[selected.den].value % factor === 0) {
            numerator[selected.num].value /= factor;
            denominator[selected.den].value /= factor;
            numerator = removeOnes(numerator);
            denominator = removeOnes(denominator);
            if (isFullyReduced(numerator, denominator)) {
                updateStats(true);
                newTask();
            }
            updatePositions();
        } else {
            //alert('Ungültige Kürzung!');
            updateStats(false);
        }
        selected = { num: null, den: null };
        drawFraction();
    }
}

function removeOnes(list) {
    if (list.length <= 1) return list;
    list = list.filter(item => item.value !== 1);
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

function handleClick(offsetX, offsetY) {
    if (!timerRunning) {
        console.log("Starte Timer");
        timerRunning = true;
        startTimer(); // Timer starten
    }
    
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
        console.log(numerator[selected.num], denominator[selected.den]);
        if (numerator[selected.num].value === denominator[selected.den].value) {
            reduceFraction(numerator[selected.num].value);
        } else {
            openInputDialog();
        }
    }

    drawFraction();
}

canvas.addEventListener('click', (e) => {
    const { offsetX, offsetY } = e;
    handleClick(offsetX, offsetY);
});

function generateRandomFraction(maxPrime, numFactorsNum, numFactorsDen, commonFactors, groupSize) {
    const primes = getPrimesUpTo(maxPrime);

    // Zufällige Primfaktoren auswählen
    const common = getRandomElements(primes, commonFactors);
    const uniqueNum = getRandomElements(primes, numFactorsNum - commonFactors);
    const uniqueDen = getRandomElements(primes, numFactorsDen - commonFactors);

    // Zähler und Nenner zusammenstellen
    const numeratorFactors = shuffle([...common, ...uniqueNum]);
    const denominatorFactors = shuffle([...common, ...uniqueDen]);

    // In Gruppen zusammenfassen
    const numerator = groupFactors(numeratorFactors, groupSize);
    const denominator = groupFactors(denominatorFactors, groupSize);

    return { numerator, denominator };
}

// Hilfsfunktion: Erzeugt eine Liste aller Primzahlen bis max
function getPrimesUpTo(max) {
    const sieve = Array(max + 1).fill(true);
    sieve[0] = sieve[1] = false;
    for (let i = 2; i * i <= max; i++) {
        if (sieve[i]) {
            for (let j = i * i; j <= max; j += i) {
                sieve[j] = false;
            }
        }
    }
    return sieve.reduce((primes, isPrime, num) => isPrime ? primes.concat(num) : primes, []);
}

// Hilfsfunktion: Wählt zufällig n Elemente aus einem Array aus
function getRandomElements(arr, n) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

// Hilfsfunktion: Mischt ein Array zufällig
function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

// Hilfsfunktion: Gruppiert Faktoren in Produkte
function groupFactors(factors, groupSize) {
    const groups = [];
    for (let i = 0; i < factors.length; i += groupSize) {
        const chunk = factors.slice(i, i + groupSize);
        groups.push({ value: chunk.reduce((a, b) => a * b, 1) });
    }
    return groups;
}

// Berechnet den größten gemeinsamen Teiler (ggT) mit dem euklidischen Algorithmus
function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

// Prüft, ob der Bruch vollständig gekürzt ist
function isFullyReduced(numerator, denominator) {
    const numProduct = numerator.reduce((prod, item) => prod * item.value, 1);
    const denProduct = denominator.reduce((prod, item) => prod * item.value, 1);
    return gcd(numProduct, denProduct) === 1;
}

// Funktion zur Anzeige der Meldung
function showToast(message, color) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.background = color;
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.margin = '5px';
    toast.style.borderRadius = '10px';
    toast.style.opacity = '0.9';
    document.getElementById('toast-container').appendChild(toast);

    // Entferne die Meldung nach 1,5 Sekunden
    setTimeout(() => {
        toast.remove();
    }, 1500);
}

function resizeCanvas() {
    //canvas.width = window.innerWidth * 0.9;
    //canvas.height = window.innerHeight * 0.7;
    const ratio = window.devicePixelRatio || 1;
    // Anpassbare Höhe (z. B. 70% der Viewport-Höhe)
    const maxHeight = Math.min(window.innerHeight * 0.5, 600);
    console.log("Resize ratio:", ratio);

    // Setze die tatsächliche Zeichenfläche
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = maxHeight * ratio;

    // Skaliere den Kontext, um die Qualität zu behalten
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);

    updatePositions();
    drawFraction(); // Neuzeichnen nach Resize
}

// Touch-Events für Auswahl
canvas.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    handleClick(touch.clientX, touch.clientY);
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initiale Anpassung

document.getElementById('newTaskBtn').addEventListener('click', newTask);

newTask();
