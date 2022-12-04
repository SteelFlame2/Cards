var HeaderName;
var Content = [];
var mousePosition = [0, 0];
var canvasMousePosition = [0, 0];
var windowScroll = [0,0];


let needMinimapRedraw = true;


document.addEventListener("mousemove", (e) => {
    mousePosition = [e.pageX, e.pageY];
    canvasMousePosition = [e.clientX, e.clientY];
});

function inRgba(r,g,b,a=1) {
    return "rgba("+(r*255)+","+(g*255)+","+(b*255)+","+a+")";
}
function getCardRandomColor() {
    let cR = 100+Math.random()*155;
    let cG = 100+Math.random()*155;
    let cB = 100+Math.random()*155;
    return inRgba(cR/255,cG/255,cB/255,0.8);
}

var pressedKeys = [];
var onKeysPressEvents = [];
var isCntrlClicked = false;
var isShiftClicked = false;
document.addEventListener("keydown", (e) => {
    if (e.code == "ControlLeft") {
        isCntrlClicked = true;
    }
    if (e.code == "ShiftLeft") {
        isShiftClicked = true;
    }

    if (!pressedKeys.includes(e.code))
        pressedKeys.push(e.code);

    for (let i = 0; i < onKeysPressEvents.length; i++) {
        let isAllPressed =true;
        if (pressedKeys.length == 0) continue;
        for (let j = 0; j < onKeysPressEvents[i].Keys.length; j++) {
            if (!pressedKeys.includes(onKeysPressEvents[i].Keys[j])) {
                isAllPressed = false;
            }
        }
        if (isAllPressed) {
            onKeysPressEvents[i].Func();
        }
    }
});
document.addEventListener("keyup", (e) => {
    if (e.code == "ControlLeft") {
        isCntrlClicked = false;
    }
    if (e.code == "ShiftLeft") {
        isShiftClicked = false;
    }
    for (let i = 0; i < pressedKeys.length; i++) {
        if (pressedKeys[i] == e.code) {
            pressedKeys.splice(i,1);
            break;
        }
    }
});
function addFewKeyPressEvent(Keys, Func) {
    onKeysPressEvents.push({Keys:Keys, Func: Func});
}