
let cols = 7; //Breite des Spielfeldes
let rows = 4; //Hoehe des Spielfeldes
let pos_schwarz = []; //Renate
let pos_rot = [] //Erhart
let pos_start_end = [] //Positionen Start Ende gefärbt
let amZug = 0; //Spieler 0 - schwarz, Spieler 1 - rot
let feld_gewaehlt = null;

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let field_width_px = canvas.width / cols;
let field_height_px = canvas.height / rows;
let moves = []; //Speichert die Züge

canvas.addEventListener('mousedown', function (e) {
    canvasClicked(canvas, e)
})

document.addEventListener('keydown', keyDown);

let infoField = document.getElementById('info');

function reset() {
    console.log("Reset");
    const input_cols = document.getElementById('input_cols').value;
    const input_rows = document.getElementById('input_rows').value;
    const n = Number.parseInt(input_cols);
    if (!isNaN(n)) {
        cols = Math.max(n, 3);
    }
    const m = Number.parseInt(input_rows);
    if (!isNaN(m)) {
        rows = Math.max(m, 3);
    }
    //console.log(input_cols,n,width);
    pos_schwarz = [];
    pos_rot = [];
    pos_start_end = [];
    amZug = 0; //Spieler 0 - schwarz, Spieler 1 - rot
    feld_gewaehlt = null;
    field_width_px = canvas.width / cols;
    field_height_px = canvas.height / rows;
    showInfoAmZug();
    draw();
}

function keyDown(e) {
    console.log(e);
    if (e.keyCode == 37); //Pfeil links
    if (e.keyCode == 38); //Pfeil hoch
    if (e.keyCode == 39); //Pfeil rechts
    if (e.keyCode == 40); //Pfeil runter
    if (e.keyCode == 32);
    if (e.key == 'a') { //toggle Autopilot
        autopilot = !autopilot;
        document.getElementById('info').innerHTML = "Autopilot: " + autopilot;
    }
    if (e.key == 'z') { // Zug zurück
        if (moves.length > 0) {
            console.log("Moves Length", moves.length);
            [pos_rot, pos_schwarz, pos_start_end, amZug] = moves.pop();
            if (pos_rot.length + pos_schwarz.length == 0) pos_start_end = [];
            feld_gewaehlt = null;
            showInfoAmZug();
            draw();
        }
    }
}

function showInfoAmZug() {
    infoField.innerHTML = `${amZug ? "Erhard (rot)" : "Renate (schwarz)"} ist am Zug`;
}
function canvasClicked(canvas, event) {
    infoField.innerHTML = "";
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    //Feld berechnen
    const field_x = Math.floor(x / field_width_px);
    const field_y = Math.floor(y / field_height_px);
    const field_pos = [field_x, field_y];

    console.log("x: " + x + " y: " + y + " field_x: " +
        field_x + " field_y: " + field_y);

    if (field_x == 0 || field_y == 0 || field_x == cols - 1 || field_y == rows - 1) {

        if (feld_gewaehlt === null) { // Beginn eines neuen Zuges
            console.log("Noch kein Feld gewählt");
            //Prüfen ob gültiges Feld für aktuellen Spielstand
            if (pos_start_end.length == 0) {
                //Allererster Zug
                feld_gewaehlt = field_pos
            } else {
                //es gibt einen gefärbten Bereich
                e = findePassendesEnde(field_pos);
                console.log("Passende Enden", e, "pos_start_end", pos_start_end);
                if (e.length == 1) {
                    //Der Zug ist eindeutig
                    console.log("Eindeutiger Zug von", e, "nach", field_pos);
                    ziehe(e[0], field_pos);
                } else if (e.length == 2) {
                    //Das passende Ende muss gewählt werden
                    feld_gewaehlt = field_pos;
                } else {
                    console.log("Ungueltiger Zug");
                }
            }
            draw(); //um neuen Spielstand anzuzeigen
        } else { //Zielfeld?!
            if (pos_start_end.length == 0) { // erster Zug
                console.log("Erster Zug");
                if (istInEinerLinie(field_pos, feld_gewaehlt)) {
                    pos_start_end = [field_pos, field_pos]; //muss zuerst setzen, damit Zug gültigkeit hat
                    ziehe(field_pos, feld_gewaehlt);
                }
            } else { // Zug bei dem das Ende des gefärbten Bereihs nicht eindeutig ist
                //prüfen ob ein Ende des gefärbten Bereichs gewählt wurde
                if (pos_start_end.some(p => p[0] === field_pos[0] && p[1] === field_pos[1])) {
                    // Es wurde ein gültiges Ende gewählt
                    ziehe(field_pos, feld_gewaehlt);
                }
            }
            feld_gewaehlt = null;
            draw();
        }
    } else {
        console.log("Nicht auf ein Feld geklickt");
    }
    showInfoAmZug();
    if (pos_rot.length + pos_schwarz.length == 2 * cols + 2 * rows - 4) {
        //Spieler hat gewonnen
        infoField.innerHTML = `Spieler ${amZug ? "Renate (schwarz)" : "Erhard (rot)"} hat gewonnen!`;
        console.log("Moves:", moves);
    }
}

