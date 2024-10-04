/*
    Snake Game
    Controls: arrow keys
*/

class Position {
    x;
    y;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}



//  The method that is called when the page loades
window.onload = function() {
    canvas = document.getElementById("content_canvas");
    context = canvas.getContext("2d");

    resizeCanvas();

    document.addEventListener("keydown", keydownEvent);
    window.addEventListener("resize", resizeCanvas);

    setInterval(game, 100);
    setInterval(draw, 16);
}



var is_running = true;

//  Change the value to whatever you want
const grid_amount = 31;

var tile_size;

var score;
var highscore = 0;
var deaths = 0;

var direction;
var next_direction;

var head;
var tiles;

var apple;
var golden_apple;


//  Assets

//  Images
const appleImg = new Image();
appleImg.src = "assets/images/apple.png";

const goldenAppleImg = new Image();
goldenAppleImg.src = "assets/images/golden_apple.png";

const headImg = new Image();
headImg.src = "assets/images/head.png";

const headOpenMouthImg = new Image();
headOpenMouthImg.src = "assets/images/head_open_mouth.png";

const tailImg = new Image();
tailImg.src = "assets/images/tail.png";

const tileImg = new Image();
tileImg.src = "assets/images/tile.png";

//  Audios
const eatingAudio = new Audio("assets/sounds/eating.mp3");

const goldenAppleAudio = new Audio("assets/sounds/golden_apple.mp3");

const loosingAudio = new Audio("assets/sounds/loosing.mp3");


reset();



//  Reset for turning all variables back to normal, except of permanent variables
function reset() {
    score = 0;

    direction = 0;
    next_direction = 0;

    head = new Position(Math.round(grid_amount / 2) - 1, Math.round(grid_amount / 2));
    tiles = [];

    respawnApple();
}


//  The Game Loop
function game() {
    if(!is_running) return;

    moveSnake();
    checkDeath();
    checkApple();
}


function respawnApple() {
    apple = getAllPossibleAppleLocations()[Math.floor(Math.random() * getAllPossibleAppleLocations().length)];
    golden_apple = Math.floor(Math.random() * 4) === 0;
}


function resizeCanvas() {
    if(window.innerWidth > window.innerHeight) {
        canvas.width = window.innerHeight - 40;
        canvas.height = window.innerHeight - 20;
        canvas.style.margin = `10px 0px 0px ${window.innerWidth / 2 - canvas.width / 2}px`;
    }
    else {
        canvas.width = window.innerWidth - 20;
        canvas.height = window.innerWidth - 20;
        canvas.style.margin = `${window.innerHeight / 2 - canvas.height / 2}px 0px 0px 10px`;
    }
    tile_size = canvas.width / grid_amount;

    draw();
}

function moveSnake() {
    if(tiles.length > 0) {
        for(var i = tiles.length - 1; i > 0; i--) {
            tiles[i].x = tiles[i - 1].x;
            tiles[i].y = tiles[i - 1].y;
        }

        tiles[0].x = head.x;
        tiles[0].y = head.y;
    }

    direction = next_direction;
    switch(direction) {
        case 1: head.y--; break;
        case 2: head.x++; break;
        case 3: head.y++; break;
        case 4: head.x--; break;
    }
}

function checkDeath() {
    for(var i = 0; i < tiles.length; i++) {
        if(head.x === tiles[i].x && head.y === tiles[i].y) {
            death();
            return;
        }
    }

    if(head.x < 0 || head.x >= grid_amount || head.y < 0 || head.y >= grid_amount) {
        death();
        return;
    }
}

function death() {
    loosingAudio.play();

    deaths++;
    reset();
}

function checkApple() {
    if(head.x === apple.x && head.y === apple.y) {
        tiles.push(new Position(head.x, head.y));
        score += golden_apple ? 2 : 1;
        if(score > highscore) {
            highscore = score;
        }
        
        (golden_apple ? goldenAppleAudio : eatingAudio).play();

        respawnApple();
    }
}



