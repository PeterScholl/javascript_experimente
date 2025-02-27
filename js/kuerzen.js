const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let numerator = [20, 36, 35];
let denominator = [20, 28, 72];
let selected = { num: null, den: null };

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

canvas.addEventListener('click', (e) => {
  const { offsetX, offsetY } = e;

  numerator.forEach((num, i) => {
    if (offsetY > 80 && offsetY < 110 && offsetX > 40 + i * 40 && offsetX < 70 + i * 40) {
      selected.num = i;
    }
  });

  denominator.forEach((den, i) => {
    if (offsetY > 140 && offsetY < 170 && offsetX > 40 + i * 40 && offsetX < 70 + i * 40) {
      selected.den = i;
    }
  });

  drawFraction();
});

document.getElementById('reduceBtn').addEventListener('click', () => {
  const factor = parseInt(document.getElementById('factorInput').value, 10);
  if (selected.num !== null && selected.den !== null && !isNaN(factor)) {
    if (numerator[selected.num] % factor === 0 && denominator[selected.den] % factor === 0) {
      numerator[selected.num] /= factor;
      denominator[selected.den] /= factor;
      selected = { num: null, den: null };
      drawFraction();
    } else {
      alert('Ungültige Kürzung!');
    }
  }
});

drawFraction();
