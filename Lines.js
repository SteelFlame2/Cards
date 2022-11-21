let canv = document.getElementById("canvas");
let ctx = canv.getContext("2d");

function magnitude(a) {
    return Math.sqrt((a[0] ** 2) + (a[1] ** 2));
}
function normalize(a) {
    let m = magnitude(a);
    return [a[0] / m, a[1] / m];
}
function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
}
function pseudoDot(a, b) {
    return a[0] * b[1] - b[0] * a[1];
}

function getInViewport(x, y) {
    if (Array.isArray(x)) {
        return [x[0] - windowScroll[0], x[1] - windowScroll[1]];
    }
    return [x - windowScroll[0], y - windowScroll[1]];
}

var nominalLength = 5;
var selectionSquare = {
    min: [0, 0],
    max: [0, 0],
    isExist: false
};

document.body.addEventListener("mousedown", (e) => {
    if (e.button == 1) e.preventDefault()
});
var mousePosition = [];

let onLineHoveredFuncs = [];
class Line {
    constructor(card1 = undefined, card2 = undefined, id = -1, Thickness = 1) {
        this.id = id;

        this.card1 = card1;
        this.card2 = card2;

        this.dom1 = this.card1.cardDOM;
        this.dom2 = this.card2.cardDOM;

        this.thickness = Thickness;
        this.hovered = false;

        document.addEventListener("mousemove", (e) => {
            if (this.isHovered(e.clientX, e.clientY)) {
                this.hovered = true;
                for (let i = 0; i < onLineHoveredFuncs.length; i++) {
                    onLineHoveredFuncs[i](this);
                }
                needLineRedraw = true;
            } else {
                this.hovered = false;
            }
        });
    }
    draw() {
        ctx.strokeStyle = "white";
        ctx.lineWidth = this.thickness;//Number(Cards[5].cardDOM.style.left.slice(0,-2))
        let p1 = getInViewport([Number(this.dom1.style.left.slice(0,-2)) + this.dom1.clientWidth / 2, Number(this.dom1.style.top.slice(0,-2))]);
        let p2 = getInViewport([Number(this.dom2.style.left.slice(0,-2)) + this.dom2.clientWidth / 2, Number(this.dom2.style.top.slice(0,-2))]);

        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.stroke();
    }
    isHovered(mx, my) {
        let delta1 = [
            (Number(this.dom2.style.left.slice(0,-2))  + this.dom2.clientWidth / 2) - (Number(this.dom1.style.left.slice(0,-2)) + this.dom1.clientWidth / 2),
            Number(this.dom2.style.top.slice(0,-2))  - Number(this.dom1.style.top.slice(0,-2)),
        ];
        let delta2 = [
            (Number(this.dom1.style.left.slice(0,-2))  + this.dom1.clientWidth / 2) - (mx + window.scrollX),
            Number(this.dom1.style.top.slice(0,-2))  - (my + window.scrollY),
        ];
        let L = dot(normalize(delta1), [-delta2[0], -delta2[1]]);
        if (Math.abs(pseudoDot(delta2, normalize(delta1))) < 12 &&
            L > 0 && L < magnitude(delta1)) {
            return true;
        }
        return false;
    }
    getLineData() {
        return { firstCardIndex: this.card1.id, secondCardIndex: this.card2.id, thick: this.thickness };
    }
}
var Lines = [];

function reformatLines() {
    let _Lines = [];
    for (let i = 0; i < Lines.length; i++) {
        _Lines.push({ p1: Lines[i].card1, p2: Lines[i].card2 });
    }
    return _Lines;
}
function createNewLine(card1, card2) {
    let newL = Lines.push(new Line(card1, card2, Lines.length));
    card1.connectedLines.push(Lines[newL - 1]);
    card2.connectedLines.push(Lines[newL - 1]);
    needLineRedraw = true;
}
function deleteLine(id, refreshConnections = false) {
    if (refreshConnections) {
        for (let i = 0; i < Cards.length; i++) {
            for (let j = 0; j < Cards[i].connectedLines.length; j++) {
                if (Cards[i].connectedLines[j] == Lines[id]) {
                    Cards[i].connectedLines.splice(j, 1);
                }
            }
        }
    }
    for (let i = id; i < Lines.length; i++) {
        Lines[i].id--;
        Lines[i].dom1 = Lines[i].card1.cardDOM;
        Lines[i].dom2 = Lines[i].card2.cardDOM;
    }
    Lines.splice(id, 1);
    needLineRedraw = true;
}

