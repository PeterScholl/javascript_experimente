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
 * representiert ein einzelnes Feld eines Spielplans und als 
 * Klassenvariablen das Feld als Array
 */
class Feld {
    static #rows = 4;
    static #cols = 4;
    static field = new Array(Feld.#rows * Feld.#cols);
    /**
     * Integer 0 - Wüste
     */
    typ = -1; //0 Wüste/Desert - 1 Wiese/Meadow - (-1 undefiniert?)
    #value = 0; //Falls Wiesenfeld mit Zahl
    #isNr = false;
    #isCow = false;
    #isCactus = false;
    /**
     * @param {boolean} b
     */
    set isCactus(b) {
        this.#isCactus = b;
        if (this.#isCactus) {
            this.typ = 0;
            this.#isCow = false;
            this.#isNr = false;
        }
    }

    get isCactus() {
        return this.#isCactus;
    }
    isMarked = false;
    componente = 0;
    border = [null, null, null, null]; // oben, rechts, unten, links

    constructor(id) {
        this.id = id;
    }

    /**
     * @param {boolean} b
     */
    set isCow(b) {
        this.#isCow = b;
        if (this.#isCow) {
            this.typ = 1; //Wiese
            this.#isNr = false;
            this.#isCactus = false;
        }
    }

    get isCow() {
        return this.#isCow;
    }

    /**
     * @param {boolean} b
     */
    set isNr(b) {
        this.#isNr = b;
        if (this.#isNr) {
            this.typ = 1; //Wiese
            this.#isCactus = false;
            this.#isCow = false;
        }
    }

    get isNr() {
        return this.#isNr;
    }

    /**
     * @param {Integer} n
     */
    set value(n) {
        if (Number.isInteger(n) && n > 1) {
            this.isNr = true;
            this.typ = 1;
            this.#value = n;
        } else if (n == 1) {
            this.isNr = false;
            this.isCow = true;
        } else {
            this.#value = 0;
            this.isNr = false;
            this.isCow = false;
            this.isCactus = false;
            this.typ = -1;
        }
    }

    get value() {
        return this.#value;
    }

    /**
     * @param {number} r
     */
    static set rows(r) {
        if (r != Feld.#rows && r > 0 && r < 12) {
            Feld.#rows = r;
            Feld.neuesFeld();
        }
    }

    static get rows() {
        return Feld.#rows;
    }

    /**
     * @param {number} c
     */
    static set cols(c) {
        if (c != Feld.#cols) {
            Feld.#cols = c;
            Feld.neuesFeld();
        }
    }

    static get cols() {
        return Feld.#cols;
    }

    /**
     * Feld neu aufbauen (z.B. nach Änderung von rows und cols)
     */
    static neuesFeld() {
        Feld.field = new Array(Feld.rows * Feld.cols);
        for (let i = 0; i < Feld.field.length; i++) {
            Feld.field[i] = new Feld(i);
        }
    }

    /**
     * gibt das Feld in der Angegebenen Richtung
     * @param {Integer} r - Richtung 
     * @returns Feld in dieser Richtung oder null
     */
    gibFeldInRichtung(r) {
        switch (r) {
            case Richtung.oben:
                return Feld.gibFeldNr(this.id - Feld.#cols);
                break;
            case Richtung.unten:
                return Feld.gibFeldNr(this.id + Feld.#cols);
                break;
            case Richtung.links:
                if (this.id % Feld.#cols != 0) {
                    return Feld.gibFeldNr(this.id - 1);
                } else {
                    return null;
                }
                break;
            case Richtung.rechts:
                if (this.id % Feld.#cols != Feld.#cols - 1) {
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
        if (!Number.isInteger(i) || i < 0 || i >= Feld.field.length) {
            return null;
        }
        return Feld.field[i];
    }

    /**
     * prüft ob dieses Feld ein Randfeld ist
     * @returns true oder false
     */
    istRandFeld() {
        if (this.id < Feld.cols || this.id >= Feld.field.length - Feld.cols || this.id % Feld.cols == 0 || this.id % Feld.cols == Feld.cols - 1) {
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

    /**
     * prüft ob der Typ Wüste/Wiese aufgrund der Angaben fix ist
     * @returns true wenn der Typ fix ist
     */
    typeIsFix() {
        return this.isCactus || this.isCow || this.isNr;
    }

    /**
     * Gibt eine Stringrepresentation des HInts wieder
     * @returns String, der den Inhalt des Feldes beschreibt
     */
    toString() {
        if (this.isCow) return "🐮"; //Kuhgesicht von zeichen.tv
        if (this.isCactus) return "🌵";
        if (this.isNr) return "" + this.value;
        return "_";
    }

    /**
     * prüft ob eine NUmmer auf diesem Feld im aktuellen Setting möglich ist
     * @param {boolean} exakt gibt an ob die Felderzahl genau stimmen muss
     * @returns false wenn es eine Nummer ist aber nicht mehr genügend Grasfelder möglich sind.
     */
    isNrPossible(exakt = false) {
        if (!this.isNr) return true;
        let count = 1;
        for (let i = 0; i < 4; i++) { //alle Richtungen
            let feld = this.gibFeldInRichtung(i);
            while (feld != null && feld.typ != 0) {
                count++;
                feld = feld.gibFeldInRichtung(i);
            }
        }
        return (exakt && count == this.value) || (!exakt && count >= this.value);
    }

    /**
     * prüft ob im aktuellen Feld kein Belegungsfehler vorliegt
     * @param {boolean} exakt - Nummern müssen exakt stimmen
     * @returns true oder false
     */
    static istGueltig(exakt = false) {
        let zk = this.zaehleZusammenhangskomponenten();
        if (zk[1] > 1 || zk[0] > 1) return false; //Fehler es gibt mehr als eine Zusammenhangskomponente Wüste bzw. Weide
        // Prüfen ob Nummern in Ordnung sind
        let nrfelder = Feld.field.filter((e) => { return e.isNr; });
        if (nrfelder.some((e) => { return !e.isNrPossible(exakt) })) {
            return false;
        }
        return true;
    }

    /**
     * setzt die Feldeinstellungen abhängig vom übergebenen String
     * @param {String} s - c für cow, C für Cactus, IntegerString für Nr. 
     */
    setFromString(s) {
        switch (s) {
            case "c": //cow
                this.isCow = true;
                this.isCactus = false;
                this.isNr = false;
                this.typ = 1; //Meadow
                break;
            case "C": //cactus
                this.isCow = false;
                this.isCactus = true;
                this.isNr = false;
                this.typ = 0; //Dessert
                break;
            default:
                let nr = Number.parseInt(s);
                console.log("Number", nr);
                if (Number.isInteger(nr)) {
                    /*
                    this.isCow = false;
                    this.isCactus = false;
                    this.isNr = true;
                    this.typ = 1; //Meadow
                    */
                    this.value = nr;
                }
        }
    }

    /**
     * aktualisiert den Eintrag in Zusammenhangskomponenten
     * wenn das Feld an ein unbekanntes Typfeld anschließt oder ein Randwüstenfeld ist
     * wird der Wert von component auf 0 gesetzt
     * Ansonsten wird der Wert mit dem Nachbarfeld verglichen und auf das Minimum gesetzt
     */
    updateComponente() {
        if (this.istRandFeld() && this.typ == 0) {
            this.componente = 0;
        }
        let n = this.gibNachbarn();
        n.forEach((f) => {
            if (f.typ == -1) {
                this.componente = 0; //offene Komponente
            } else if (f.typ == this.typ) {
                //Componente anpassen
                if (this.componente > f.componente) {
                    this.componente = f.componente;
                    this.updateComponente();
                    return;
                } else if (this.componente < f.componente) {
                    f.componente = this.componente;
                    f.updateComponente();
                }
            }
        })

    }

    /**
     * zählt die Zusammenhangskomponenten - darf jeweils nur eine sein
     * @returns [anz Wiesen, anz Wüsten];
     */
    static zaehleZusammenhangskomponenten() {
        let m = Feld.field.filter((f) => { return f.typ == 1; }); //Meadows
        let d = Feld.field.filter((f) => { return f.typ == 0; }); //Wüsten
        for (let i = 0; i < m.length; i++) {
            m[i].componente = i + 1; //Erhält einen Wert für die Komponente groesser 1
        }
        for (let i = 0; i < d.length; i++) {
            d[i].componente = i + 1; //Analog bei den Wüsten
        }
        m.forEach((f) => { f.updateComponente(); });
        d.forEach((f) => { f.updateComponente(); });
        let zm = [... new Set(m.map((f) => { return f.componente; }))];
        let zd = [... new Set(d.map((f) => { return f.componente; }))];
        //console.dir("Deserts:", d, "Meadows", m, "zd", zd, "zm", zm);
        return [zm.length, zd.length];
    }

    static FeldtoString() {
        return Feld.field.map((e) => {return e.typ;}).toString();
    }
}


let table = document.getElementsByTagName('table')[0];



let inputRows = document.getElementById('input_rows');
inputRows.value = Feld.rows;
let inputCols = document.getElementById('input_cols');
inputCols.value = Feld.cols;
Feld.neuesFeld();
Feld.field[2].isCactus = true;
Feld.field[4].isCow = true;
for (let i = 0; i < Feld.field.length; i++) {
    if (Math.random() < 0.5) {
        Feld.field[i].isCactus = true;
    } else {
        Feld.field[i].isCow = true;
    }
}

Feld.neuesFeld();
Feld.field[0].value = 3;
Feld.field[2].value = 5;
Feld.field[10].value = 7;
Feld.field[8].isCow = true;
Feld.field[5].isCactus = true;
Feld.field[7].isCactus = true;
Feld.field[13].isCactus = true;
Feld.field[15].isCactus = true;



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
    table.innerHTML = ""; //Tabelle löschen
    let currow = table.insertRow(-1);

    for (let id = 0; id < Feld.rows * Feld.cols; id++) {
        let td = currow.insertCell(-1);
        td.id = id;
        td.innerHTML = Feld.field[id].toString();
        switch (Feld.field[id].typ) {
            case 0:
                td.style.backgroundColor = '#ee0';
                break;
            case 1:
                td.style.backgroundColor = 'lightgreen';
                break;
        }
        if ((id + 1) % Feld.cols == 0) {
            currow = table.insertRow(-1);
        }
    }

    // alle Zellen der Tabelle editierbar machen
    let cells = table.getElementsByTagName('td');
    for (let i = 0; i < cells.length; i++) {
        cells[i].onclick = function () {
            if (this.hasAttribute("data-clicked")) {
                return; //was already clicked
            }
            console.log("clicked");
            this.setAttribute("data-clicked", "yes");
            this.setAttribute("data-text", this.innerHTML);
            this.setAttribute("css-text", this.style.cssText);

            let input = document.createElement('input');
            input.setAttribute("type", "text");
            input.value = this.innerHTML;
            if (this.innerHTML == "🌵") input.value = "C";
            if (this.innerHTML == "🐮") input.value = "c";
            input.style.width = this.offsetWidth - 1 - (this.clientLeft * 4) + "px";
            input.style.height = this.offsetHeight - (this.clientTop * 2) + "px";
            input.style.border = "0px transparent";
            input.style.margin = "0";
            input.style.padding = "0";
            input.style.fontFamily = "inherit";
            input.style.fontSize = "inherit";
            input.style.textAlign = "inherit";
            input.style.backgroundColor = "LightGoldenRodYellow";

            input.onblur = function () { //Wenn das input-Element den Fokus verliert
                let td = input.parentElement;
                let orig_text = td.getAttribute("data-text");
                let current_text = this.value; //Inhalt des Input-Elements

                td.removeAttribute("data-clicked");
                td.removeAttribute("data-text");
                td.innerHTML = current_text;
                td.style.cssText = td.getAttribute("css-text");
                td.removeAttribute("css-text");

                if (orig_text != current_text) {
                    //something changed
                    console.log("Something changed");
                    Feld.field[Number.parseInt(td.id)].setFromString(current_text);
                    draw();
                } else {
                    console.log("nothing changed");
                }
            }

            input.onkeydown = function (event) {
                if (event.key == "Enter") {
                    this.blur();
                }
                if (event.key == "Tab") {
                    event.preventDefault();
                    //event.stopPropagation();
                    //event.stopImmediatePropagation();
                    let nr = Number.parseInt(this.parentElement.id);
                    this.blur();
                    if (Number.isInteger(nr)) {
                        cells[(nr + 1)%cells.length].click();
                    }
                }
            }

            this.innerHTML = ""; //Zelle leeren
            this.style.cssText = 'padding: 0px 0px';
            this.appendChild(input);
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
        Feld.rows = r;
    } else {
        inputRows.value = Feld.rows;
    }
    let c = Number.parseInt(inputCols.value);
    Feld.cols = c;
    console.log("rows, cols", r, c);
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
    Feld.field.forEach(element => { element.isMarked = false; });
    //Randfelder mit Wüste in Queue aufnehmen
    let queue = Feld.field.filter(element => { return element.istRandFeld() && element.typ == 0; });
    //ein Wiesenfeld
    queue.push(Feld.field.find(element => { return element.typ == 1; }));
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
    return Feld.field.every(e => { return e.isMarked; });
}


function solve() {
    let sols = solutions();
    alert("Es gibt "+sols.length+" Lösungen");
    if (sols.length > 0) {
        sols[0].forEach((v,i) => {Feld.field[i].typ = v;});
        draw();
    }

}

/** Methode die versucht das Feld zu lösen
 * @param {Integer} pos Position ab der probiert wird, die davor sind dann schon gesetzt - start bei 0
 * @returns Array mit Lösungen, welche jeweils aus einem Array mit Feldtypen besteht
 */
function solutions() {
    let results = []; //hier sammeln wir die gültigen Lösungen
    let pos = 0; // wir starten am Anfang
    //Alle Felder zurücksetzen
    Feld.field.forEach((e) => {if (!e.typeIsFix()) e.typ=-1;});
    let count = 0;
    while (pos >= 0) {
        if (count < -100) {
            draw();
            alert("Anzeige: "+ count);
            count=0;
        }
        if (pos >= Feld.field.length) {
            //Alle Feldtypen sind gesetzt Gültigkeit checken
            if (Feld.istGueltig(true)) {
                results.push(Feld.field.map((e) => { return e.typ; }));
            }
            // zur nächsten Setzung schreiten
            let changed = false;
            pos--;
            while (!changed && pos >= 0) {
                if (Feld.field[pos].typeIsFix()) {
                    pos--;
                } else if (Feld.field[pos].typ < 1) {
                    Feld.field[pos].typ += 1;
                    count++;
                    changed = true;
                    pos++;
                } else {
                    Feld.field[pos].typ = -1; // zurücksetzen
                    count++;
                    pos--;
                }
            }
        } else {
            // Wenn jetzt schon ungültig, dann zurücksetzen oder weitersetzen
            if (!Feld.istGueltig()) {
                console.log(Feld.FeldtoString());
                console.log(Feld.istGueltig());
                let changed = false;
                while (!changed && pos >= 0) {
                    if (Feld.field[pos].typeIsFix() || Feld.field[pos].typ == -1) {
                        pos--;
                    } else if (Feld.field[pos].typ < 1) {
                        Feld.field[pos].typ += 1;
                        count++;
                        changed = true;
                        pos++;
                    } else {
                        Feld.field[pos].typ = -1; // zurücksetzen
                        pos--;
                    }
                }
            } else {
                //aktuelle Position setzen
                if (Feld.field[pos].typeIsFix()) {
                    pos++;
                } else {
                    Feld.field[pos].typ += 1;
                    count++;
                    pos++;
                }
            }
        }
    }
    return results;
}

function validField(r, c) {
    return r >= 0 && r < Feld.rows && c >= 0 && c < Feld.cols;
}

function addSquare(x, y) {
    ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth - 1, cellHeight - 1);
}


function gameLoop() {
}


// 1,0,1,1,1,0,1,0,1,-1,1,-1,-1,0,-1,0