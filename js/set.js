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
            this.spielfeld = Array(21).fill(0); //Maximal 21 Karten
            this.spielfeldkarten = 0; //Anzahl der Karten auf dem Spielfeld
            this.kartenstapel = Array(81).fill(0); //gemischter Kartenstapel
            this.felderGewaehlt = Array(3).fill(0); //ausgewählte Felder
            this.teams = 0; //Anzahl der Teams
            this.teamNames = ['Nicht zugeordnet']; //Namen der Teams
            this.won = Array(this.teams + 1).fill(0); //Zähler für gefundene Sets je Team
            this.lost = Array(this.teams + 1).fill(0);; //Zähler für Fehlschläge
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

    /**
     * Mischt die Karten neu und setzt alle Werte auf die Ausgangseinstellungen
     */
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
        this.won = Array(this.teams + 1).fill(0); //Zähler für gefundene Sets je Team + Sammel
        this.lost = Array(this.teams + 1).fill(0);; //Zähler für Fehlschläge

        this.draw();
    }

    /**
     * Passt Teamvariablen an und setzt das Spiel zurück wenn sich die Anzahl geändert hat
     */
    teamWerteAnNamensListeAnpassen() {
        let neueAnzahl = this.teamNames.length;
        if (this.teams != neueAnzahl) {
            this.teams = this.teamNames.length;
            this.reset();
        }
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
            td.innerHTML = "" + (i + 1) + "<img src='./img/" + (this.spielfeld[i] + 1) + ".gif' width=" + this.kartenBildWidth + ">";
            td.addEventListener("click", (e) => { this.karteGeklickt(e.target); });
            row[currow++].appendChild(td);
            currow %= this.tableRows;
        }

        this.drawInfoFeld();
    }

    /**
     * Füllt das Info-Feld neu mit Infos über verbleibende Karten ...
     * Buttons für die Teams
     */
    drawInfoFeld() {
        let infoHTML = "<p>verbleibende Karten:" + (81 - this.topkarte);
        if (this.won[0] > 0) {
            infoHTML += " gefundene Sets: " + this.won[0];
        }
        if (this.lost[0] > 0) {
            infoHTML += " Fehlschläge: " + this.lost[0];
        }
        if (this.teams > 0) {
            infoHTML += "<br>";
            //Team Buttons
            this.teamNames.slice(1).forEach((name, id) => {
                infoHTML += "<button onclick='Set.getInstance().manageWon(" + (id+1) + ")' class='teams'>" + name + " (" + this.won[id+1] + ")</button>";
            })
        }
        infoHTML += "</p>";
        document.getElementById('infos').innerHTML = infoHTML;
    }

    /**
     * Auswerten was passiert, wenn eine Karte geklickt wurde
     * @param {Node} target 
     */
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
                this.won[0] += 1;
                // Karten werden einfach entfernt wenn keine neuen Karten mehr da sind oder mehr als 12 auf dem Feld
                if (this.topkarte >= 81 - 3 || this.spielfeldkarten > 12) {
                    this.spielfeld = this.spielfeld.filter((e) => { return !karten.includes(e) });
                    this.spielfeldkarten -= 3;
                    // Gegebenenfalls neue Karten austeilen - maximal 12
                    this.neueKartenAusteilen(3, 12);
                    this.resize();
                } else {
                    //bevorzugte Methode - Karten ersetzen
                    for (let i = 0; i < clickedCards.length; i++) {
                        let spielkartenID = Number.parseInt(clickedCards[i].id);
                        this.spielfeld[spielkartenID] = this.kartenstapel[this.topkarte++];
                    }
                }

                this.draw();

            } else {
                console.log("Kein Set!!");
                this.lost[0] += 1;
                this.drawInfoFeld();
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
                        console.log("Set gefunden:", i + 1, j + 1, k + 1);
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

    /**
     * legt neue Karten vom Kartenstapel auf dem Tisch
     * @param {int} anz Anzahl der auszuteilenden Karten
     * @param {int} max maximale Anzahl der Karten die auf dem Tisch liegen sollen 
     */
    neueKartenAusteilen(anz, max = 21) {
        console.log("Neue Karten", anz);
        for (let i = 0; i < anz; i++) { // maximal anz neue Karten
            if (this.spielfeldkarten < max && this.topkarte < 81) {
                this.spielfeld[this.spielfeldkarten++] = this.kartenstapel[this.topkarte++];
            }
        }
    }

    /**
     * berechnet/setzt die Größe der Karten passend zum Bildschirm und zur Kartenanzahl
     */
    resize2() {
        // Berechne Anzahl der Zeilen und Breite einer Karte
        if (window.innerHeight > 1.1 * window.innerWidth) {
            //Der Bildschirm ist deutlich Höher als Breit
            //console.log("Bildschrim hochkant", window.innerHeight, window.innerWidth);
            let nrZeilen = Math.floor(window.innerHeight * 5 / window.innerWidth);
            this.tableRows = nrZeilen;
            //Bildwidth muss ausreichen um 21/nrZeilen Karten darzustellen
            this.kartenBildWidth = window.innerWidth * nrZeilen / 21 - 30; //-30 für das Padding
        } else {
            this.tableRows = 3;
            this.kartenBildWidth = window.innerWidth / 8 - 30; //30 für das Padding
        }
        this.draw();
    }

    /**
     * Alternative Resize Methode, die die Kartengröße nach der Anzahl der Spielkarten ausrechnet
     */
    resize() {
        let height = window.innerHeight - 250; // Höhe ohne 250 px für die Buttons/Bedienung
        let width = window.innerWidth;
        let anzahlKarten = Math.max(15, this.spielfeldkarten); //es soll immer Platz für 15 Karten sein
        //Faktor zwischen Länge und Breite eines Kartenfeldes wird mit 1.5 angenommen

        let alpha = (width/1.5)/height;
        let anzZeilen = Math.ceil(Math.sqrt(anzahlKarten/alpha));
        this.tableRows = anzZeilen;
        //Jetzt noch die richtige Weite ausrechnen
        let anzSpalten = Math.ceil(anzahlKarten/anzZeilen);
        let kartenWidthFit = width/anzSpalten-50;
        let kartenHeightFit = (height/anzZeilen-50)*1.5;
        this.kartenBildWidth = Math.min(kartenWidthFit,kartenHeightFit);
        console.log("Anzahl Zeilen mit resize2",anzZeilen);
        this.draw();
    }

    /**
     * ordnet ein gefundenes Set dem TEam zu oder "legt" das
     * Set wieder zurück auf den Stapel, wenn keins da ist
     * @param {int} teamId des TEams, dass das Set erhalten soll
     */
    manageWon(teamId) {
        //gefundenes Set diesem team zuordnen - oder abziehen
        console.log("manageWon - teamID: ",teamId, "won0: ", this.won[0]);
        console.dir(this.won);
        if (this.won[0]>0) {
            this.won[teamId]+=1;
            this.won[0]-=1;
        } else if (this.won[teamId]>0) {
            this.won[0]+=1;
            this.won[teamId]-=1;
        }
        this.drawInfoFeld();
    }
}



console.log("Avail-height:", screen.availHeight, "Avail-width", screen.availWidth);
let s = Set.getInstance();
s.reset();