function draw() {
    drawGame();
    drawInfoBar();
}

function drawGame() {
    //background
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.height, canvas.width);

    //apple
    context.drawImage(golden_apple ? goldenAppleImg : appleImg, apple.x * tile_size, apple.y * tile_size, tile_size, tile_size);

    //head
    drawRotatedImage(getDistance(head, apple) < grid_amount / 10 ? headOpenMouthImg : headImg, (direction - 1) * 90 * Math.PI / 180, head.x * tile_size, head.y * tile_size, tile_size, tile_size);

    //tiles
    for(var i = 0; i < tiles.length - 1; i++) {
        context.drawImage(tileImg, tiles[i].x * tile_size, tiles[i].y * tile_size, tile_size, tile_size);
    }

    //tail
    if(tiles.length > 0) drawRotatedImage(tailImg, (getTailDirection() - 1) * 90 * Math.PI / 180, tiles[tiles.length - 1].x * tile_size, tiles[tiles.length - 1].y * tile_size, tile_size, tile_size);

    //move information
    context.fillStyle = "white";
    if(direction === 0) context.fillText("use the arrow keys to move...", 5, 10);
}

function drawInfoBar() {
    //background
    context.fillStyle = is_running ? "darkgreen" : "darkred";
    context.fillRect(0, canvas.height - 20, canvas.width, canvas.height);

    //text
    context.fillStyle = "white";
    context.fillText(`score: ${score}`, canvas.width / 5, canvas.height - 5);
    context.fillText(`highscore: ${highscore}`, canvas.width / 5 * 2, canvas.height - 5);
    context.fillText(is_running ? "▷" : "||", canvas.width / 5 * 3, canvas.height - 5);
    context.fillText(`deaths: ${deaths}`, canvas.width / 5 * 4, canvas.height - 5);
}



function keydownEvent(event) {
    //pause key
    if(event.code === "Space") {
        is_running = !is_running;
    }

    //move keys
    if(is_running) {
        switch(event.code) {
            case "ArrowUp": if(direction != 3) next_direction = 1; break;
            case "ArrowRight": if(direction != 4) next_direction = 2; break;
            case "ArrowDown": if(direction != 1) next_direction = 3; break;
            case "ArrowLeft": if(direction != 2) next_direction = 4; break;
        }
    }
}



function getAllPossibleAppleLocations() {
    var locations = [];
    for(var x = 0; x < grid_amount; x++) {
        for(var y = 0; y < grid_amount; y++) {
            var taken = false;

            tiles.forEach(tile => {
                if(tile.x === x && tile.y === y) taken = true;
            });

            if(getDistance(head, new Position(x, y)) < grid_amount / 10) taken = true;

            if(!taken) {
                locations.push(new Position(x, y));
            }
        }
    }
    return locations;
}

function drawRotatedImage(image, angle , positionX, positionY, width, height) {
    context.translate(positionX + width / 2, positionY + height / 2);
    context.rotate(angle);
    context.drawImage(image, -width / 2, -height / 2, width, height);
    context.rotate(-angle);
    context.translate(-(positionX + width / 2), -(positionY + height / 2));
}

function getTailDirection() {
    const x1 = tiles.length > 1 ? tiles[tiles.length - 2].x : head.x;
    const y1 = tiles.length > 1 ? tiles[tiles.length - 2].y : head.y;
    const x2 = tiles[tiles.length - 1].x;
    const y2 = tiles[tiles.length - 1].y;

    if(x1 === x2) {
        return y1 === y2 + 1 ? 3 : 1;
    }
    if(y1 === y2) {
        return x1 === x2 + 1 ? 2 : 4;
    }
    return 0;
}

function getDistance(pos1, pos2) {
    return Math.sqrt((pos2.x - pos1.x) ** 2 + (pos2.y - pos1.y) ** 2);
}