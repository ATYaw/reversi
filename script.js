/*
Model
Logic
View

*/


const boardEl = document.getElementById("board");
const countFrontEl = document.getElementById("count-front");
const countBackEl = document.getElementById("count-back");
const restartEl = document.getElementById("restart");


const context = new AudioContext();

// #define
const FRONT = 1;
const BACK = 2;
const BOARD_SIZE = 8;


let board = [
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,2,1,0,0,0],
    [0,0,0,1,2,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0]    
];


const directions = [
    [-1, -1], [0, -1], [1, -1],
    [-1,  0],          [1,  0],
    [-1,  1], [0,  1], [1,  1]
];

let turn = FRONT;






// main
main();
function main() {
    restartEl.addEventListener("click", restartGame);
    boardEl.addEventListener("click", clickCelleventList);
    createBoard();
    updateBoard();
}




// callback
function restartGame() {
    board[0] = [0,0,0,0,0,0,0,0];
    board[1] = [0,0,0,0,0,0,0,0];
    board[2] = [0,0,0,0,0,0,0,0];
    board[3] = [0,0,0,2,1,0,0,0];
    board[4] = [0,0,0,1,2,0,0,0];
    board[5] = [0,0,0,0,0,0,0,0];
    board[6] = [0,0,0,0,0,0,0,0];
    board[7] = [0,0,0,0,0,0,0,0];
    
    turn = FRONT;

    updateBoard();
}


function clickCelleventList(e) {
    const cellEl = e.target.closest(".cell");
    
    if(!cellEl) return;
    
    const x = Number(cellEl.dataset.x);
    const y = Number(cellEl.dataset.y);
    
    putStone(x, y);    
}


function updateCell(x, y) {

    const cellEl = document.querySelector(
        `[data-x="${x}"][data-y="${y}"]`
    );

    const stoneEl =
        cellEl.querySelector(".stone");

    if(board[y][x] === 0) {

        stoneEl.style.display = "none";
        stoneEl.classList.remove("back");

        return;
    }

    stoneEl.style.display = "block";

    if(board[y][x] === BACK) {
        stoneEl.classList.add("back");
    }
    else {
        stoneEl.classList.remove("back");
    }
}


function createBoard() {

    boardEl.innerHTML = "";

    for(let y = 0; y < BOARD_SIZE; y++) {

        for(let x = 0; x < BOARD_SIZE; x++) {

            const cellEl =
                createCellEl(x, y);

            const stoneEl =
                document.createElement("div");

            stoneEl.classList.add("stone");
            stoneEl.style.display = "none";

            cellEl.appendChild(stoneEl);

            boardEl.appendChild(cellEl);
        }
    }
}

function updateBoard() {

    drawCount();

    for(let y = 0; y < BOARD_SIZE; y++) {

        for(let x = 0; x < BOARD_SIZE; x++) {

            updateCell(x, y);
        }
    }
}




function drawCount() {
    const flont = countStone(FRONT);
    const back = countStone(BACK);

    countFrontEl.textContent = flont;
    countBackEl.textContent = back;
}



function createCellEl(x, y) {
    const cellEl = document.createElement("div")
    cellEl.classList.add("cell");

    cellEl.dataset.x = x;
    cellEl.dataset.y = y;

    return cellEl;    
}


function createStoneEl(side) {
    const stoneEl = document.createElement("div");
    stoneEl.classList.add("stone");

    if(side === BACK) {
        stoneEl.classList.add("back");
    }
    
    return stoneEl;
}



function putStone(x, y) {
    if(!canPutStone(x, y)) {
        return;
    }

    board[y][x] = turn;

    updateCell(x, y);

    flipStone(x, y);

    changeTurn();

    if(!hasValidMove()) {
        changeTurn();

        if(!hasValidMove()) {
            updateBoard();
            gameOver();
            return;
        }

        alert("pass");
    }

}


function flipStone(x, y) {
    const stones = getFlippableStones(x, y);

    for(const [fx, fy] of stones) {
        board[fy][fx] = turn;

        updateCell(fx, fy);
    }
}

function canPutStone(x, y) {
    if(board[y][x] !== 0) {
        return false;
    }

    return getFlippableStones(x, y).length > 0;
}

function getFlippableStones(x, y) {

    const enemy = turn === BACK ? FRONT : BACK;

    const result = [];

    for(const [dx, dy] of directions) {

        let nx = x + dx;
        let ny = y + dy;

        const stones = [];

        while(
            nx >= 0 && nx < BOARD_SIZE &&
            ny >= 0 && ny < BOARD_SIZE &&
            board[ny][nx] === enemy
        ) {
            stones.push([nx, ny]);

            nx += dx;
            ny += dy;
        }

        if(
            stones.length > 0 &&
            nx >= 0 && nx < BOARD_SIZE &&
            ny >= 0 && ny < BOARD_SIZE &&
            board[ny][nx] === turn
        ) {
            result.push(...stones);
        }
    }

    return result;
}

function hasValidMove() {
    for(let y = 0; y < BOARD_SIZE; y++) {
        for(let x = 0; x < BOARD_SIZE; x++) {

            if (canPutStone(x, y)) {
                return true;
            }
        }
    }

    return false;
}


function gameOver() {
    const frontCount = countStone(FRONT);
    const backCount = countStone(BACK);
    
    let message = "";
    
    if(frontCount > backCount) {
        message = "FRONT Wins"
    } else if(backCount > frontCount) {
        message = "BACK Wins"
    } else {
        message = "No Winner"
    }
    alert(message);
}

function countStone(side) {
    let count = 0;

    for(let y = 0; y < BOARD_SIZE; y++) {
        for(let x = 0; x < BOARD_SIZE; x++) {

            if(board[y][x] === side) {
                count++;
            }
        }
    }

    return count;
}

function changeTurn() {
    turn = turn === BACK ? FRONT : BACK;

    playSound();
}



function playSound() {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.frequency.value = 800;

    oscillator.start();

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        context.currentTime + 0.1
    );

    oscillator.stop(context.currentTime + 0.1);
}



