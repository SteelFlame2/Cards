// Window scroll as drag
var scrollingBounder = document.getElementById("scrolling-bounds");

let isClickHoldsOnDocument = false;
document.addEventListener("mousedown", (e) => {
    if (e.buttons == 1 && (e.target == canvas || e.target == document.documentElement || e.target == document.body) && !isShiftClicked) {
        isClickHoldsOnDocument = true
    }
});
document.addEventListener("mouseup", (e) => {
    isClickHoldsOnDocument = false;
});
document.addEventListener("mousemove", (e) => {
    // console.log(isClickHoldsOnDocument);
    if (isClickHoldsOnDocument) {
        // backUpdate();
        needLineRedraw = true;
        needMinimapRedraw = true;
        window.scrollBy(-e.movementX, -e.movementY);
        scrollingBounder.style.left = window.scrollX + "px";
        scrollingBounder.style.top = window.scrollY + "px";
        windowScroll = [window.scrollX, window.scrollY];
    }
    if (e.clientX > window.clientX || e.clientY > window.clientY ||
        e.clientX < 0 || e.clientY < 0) isClickHoldsOnDocument = false;
});
document.addEventListener("blur", () => {
    isClickHoldsOnDocument = false;
});

// Selection square

document.addEventListener("mousedown", (e) => {
    if (e.buttons == 1 && isShiftClicked) {
        selectionSquare.min = [mousePosition[0], mousePosition[1]];
        selectionSquare.max = [e.pageX - selectionSquare.min[0], e.pageY - selectionSquare.min[1]];
        selectionSquare.isExist = true;
    }
});
document.addEventListener("mousemove", (e) => {
    if (e.buttons == 1 && isShiftClicked) {
        selectionSquare.max = [e.pageX - selectionSquare.min[0], e.pageY - selectionSquare.min[1]];
    }
});
document.addEventListener("mouseup", (e) => {
    for (let i = 0; selectionSquare.isExist && i < Cards.length; i++) {
        if (Cards[i].isCardInArea(selectionSquare.min, [selectionSquare.min[0] + selectionSquare.max[0], selectionSquare.min[1] + selectionSquare.max[1]])) {
            Cards[i].Select();
        }
    }
    selectionSquare.isExist = false;
});

// DataBase functions
var save1req = window.indexedDB.open("Save 1", 1);
var save1DB;
save1req.onsuccess = function (e) {
    save1DB = save1req.result;
    loadData();
}
save1req.onupgradeneeded = function (e) {
    save1DB = e.target.result
    save1DB.createObjectStore("Cards", { autoIncrement: true });
    save1DB.createObjectStore("Lines", { autoIncrement: true });
}

var backupReq = window.indexedDB.open("Backup", 1);
var backupDB;
backupReq.onsuccess = function (e) {
    backupDB = backupReq.result;
}
backupReq.onupgradeneeded = function (e) {
    backupDB = e.target.result
    backupDB.createObjectStore("Cards", { autoIncrement: true });
    backupDB.createObjectStore("Lines", { autoIncrement: true });
}