function findConnectedLines(StartLines, exceptionLines) {
    let connectedLines = [];
    for (let i = 0; i < StartLines.length; i++) {
        let sDom1 = StartLines[i].dom1;
        let sDom2 = StartLines[i].dom2;
        let lineNeighbors = [];
        for (let j = 0; j < Lines.length; j++) {
            if ((Lines[j].dom1 == sDom1 && Lines[j].dom2 == sDom2)) continue;
            if (exceptionLines.includes(Lines[j])) continue;
            if (Lines[j].dom1 == sDom1 || Lines[j].dom1 == sDom2) {
                lineNeighbors.push(Lines[j]);
                exceptionLines.push(Lines[j]);
            }
            if (Lines[j].dom2 == sDom1 || Lines[j].dom2 == sDom2) {
                lineNeighbors.push(Lines[j]);
                exceptionLines.push(Lines[j]);
            }
        }
        connectedLines.push(lineNeighbors);
    }
    return connectedLines;
}
function findFirstLines() {
    let firstLines = [];
    for (let i = 0; i < Lines.length; i++) {
        if (Lines[i].card1 == Cards[0] || Lines[i].card2 == Cards[0]) {
            firstLines.push(Lines[i]);
        }
    }
    return firstLines;
}
function findHoveredLineInPoint(x, y) {
    if (typeof x == "object") {
        for (let i = 0; i < Lines.length; i++) {
            if (Lines[i].isHovered(x[0], x[1])) {
                return [true, i];
            }
        }
        return [false];
    }
    for (let i = 0; i < Lines.length; i++) {
        if (Lines[i].isHovered(x, y)) {
            return [true, i];
        }
    }
    return [false, -1];
}
function executeForLinesTree(_StartLines, FuncForLines = (index, line) =>{}) {
    let StartLines = _StartLines;
    if (Lines.length == 0) {
        console.log("Lines length = 0");
        return;
    }
    let exceptions = [];
    let S = [];
    for (let i = 0; i < StartLines.length; i++) {
        S.push(StartLines[i]);
        exceptions.push();//StartLines[i]
    }
    let last = findConnectedLines(S, exceptions);
    let ind = 1;
    while (true) {
        let comparedLast = [];
        for (let i = 0; i < last.length; i++) {
            for (let j = 0; j < last[i].length; j++) {
                comparedLast.push(last[i][j]);
            }
        }
        for (let i = 0; i < comparedLast.length; i++) {
            FuncForLines(ind, comparedLast[i]);
        }
        if (comparedLast.length == 0) break;
        last = findConnectedLines(comparedLast, exceptions);
        ind++;
    }
}
var mainLine = -1;
function setThickness(StartLines = findFirstLines()) {
    StartLines = [Lines[mainLine]];
    Lines[mainLine].thickness = 1;
    executeForLinesTree(StartLines,(ind,line)=>{
        line.thickness = Math.max(nominalLength - ind * 1.2, 1);
    });
    if (mainLine != -1)
        Lines[mainLine].thickness = nominalLength;
    needLineRedraw = true;
}

document.addEventListener("wheel", (e)=>{
    let hover = findHoveredLineInPoint(e.clientX,e.clientY);
    if (hover[0]) {
        nominalLength += 1 * -e.deltaY/100;
        Lines[hover[1]].thickness = nominalLength;
    }
    needLineRedraw = true;
});

let needLineRedraw = true;

function updateLines() {
    if (selectionSquare.isExist)
        needLineRedraw = true;
    if (!needLineRedraw) {
        requestAnimationFrame(updateLines);
        return;
    }
    console.log("redraw");
    ctx.fillStyle = "black";
    ctx.clearRect(0, 0, canv.width, canv.height);
    if (selectionSquare.isExist) {
        ctx.strokeStyle = "white";
        // ctx.strokeRect(selectionSquareInView.min[0], selectionSquareInView.min[1], selectionSquareInView.max[0], selectionSquareInView.max[1]);
        ctx.strokeRect(selectionSquare.min[0] - window.scrollX, selectionSquare.min[1] - window.scrollY, selectionSquare.max[0], selectionSquare.max[1]);
    }
    for (let i = 0; i < Lines.length; i++) {
        Lines[i].draw();
    }
    needLineRedraw = false;
    requestAnimationFrame(updateLines);
}
requestAnimationFrame(updateLines);