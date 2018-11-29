var players = ["player1", "player2"];
var curPlayer = players[0];
var otherPlayer = players[1];
var gW = 7;
var gH = 6;
var winLen = 4;
var winStr = winCondition();
var styleList = document.styleSheets;
var move = 0;
var single = true;

function getStyle(name) {
    for (var i = 0; i < styleList.length; i++) {
        if (styleList[i] == name) return styleList[i];
    }
}

function winCondition() {
    winStr = "";
    while (winLen > 0) {
        winStr += "w";
        winLen--;
    }
    return winStr;
}
// Initialize game Board
var gameBoard = document.getElementById("container");
var columns = gameBoard.getElementsByClassName("column");
var ui = document.getElementsByClassName("ui")[0];

var message = document.getElementsByTagName("H1")[0];
message.innerHTML = "LET'S DO IT!";
setTimeout(() => (message.innerHTML = ""), 600);
setTimeout(() => {
    message.style.color = "cadetblue";
    message.innerHTML = curPlayer;
}, 800);

function Grid(w, h) {
    this.width = w;
    this.height = h;
    this.init();
}
Grid.prototype = [];
Grid.prototype.init = function() {
    for (var y = 0; y < this.height; y++) {
        this.push([]);
        for (var x = 0; x < this.width; x++) {
            this[y].push(0);
        }
    }
};
Grid.prototype.at = function(x, y) {
    return this[y][x];
};
var board = new Grid(gW, gH);
renderGrid(board);

function renderGrid(grid) {
    for (var x = 0; x < grid.width; x++) {
        var column = document.createElement("div");
        column.className = "column";
        gameBoard.append(column);
        for (var y = 0; y < grid.height; y++) {
            var slot = document.createElement("div");
            slot.className = "slot";
            column.append(slot);
        }
    }
}

document.addEventListener("keydown", function(e) {
    if (e.keyCode == "32") {
        parseBoard();
    }
});

var patAll = [
    ["0222", "0111"],
    ["1110", "0111", "2220", "0222"],
    ["011", "022"],
    ["110", "011", "220", "022"]
    // ["01"],
    // ["10", "01"]
];

function parseBoard() {
    for (var p = 0; p < patAll.length; p++) {
        for (var b = 0; b < patAll[p].length; b++) {
            if (p % 2 == 0) {
                if (checkCols(patAll[p][b])) return;
            } else {
                if (checkRows(patAll[p][b])) return;
            }
        }
    }
    autoDrop(1);
}

function checkCols(ptrn) {
    var str = "";
    for (var x = 0; x < gW; x++) {
        str = "";
        for (var y = 0; y < gH; y++) {
            str += makePattern(x, y);
        }
        if (findPattern(str, ptrn) > -1) {
            dropPiece(columns[x]);
            return true;
        }
    }
}

function checkRows(ptrn) {
    var str = "";
    var pos = 0;
    for (var y = 0; y < gH; y++) {
        str = "";
        for (var x = 0; x < gW; x++) {
            str += makePattern(x, y);
        }
        pos = findPattern(str, ptrn);
        if (pos > -1) {
            if (ptrn.indexOf("0") == 0 && isBased(pos, y)) {
                dropPiece(columns[pos]);
                return true;
            } else if (isBased(pos + ptrn.indexOf("0"), y)) {
                dropPiece(columns[pos + ptrn.indexOf("0")]);
                return true;
            }
        }
    }
}

function isBased(x, y) {
    if (y + 1 >= gH) {
        return true;
    }
    if (slotAt(x, y + 1).classList.length > 1) {
        return true;
    }
    return false;
}

function makePattern(x, y) {
    var str = "";
    var slot = slotAt(x, y);

    if (slot.classList.contains(curPlayer)) {
        str += "1";
    } else if (slot.classList.contains(otherPlayer)) {
        str += "2";
    } else {
        str += "0";
    }
    return str;
}

function findPattern(str, ptrn) {
    var pos = str.indexOf(ptrn);
    if (pos > -1) {
        // str = cutStr(str, pos, pos + pat.length);
        return pos;
    }
}

function cutStr(str, cutStart, cutEnd) {
    return str.substr(0, cutStart) + str.substr(cutEnd + 1);
}

function slotAt(x, y) {
    return gameBoard.childNodes[x].childNodes[y];
}
//----------------------------------------------------

gameBoard.addEventListener("click", function(e) {
    if (e.target.classList.contains("slot")) {
        dropPiece(e.target.parentNode);
    } else {
        dropPiece(e.target);
    }
});

function switchPlayer() {
    if (curPlayer == players[0]) {
        curPlayer = players[1];
        otherPlayer = players[0];
    } else {
        curPlayer = players[0];
        otherPlayer = players[1];
    }
    setTimeout(() => {
        message.innerHTML = curPlayer;
        if (curPlayer == players[0]) {
            message.style.color = "cadetblue";
        } else {
            if (single) parseBoard();
            message.style.color = "coral";
        }
    }, 1050);
}

