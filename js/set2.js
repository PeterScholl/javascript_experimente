/*
 * Version 0.06 Peter Scholl - SVG-Version
 */

/**
 * Erzeugt ein SVG-Element für eine Set-Karte.
 * cardValue: 0–80 (interner Kartenwert)
 * width: Breite des SVGs in Pixeln
 *
 * Kodierung (Basis 3):
 *   n % 3         → Anzahl Formen (0→1, 1→2, 2→3)
 *   (n/3)  % 3   → Farbe         (0→rot, 1→lila, 2→grün)
 *   (n/9)  % 3   → Form          (0→Squiggle, 1→Raute, 2→Oval)
 *   (n/27) % 3   → Füllung       (0→voll, 1→gestreift, 2→offen)
 */
const COLOR_SETS = {
    normal:   ['#cc2222', '#882299', '#229933'],
    contrast: ['#cc2222', '#33113f', '#229933']
};

function cardToSVG(cardValue, width, colors = COLOR_SETS.normal, strokeScale = 1) {
    const count     = (cardValue % 3) + 1;
    const colorIdx  = Math.floor(cardValue / 3)  % 3;
    const shapeIdx  = Math.floor(cardValue / 9)  % 3;
    const shadingIdx= Math.floor(cardValue / 27) % 3;

    const color  = colors[colorIdx];
    const strokeWidth = 2.5 * strokeScale;

    const W = 200, H = 130;
    const h = Math.round(width * H / W);

    // X-Mittelpunkte der Formen (card ist 200px breit)
    const xList = [[100], [60, 140], [40, 100, 160]][count - 1];
    const cy = H / 2; // 65 – senkrechte Mitte

    const uid = `c${cardValue}`; // eindeutiges Präfix für SVG-IDs

    // --- Pfad-Generatoren ---

    function squigglePath(cx) {
        // S-förmige Kurve (obere Wölbung rechts, untere links)
        return [
            `M ${cx - 5},${cy - 42}`,
            `C ${cx + 40},${cy - 36} ${cx + 20},${cy - 15} ${cx + 5},${cy + 6}`,
            `C ${cx + 0},${cy + 15} ${cx + 0},${cy + 15} ${cx + 5},${cy + 24}`,
            `C ${cx + 10},${cy + 32} ${cx +10},${cy + 42} ${cx + 5},${cy + 42}`,
            `C ${cx - 40},${cy + 36} ${cx - 20},${cy + 15} ${cx - 5},${cy - 6}`,
            `C ${cx - 0},${cy - 15} ${cx - 0},${cy - 15} ${cx - 5},${cy - 24}`,
            `C ${cx - 10},${cy - 32} ${cx - 10},${cy - 42} ${cx - 5},${cy - 42} Z`
        ].join(' ');
    }

    function diamondPath(cx) {
        return `M ${cx},${cy - 42} L ${cx + 22},${cy} L ${cx},${cy + 42} L ${cx - 22},${cy} Z`;
    }

    // --- Defs (Streifenmuster + ClipPaths) ---
    let defsInner = '';

    if (shadingIdx === 1) {
        defsInner += `<pattern id="${uid}sp" patternUnits="userSpaceOnUse" width="7" height="7">
            <rect width="7" height="7" fill="white"/>
            <line x1="0" y1="3.5" x2="7" y2="3.5" stroke="${color}" stroke-width="i${strokeWidth}"/>
        </pattern>`;

        xList.forEach((cx, i) => {
            defsInner += `<clipPath id="${uid}cp${i}">`;
            if      (shapeIdx === 0) defsInner += `<path d="${squigglePath(cx)}"/>`;
            else if (shapeIdx === 1) defsInner += `<path d="${diamondPath(cx)}"/>`;
            else                     defsInner += `<ellipse cx="${cx}" cy="${cy}" rx="17" ry="42"/>`;
            defsInner += `</clipPath>`;
        });
    }

    const defs = defsInner ? `<defs>${defsInner}</defs>` : '';

    // --- Formen zeichnen ---
    let shapes = '';

    xList.forEach((cx, i) => {
        const solidFill  = shadingIdx === 0 ? color : 'none';
        const stripeRect = `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#${uid}sp)" clip-path="url(#${uid}cp${i})"/>`;

        if (shapeIdx === 0) {
            const d = squigglePath(cx);
            if (shadingIdx === 1) shapes += stripeRect;
            shapes += `<path d="${d}" fill="${solidFill}" stroke="${color}" stroke-width="${strokeWidth}"/>`;
        } else if (shapeIdx === 1) {
            const d = diamondPath(cx);
            if (shadingIdx === 1) shapes += stripeRect;
            shapes += `<path d="${d}" fill="${solidFill}" stroke="${color}" stroke-width="${strokeWidth}"/>`;
        } else {
            if (shadingIdx === 1) shapes += stripeRect;
            shapes += `<ellipse cx="${cx}" cy="${cy}" rx="17" ry="42" fill="${solidFill}" stroke="${color}" stroke-width="${strokeWidth}"/>`;
        }
    });

    return `<svg width="${width}" height="${h}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" pointer-events="none">
        <rect width="${W}" height="${H}" rx="10" fill="white" stroke="#ccc" stroke-width="1.5"/>
        ${defs}
        ${shapes}
    </svg>`;
}


