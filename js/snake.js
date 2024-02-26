let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let rows = 30;
let cols = 30;
let snake = [
    { x: 2, y: 3 },
    { x: 2, y: 4 },
    { x: 2, y: 5 }
];
let food = { x: 5, y: 5 };
let foodCollected = false;
let cellWidth = canvas.width / cols;
let cellHeight = canvas.height / rows;
let direction = 'LEFT';
let intervallTime = 300;
let minIntervallTime = 50;
let pause = false;
let autopilot = false;
let lastSpiralRight = true;

placeFood()

let interval = setInterval(gameLoop, intervallTime);

document.addEventListener('keydown', keyDown);

draw();

function shiftSnake() {
    for (let i = snake.length - 1; i > 0; i--) {
        const part = snake[i];
        const lastPart = snake[i - 1];
        part.x = lastPart.x;
        part.y = lastPart.y;

    }
}

function togglePause() {
    pause = !pause;
    if (pause) {
        document.getElementById('info').innerHTML = "Pause";
    } else {
        document.getElementById('info').innerHTML = "";
    }
}

function keyDown(e) {
    console.log(e);
    if (e.keyCode == 37) {
        direction = 'LEFT';
    }
    if (e.keyCode == 38) {
        direction = 'UP';
    }
    if (e.keyCode == 39) {
        direction = 'RIGHT';
    }
    if (e.keyCode == 40) {
        direction = 'DOWN';
    }
    if (e.key == 'p') {
        togglePause();
    }
    if (e.key == '+') {
        intervallTime-=5;
        if (intervallTime<50) {
            intervallTime=50;
        }
        updateTimer();
    }
    if (e.key == 'a') { //toggle Autopilot
        autopilot = !autopilot;
        document.getElementById('info').innerHTML = "Autopilot: " + autopilot;
    }
}

function setDirectionByAutopilot() {
    console.log("Autopilot");
    //checken ob food in der Nähe
    if (snake[0].y == food.y && food.x != snake[0].x && (direction == 'UP' || direction == 'DOWN')) {
        if (snake[0].x < food.x) {
            direction = 'RIGHT';
        } else {
            direction = 'LEFT';
        }
    }
    //felder Frei
    let nextField = isNextFieldFree();
    let overNextField = isNextFieldFree(2);
    turnLeft();
    let leftField = isNextFieldFree();
    let secLeftField = isNextFieldFree(2);
    turnAround();
    let rightField = isNextFieldFree();
    let secRightField = isNextFieldFree(2);
    turnLeft(); //Direction wie zu Anfang
    if (!nextField) { //Drehung nötig!
        if (!leftField) { //Links und vorne nicht frei
            turnRight();
        } else { //Links wäre möglich
            if (!rightField) { //muss nach Links
                turnLeft();
            } else { //Links und rechts möglich
                if (!secLeftField) { //Rechts scheint sinniger
                    turnRight();
                } else {
                    turnLeft();
                }
            }
        }
    } else { //Weiter gerade aus ginge
        if (!overNextField) { //Aber wir sind zwei vor einem Hindernis
            if (!leftField || !secLeftField) {//Links geht nicht oder ist auch nicht sinnvoller
                if (rightField) { //Rechts ist mindestens genau so sinnvoll
                    if (lastSpiralRight && leftField && !secRightField) { //Die letzte Drehung ging nach rechts
                        turnLeft();
                        lastSpiralRight = false;
                    } else {
                        turnRight();
                        if (leftField) { //links war frei aber der zweite nicht
                            lastSpiralRight = true;
                        }
                    }
                }
            } else { //Links wäre eine sinnvolle Option
                if (!rightField || !secRightField) { //rechts geht nicht oder ist nicht sinnvoll
                    turnLeft();
                    if (rightField) { //rechts war frei aber der zweite nicht
                        lastSpiralRight = false;
                    }
                } else { //Rechts ist auch sinnvoll
                    if (Math.random() < 0.5) {
                        turnLeft();
                    } else {
                        turnRight();
                    }
                }
            }


        }
    }

    /*
    //prüfen ob nächstes Feld frei ist
    if (!isNextFieldFree()) {
        //wenn nicht nach links oder rechts abbiegen
        if (Math.random() < 0.5) {
            turnLeft();
            if (!isNextFieldFree()) {
                turnLeft();
                turnLeft();
            } 
        } else {
            turnRight();
            if (!isNextFieldFree()) {
                turnLeft();
                turnLeft();
            } 
        }
    }
    */
}