function autoDrop(num) {
    var rndCol = 0;
    for (var i = 0; i < num; i++) {
        rndCol = Math.floor(Math.random() * gW);
        dropPiece(columns[rndCol]);
    }
}
//autoDrop(18);
function dropPiece(obj) {
    var arrCol = Array.from(obj.children).reverse();
    var colInd = [].slice.call(obj.parentElement.children).indexOf(obj);
    var isFull = true;
    for (var i = 0; i < arrCol.length; i++) {
        if (
            arrCol[i].classList.length == 1 &&
            arrCol[i].classList.contains("slot")
        ) {
            arrCol[i].classList.add(curPlayer);
            board[gH - 1 - i][colInd] = players.indexOf(curPlayer) + 1;
            move += 1;
            dropAnim(arrCol[i]);
            isFull = false;
            break;
        }
    }
    if (isFull) return;
    var checks = [
        arrCol,
        getRow(arrCol.length - i),
        getDiagR(arrCol[i], arrCol.length - i, colInd),
        getDiagL(arrCol[i], arrCol.length - i, colInd)
    ];
    var win;
    var c = 0;
    while (c < 4) {
        win = checkWin(checks[c]);
        if (win) {
            message.innerHTML = win.toUpperCase();
            break;
        }
        c++;
    }

    if (!win) switchPlayer();
    if (win) {
        setTimeout(function() {
            var clean = document.getElementsByClassName("slot");
            for (var item of clean) {
                item.classList.remove("player1");
                item.classList.remove("player2");
                message.innerHTML = "ONE MORE TIME!";
                //ui.style.display = "inherit";
            }
        }, 3000);
    }
}

function dropAnim(obj) {
    var style = window.getComputedStyle(obj);
    var x;
    var y;
    x = obj.offsetLeft - parseInt(style.marginLeft, 10);
    y = obj.offsetTop - parseInt(style.marginTop, 10);
    var clone = obj.cloneNode(true);
    obj.style.visibility = "hidden";
    clone.classList.add("anim");
    clone.style.left = x + "px";
    clone.style.top = y + "px";
    gameBoard.prepend(clone);
    setTimeout(() => {
        clone.classList.remove("anim");
        clone.classList.add("animIn");
        clone.addEventListener("transitionend", function() {
            obj.style.visibility = "visible";
            gameBoard.removeChild(this);
        });
    }, 0);
}
function checkWin(arr) {
    var pattern = "";
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].classList.contains(curPlayer)) {
            pattern += "w";
        } else {
            pattern += "x";
        }
    }
    return pattern.indexOf(winStr) > -1 ? curPlayer + " WINS!" : null;
}

function getRow(slotInd) {
    var row = document.querySelectorAll(
        ".column .slot:nth-child(" + slotInd + ")"
    );
    return row;
}

function getDiagR(slot, row, col) {
    var diag = [];
    var nextSlot;
    var nextCol = slot.parentNode.nextSibling;
    for (var i = 1; i < gW - col; i++) {
        nextSlot = nextCol.querySelector(".slot:nth-child(" + (row - i) + ")");
        if (nextSlot) {
            diag.unshift(nextSlot);
        } else {
            break;
        }
        nextCol = nextCol.nextSibling;
    }
    diag.push(slot); //add curPlayer last slot
    nextCol = slot.parentNode.previousSibling;
    for (var j = col; j > 0; j--) {
        var pos = row + (col - j + 1);
        nextSlot = nextCol.querySelector(".slot:nth-child(" + pos + ")");
        if (nextSlot) {
            diag.push(nextSlot);
        } else {
            break;
        }
        nextCol = nextCol.previousSibling;
    }
    return diag;
}

function getDiagL(slot, row, col) {
    var diag = [];
    var nextSlot;
    var nextCol = slot.parentNode.nextSibling;
    for (var i = 1; i < gW - col; i++) {
        nextSlot = nextCol.querySelector(".slot:nth-child(" + (row + i) + ")");
        if (nextSlot) {
            diag.unshift(nextSlot);
        } else {
            break;
        }
        nextCol = nextCol.nextSibling;
    }
    diag.push(slot); //add curPlayer last slot
    nextCol = slot.parentNode.previousSibling;
    for (var j = col; j > 0; j--) {
        var pos = row - (col - j + 1);
        nextSlot = nextCol.querySelector(".slot:nth-child(" + pos + ")");
        if (nextSlot) {
            diag.push(nextSlot);
        } else {
            break;
        }
        nextCol = nextCol.previousSibling;
    }
    return diag;
}
