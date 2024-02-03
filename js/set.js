/*
 * Version 0.04 Peter Scholl
 */



/**
 * Set representiert das Spiel
 */
class Set {

    constructor() {
        if (typeof Set.instance === 'object') {
            return Set.instance;
        } else {
            //erster und einziger Aufruf der Initialisierung
            Set.instance = this;
            this.setcount = 0;
            this.spielfeld = Array(21).fill(0); //Maximal 21 Karten
            this.spielfeldkarten = 0; //Anzahl der Karten auf dem Spielfeld
            this.kartenstapel = Array(81).fill(0); //gemischter Kartenstapel
            this.felderGewaehlt = Array(3).fill(0); //ausgewählte Felder
            this.teams = 1; //Anzahl der Teams
            this.won = Array(this.teams).fill(0); //Zähler für gefundene Sets je Team
            this.lost = Array(this.teams).fill(0);; //Zähler für Fehlschläge
            this.topkarte = 0; //nächste Karte des gemischten Stapels
            this.tableRows = 3; //Anzahl Tabellenspalten
            this.kartenBildWidth = 200; //Weite eines Bildes in Pixeln
            this.resize(); //größen bestimmen
        }
    }

    /**
    * getInstanceMethode um den Controller zur erhalten
    * @returns die einzige instanz des Controllers
    */
    static getInstance() {
        Set.instance = new Set();
        Set.getInstance = function () {
            return Set.instance;
        }
        return Set.instance;
    }


    reset() {
        //Kartenstapel füllen
        for (let i = 0; i < 81; i++) {
            this.kartenstapel[i] = i;
        }
        //und mischen
        for (let i = 80; i >= 0; i--) {
            let zuf = Math.floor((Math.random() * i));
            let tkarte = this.kartenstapel[i];
            this.kartenstapel[i] = this.kartenstapel[zuf];
            this.kartenstapel[zuf] = tkarte;
        }
        this.topkarte = 0;


        //Die ersten 12 Karten ausgeben
        for (let i = 0; i < 12; i++) {
            this.spielfeld[i] = this.kartenstapel[this.topkarte];
            this.topkarte++;
        }
        this.spielfeldkarten = 12;

        //Spielvariablen zurücksetzen
        this.won = Array(this.teams).fill(0); //Zähler für gefundene Sets je Team
        this.lost = Array(this.teams).fill(0);; //Zähler für Fehlschläge

        this.draw();
    }


    /**
     * Zeichnet das Spielfeld und alles weitere neu
     */
    draw() {
        //Alle Tabellenzeilen löschen - mit Karten befüllen - erste Karte erste Zeile, zweite Karte zweite ...
        let html_spielfeld = document.getElementById('karten');
        html_spielfeld.innerHTML = "";
        const anzKartenInZeile = Math.ceil(this.spielfeldkarten / 3);
        let row = []; //Zeilen
        for (let i = 0; i < this.tableRows; i++) {
            row.push(document.createElement('tr'));
            html_spielfeld.appendChild(row[i]);
        }
        let currow = 0; //aktuelle Zeile die befüllt wird
        for (let i = 0; i < this.spielfeldkarten; i++) {
            let td = document.createElement('td');
            td.setAttribute('id', i);
            td.innerHTML = "<img src='./img/" + (this.spielfeld[i] + 1) + ".gif' width=" + this.kartenBildWidth + ">";
            td.addEventListener("click", (e) => { this.karteGeklickt(e.target); });
            row[currow++].appendChild(td);
            currow %= this.tableRows;
        }

        document.getElementById('infos').innerHTML = "<p>verbleibende Karten:" + (81 - this.topkarte) + "</p>";

    }


