
let width = 5; //Breite des Spielfeldes

let colorsAvailable = ['gray', 'fuchsia', 'green', 'yellow', 'navy']; //erlaubte Farben
let colors = []; //zweidimensionales Feld der Farben 

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let field_width_px = canvas.width / width;

canvas.addEventListener('mousedown', function (e) {
    canvasClicked(canvas, e)
});

//document.addEventListener('keydown', keyDown);

let infoField = document.getElementById('info');
let checkBoxAlleFelder = document.getElementById('alleFelder');
checkBoxAlleFelder.addEventListener('change', function (e) { unerlaubteFelderSchwarz(); });
let checkBoxSymmetrieAchsen = document.getElementById('symmAchsen');
checkBoxSymmetrieAchsen.addEventListener('change', function (e) { draw(); });


function unerlaubteFelderSchwarz() {
    if (checkBoxAlleFelder.checked == false) {
        for (let zeile = 0; zeile < width; zeile++) {
            for (let spalte = 0; spalte < width; spalte++) {
                if (!erlaubtesFeld(zeile, spalte)) {
                    colors[zeile][spalte] = colorsAvailable[0];
                }
            }
        }
    }
    pruefeSymmetrie();
    draw();
}

function toggleVisibility(element) {
    if (element.style.display === "block") {
        element.style.display = "none";
    } else {
        element.style.display = "block"
    }
}

function reset() {
    console.log("Reset");
    colors = Array(width).fill([]);
    colors = colors.map((e) => Array(width).fill('gray'));
    //console.log(input_cols,n,width);
    pruefeSymmetrie();
    draw();
}

function pruefeSymmetrie() {
    //Achsensymmetrie fallende Achse
    let achsSymm1 = true;
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < width; j++) {
            achsSymm1 &= (colors[i][j] === colors[j][i]);
        }
    }
    //Achsensymmetrie fallende Achse
    let achsSymm2 = true;
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < width; j++) {
            achsSymm2 &= (colors[i][j] === colors[width - 1 - j][width - 1 - i]);
        }
    }
    //Achsensymmetrie fallende Achse
    let pktSymm = true;
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < width; j++) {
            pktSymm &= (colors[i][j] === colors[width - 1 - i][width - 1 - j]);
        }
    }

    console.log("Achsensymmetrisch fallend:", achsSymm1);
    console.log("Achsensymmetrisch steigend:", achsSymm2);
    console.log("Punktsymmetrisch steigend:", pktSymm);
    let bericht = "Die Figur ist<br>";
    if (!(achsSymm1 || achsSymm2 || pktSymm)) {
        bericht += "NICHT symmetrisch"
    } else {
        if (achsSymm1) {
            bericht += "symmetrisch zur fallenden Symmetrieachse<br>";
        }
        if (achsSymm2) {
            bericht += "symmetrisch zur steigenden Symmetrieachse<br>";
        }
        if (pktSymm) {
            bericht += "symmetrisch zum Mittelpunkt<br>";
        }
    }
    infoField.innerHTML = bericht;

}


function canvasClicked(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    //Feld berechnen
    const field_x = Math.floor(x / field_width_px);
    const field_y = Math.floor(y / field_width_px);

    console.log("x: " + x + " y: " + y + " field_x: " +
        field_x + " field_y: " + field_y);

    if (checkBoxAlleFelder.checked == true || erlaubtesFeld(field_x, field_y)) {
        //zu nächster Farbe wechseln
        naechsteFarbe(field_x, field_y);

        pruefeSymmetrie();     //Symmetrie updaten
        draw();     //neu Zeichnen
    }
}

function naechsteFarbe(x, y) {
    if (x >= 0 && x < width && y >= 0 && y < width) {
        let aktColor = colors[x][y];
        let idx = colorsAvailable.indexOf(aktColor);
        console.log("Index", idx);
        colors[x][y] = colorsAvailable[(idx + 1) % colorsAvailable.length];
    }
}

reset();
draw();

function erlaubtesFeld(x, y) {
    if (x == 2 || y == 2 || (x == 1 && y == 1) || (x == 3 && y == 3)) {
        return true;
    }
    return false;
}

function draw() {
    canvas.width = 480;
    canvas.height = canvas.width; //quadratisch
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //Felder
    ctx.fillStyle = 'white';
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < width; j++) {
            //ctx.fillRect(i*field_width_px+1,j*field_width_px+1,field_width_px-2, field_width_px-2);
            draw_rect_onField(i, j, border = 1);
        }
    }
    //Färbungen
    for (let zeile = 0; zeile < width; zeile++) {
        for (let spalte = 0; spalte < width; spalte++) {
            if (checkBoxAlleFelder.checked == false && !erlaubtesFeld(zeile, spalte)) {
                ctx.fillStyle = 'black';
                draw_rect_onField(zeile, spalte, border = 0);

            } else {
                ctx.fillStyle = colors[zeile][spalte];
                draw_rect_onField(zeile, spalte, border = 2);
            }
        }
    }

    //Symmetrieachsen einzeichnen
    if (checkBoxSymmetrieAchsen.checked == true) {
        console.log("Symmetrieachsen zeichnen!")
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(canvas.width,canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(canvas.width,0);
        ctx.lineTo(0,canvas.height);
        ctx.stroke();
    }
}

function draw_rect_onField(x, y, border = 0) {
    if (istGueltig(x, y)) {
        ctx.fillRect(x * field_width_px + border, y * field_width_px + border,
            field_width_px - 2 * border, field_width_px - 2 * border);

    }
}

function istGueltig(x, y) {
    return x >= 0 && x < width && y >= 0 && y < width;
}

function gameLoop() { }
