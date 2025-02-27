const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

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
  draw();
}


function drawFraction() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '20px Arial';

  numerator.forEach((num, i) => {
    ctx.fillText(num, 50 + i * 40, 100);
    if (selected.num === i) ctx.strokeRect(40 + i * 40, 80, 30, 30);
  });

  ctx.fillText('─'.repeat(numerator.length), 50, 130);

  denominator.forEach((den, i) => {
    ctx.fillText(den, 50 + i * 40, 160);
    if (selected.den === i) ctx.strokeRect(40 + i * 40, 140, 30, 30);
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
  dialog.style.top = '50%';
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

  numerator.forEach((num, i) => {
    if (offsetY > 80 && offsetY < 110 && offsetX > 40 + i * 40 && offsetX < 70 + i * 40) {
      selected.num = selected.num === i ? null : i;
    }
  });

  denominator.forEach((den, i) => {
    if (offsetY > 140 && offsetY < 170 && offsetX > 40 + i * 40 && offsetX < 70 + i * 40) {
      selected.den = selected.den === i ? null : i;
    }
  });

  drawFraction();

  if (selected.num !== null && selected.den !== null) {
    openInputDialog();
  }
});

    
document.getElementById('newTaskBtn').addEventListener('click', newTask);

drawFraction();
