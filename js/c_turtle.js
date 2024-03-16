class Turtle {
    delaytime = 5; //Waits 100 ms 
    pos_x = 0;
    pos_y = 0;
    dir = 0; //direction north = 0 (360°)
    #mycanvas = null;
    #ctx = null;
    pen = false; //pen up
    pen_width = 1;
    pen_color = '#000000'; //black

    constructor(canvas) {
        this.#mycanvas = canvas;
        this.#ctx = canvas.getContext('2d');
        this.#ctx.strokeStyle = this.pen_color; //schwarze Linienfarbe
        this.#ctx.lineWidth = this.pen_width; //Linienbreite - gerne mal mit spielen
        this.#ctx.lineJoin = 'round'; //Die Übergänge von einer Linie zur nächsten sind rund
    }

    /**
     * Wenn pen = true wird eine Linie von der aktuellen Position zur Zielposition gezogen
     * ansonsten bewegt sich die Schildkröte nur dahin
     * @param {Integer} x 
     * @param {Integer} y 
     */
    async goto(x, y) {
        if (isNaN(x) || isNaN(y)) return;
        if (this.pen) { // Linie zeichnen
            this.#ctx.beginPath();
            this.#ctx.moveTo(this.pos_x, this.pos_y);
            this.#ctx.lineTo(x, y);
            this.#ctx.stroke();
        }
        this.pos_x = x;
        this.pos_y = y;
        await Turtle.delay(this.delaytime);
    }

    pendown() {
        this.pen = true;
    }

    penup() {
        this.pen = false;
    }

    /**
     * Bewegt die Turtle um width schritte in die aktuelle Richtung
     * @param {number} width 
     */
    async forward(width) {
        if (isNaN(width)) return;
        let width_x = Math.sin(Math.PI * this.dir / 180) * width;
        let width_y = -Math.cos(Math.PI * this.dir / 180) * width;
        await this.goto(this.pos_x + width_x, this.pos_y + width_y);
    }

    turnright(degrees) {
        if (!isNaN(degrees)) {
            this.dir = (this.dir + degrees) % 360
        }
    }

    static delay(milliseconds){
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }

}