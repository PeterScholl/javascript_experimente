let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

draw();


async function draw() {
    //Hier wird gezeichnet
    ctx.fillStyle = 'lightgray';  //erst mal löschen - alles weiß
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    /*
    ctx.fillStyle = 'black'; //wir malen mit schwarz
    ctx.fillStyle = 'rgb(50, 250, 50 , 0.5)'; //rot grün blau transparenz 

    // Ein Rechteck malen
    ctx.fillRect(30, 40, 50, 60);

    //Jetzt das Fisch-Beispiel von der Webseite
    // https://wiki.selfhtml.org/wiki/JavaScript/Canvas/Formen_und_Pfade#Anwendungsbeispiel

    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(20, 80);
    ctx.lineTo(20, 20);
    // arc(x, y, r, w1, w2, dir) - Startpunkt x,y - Radius r - Winkel w1, Winkel w2 - dir wäre die Richtung 
    ctx.arc(90, 50, 30, Math.PI * 7 / 6, Math.PI * 5 / 6, false);
    ctx.closePath();
    ctx.strokeStyle = '#000000'; //schwarze Linienfarbe
    ctx.lineWidth = 5; //Linienbreite - gerne mal mit spielen
    ctx.lineJoin = 'round'; //Die Übergänge von einer Linie zur nächsten sind rund
    ctx.stroke();
    //fisch(3.5); //Malt einen größeren Fisch
    */
    let t = new Turtle(canvas);
    t.goto(200, 200);
    t.pendown();
    t.goto(280, 280);
    t.goto(220, 280);
    t.goto(200, 200);
    for (let w = 1; w < 50; w++) {
        for (let i = 0; i < 73; i++) {
            await t.forward(w);
            t.turnright(-5);
        }
    }
}

function fisch(faktor) {
    ctx.beginPath();
    ctx.moveTo(20 * faktor, 80 * faktor);
    ctx.lineTo(20 * faktor, 20 * faktor);
    // arc(x, y, r, w1, w2, dir) - Startpunkt x,y - Radius r - Winkel w1, Winkel w2 - dir wäre die Richtung 
    ctx.arc(90 * faktor, 50 * faktor, 30 * faktor, Math.PI * 7 / 6, Math.PI * 5 / 6, false);
    ctx.closePath();
    ctx.strokeStyle = '#000000'; //schwarze Linienfarbe
    ctx.lineWidth = 5 * faktor; //Linienbreite - gerne mal mit spielen
    ctx.lineJoin = 'round'; //Die Übergänge von einer Linie zur nächsten sind rund
    ctx.stroke();
}

