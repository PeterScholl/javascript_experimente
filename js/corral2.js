class Richtung {
    static oben = 0;
    static rechts = 1;
    static unten = 2;
    static links = 3;
}

class Border {
    isDefined = false;
    isFence = false;
    isOpen = false;
    fields = [null, null]; //eins und das andere Feld

    constructor() {

    }
}

/**
 * representiert ein einzelnes Feld eines Spielplans
 */
class Feld {
    typ = 0; //0 Wüste/Desert - 1 Wiese/Meadow - (-1 undefiniert?)
    value = 0; //Falls Wiesenfeld mit Zahl
    isCactus = false;
    isCow = false;
    isNr = false;
    isMarked = false;
    componente = 0;
    border = [null, null, null, null]; // oben, rechts, unten, links

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
     * gibt das Feld an der Position i, wenn es existiert, sonst null
     * @param {Integer} i Feldnummer 
     * @returns Das Feld an dieser Position sonst null
     */

    static gibFeldNr(i) {
        if (!Number.isInteger(i) || i < 0 || i >= field.length) {
            return null;
        }
        return field[i];
    }

    /**
     * prüft ob dieses Feld ein Randfeld ist
     * @returns true oder false
     */
    istRandFeld() {
        if (this.id < cols || this.id >= field.length - cols || this.id % cols == 0 || this.id % cols == cols - 1) {
            return true;
        }
        return false;
    }

    /**
     * gibt eine Liste der vier Nachbarfelder (mindestens 2 bei einer Ecke)
     * @returns Liste der Nachbarfelder
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

    /**
     * prüft ob ein existierendes Nachbarfeld dieses Feldes den geforderten Typ hat
     * @param {Integer} typ 0- Wüste 1 - Wiese 
     * @returns true oder false
     */

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


let table = document.getElementsByTagName('table')[0];
let rows = 4;
let cols = rows;
let field = Array(rows * cols);
for (let i = 0; i < field.length; i++) {
    field[i] = new Feld(i);
}


let inputRows = document.getElementById('input_rows');
let inputCols = document.getElementById('input_cols');


document.addEventListener('keydown', keyDown); //wer weiß wan man den brauchen kann ;-)

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
    //Tabelle zeichnen
    table.innerHTML=""; //Tabelle löschen
    let currow = table.insertRow(-1);

    for (let id = 0; id < rows * cols; id++) {
        let td = currow.insertCell(-1);
        td.id = id;
        td.innerHTML = id;
        if ((id + 1) % cols == 0) {
            currow = table.insertRow(-1);
        }
    }

    // alle Zellen der Tabelle editierbar machen
    let cells = table.getElementsByTagName('td');
    for (let i=0; i < cells.length; i++) {
        cells[i].onclick = function() {
            if (this.hasAttribute("data-clicked")) {
                return; //was already clicked
            }
            console.log("clicked");
            this.setAttribute("data-clicked","yes");
            this.setAttribute("data-text", this.innerHTML);

            let input = document.createElement('input');
            input.setAttribute("type","text");
            input.value = this.innerHTML;
            input.style.width = this.offsetWidth -1 - (this.clientLeft * 4) + "px";
            input.style.height = this.offsetHeight - (this.clientTop * 2) + "px";
            input.style.border = "0px transparent";
            input.style.margin = "0";
            input.style.padding = "0";
            input.style.fontFamily = "inherit";
            input.style.fontSize = "inherit";
            input.style.textAlign = "inherit";
            input.style.backgroundColor = "LightGoldenRodYellow";

            input.onblur = function() { //Wenn das input-Element den Fokus verliert
                let td = input.parentElement;
                let orig_text = td.getAttribute("data-text");
                let current_text = this.value; //Inhalt des Input-Elements

                td.removeAttribute("data-clicked");
                td.removeAttribute("data-text");
                td.innerHTML = current_text;
                td.style.cssText = '';

                if (orig_text != current_text) {
                    //something changed
                    console.log("Something changed");
                } else {
                    console.log("nothing changed");
                }
            }

            input.onkeydown = function(event) {
                if (event.key == "Enter") {
                    this.blur();
                }
            }

            this.innerHTML = ""; //Zelle leeren
            this.style.cssText = 'padding: 0px 0px';
            this.append(input);
            this.firstElementChild.select();

        }
    }
}

/**
 * valuesUpdated() wird aufgerufen, wenn sich die Einstellungen an der Seite geändert haben
 */
function valuesUpdated() {
    let r = Number.parseInt(inputRows.value);
    if (r > 0 && r < 12) {
        rows = r;
    } else {
        inputRows.value = r;
    }
    let c = Number.parseInt(inputCols.value);
    cols = c;
    console.log("rows, cols", r, c);
    field = Array(rows * cols);
    for (let i = 0; i < field.length; i++) {
        field[i] = new Feld(i);
    }
    draw();
}

/**
 * erzeugt eine neue zusammenhängende Weide mit der angegebenen Prozentzahl
 * @param {Integer} percent 
 */
function createNewMeadow(percent) {
    if (!Number.isInteger(percent) || percent < 0 || percent > 100) {
        percent = 50;
    }
    const nrMeadowFields = Math.round(rows * cols * percent / 100); //Nr of fields meadow
    //Fill field with Meadow
    field = Array(rows * cols);
    for (let i = 0; i < field.length; i++) {
        field[i] = new Feld(i);
        field[i].typ = 1; //Meadow - Weide
    }

    const fieldTotal = rows * cols;
    let nrDesertFields = 0;

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

    //draw();
    //console.log("Valid? ", checkFieldValid());
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


