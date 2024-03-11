class Richtung {
    static oben = 0;
    static rechts = 1;
    static unten = 2;
    static links = 3;
}

class Feld {
    typ = 0; //0 Wüste/Desert - 1 Wiese/Meadow
    value = 0; //Falls Wiesenfeld mit Zahl
    isCactus = false;
    isCow = false;
    isNr = false;
    isMarked = false;

    constructor(id) {
        this.id = id;
    }

    gibFeldInRichtung(r) {
        switch (r) {
            case Richtung.oben:
                return Feld.gibFeldNr(this.id - cols);
                break;
            case Richtung.unten:
                return Feld.gibFeldNr(this.id + cols);
                break;
            case Richtung.links:
                if (this.id % cols != 0) {
                    return Feld.gibFeldNr(this.id - 1);
                } else {
                    return null;
                }
                break;
            case Richtung.rechts:
                if (this.id % cols != cols - 1) {
                    return Feld.gibFeldNr(this.id + 1);
                } else {
                    return null;
                }
                break;
            default:
                return null;
        }
    }

    /**
     * gibt das Feld an Position i (Zeilenweise von links nach rechts
     * beginnend bei 0 nummeriert)
     * @param {Integer} i 
     * @returns Feld an der Position i, sonst null
     */
    static gibFeldNr(i) {
        if (!Number.isInteger(i) || i < 0 || i >= field.length) {
            return null;
        }
        return field[i];
    }

    istRandFeld() {
        if (this.id < cols || this.id >= field.length - cols || this.id % cols == 0 || this.id % cols == cols - 1) {
            return true;
        }
        return false;
    }

    /**
     * prüft ob dieses Feld ein Wüstenkandidat ist, d.h.
     * ein Nachbarfeld ist Wüste und die 5 gegenüberliegenden
     * Felder sind Wiese (Variante Gang)
     *  MM
     * DxM
     *  MM
     * oder kein Diagonal benachbartes Feld ist Wüste während 
     * die beiden gemeinsamen Nachbarn Wiese sind (Variante gang = false)
     * @param {boolean} gang optional - standard true
     */
    istWuestenKandidat(gang = true) {
        if (this.typ == 0) return false; //wenn schon Wüste unsinn
        if (gang) { //Variante gang
            let nb = this.gibNachbarn();
            let nbw = nb.filter((e) => { return e.typ == 0; });
            if (4 - nb.length + nbw.length != 1) {
                return false;
            }
            let achtNB = this.gibAchtUmlaufendeFelder();
            // Wüstennachbarn finden
            let pos = 0; //oben
            while (pos < 18 && !(achtNB[pos] == null || achtNB[pos].typ == 0)) {
                pos += 2;
            }
            // pos ist das Wüstenfeld - die fünf gegenüber auf nicht Wiese prüfen
            for (let i = 0; i < 5; i++) {
                if (achtNB[(pos + 2 + i) % 8] == null || achtNB[(pos + 2 + i) % 8].typ != 1) {
                    return false; //Es gibt eine Wüste bei den Feldern
                }
            }
            return true;
        } else { //Variante nicht gang
            let achtNB = this.gibAchtUmlaufendeFelder();
            for (let i = 0; i < 4; i++) { //Wir prüfen die vier Ecken
                if ((achtNB[2 * i] != null && achtNB[2 * i].typ == 1) &&
                    achtNB[(2 * (i + 1)) % 8] != null && achtNB[(2 * (i + 1)) % 8].typ == 1) {
                    //zwei senkrechte Nachbarn sind Wiese
                    if (achtNB[2 * i + 1].typ == 0) {
                        //Aber das Eckfeld ist Wüste
                        return false;
                    }
                }
            }
            return true;
        }
    }

