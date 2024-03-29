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
            this.zeilenOffset = 0;
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

        this.resize();
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
        let html_spielfeld = document.querySelector('div.field');
        html_spielfeld.innerHTML = "";
        let row = []; //Zeilen
        for (let i = 0; i < this.tableRows; i++) {
            let rowdiv = document.createElement('div');
            rowdiv.classList.add("row"); 
            row.push(rowdiv);
            html_spielfeld.appendChild(rowdiv);
        }
        let currow = 0; //aktuelle Zeile die befüllt wird
        for (let i = 0; i < this.spielfeldkarten; i++) {
            let td = document.createElement('div');
            td.setAttribute('id', i);
            td.classList.add('cell','container');
            // so gestalten, dass die Zahl im Bild erscheint
            td.innerHTML = "<img src='./img/" + (this.spielfeld[i] + 1) + ".gif' width=" + this.kartenBildWidth + ">"+
            "<div class='topleft'>"+(i+1)+"</div>";
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
                infoHTML += "<button onclick='Set.getInstance().manageWon(" + (id + 1) + ")' class='teams'>" + name + " (" + this.won[id + 1] + ")</button>";
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
        let clickedCards = document.querySelectorAll("div.clicked");
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
     * Resize Methode, die die Kartengröße nach der Anzahl der Spielkarten ausrechnet
     */
    resize() {
        let height = Math.min(window.innerHeight,screen.availHeight) - 140; // Höhe ohne 140 px für die Buttons/Bedienung
        let width = Math.min(window.innerWidth,screen.availWidth);
        let anzahlKarten = Math.max(15, this.spielfeldkarten); //es soll immer Platz für 15 Karten sein
        //Faktor zwischen Länge und Breite eines Kartenfeldes wird mit 1.5 angenommen

        let alpha = (width / 1.2) / height;
        let anzZeilen = Math.ceil(Math.sqrt(anzahlKarten / alpha));
        if (anzZeilen+this.zeilenOffset > 0) {
            anzZeilen+=this.zeilenOffset;
        }
        this.tableRows = anzZeilen;
        //Jetzt noch die richtige Weite ausrechnen
        let anzSpalten = Math.ceil(anzahlKarten / anzZeilen);
        let kartenWidthFit = width / anzSpalten - 30;
        let kartenHeightFit = (height / anzZeilen - 30) * 1.5;
        if (kartenWidthFit<0) {
            kartenWidthFit+=50;
        }
        if (kartenHeightFit < 10) {
            kartenHeightFit = kartenWidthFit
        }
        
        this.kartenBildWidth = Math.min(kartenWidthFit, kartenHeightFit);
        this.kartenBildWidth = Math.max(this.kartenBildWidth,30);
        console.log("Anzahl Zeilen mit resize", anzZeilen);
        this.draw();
    }

    /**
     * ordnet ein gefundenes Set dem TEam zu oder "legt" das
     * Set wieder zurück auf den Stapel, wenn keins da ist
     * @param {int} teamId des TEams, dass das Set erhalten soll
     */
    manageWon(teamId) {
        //gefundenes Set diesem team zuordnen - oder abziehen
        console.log("manageWon - teamID: ", teamId, "won0: ", this.won[0]);
        console.dir(this.won);
        if (this.won[0] > 0) {
            this.won[teamId] += 1;
            this.won[0] -= 1;
        } else if (this.won[teamId] > 0) {
            this.won[0] += 1;
            this.won[teamId] -= 1;
        }
        this.drawInfoFeld();
    }

    changeZeilenOffset(change) {
        this.zeilenOffset+=change;
        console.log("Zeilenoffset:", this.zeilenOffset);
        this.resize();
    }

    /**
     * führt irgendwelche Tests aus, die für die Programmierung wichtig sind
     */
    test() {
        let text = "Window inner Height: " + window.innerHeight + "\n";
        text += "Screen available Height: " + screen.availHeight + "\n";
        text += "Window inner Width: " + window.innerWidth + "\n";
        text += "Screen available Width: " + screen.availWidth +"\n";
        text += "this.kartenBildWidth: " + this.kartenBildWidth + "\n";
        text += "Zeilen: " + this.tableRows +"\n";
        text += "Zeilenoffset: " + this.zeilenOffset;
        alert(text);
    }
}



console.log("Avail-height:", screen.availHeight, "Avail-width", screen.availWidth);
let s = Set.getInstance();
s.reset();