function addCardsToTable(path, DB = save1DB) {
    let CardsTrans = DB.transaction("Cards", "readwrite");
    let CardsTable = CardsTrans.objectStore("Cards");
    CardsTable.clear();
    for (let i = 1; i < Cards.length; i++) {
        let data = Cards[i].getCardData();
        CardsTable.add({ Header: data[0], Content: data[1], Position: data[2], Color: data[3] });
    }
}
function addLinesToTable(path, DB = save1DB) {
    let LinesTrans = DB.transaction("Lines", "readwrite");
    let LinesTable = LinesTrans.objectStore("Lines");
    LinesTable.clear();
    for (let i = 0; i < Lines.length; i++) {
        LinesTable.add(Lines[i].getLineData());
    }
}
function saveData(path, DB = save1DB) {
    addCardsToTable(path,DB);
    addLinesToTable(path,DB);
}
let onCardsLoadedFuncs = [];
var newLinesToPush = [];
function loadData(path, DB = save1DB) {
    Cards.splice(1, Cards.length - 1);
    Lines.splice(0, Lines.length);

    let cards = document.getElementsByClassName("card");
    let len = cards.length;
    for (let i = 0; i < len; i++) {
        if (cards.length <= 1) break;
        cards[1].remove();
    }

    let CardsTrans = DB.transaction("Cards", "readonly");
    let CardsTable = CardsTrans.objectStore("Cards");
    let LinesTrans = DB.transaction("Lines", "readonly");
    let LinesTable = LinesTrans.objectStore("Lines");

    let newCards = CardsTable.getAll();
    let newLines = LinesTable.getAll();
    newCards.onsuccess = function (e) {
        // console.log(e.target.result[i].Content);
        for (let i = 0; i < e.target.result.length; i++) {
            let newContent = [];
            for (let j = 0; j < e.target.result[i].Content.length; j++) {
                if (e.target.result[i].Content[j].Type == "Span") {
                    let span = createTextReminder(e.target.result[i].Content[j].data);
                    span.appendChild(document.createElement("br"));
                    newContent.push(span);
                } else if (e.target.result[i].Content[j].Type == "List") {
                    newContent.push(createListOfTasks(e.target.result[i].Content[j].name, e.target.result[i].Content[j].data));
                }
            }
            // console.log(e.target.result[i]);
            createNewStick(e.target.result[i].Header, newContent, e.target.result[i].Position, e.target.result[i].Color);
        }
        for (let i = 0; i < onCardsLoadedFuncs.length; i++) {
            onCardsLoadedFuncs[i]();
        }
        for (let i = 0; i < newLinesToPush.length; i++) {
            Lines.push(new Line(Cards[newLinesToPush[i].firstCardIndex], Cards[newLinesToPush[i].secondCardIndex], Lines.length, newLinesToPush[i].thick));
        }
        needLineRedraw = true;
    }
    newLines.onsuccess = function (e) {
        for (let i = 0; i < e.target.result.length; i++) {
            if (Cards.length <= 1) {
                newLinesToPush.push(e.target.result[i]);
            } else {
                Lines.push(new Line(Cards[e.target.result[i].firstCardIndex], Cards[e.target.result[i].secondCardIndex], Lines.length, e.target.result[i].thick));
            }
        }
        needLineRedraw = true;
    }
}
var isWindowLoaded = false;
window.onbeforeunload = function () {
    if (isWindowLoaded) {
        saveData();
        console.log("save");
    }
    return false;
}
window.onload = function () {
    // loadData();
    isWindowLoaded = true;
    resetRecomendations();
    needLineRedraw = true;
}

let popupMessageDOM = document.getElementById("popupPanel");
let popupMessageDOMText = document.getElementById("popupPanel-message");
let popupCloseButton = document.getElementById("popupPanel-closebutton");
popupCloseButton.onclick = (e)=>{
    popupMessageDOM.className = "";
    popupMessageDOM.style.display = "none";
};
function showPopupMessage(text, timeToShow = 800) {
    popupMessageDOMText.innerHTML = text;
    popupMessageDOM.className = "triggered";
    popupMessageDOM.style.display = "flex";
    setTimeout(()=>{
        popupMessageDOM.className = "";
        setTimeout(()=>{
            popupMessageDOM.style.display = "none";
        },300);
    },timeToShow);
}
addFewKeyPressEvent(["KeyS","ShiftLeft"],()=>{
    saveData();
    showPopupMessage("Saved");
});
addFewKeyPressEvent(["KeyH","ShiftLeft"],()=>{
    showPopupMessage(`
        LShift + H -> this panel<br/>
        * L/M/R MB - Left/Middle/Right Mouse Button<br/>
        Double LMB on card -> select all tree of cards <br/>
        LShift + LMB drag -> selection square<br/>
        LCntrl + LMB on multiple card -> select this cards<br/>
        Shift + F -> Search group by header + help<br/>
        MMB on cards -> create lines between<br/>
        You can add link on image in text remind -> card will show image from this link<br/>
        RMB on card/empty space/line -> context menu<br/>
        LCntrl + Z -> backup card delete<br/>
        LShift + S -> Save (Recommended to click regulary)<br/>
        Scroll when mouse hover line and scroll -> change nominal line width
    `, 3000);
});
showPopupMessage(`
        LShift + H -> this panel<br/>
        * L/M/R MB - Left/Middle/Right Mouse Button<br/>
        Double LMB on card -> select all tree of cards <br/>
        LShift + LMB drag -> selection square<br/>
        LCntrl + LMB on multiple card -> select this cards<br/>
        Shift + F -> Search group by header + help<br/>
        MMB on cards -> create lines between<br/>
        You can add link on image in text remind -> card will show image from this link<br/>
        RMB on card/empty space/line -> context menu<br/>
        LCntrl + Z -> backup card delete<br/>
        LShift + S -> Save (Recommended to click regulary)<br/>
        Scroll when mouse hover line and scroll -> change nominal line width
    `, 5000);