    /**
     * gibt die 8 Umlaufenden Felder beginnend im Norden als Array zurück
     */
    gibAchtUmlaufendeFelder() {
        let res = new Array(8);
        res[0] = this.gibFeldInRichtung(Richtung.oben);
        res[2] = this.gibFeldInRichtung(Richtung.rechts);
        res[4] = this.gibFeldInRichtung(Richtung.unten);
        res[6] = this.gibFeldInRichtung(Richtung.links);
        //res[3] unten rechts klären
        for (let i = 1; i < res.length; i += 2) { //alle Ecken durchlaufen
            if (res[i - 1] == null || res[(i + 1) % 8] == null) {
                res[i] = null;
            } else {
                res[i] = res[i - 1].gibFeldInRichtung((Richtung.rechts + (i - 1) / 2) % 4);
            }
        }
        return res;
    }

    /**
     * gibt ein Array der gültigen Nachbarfelder zurück
     * @returns Array der Nachbarfelder die im Feld sind
     */
    gibNachbarn() {
        let res = [];
        for (let i = 0; i < 4; i++) { //alle Richtungen
            const feld = this.gibFeldInRichtung(i);
            if (feld != null) {
                res.push(feld);
            }
        }
        return res;
    }

    istNachbarVon(typ) {
        for (let i = 0; i < 4; i++) { //alle Richtungen
            const feld = this.gibFeldInRichtung(i);
            if (feld != null && feld.typ == typ) {
                return true;
            }
        }
        return false;
    }


}



let canvas = document.getElementById('canvas');
canvas.addEventListener('mousedown', function (e) {
    canvasClicked(canvas, e)
})
let ctx = canvas.getContext('2d');
let rows = 8;
let cols = rows;
let field = Array(rows * cols);
for (let i = 0; i < field.length; i++) {
    field[i] = new Feld(i);
}

let cellWidth = canvas.width / cols;
let cellHeight = canvas.height / rows;

let inputRows = document.getElementById('input_rows');
inputRows.value = rows;
let inputCols = document.getElementById('input_cols');
inputCols.value = cols;
let inputFieldChosen = document.getElementById('input_field_chosen');
let inputMeadowPercent = document.getElementById('input_meadow_percent');
let inputVariant = document.getElementById('input_variant'); //Variante für Wiesenerzeugung
let buttonTest = document.getElementById('button_test');
buttonTest.addEventListener('click', (e) => {
    //Testfunktion
    let nrfeld = Number.parseInt(inputFieldChosen.value);
    console.log(field[nrfeld].istWuestenKandidat());
})


document.addEventListener('keydown', keyDown); //wer weiß wan man den brauchen kann ;-)

createNewMeadow(50,parseInt(inputVariant.value));
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

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            switch (field[r * cols + c].typ) {
                case 0: //dessert
                    ctx.fillStyle = 'yellow';
                    addSquare(c, r);
                    break;
                case 1: //meadow
                    ctx.fillStyle = 'green';
                    addSquare(c, r);
                    break;
                default: //don't know
                    ctx.fillStyle = 'red';
                    addSquare(r, c);

            }
        }

    }


    //requestAnimationFrame(draw);

}

function valuesUpdated() {
    let r = Number.parseInt(inputRows.value);
    if (r > 0 && r < 12) {
        rows = r;
    } else {
        inputRows.value = r;
    }
    let c = Number.parseInt(inputCols.value);
    cols = c;
    let p = Number.parseInt(inputMeadowPercent.value);
    //console.log("r,c,p", r, c, p);
    canvas.width = canvas.height * cols / rows;
    cellWidth = canvas.width / cols;
    cellHeight = canvas.height / rows;
    inputFieldChosen.setAttribute('max', (r * c - 1));
    createNewMeadow(p,parseInt(inputVariant.value));
    draw();
}

