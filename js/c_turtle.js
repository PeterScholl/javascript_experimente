class Turtle {
    operations = [];
    delaytime = 0; //Waits 100 ms 
    pos_x = 0;
    pos_y = 0;
    dir = 0; //direction north = 0 (360°)
    #mycanvas = null;
    #ctx = null;
    pen = false; //pen up
    pen_width = 1;
    pen_color = '#000000'; //black
    count = 1;
    index=0;

    constructor(canvas) {
        this.#mycanvas = canvas;
        this.#ctx = canvas.getContext('2d');
        this.#ctx.strokeStyle = this.pen_color; //schwarze Linienfarbe
        this.#ctx.lineWidth = this.pen_width; //Linienbreite - gerne mal mit spielen
        this.#ctx.lineJoin = 'round'; //Die Übergänge von einer Linie zur nächsten sind rund
        this.executeOperationsWithDelay();
    }

    executeOperationsWithDelay() {
        const executeNextOperation = () => {
            //console.log(this.count++);
            let cur_delay = this.delaytime;
            if (this.index < this.operations.length) {
                //console.log("Methode ausführen:", this.index);
                const { method, args, delaytime } = this.operations[this.index++];
                method(...args);
                if (typeof(delaytime) != 'undefined') {
                    //console.log("Delay angegeben");
                    cur_delay = delaytime;
                }
            }
            //console.log("Delaytime:",cur_delay, this.delaytime);
            setTimeout(executeNextOperation, cur_delay);
        };

        executeNextOperation();
    }

    goto(x, y) {
        this.operations.push({ method: this.op_goto.bind(this), args: [x, y] });
    }

    /**
     * Wenn pen = true wird eine Linie von der aktuellen Position zur Zielposition gezogen
     * ansonsten bewegt sich die Schildkröte nur dahin
     * @param {Integer} x 
     * @param {Integer} y 
     */
    op_goto(x, y) {
        //console.log("x,y", x, y);
        if (isNaN(x) || isNaN(y)) return;
        if (this.pen) { // Linie zeichnen
            this.#ctx.beginPath();
            this.#ctx.moveTo(this.pos_x, this.pos_y);
            this.#ctx.lineTo(x, y);
            this.#ctx.stroke();
        }
        this.pos_x = x;
        this.pos_y = y;
    }

    pendown() {
        this.operations.push({ method: this.op_pendown.bind(this), args: [] });
    }

    op_pendown() {
        this.pen = true;
    }

    penup() {
        this.operations.push({ method: this.op_penup.bind(this), args: [] });
    }

    op_penup() {
        this.pen = false;
    }

    forward(w) {
        //console.log("Forward: ",w);
        this.operations.push({ method: this.op_forward.bind(this), args: [w] });
    }

    /**
     * Bewegt die Turtle um width schritte in die aktuelle Richtung
     * @param {number} width 
     */
    op_forward(width) {
        //console.log("op_forward:",width); 
        if (isNaN(width)) return;
        let width_x = Math.sin(Math.PI * this.dir / 180) * width;
        let width_y = -Math.cos(Math.PI * this.dir / 180) * width;
        this.op_goto(this.pos_x + width_x, this.pos_y + width_y);
    }

    turnright(degrees) {
        this.operations.push({ method: this.op_turnright.bind(this), args: [degrees], delay: 0 });
    }

    op_turnright(degrees) {
        if (!isNaN(degrees)) {
            this.dir = (this.dir + degrees) % 360
        }
    }

    static delay(milliseconds) {
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }

}