function isNextFieldFree(factor = 1) {
    //console.log("Check Next Field");
    let current = JSON.parse(JSON.stringify(snake[0]));
    if (direction == 'LEFT') {
        current.x -= factor;
    }
    if (direction == 'RIGHT') {
        current.x += factor;
    }
    if (direction == 'UP') {
        current.y -= factor;
    }
    if (direction == 'DOWN') {
        current.y += factor;
    }
    if (istPosInSchlange(current.x, current.y)) {
        //console.log("Autopilot - Schlange im Weg");
        return false;
    }
    if (current.x < 0 || current.y < 0 || current.x >= cols || current.y >= rows) {
        //console.log("Autopilot - Rand im Weg");
        return false;
    }
    //console.log("Autopilot - alles frei", direction, current.x, current.y, Math.random());
    return true;

}

function istPosInSchlange(x, y) {
    return !snake.every(part => !(part.x == x && part.y == y));
}

function turnLeft() {
    switch (direction) {
        case 'LEFT':
            direction = 'DOWN';
            break;
        case 'RIGHT':
            direction = 'UP';
            break;
        case 'UP':
            direction = 'LEFT';
            break;
        case 'DOWN':
            direction = 'RIGHT';
            break;
    }
}

function turnRight() {
    switch (direction) {
        case 'LEFT':
            direction = 'UP';
            break;
        case 'RIGHT':
            direction = 'DOWN';
            break;
        case 'UP':
            direction = 'RIGHT';
            break;
        case 'DOWN':
            direction = 'LEFT';
            break;
    }
}
function turnAround() {
    switch (direction) {
        case 'LEFT':
            direction = 'RIGHT';
            break;
        case 'RIGHT':
            direction = 'LEFT';
            break;
        case 'UP':
            direction = 'DOWN';
            break;
        case 'DOWN':
            direction = 'UP';
            break;
    }
}
function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';

    snake.forEach(part => addSquare(part.x, part.y));

    ctx.fillStyle = 'yellow';
    addSquare(food.x, food.y);

    requestAnimationFrame(draw);

}

function addSquare(x, y) {
    ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth - 1, cellHeight - 1);
}

function updateTimer() {
    clearInterval(interval);
    interval = setInterval(gameLoop, intervallTime);
    document.getElementById('timer').innerHTML = intervallTime;
}

function gameLoop() {
    //console.log("Pos 1,1:",istPosInSchlange(1,1));
    if (pause) return;
    if (autopilot) {
        setDirectionByAutopilot();
    }
    // Schlange ggf. verlängern
    if (foodCollected) {
        snake = [{ x: snake[0].x, y: snake[0].y }, ...snake];
        intervallTime = minIntervallTime+Math.floor(0.98 * (intervallTime-minIntervallTime));
        updateTimer();

        document.getElementById('length').innerHTML = snake.length;

        foodCollected = false;
    } else {
        // wenn verlängert wurde muss sich nur der Kopf bewegen
        shiftSnake();
    }
    //bewegen
    if (direction == 'LEFT') {
        snake[0].x--;
    }
    if (direction == 'RIGHT') {
        snake[0].x++;
    }
    if (direction == 'UP') {
        snake[0].y--;
    }
    if (direction == 'DOWN') {
        snake[0].y++;
    }

    testGameOver();
    //food gefunden
    if (snake[0].x == food.x && snake[0].y == food.y) {
        //futter fressen - schlange wachsen
        foodCollected = true;
        placeFood();
    }

}

function placeFood() {
    let randy = Math.floor(Math.random() * (rows-2))+1;
    let randx = Math.floor(Math.random() * (cols-2))+1;
    //food.x = randx;
    //food.y = randy;
    food = { x: randx, y: randy };
}

function testGameOver() {
    //Schlange beißt sich
    let firstPart = snake[0];
    let otherParts = snake.slice(1);

    let duplicatePart = otherParts.find(part => part.x == firstPart.x && part.y == firstPart.y);

    // Schlange läuft gegen die Wand
    if (snake[0].x < 0 ||
        snake[0].y < 0 ||
        snake[0].x > cols - 1 ||
        snake[0].y > rows - 1 ||
        duplicatePart) {
        //Reset game
        placeFood();
        snake = [{ x: 19, y: 3 },{ x: 19, y: 3 },{ x: 19, y: 3 }];
        direction = 'LEFT';
        intervallTime = 300;
        updateTimer();
    }
}