function createNewMeadow(percent, variant = 1) {
    const nrMeadowFields = Math.round(rows * cols * percent / 100); //Nr of fields meadow
    if (!Number.isInteger(percent) || percent < 0 || percent > 100) {
        percent = 50;
    }
    //Fill field with Meadow
    field = Array(rows * cols);
    for (let i = 0; i < field.length; i++) {
        field[i] = new Feld(i);
        field[i].typ = 1; //Meadow - Weide
    }

    const fieldTotal = rows * cols;
    let nrDesertFields = 0;
    switch (variant) {
        case 0:

            while (nrDesertFields < fieldTotal - nrMeadowFields) { //es sind noch zu wenige Wüstenfelder
                //kandidaten für neue Wüstenfelder sind Wiesen die Randfelder oder Nachbarn von Wüste (0) sind.
                const kandidaten = field.filter(e => { return e.typ == 1 && (e.istRandFeld() || e.istNachbarVon(0)); });
                const zfl = Math.floor(Math.random() * kandidaten.length); //Zufallskandidat auswählen
                kandidaten[zfl].typ = 0; //und zu Wüste machen
                if (checkFieldValid()) {
                    nrDesertFields++;
                } else {
                    kandidaten[zfl].typ = 1; //wieder zurück
                }
            }
            break;
        case 1:
        default:

            /**
             * zweite Funktion, die eher eine Art von Gaengen 
             * erzeugen soll (keine Flecken von Wüste)
             * @param {Integer} percent Anteil der Wiese 
             */

            let gang = true; //Zunächst Gänge graben - also Gradlinige Wüsten
            while (nrDesertFields < fieldTotal - nrMeadowFields) { //es sind noch zu wenige Wüstenfelder
                //kandidaten für neue Wüstenfelder sind 
                // Wiesenfelder (typ1), die ein Wüstenfeld als Nachbar haben (oder Rand) und 
                // auf der anderen Seite nur 5 Wiesen.
                const kandidaten = field.filter(e => {
                    return e.typ == 1 && (e.istWuestenKandidat(gang));
                });
                if (kandidaten.length == 0) {
                    if (gang) {
                        gang = false; //algemeinere Wüstenfelder zulassen
                        continue;
                    } else {
                        break;
                    }
                }
                const zfl = Math.floor(Math.random() * kandidaten.length); //Zufallskandidat auswählen
                kandidaten[zfl].typ = 0; //und zu Wüste machen
                if (checkFieldValid()) {
                    nrDesertFields++;
                } else {
                    kandidaten[zfl].typ = 1; //wieder zurück
                }
            }

    }
}

function canvasClicked(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    //Feld berechnen
    const field_x = Math.floor(x / cellHeight);
    const field_y = Math.floor(y / cellWidth);
    const field_pos = [field_x, field_y];

    console.log("x: " + x + " y: " + y + " field_x: " +
        field_x + " field_y: " + field_y);
    inputFieldChosen.value = field_y * cols + field_x;
}

function checkFieldValid() {
    // wir prüfen ob die Wüste und die Wiese einfach zusammenhängend sind, 
    // wenn wir alle 
    // Randfelder mit Wüste zu einer Zusammenhangskomponente zählen und eine Wiese

    //alle Markierungen löschen
    field.forEach(element => { element.isMarked = false; });
    //Randfelder mit Wüste in Queue aufnehmen
    let queue = field.filter(element => { return element.istRandFeld() && element.typ == 0; });
    //ein Wiesenfeld
    queue.push(field.find(element => { return element.typ == 1; }));
    //Alle in der queue markieren
    queue.forEach(element => { element.isMarked = true; });
    while (queue.length > 0) {
        let first = queue.shift();
        let nachbarn = first.gibNachbarn();
        nachbarn = nachbarn.filter(e => { return e.typ == first.typ && e.isMarked == false; }); //nur unmarkierte Nachbarn mit gleichem typ
        nachbarn.forEach(e => { e.isMarked = true; }); //alle diese Nachbarn werden jetzt markiert
        queue = queue.concat(nachbarn); //und in die Queue gepackt - concat ändert das Array nicht *sic*
    }
    //console.log("alle Felder",JSON.stringify(field));
    //console.log("alleMarkiert? ", field.every(e => { return e.isMarked; }));
    return field.every(e => { return e.isMarked; });
}

function validField(r, c) {
    return r >= 0 && r < rows && c >= 0 && c < cols;
}

function addSquare(x, y) {
    ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth - 1, cellHeight - 1);
}


function gameLoop() {
}


