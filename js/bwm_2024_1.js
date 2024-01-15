
let width = 7; //Breite des Spielfeldes
let pos_schwarz = [[0, 0], [width - 1, width - 1]];
let pos_rot = [[0, width - 1], [width - 1, 0]]
let amZug = 0; //Spieler 0 - schwarz, Spieler 1 - rot
let feld_gewaehlt = null;

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let field_width_px = canvas.width / width;
let autopilot = false;
let moves = []; //Speichert die Züge

canvas.addEventListener('mousedown', function (e) {
    canvasClicked(canvas, e)
})

document.addEventListener('keydown', keyDown);

let infoField = document.getElementById('info');

function reset() {
    console.log("Reset");
    const input_cols = document.getElementById('input_cols').value;
    const n = Number.parseInt(input_cols);
    if (!isNaN(n)) {
        width = n;
    }
    //console.log(input_cols,n,width);
    pos_schwarz = [[0, 0], [width - 1, width - 1]];
    pos_rot = [[0, width - 1], [width - 1, 0]]
    amZug = 0; //Spieler 0 - schwarz, Spieler 1 - rot
    feld_gewaehlt = null;
    field_width_px = canvas.width / width;
    draw();
}

function keyDown(e) {
    console.log(e);
    if (e.keyCode == 37) { //Pfeil links
        if (feld_gewaehlt != null) {
            zieheAuf([feld_gewaehlt[0] - 1, feld_gewaehlt[1]]);
        }
    }
    if (e.keyCode == 38) { //Pfeil hoch
        if (feld_gewaehlt != null) {
            zieheAuf([feld_gewaehlt[0], feld_gewaehlt[1]-1]);
        }
    }
    if (e.keyCode == 39) { //Pfeil rechts
        if (feld_gewaehlt != null) {
            zieheAuf([feld_gewaehlt[0] + 1, feld_gewaehlt[1]]);
        }
    }
    if (e.keyCode == 40) { //Pfeil runter
        if (feld_gewaehlt != null) {
            zieheAuf([feld_gewaehlt[0], feld_gewaehlt[1]+1]);
        }
    }
    if (e.keyCode == 32) { //Leertaste
        //Stein eines Spielers der am Zug ist
        //console.log("Leertaste gedrückt");
        let optionen = pos_rot;
        if (amZug == 0) {
            optionen = pos_schwarz;
        }
        if (feld_gewaehlt == null) {
            feld_gewaehlt = optionen[0];
        } else { //es wurde schon ein Feld gewählt
            if (enthaelt([optionen[0]], feld_gewaehlt)) {
                feld_gewaehlt = optionen[1];
            } else {
                feld_gewaehlt = optionen[0];
            }

        }
        draw();
    }
    if (e.key == 'a') { //toggle Autopilot
        autopilot = !autopilot;
        document.getElementById('info').innerHTML = "Autopilot: " + autopilot;
    }
    if (e.key == 'z') { // Zug zurück
        if (moves.length>0) {
            //console.log(moves.length);
            [von,nach]=moves.pop();
            //console.log(moves.length);
            if (amZug==0) { //Schwarz ist am Zug - Rücknahme von Rot
                bewege(pos_rot,nach,von);
            } else {
                bewege(pos_schwarz,nach,von);
            }
            moves.pop(); //der neue "Zug" muss wieder runter
            amZug=1-amZug; //Spieler wechseln
            feld_gewaehlt=null;
            draw();
        }
    }
}

function canvasClicked(canvas, event) {
    infoField.innerHTML = "";
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    //Feld berechnen
    const field_x = Math.floor(x / field_width_px);
    const field_y = Math.floor(y / field_width_px);
    const field_pos = [field_x, field_y];

    console.log("x: " + x + " y: " + y + " field_x: " +
        field_x + " field_y: " + field_y);

    if (feld_gewaehlt === null) {
        console.log("Noch kein Feld gewählt");
        //Prüfen ob gültiges Feld für Spieler am Zug
        if (amZug === 0) { //Spieler Schwarz ist am Zug
            console.log("Schwarz ist am Zug");
            if (enthaelt(pos_schwarz, field_pos)) {
                console.log("richtig!");
                feld_gewaehlt = field_pos;
            } else if (enthaelt(pos_rot, field_pos)) {
                infoField.innerHTML = "Schwarz ist am Zug";
            }

        } else { //Spieler rot ist am Zug
            console.log("Rot ist am Zug");
            if (enthaelt(pos_rot, field_pos)) {
                console.log("richtig!");
                feld_gewaehlt = field_pos;
            } else if (enthaelt(pos_schwarz, field_pos)) {
                infoField.innerHTML = "Rot ist am Zug";
            }
        }
        draw(); //um gewählte Figur anzuzeigen
    } else { //Zielfeld?!
        zieheAuf(field_pos);
    }
}

function zieheAuf(field_pos) {
    if (feld_gewaehlt == null) { // es gibt ein Quellfeld
        return;
    }
    if (!istGueltig(field_pos[0], field_pos[1])) return;
    if (enthaelt(pos_rot, field_pos) || enthaelt(pos_schwarz, field_pos)) {
        console.log("Feld ist ungültig - nicht leer");
        infoField.innerHTML = "Kein g&uuml;ltiges Zielfeld - schon belegt";
        feld_gewaehlt = null;
    } else { //feld ist frei
        if (istNachbarfeld(feld_gewaehlt, field_pos)) {
            //entsprechende Farbe bewegen
            if (amZug == 0) { //schwarz bewegen
                bewege(pos_schwarz, feld_gewaehlt, field_pos);
            } else { //rot bewegen
                bewege(pos_rot, feld_gewaehlt, field_pos);
            }
            amZug = 1 - amZug;
        } else {
            infoField.innerHTML = "Kein Nachbarfeld";
            console.log("Feld ist nicht erreichbar");
        }
        feld_gewaehlt = null;

    }
    draw(); //update
}

function bewege(f, von, nach) { //f ist das Feld mit den Positionen
    for (let i = 0; i < f.length; i++) {
        if (f[i][0] == von[0] && f[i][1] == von[1]) {
            f[i] = nach;
            moves.push([von,nach]);
        }
    }
}

function istNachbarfeld(pos1, pos2) {
    const diff1 = Math.abs(pos1[0] - pos2[0]);
    const diff2 = Math.abs(pos1[1] - pos2[1]);
    if (Math.min(diff1, diff2) == 0 && Math.max(diff1, diff2) == 1) {
        return true;
    }
    return false;
}

function enthaelt(f, pos) {
    for (let i = 0; i < f.length; i++) {
        if (f[i][0] == pos[0] && f[i][1] == pos[1]) {
            return true;
        }
    }
    return false;
}
draw();

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
    //Figuren
    ctx.fillStyle = 'black';
    pos_schwarz.forEach(p => draw_rect_onField(p[0], p[1], border = border = field_width_px / 15));
    //Figuren Rot
    ctx.fillStyle = 'red';
    pos_rot.forEach(p => draw_rect_onField(p[0], p[1], border = field_width_px / 15));

    //draw chosen
    if (feld_gewaehlt != null) {
        ctx.fillStyle = 'green';
        draw_rect_onField(feld_gewaehlt[0], feld_gewaehlt[1], border = field_width_px / 3);
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