/**
 * Set representiert das Spiel
 */
class Set {

    constructor() {
        if (typeof Set.instance === 'object') {
            return Set.instance;
        } else {
            Set.instance = this;
            this.spielfeld = Array(21).fill(0);
            this.spielfeldkarten = 0;
            this.kartenstapel = Array(81).fill(0);
            this.felderGewaehlt = Array(3).fill(0);
            this.teams = 0;
            this.teamNames = ['Nicht zugeordnet'];
            this.won = Array(this.teams + 1).fill(0);
            this.lost = Array(this.teams + 1).fill(0);
            this.topkarte = 0;
            this.tableRows = 3;
            this.kartenBildWidth = 200;
            this.zeilenOffset = 0;
            this.highContrast = localStorage.getItem('highContrast') === 'true'; 
            this.resize();
        }
    }

    static getInstance() {
        Set.instance = new Set();
        Set.getInstance = function () {
            return Set.instance;
        }
        return Set.instance;
    }

    reset() {
        for (let i = 0; i < 81; i++) {
            this.kartenstapel[i] = i;
        }
        for (let i = 80; i >= 0; i--) {
            let zuf = Math.floor((Math.random() * i));
            let tkarte = this.kartenstapel[i];
            this.kartenstapel[i] = this.kartenstapel[zuf];
            this.kartenstapel[zuf] = tkarte;
        }
        this.topkarte = 0;

        for (let i = 0; i < 12; i++) {
            this.spielfeld[i] = this.kartenstapel[this.topkarte];
            this.topkarte++;
        }
        this.spielfeldkarten = 12;

        this.won  = Array(this.teams + 1).fill(0);
        this.lost = Array(this.teams + 1).fill(0);

        this.resize();
        this.draw();
    }

    teamWerteAnNamensListeAnpassen() {
        let neueAnzahl = this.teamNames.length;
        if (this.teams != neueAnzahl) {
            this.teams = this.teamNames.length;
            this.reset();
        }
    }

