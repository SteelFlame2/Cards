let canv = document.getElementById("canvas");
let ctx = canv.getContext("2d");

canv.width = window.innerWidth;
canv.height = window.innerHeight;
window.addEventListener("resize",(e) => {
    canv.width = window.innerWidth;
    canv.height = window.innerHeight;
});

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
function boxIntersection(p,P,A,B) {
    let t = [(A[0]-p[0])/P[0], (A[1]-p[1])/P[1], (B[0]-p[0])/P[0], (B[1]-p[1])/P[1]];

    let maxT = -Infinity, minT = Infinity, maxInd,minInd;
    for (let i = 0; i < t.length; i++) {
        if (maxT < t[i]) {
            maxT = t[i];
            maxInd = i;
        }
        if (minT > t[i]) {
            minT = t[i];
            minInd = i;
        }
    }
    if (minInd > maxInd) {
        t.splice(minInd,1);
        t.splice(maxInd,1);
    } else {
        t.splice(maxInd,1);
        t.splice(minInd,1);
    }

    if (t[0] > t[1])
        t = [t[1],t[0]];

    return t;
}
function drawArrow(a,b) {
    let direction = normalize([(b[0]-a[0]),(b[1]-a[1])]);
    let normal = normalize([(a[1]-b[1]),(b[0]-a[0])]);
    ctx.moveTo(a[0],a[1]);
    ctx.lineTo(b[0],b[1]);
    ctx.moveTo(b[0],b[1]);
    ctx.lineTo(b[0]-direction[0]*20+normal[0]*10,b[1]-direction[1]*20+normal[1]*10);
    ctx.moveTo(b[0],b[1]);
    ctx.lineTo(b[0]-direction[0]*20-normal[0]*10,b[1]-direction[1]*20-normal[1]*10);
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
    GetLineViewportPoints() {
        let card1Rect = [this.card1.styleData.pos,this.card1.styleData.size];
        let card2Rect = [this.card2.styleData.pos,this.card2.styleData.size];
        let startRectPosition = getInViewport([card1Rect[0][0], card1Rect[0][1]]);
        let endRectPosition = getInViewport([card2Rect[0][0], card2Rect[0][1]]);
        let startPoint = [startRectPosition[0]+card1Rect[1][0]/2, startRectPosition[1]+card1Rect[1][1]/2];
        let endPoint = [endRectPosition[0]+card2Rect[1][0]/2-startPoint[0], endRectPosition[1]+card2Rect[1][1]/2-startPoint[1]];

        let intersectPoint1 = boxIntersection(startPoint,endPoint,startRectPosition,[startRectPosition[0]+this.dom1.clientWidth,startRectPosition[1]+this.dom1.clientHeight]);
        let intersectPoint2 = boxIntersection(startPoint,endPoint,endRectPosition,[endRectPosition[0]+this.dom2.clientWidth,endRectPosition[1]+this.dom2.clientHeight]);
        
        intersectPoint1[1] += 0.03;
        intersectPoint2[0] += -0.03;
        
        let p1 = ([startPoint[0]+(endPoint[0])*intersectPoint1[1],startPoint[1]+(endPoint[1])*intersectPoint1[1]]);
        let p2 = ([startPoint[0]+(endPoint[0])*intersectPoint2[0],startPoint[1]+(endPoint[1])*intersectPoint2[0]]);

        return [p1,p2];
    }
    draw() {
        ctx.strokeStyle = "white";
        ctx.lineWidth = this.thickness;//Number(Cards[5].cardDOM.style.left.slice(0,-2))
        ctx.lineCap = 'round';

        let points = this.GetLineViewportPoints();

        ctx.beginPath();
        drawArrow([points[0][0],points[0][1]],[points[1][0],points[1][1]]);
        ctx.stroke();
    }
    isHovered(mx, my, maxDst = 12) {
        let p1 = [Number(this.dom1.style.left.slice(0,-2))+this.dom1.clientWidth/2, Number(this.dom1.style.top.slice(0,-2))+this.dom1.clientHeight/2];
        let p2 = [Number(this.dom2.style.left.slice(0,-2))+this.dom2.clientWidth/2, Number(this.dom2.style.top.slice(0,-2))+this.dom2.clientHeight/2];
        
        // console.log(p1,p2);

        let delta1 = [
            p2[0]-p1[0],
            p2[1]-p1[1],
        ];
        let delta2 = [
            p1[0] - (mx),
            p1[1] - (my),
        ];
        let L = dot(normalize(delta1), [-delta2[0], -delta2[1]]);
        if (Math.abs(dot([-delta2[1],delta2[0]], normalize(delta1))) < maxDst && L > 0 && L < magnitude(delta1)) {
            // console.log(dot([-delta2[1],delta2[0]], normalize(delta1)));
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
    let hover = findHoveredLineInPoint(e.pageX,e.pageY);
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
    // console.log("redraw");
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

    // A = [200,200];
    // B = [500,500];
    // ctx.strokeRect(A[0],A[1],B[0]-A[0],B[1]-A[1]);

    // let t = boxIntersection([canv.width/2,canv.height/2],[canvasMousePosition[0]-canv.width/2,canvasMousePosition[1]-canv.height/2],A,B);
    // ctx.beginPath();
    // ctx.moveTo(canv.width/2,canv.height/2);
    // ctx.lineTo(canv.width/2+(canvasMousePosition[0]-canv.width/2)*t[1],canv.height/2+(canvasMousePosition[1]-canv.height/2)*t[1]);
    // ctx.stroke();

    needLineRedraw = false;
    requestAnimationFrame(updateLines);
}
requestAnimationFrame(updateLines);