function ziehe(von, nach) { //von sollte immer das Ende des aktuell gefärbten Bereichs sein
    //Gültigkeitsprüfung
    //welches Ende wird geändert?
    const index = pos_start_end.findIndex(p => p[0] === von[0] && p[1] === von[1]);
    if (index == -1) {
        //ungültiger Zug - kein Ende des Bereichs
        return;
    }
    if (von[1] == nach[1]) {
        //Unterschied an vorderer Stelle (Zeilen?!)
        if (von[1] != 0 && von[1] != rows - 1) return;
        del = 0
    } else {
        //Unterschied an hinterer Stelle (Spalten?!)
        if (von[0] != 0 && von[0] != cols - 1) return;
        del = 1; //Stelle an der der Unterschied ist
    }
    alteSituation = [pos_rot.map(p => [...p]), pos_schwarz.map(p => [...p]), pos_start_end.map(p => [...p]), amZug];
    if (nach[del] > von[del]) {
        for (let i = nach[del]; i >= von[del]; i--) {
            neu = [1, 1]
            neu[1 - del] = nach[1 - del]
            neu[del] = i
            console.log("i", i, "neu", neu);
            faerbe(neu, amZug);
        }
    } else {
        for (let i = nach[del]; i <= von[del]; i++) {
            neu = [1, 1]
            neu[1 - del] = nach[1 - del]
            neu[del] = i
            faerbe(neu, amZug);
        }
    }
    // Update des Spielstandes
    amZug = 1 - amZug;
    showInfoAmZug();
    pos_start_end[index] = nach;
    moves.push(alteSituation);
}

function faerbe(pos, spieler) {
    if (feldFrei(pos)) {
        if (spieler == 0) {
            pos_schwarz.push(pos);
        } else {
            pos_rot.push(pos);
        }
    }
}

function feldFrei(pos) {
    const exists_s = pos_schwarz.some(p => pos[0] === p[0] && pos[1] === p[1]);
    const exists_r = pos_rot.some(p => pos[0] === p[0] && pos[1] === p[1]);
    return !exists_r && !exists_s;
}

function findePassendesEnde(pos) {
    e = []
    if (pos_start_end.length < 2 || !feldFrei(pos)) return [];
    if (istInEinerLinie(pos, pos_start_end[0])) {
        e.push(pos_start_end[0]);
    }
    if (istInEinerLinie(pos, pos_start_end[1])) {
        e.push(pos_start_end[1]);
    }
    if (e.length < 2) return e;
    if (istEcke(pos) && !istInEinerLinie(pos_start_end[0], pos_start_end[1])) return e;
    // beide Enden könnten in einer Reihe sein - das finden welches näher ist
    // E1...E2  pos
    a1 = e[0][0] - pos[0] + e[0][1] - pos[1]
    a2 = e[1][0] - pos[0] + e[1][1] - pos[1]
    if (a1 * a2 < 0) return e; //pos liegt zwischen beiden
    if (Math.abs(a1) < Math.abs(a2)) return [e[0]]; // erstes Ende ist näher
    return [e[1]]; //zweites Ende ist näher
}

function istEcke(pos) {
    return (pos[0] == 0 || pos[0] == cols - 1) && (pos[1] == 0 || pos[1] == rows - 1);
}

function istInEinerLinie(pos1, pos2) {
    if ((pos1[0] == pos2[0] && (pos1[0] == 0 || pos1[0] == cols - 1)) || (pos1[1] == pos2[1] && (pos1[1] == 0 || pos1[1] == rows - 1))) {
        return true;
    }
    return false;
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
reset();
draw();

function draw() {
    canvas.width = 480;
    canvas.height = canvas.width; //quadratisch
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //Felder
    ctx.fillStyle = 'white';
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (i == 0 || j == 0 || i == cols - 1 || j == rows - 1)
                draw_rect_onField(i, j, border = 1);
        }
    }
    //Mitte leeren
    ctx.fillRect(field_width_px + 1, field_height_px + 1, canvas.width - 2 * field_width_px - 2, canvas.height - 2 - 2 * field_height_px);
    //Figuren
    ctx.fillStyle = 'black';
    pos_schwarz.forEach(p => draw_rect_onField(p[0], p[1], border = Math.min(field_width_px, field_height_px) / 15));
    //Figuren Rot
    ctx.fillStyle = 'red';
    pos_rot.forEach(p => draw_rect_onField(p[0], p[1], border = Math.min(field_width_px, field_height_px) / 15));

    //draw chosen
    if (feld_gewaehlt != null) {
        ctx.fillStyle = 'green';
        draw_rect_onField(feld_gewaehlt[0], feld_gewaehlt[1], border = field_width_px / 3);
    }
}

function draw_rect_onField(x, y, border = 0) {
    if (istGueltig(x, y)) {
        ctx.fillRect(x * field_width_px + border, y * field_height_px + border,
            field_width_px - 2 * border, field_height_px - 2 * border);

    }
}

function istGueltig(x, y) {
    return x >= 0 && x < cols && y >= 0 && y < rows;
}

function gameLoop() { }
