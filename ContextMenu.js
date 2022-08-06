var contextMenuDocumentDom = document.getElementById("document-context-menu");
var lastConextMenuCallPosition = [0, 0];

var mainLineSetter = document.getElementById("set-main-line");
var contexLineDeleter = document.getElementById("delete-line");

function setContextMenuVisibility(state = 0) {
    if (state == 0) {
        contextMenuDocumentDom.className = "context-menu hidden";
    } else if (state == 1) {
        contextMenuDocumentDom.className = "context-menu visible";
    }
}

document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    setContextMenuVisibility(1);
    contextMenuDocumentDom.style.left = e.clientX + "px";
    contextMenuDocumentDom.style.top = e.clientY + "px";
    lastConextMenuCallPosition = [e.clientX, e.clientY];

    let hover = findHoveredLineInPoint(e.clientX, e.clientY);
    if (hover[0]) {
        mainLineSetter.className = "clickable";
        contexLineDeleter.className = "clickable";
    } else {
        mainLineSetter.className = "not-clickable";
        contexLineDeleter.className = "not-clickable";
    }
});
document.addEventListener("mousedown", (e) => {
    if (e.buttons == 1 && (e.target == canvas || e.target == document.body)) {
        setContextMenuVisibility(0);
    }
});

mainLineSetter.addEventListener("click", (e) => {
    let hover = findHoveredLineInPoint(lastConextMenuCallPosition);
    if (hover[0]) { mainLine = hover[1]; }
    setContextMenuVisibility(0);
});
contexLineDeleter.addEventListener("click", (e) => {
    let hover = findHoveredLineInPoint(lastConextMenuCallPosition);
    if (hover[0]) {
        console.log(hover[1]);
        deleteLine(hover[1]);
    }
    setContextMenuVisibility(0);
});

let contextMenuElements = document.getElementsByClassName("context-menu-element");
for (let i = 0; i < contextMenuElements.length; i++) {
    contextMenuElements[i].addEventListener("onclick", (e) => {
        console.log(e);
    });
}