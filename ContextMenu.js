var contextMenuDocumentDom = document.getElementById("document-context-menu");
var lastConextMenuCallPosition = [0, 0];

var contexLineDeleter = document.getElementById("delete-line");
var cardEditor = document.getElementById("card-editor");
var weightsUpdater = document.getElementById("update-weights");
var backgroundStateToggle = document.getElementById("background-state");
function setContextMenuVisibility(state = 0) {
    if (state == 0) {
        contextMenuDocumentDom.className = "context-menu hidden";
    } else if (state == 1) {
        contextMenuDocumentDom.className = "context-menu visible";
    }
}


var pointedCard;
document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    setContextMenuVisibility(1);
    contextMenuDocumentDom.style.left = e.clientX + "px";
    contextMenuDocumentDom.style.top = e.clientY + "px";
    lastConextMenuCallPosition = [e.pageX, e.pageY];

    let hover = findHoveredLineInPoint(e.clientX, e.clientY);
    if (hover[0]) {
        contexLineDeleter.className = "clickable";
        weightsUpdater.className = "clickable";
    } else {
        contexLineDeleter.className = "not-clickable";
        weightsUpdater.className = "not-clickable";
    }

    let isOnCard = false;
    for (let i = 0; i < Cards.length; i++) {
        if (Cards[i].isPointOnCard(lastConextMenuCallPosition[0], lastConextMenuCallPosition[1])) {
            pointedCard = Cards[i];
            isOnCard = true;
        }
    }
    if (isOnCard) {
        cardEditor.className = "clickable";
    } else {
        cardEditor.className = "not-clickable";
    }
});
document.addEventListener("mousedown", (e) => {
    if (e.buttons == 1 && (e.target == canvas || e.target == document.body)) {
        setContextMenuVisibility(0);
    }
});

contexLineDeleter.addEventListener("click", (e) => {
    let hover = findHoveredLineInPoint(lastConextMenuCallPosition);
    if (hover[0]) {
        deleteLine(hover[1]);
    }
    setContextMenuVisibility(0);
});
cardEditor.addEventListener("click", (e) => {
    copyDataToCreator(pointedCard);
    setContextMenuVisibility(0);
});

weightsUpdater.addEventListener("click", (e => {
    mainLine = findHoveredLineInPoint(lastConextMenuCallPosition)[1];
    setThickness();
    mainLine = -1;
    setContextMenuVisibility(0);
}));
backgroundStateToggle.addEventListener("click", (e)=>{
    if (backgroundStateToggle.className == "toggle-on") {
        bg.clearColor(0, 0, 0, 1);
        backgroundStateToggle.innerHTML = "Turn off background";
        isBackgroundTurned = true;
        backgroundStateToggle.className = "toggle-off";
    } else {
        bg.clearColor(0, 0, 0, 0);
        bg.clear(bg.COLOR_BUFFER_BIT | bg.DEPTH_BUFFER_BIT);
        backgroundStateToggle.innerHTML = "Turn on background";
        isBackgroundTurned = false;
        backgroundStateToggle.className = "toggle-on";
    }
    setContextMenuVisibility(0);
});