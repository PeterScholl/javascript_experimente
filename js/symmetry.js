
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
    for (let zeile = 0; zeile < width; zeile++) {
        for (let spalte = 0; spalte < width; spalte++) {
            if (!erlaubtesFeld(zeile, spalte)) {
                if (checkBoxAlleFelder.checked == false) {
                    colors[zeile][spalte] = 'black';
                } else {
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
    let fieldSizeInput = document.getElementById('fieldsize');
    //console.log("Fieldsize:",fieldsize.value);
    if (fieldsize.value >= 3 && fieldsize.value <= 20) {
        width = Number.parseInt(fieldsize.value);
    } else {
        fieldsize.value = width;
    }
    colors = Array(width).fill([]);
    colors = colors.map((e) => Array(width).fill('gray'));
    //console.log(input_cols,n,width);
    unerlaubteFelderSchwarz(); //zeichnet auch gleich das Feld neu und prüft symmetrie
}

function pruefeSymmetrie() {
    let achsSymm1 = true; //Achsensymmetrie fallende Achse
    let achsSymm2 = true; //Achsensymmetrie steigende Achse
    let pktSymm = true; //Achsensymmetrie Punktsymmetrie
    let achsSymm_hor = true;
    let achsSymm_ver = true;

    for (let i = 0; i < width; i++) {
        for (let j = 0; j < width; j++) {
            achsSymm1 &= (colors[i][j] === colors[j][i]); //Achsensymmetrie fallende Achse
            achsSymm2 &= (colors[i][j] === colors[width - 1 - j][width - 1 - i]); //Achsensymmetrie steigende Achse
            pktSymm &= (colors[i][j] === colors[width - 1 - i][width - 1 - j]); //Achsensymmetrie Punktsymmetrie   
            achsSymm_hor &= (colors[i][j] === colors[i][width - 1 - j]); //Achsensymm. horizontal 
            achsSymm_ver &= (colors[i][j] === colors[width - 1 - i][j]); //Achsensymm. vertikal 
        }
    }

    let bericht = "Die Figur ist<br>";
    if (!(achsSymm1 || achsSymm2 || pktSymm || achsSymm_hor || achsSymm_ver)) {
        bericht += "<b>NICHT</b> symmetrisch"
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
        if (achsSymm_hor) {
            bericht += "symmetrisch zur horizontalen Symmetrieachse<br>";
        }
        if (achsSymm_ver) {
            bericht += "symmetrisch zur vertikalen Symmetrieachse<br>";
        }
    }
    infoField.innerHTML = bericht;

}

/**
 * Verändert die Farben der oberenRechten, unteren rechten oder unteren Hälfte so, dass
 * eine Symmetrie vorliegt
 * @param {String} wo obenRechts, untenRechts, punkt 
 */
function faerbeSymm(wo) {
    switch (wo) {
        case 'obenRechts':
            for (let i = 0; i < width; i++) {
                for (let j = i; j < width; j++) {
                    colors[j][i] = colors[i][j];
                }
            }
            pruefeSymmetrie();
            draw();
            break;
        case 'untenRechts':
            for (let i = 0; i < width; i++) {
                for (let j = 0; j < width-i; j++) {
                    colors[width-1-i][width-1-j] = colors[j][i];
                }
            }
            pruefeSymmetrie();
            draw();
            break;
        case 'punkt':
            for (let i = 0; i < width; i++) {
                for (let j = 0; j < Math.ceil(width/2); j++) {
                    colors[width-1-i][width-1-j] = colors[i][j];
                }
            }
            pruefeSymmetrie();
            draw();
            break;
    }
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

function randomColors() {
    for (let zeile = 0; zeile < width; zeile++) {
        for (let spalte = 0; spalte < width; spalte++) {
            if (checkBoxAlleFelder.checked == true || erlaubtesFeld(zeile, spalte)) {
                let zfl = Math.floor(Math.random() * colorsAvailable.length);
                //console.log("Zufall",zfl);
                colors[zeile][spalte] = colorsAvailable[zfl];
            }
        }
    }
    pruefeSymmetrie();
    draw();
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

/**
 * berechnet ob ein Feld Im Muster liegt
 * @param {Number} x  
 * @param {Number} y 
 * @returns true, wenn das Feld erlaubt, das heißt im Muster liegt
 */
function erlaubtesFeld(x, y) {
    console.log("width/2", width / 2);
    if ((x < Math.ceil(width / 2) - 1 && y < Math.ceil(width / 2) - 1) || (x > width / 2 && y > width / 2)) {
        return false;
    }
    if ((x - y <= Math.floor(width / 2)) && (y - x <= width / 2)) {
        return true;
    }
    return false;
}

function draw() {
    //canvas.width = 480;
    //console.log("Padding of canvas parent:",canvas.parentElement.style.padding);
    canvas.width = Math.min(480, canvas.parentElement.clientWidth - 30); //padding ist 15
    canvas.height = canvas.width; //quadratisch
    field_width_px = canvas.width / width;
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
        drawLine(0, 0, canvas.width, canvas.height);
        drawLine(canvas.width, 0, 0, canvas.height);
        if (width < 5 || checkBoxAlleFelder.checked) { //horizontale und vertikale Symmetrieachse ergänzen
            drawLine(canvas.width / 2, 0, canvas.width / 2, canvas.height);
            drawLine(0, canvas.height / 2, canvas.width, canvas.height / 2);
        }
    }
}

function drawLine(from_x, from_y, to_x, to_y, style = 'red') {
    ctx.lineWidth = 2;
    ctx.strokeStyle = style;
    ctx.beginPath();
    ctx.moveTo(from_x, from_y);
    ctx.lineTo(to_x, to_y);
    ctx.stroke();
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