    draw() {
        let html_spielfeld = document.querySelector('div.field');
        html_spielfeld.innerHTML = "";
        let row = [];
        for (let i = 0; i < this.tableRows; i++) {
            let rowdiv = document.createElement('div');
            rowdiv.classList.add("row");
            row.push(rowdiv);
            html_spielfeld.appendChild(rowdiv);
        }
        let currow = 0;
        for (let i = 0; i < this.spielfeldkarten; i++) {
            let td = document.createElement('div');
            td.setAttribute('id', i);
            td.classList.add('cell', 'container');
            // SVG statt img
            td.innerHTML = cardToSVG(
                this.spielfeld[i], 
                this.kartenBildWidth,
                this.highContrast ? COLOR_SETS.contrast : COLOR_SETS.normal,
                this.highContrast ? 1.5 : 1     //strokeScaleFaktor
            ) + "<div class='topleft'>" + (i + 1) + "</div>";
            td.addEventListener("click", (e) => { this.karteGeklickt(e.target); });
            row[currow++].appendChild(td);
            currow %= this.tableRows;
        }

        this.drawInfoFeld();
    }

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
            this.teamNames.slice(1).forEach((name, id) => {
                infoHTML += "<button onclick='Set.getInstance().manageWon(" + (id + 1) + ")' class='teams'>" + name + " (" + this.won[id + 1] + ")</button>";
            })
        }
        infoHTML += "</p>";
        document.getElementById('infos').innerHTML = infoHTML;
    }

    karteGeklickt(target) {
        // SVG hat pointer-events="none", daher trifft der Klick immer die .cell-div
        // Sicherheitshalber: falls doch ein Kind-Element getroffen wird, nach oben navigieren
        while (target && !target.classList.contains('cell')) {
            target = target.parentElement;
        }
        if (!target) return;

        target.classList.toggle("clicked");

        let clickedCards = document.querySelectorAll("div.clicked");
        if (clickedCards.length === 3) {
            let karten = [];
            for (let i = 0; i < clickedCards.length; i++) {
                let spielkartenID = Number.parseInt(clickedCards[i].id);
                karten.push(this.spielfeld[spielkartenID]);
            }
            if (this.isset(karten[0], karten[1], karten[2])) {
                this.won[0] += 1;
                if (this.topkarte >= 81 - 3 || this.spielfeldkarten > 12) {
                    this.spielfeld = this.spielfeld.filter((e) => { return !karten.includes(e) });
                    this.spielfeldkarten -= 3;
                    this.neueKartenAusteilen(3, 12);
                    this.resize();
                } else {
                    for (let i = 0; i < clickedCards.length; i++) {
                        let spielkartenID = Number.parseInt(clickedCards[i].id);
                        this.spielfeld[spielkartenID] = this.kartenstapel[this.topkarte++];
                    }
                }
                this.draw();
            } else {
                this.lost[0] += 1;
                this.drawInfoFeld();
            }

            clickedCards.forEach((e) => { e.classList.remove("clicked") });
        }
    }

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

    numberOfSets() {
        let numofsets = 0;
        for (let i = 0; i < this.spielfeldkarten - 2; i++) {
            for (let j = i + 1; j < this.spielfeldkarten - 1; j++) {
                let skarte = this.missingsetcard(this.spielfeld[i], this.spielfeld[j]);
                for (let k = j + 1; k < this.spielfeldkarten; k++) {
                    if (this.spielfeld[k] == skarte) {
                        numofsets++;
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
        for (let i = 0; i < anz; i++) {
            if (this.spielfeldkarten < max && this.topkarte < 81) {
                this.spielfeld[this.spielfeldkarten++] = this.kartenstapel[this.topkarte++];
            }
        }
    }

    resize() {
        let height = Math.min(window.innerHeight, screen.availHeight) - 140;
        let width  = Math.min(window.innerWidth,  screen.availWidth);
        let anzahlKarten = Math.max(15, this.spielfeldkarten);

        let alpha = (width / 1.2) / height;
        let anzZeilen = Math.ceil(Math.sqrt(anzahlKarten / alpha));
        if (anzZeilen + this.zeilenOffset > 0) {
            anzZeilen += this.zeilenOffset;
        }
        this.tableRows = anzZeilen;

        let anzSpalten = Math.ceil(anzahlKarten / anzZeilen);
        let kartenWidthFit  = width / anzSpalten - 30;
        let kartenHeightFit = (height / anzZeilen - 30) * 1.5;
        if (kartenWidthFit < 0) kartenWidthFit += 50;
        if (kartenHeightFit < 10) kartenHeightFit = kartenWidthFit;

        this.kartenBildWidth = Math.min(kartenWidthFit, kartenHeightFit);
        this.kartenBildWidth = Math.max(this.kartenBildWidth, 30);
        this.draw();
    }

    manageWon(teamId) {
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
        this.zeilenOffset += change;
        this.resize();
    }

    toggleContrast(checked) {
        this.highContrast = checked;
        localStorage.setItem('highContrast', checked);
        this.draw();
    }

    test() {
        let text = "Window inner Height: " + window.innerHeight + "\n";
        text += "Screen available Height: " + screen.availHeight + "\n";
        text += "Window inner Width: " + window.innerWidth + "\n";
        text += "Screen available Width: " + screen.availWidth + "\n";
        text += "this.kartenBildWidth: " + this.kartenBildWidth + "\n";
        text += "Zeilen: " + this.tableRows + "\n";
        text += "Zeilenoffset: " + this.zeilenOffset;
        alert(text);
    }
}

console.log("Avail-height:", screen.availHeight, "Avail-width", screen.availWidth);
let s = Set.getInstance();
s.reset();
document.getElementById('contrastToggle').checked = s.highContrast;
