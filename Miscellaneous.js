// Mouse data
var mousePosition = [0, 0];
document.addEventListener("mousemove", (e) => {
    mousePosition = [e.clientX, e.clientY];
});
// Window scroll as drag
var scrollingBounder = document.getElementById("scrolling-bounds");

let isClickHoldsOnDocument = false;
document.addEventListener("mousedown", (e) => {
    if (e.buttons == 1 && (e.target == canvas || e.target == document.body)) {
        isClickHoldsOnDocument = true
    }
});
document.addEventListener("mouseup", (e) => {
    isClickHoldsOnDocument = false;
});
document.addEventListener("mousemove", (e) => {
    // console.log(isClickHoldsOnDocument);
    if (isClickHoldsOnDocument) {
        window.scrollBy(-e.movementX, -e.movementY);
        scrollingBounder.style.left = window.scrollX + "px";
        scrollingBounder.style.top = window.scrollY + "px";
    }
    if (e.clientX > window.clientX || e.clientY > window.clientY ||
        e.clientX < 0 || e.clientY < 0) isClickHoldsOnDocument = false;
});
document.addEventListener("blur", () => {
    isClickHoldsOnDocument = false;
});


// DataBase functions
var save1req = window.indexedDB.open("Save 1", 1);
var save1DB;
save1req.onsuccess = function (e) {
    save1DB = save1req.result;
    console.log(e);
}
save1req.onupgradeneeded = function (e) {
    save1DB = e.target.result
    save1DB.createObjectStore("Cards", { autoIncrement: true });
    save1DB.createObjectStore("Lines", { autoIncrement: true });
}


function addCardsToTable(path) {
    let CardsTrans = save1DB.transaction("Cards", "readwrite");
    let CardsTable = CardsTrans.objectStore("Cards");
    CardsTable.clear();
    for (let i = 1; i < Cards.length; i++) {
        let data = Cards[i].getCardData();
        CardsTable.add({ Header: data[0], Content: data[1], Position: data[2] });
    }
}
function addLinesToTable(path) {
    let LinesTrans = save1DB.transaction("Lines", "readwrite");
    let LinesTable = LinesTrans.objectStore("Lines");
    LinesTable.clear();
    for (let i = 0; i < Lines.length; i++) {
        LinesTable.add(Lines[i].getLineData());
    }
}
function saveData(path) {
    addCardsToTable(path);
    addLinesToTable(path);
}
var newLinesToPush = [];
function loadData(path) {
    Cards.splice(1, Cards.length - 1);
    Lines.splice(0, Lines.length);

    let cards = document.getElementsByClassName("card");
    let len = cards.length;
    for (let i = 0; i < len; i++) {
        if (cards.length <= 1) break;
        cards[1].remove();
    }

    let CardsTrans = save1DB.transaction("Cards", "readonly");
    let CardsTable = CardsTrans.objectStore("Cards");
    let LinesTrans = save1DB.transaction("Lines", "readonly");
    let LinesTable = LinesTrans.objectStore("Lines");

    let newCards = CardsTable.getAll();
    let newLines = LinesTable.getAll();
    newCards.onsuccess = function (e) {
        // console.log(e.target.result[i].Content);
        for (let i = 0; i < e.target.result.length; i++) {
            let newContent = [];
            for (let j = 0; j < e.target.result[i].Content.length; j++) {
                if (e.target.result[i].Content[j].Type == "Span") {
                    newContent.push(createTextReminder(e.target.result[i].Content[j].data));
                } else if (e.target.result[i].Content[j].Type == "List") {
                    newContent.push(createListOfTasks(e.target.result[i].Content[j].name, e.target.result[i].Content[j].data));
                }
            }
            createNewStick(e.target.result[i].Header, newContent, e.target.result[i].Position);
        }
        for (let i = 0; i < newLinesToPush.length; i++) {
            Lines.push(new Line(Cards[newLinesToPush[i].firstCardIndex], Cards[newLinesToPush[i].secondCardIndex], Lines.length));
        }
    }
    newLines.onsuccess = function (e) {
        for (let i = 0; i < e.target.result.length; i++) {
            if (Cards.length <= 1) {
                newLinesToPush.push(e.target.result[i]);
            } else {
                Lines.push(new Line(Cards[e.target.result[i].firstCardIndex], Cards[e.target.result[i].secondCardIndex], Lines.length));
            }
        }
    }
}
window.onbeforeunload = function () {
    saveData();
}
window.onload = function () {
    loadData();
}