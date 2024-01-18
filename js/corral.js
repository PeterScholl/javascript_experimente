let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let rows = 4;
let cols = rows;
let field = Array(rows)
    .fill()
    .map(()=> Array(cols).fill(0)); //0 = Desert 1 = Meadow, 2 = cow, 3 = cactus <0 = -nr  

let cellWidth = canvas.width / cols;
let cellHeight = canvas.height / rows;

let inputRows = document.getElementById('input_cols');
let inputMeadowPercent = document.getElementById('input_meadow_percent');

class Feld {
    typ = 0; //0 Wüste/Desert - 1 Wiese/Meadow
    value = 0; //Falls Wiesenfeld mit Zahl
    isCactus = false;
    isCow = false;

    constructor(id) {
        this.id=id;
    }

    


}

document.addEventListener('keydown', keyDown); //wer weiß wan man den brauchen kann ;-)

createNewMeadow(50);
draw();


function keyDown(e) {
    console.log(e);
    if (e.keyCode == 37) {
        direction = 'LEFT';
    }
    if (e.key == 'a') { //toggle Autopilot
        console.log("a gedrückt");
    }
}

function draw() {
    //Canvas schwarz füllen
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r=0; r<rows; r++) {
        for (let c=0; c<cols; c++) {
            switch (field[r][c]) {
                case 0: //dessert
                    ctx.fillStyle = 'yellow';
                    addSquare(r,c);
                    break;
                case 1: //meadow
                    ctx.fillStyle = 'green';
                    addSquare(r,c);
                    break;
                default: //don't know
                    ctx.fillStyle = 'red';
                    addSquare(r,c);           
                
            }
        }

    }

   
    //requestAnimationFrame(draw);

}

function valuesUpdated() {
    console.log("valuesUpdated",inputRows.value);


}

function createNewMeadow(percent) {
    if (!Number.isInteger(percent) || percent<0 || percent > 100 ) {
        percent = 50;
    }
    const nrMeadowFields = Math.round(rows*cols*percent/100); //Nr of fields meadow
    //Fill field with Desert
    field = Array(rows)
    .fill()
    .map(()=> Array(cols).fill(0)); //0 = Desert 1 = Meadow, 2 = cow, 3 = cactus <0 = -nr  

    const fieldTotal = rows*cols;
    let nrDesertFields = fieldTotal;

    while (fieldTotal-nrDesertFields<nrMeadowFields) { //es sind noch zu viele Wüstenfelder
        //Zufallswüstenfeld wählen
        let zfl = Math.floor(Math.random() * nrDesertFields);
        let r=0, c=0; //row and column am Anfang
        while (zfl>0 || field[r][c]!=0) { //Durchlaufen bis zum zfl-ten Wüstenfeld
            //nächstes Feld
            c++;
            if (c>=cols) { //Ende der Spalten erreicht
                c=0;
                r++; //nächste Zeile
            }
            if (r>=rows) {
                throw "Rows out of range: "+r;
            }
            if (field[r][c]==0) {
                zfl--;
            }
        }
        // auf dem Feld r,c ist eine Wüste
        field[r][c]=1; //auf Weide setzen
        if (checkFieldValid()) {
            nrDesertFields--;
        } else {
            field[r][c]=0; //back to desert
        }

    }
}

function checkFieldValid() {
    // wir prüfen ob die Wüste einfach zusammenhängend ist, wenn wir alle 
    // Randfelder mit Wüste zu einer Zusammenhangskomponente zählen

    return true;
}

function validField(r,c) {
    return r>=0 && r<rows && c>=0 && c<cols;
}

function addSquare(x, y) {
    ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth - 1, cellHeight - 1);
}


function gameLoop() {
}


