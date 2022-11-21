var HeaderName;
var Content = [];
var mousePosition = [0, 0];
var canvasMousePosition = [0, 0];
var windowScroll = [0,0];

document.addEventListener("mousemove", (e) => {
    mousePosition = [e.pageX, e.pageY];
    canvasMousePosition = [e.clientX, e.clientY];
});


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