    karteGeklickt(target) {
        console.log("Tag-Typ:", target.tagName);
        if (target.tagName === "IMG") {
            //console.dir(target);
            target = target.parentElement;
        }
        console.log("Ziel", target.tagName, target.id);
        target.classList.toggle("clicked");

        //prüfen, ob drei Karten angeklickt wurden
        let clickedCards = document.querySelectorAll("td.clicked");
        console.log("Anzahl geklickter Karten:", clickedCards.length);
        if (clickedCards.length === 3) { //drei Karten wurden geklickt - prüfen
            let karten = []; //die drei angeklickten Karten
            for (let i = 0; i < clickedCards.length; i++) {
                let spielkartenID = Number.parseInt(clickedCards[i].id);
                console.log("Karte", i, "hat id", spielkartenID, "mit Typ", this.spielfeld[spielkartenID]);
                karten.push(this.spielfeld[spielkartenID]);
            }
            console.log("Angeklickte Karten", karten);
            // Auf Set prüfen
            if (this.isset(karten[0], karten[1], karten[2])) {
                console.log("Set gefunden!!!");
                this.spielfeld = this.spielfeld.filter((e) => { return !karten.includes(e) });
                this.spielfeldkarten -= 3;
                // Anzahl gefunden erhöhen
                // Gegebenenfalls neue Karten austeilen - maximal 12
                this.neueKartenAusteilen(3, 12);
                this.draw();

            } else {
                console.log("Kein Set!!");
            }

            //geklickt wieder auflösen
            clickedCards.forEach((e) => { e.classList.remove("clicked") });

        }

    }

    /**
     * berechnet die zu k1 und k2 passende Setkarte
     * @param {int} v1 - Karte 1 
     * @param {int} v2 - Karte 2
     * @returns Die Zahl der zugehörigen Set-Karte
     */
    missingsetcard(v1, v2) {
        let r1, r2;
        let v3 = 0;
        for (let i = 1; i < 81; i *= 3) {
            r1 = v1 % 3;
            r2 = v2 % 3;
            if (r1 == r2) {
                v3 += r1 * i;
            } else {
                v3 += (3 - r1 - r2) * i;
            }
            v1 = (v1 - r1) / 3;
            v2 = (v2 - r2) / 3;
        }
        return v3;
    }

    /**
     * Berechnet die Anzahl der Sets auf dem Spielfeld
     * @returns die Anzahl an Sets auf dem Spielfeld
     */
    numberOfSets() {
        let numofsets = 0;
        for (let i = 0; i < this.spielfeldkarten - 2; i++) { //Alle Paare durchlaufen - erste Karte des Paars
            for (let j = i + 1; j < this.spielfeldkarten - 1; j++) { //zweite Karte des Paars
                let skarte = this.missingsetcard(this.spielfeld[i], this.spielfeld[j]); //passende Karte
                for (let k = j + 1; k < this.spielfeldkarten; k++) { //Schauen ob diese auf dem Feld liegt
                    if (this.spielfeld[k] == skarte) {
                        numofsets++;
                        console.log("Set gefunden:", i, j, k);
                        break;
                    }
                }
            }
        }
        return numofsets;
    }

    isset(k1, k2, k3) {
        return k3 === this.missingsetcard(k1, k2);
    }

    neueKartenAusteilen(anz, max = 21) {
        console.log("Neue Karten", anz);
        for (let i = 0; i < anz; i++) { // maximal anz neue Karten
            if (this.spielfeldkarten < max && this.topkarte < 81) {
                this.spielfeld[this.spielfeldkarten++] = this.kartenstapel[this.topkarte++];
            }
        }
    }

    resize() { //wird aufgerufen, wenn der Bildschirm verändert wird
        //console.log("Avail-height:", window.innerHeight, "Avail-width", window.innerWidth);
        // Berechne Zeilen und Breite einer Karte
        if (window.innerHeight > 1.1* window.innerWidth) {
            //Der Bildschirm ist deutlich Höher als Breit
            //console.log("Bildschrim hochkant", window.innerHeight, window.innerWidth);
            let nrZeilen = Math.floor(window.innerHeight * 5 / window.innerWidth);
            this.tableRows = nrZeilen;
            //Bildwidth muss ausreichen um 21/nrZeilen Karten darzustellen
            this.kartenBildWidth = window.innerWidth * nrZeilen / 21 -30 ;
        } else {
            this.tableRows = 3;
            this.kartenBildWidth = window.innerWidth / 8 -30; //30 für das Padding
        }
        this.draw();
    }
}

function resize() {
    Set.getInstance().resize();
}

console.log("Avail-height:", screen.availHeight, "Avail-width", screen.availWidth);
let s = Set.getInstance();
s.reset();
