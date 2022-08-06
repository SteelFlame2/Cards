var selectedCard1 = -1;
var selectionLostTimer = undefined;
function restartSelectionLostTimer() {
    if (typeof selectionLostTimer != undefined)
        clearTimeout(selectionLostTimer);
    selectionLostTimer = setTimeout(() => {
        if (!Cards[selectedCard1]) return;
        Cards[selectedCard1].cardDOM.style.border = "";
        selectedCard1 = -1;
    }, 2 * 1000);
}
class Card {
    constructor(id = -1, CardDOM) {
        this.id = id;
        this.cardDOM = CardDOM;

        this.clickOffset = [0, 0];
        this.isClicked = false;

        this.Initialize();

        this.connectedLines = [];
    }
    Initialize() {
        this.cardDOM.addEventListener("mousedown", (e) => {
            this.clickOffset = [
                e.clientX - ~~(this.cardDOM.style.left.slice(0, -2)),
                e.clientY - ~~(this.cardDOM.style.top.slice(0, -2))
            ];
            if (e.buttons == 4) {
                if (selectedCard1 == -1) {
                    selectedCard1 = this.id;
                    restartSelectionLostTimer();
                    this.cardDOM.style.border = "1px dashed rgb(255,255,0)";
                } else {
                    if (selectedCard1 != this.id) {
                        let isLinesContain = false;
                        let containInd = -1;
                        for (let i = 0; i < Lines.length; i++) {
                            if ((Lines[i].dom1 == Cards[selectedCard1].cardDOM && Lines[i].dom2 == Cards[this.id].cardDOM) ||
                                Lines[i].dom2 == Cards[selectedCard1].cardDOM && Lines[i].dom1 == Cards[this.id].cardDOM) {
                                containInd = i;
                                isLinesContain = true;
                                break;
                            }
                        }
                        if (!isLinesContain) {
                            // Lines.push(new Line(Cards[selectedCard1].cardDOM, Cards[this.id].cardDOM, Cards[selectedCard1], Cards[this.id]));
                            createNewLine(Cards[selectedCard1], Cards[this.id]);
                        } else {
                            // Lines.splice(containInd, 1);
                            deleteLine(containInd);
                        }
                        Cards[selectedCard1].cardDOM.style.border = "";
                        selectedCard1 = this.id;
                        this.cardDOM.style.border = "1px dashed rgb(255,255,0)";
                        restartSelectionLostTimer();
                    }
                }
            }
            this.isClicked = true;
        });
        document.addEventListener("mouseup", (e) => {
            this.isClicked = false;
        });
        document.addEventListener("mousemove", (e) => {
            if (this.isClicked) {
                this.cardDOM.style.top = (e.clientY - this.clickOffset[1]) + "px";
                this.cardDOM.style.left = (e.clientX - this.clickOffset[0]) + "px";
            }
        });
        document.addEventListener("mousedown", (e) => {
            if (e.buttons != 1) return;
            let isCard = false;
            let path = e.composedPath();
            for (let i = 0; i < path.length; i++) {
                if (path[i].className == "card") {
                    isCard = true;
                    break;
                }
            }
            if (!isCard) {
                if (!Cards[selectedCard1]) return;
                Cards[selectedCard1].cardDOM.style.border = "";
                selectedCard1 = -1;
            }
        });
        let closer = this.cardDOM.getElementsByClassName("closer");
        if (closer.length > 0) {
            closer[0].addEventListener("mousedown", (e) => {
                let len = this.connectedLines.length;
                for (let i = 0; i < len; i++) {
                    deleteLine(this.connectedLines[0], true);
                }
                for (let i = this.id + 1; i < Cards.length; i++) {
                    Cards[i].id -= 1;
                }

                Cards.splice(this.id, 1);
                this.cardDOM.remove();
                return;
            });
        }
    }
    getCardData() {
        let HeaderText = this.cardDOM.children[0].children[0].innerText;
        let ContentData = [];
        let ContentChildrens = this.cardDOM.children[2].children;
        for (let i = 0; i < ContentChildrens.length; i++) {
            if (ContentChildrens[i].tagName == "SPAN") {
                ContentData.push({ Type: "Span", data: ContentChildrens[i].innerText });
            } else if (ContentChildrens[i].tagName == "UL") {
                let ListTasks = [];
                for (let j = 0; j < ContentChildrens[i].children.length; j++) {
                    ListTasks.push(ContentChildrens[i].children[j].innerText);
                }
                ContentData.push({ Type: "List", name: ContentChildrens[i].firstChild.nodeValue, data: ListTasks });
            }
        }
        return [HeaderText, ContentData, [this.cardDOM.offsetLeft, this.cardDOM.offsetTop]]
        let text = "";
        text += HeaderText + ";";
        for (let i = 0; i < ContentData.length; i++) {
            if (ContentData[i].Type == "Span") {
                text += ("Span" + i) + ":" + ContentData[i].data + ";";
            } else if (ContentData[i].Type == "List") {
                text += ("Task" + i) + ":" + ContentData[i].name + ":";
                for (let j = 0; j < ContentData[i].data.length; j++) {
                    text += j + ":" + ContentData[i].data[j] + ",";
                }
                text += ";";
            }
        }
        return text;
        // return [HeaderText, ContentData];
    }
}
let Cards = [];

let _cards = document.getElementsByClassName("card");
for (let i = 0; i < _cards.length; i++) {
    Cards.push(new Card(i, _cards[i]));
}

function createListOfTasks(ListName, Tasks) { // Just array of strings with task text 
    let ulMain = document.createElement("ul");
    ulMain.innerHTML += ListName;

    for (let i = 0; i < Tasks.length; i++) {
        ulMain.innerHTML += `
            <li>
                <div>${Tasks[i]}</div><img src="Images/UncompleteTask.svg" class="completenessSvg" id="unCompleteSvg" alt="Completeness">
            </li>
        `;
    }
    let svgs = ulMain.getElementsByClassName("completenessSvg");
    for (let i = 0; i < svgs.length; i++) {
        svgs[i].addEventListener("mousedown", (e) => {
            if (e.target.id == "completeSvg") {
                e.target.id = "unCompleteSvg";
                e.target.src = "Images/UncompleteTask.svg";
            } else {
                e.target.id = "completeSvg"
                e.target.src = "Images/CompleteTask.svg";
            }

        });
    }
    ulMain.className = "tasks";

    return ulMain;
}
function createTextReminder(Text) {
    let Span = document.createElement("span");
    Span.innerHTML = Text;
    Span.className = "textReminder";
    return Span;
}
function createNewStick(Header, Content, Offset = [Math.random() * (window.clientWidth - 200), Math.random() * (window.clientHeight - 200)]) {
    let cardDom = document.createElement('div');
    cardDom.className = "card";
    // ${Cards.length}
    cardDom.innerHTML += `
        <div id="header">
            <div id="text">${Header}</div>
            <div class="closer">
                <img src="Images/close.svg" alt="Close">
            </div>
        </div><hr>`;

    let contentDiv = document.createElement("div");
    contentDiv.id = "content";

    for (let i = 0; i < Content.length; i++) {
        contentDiv.appendChild(Content[i].cloneNode(true));

        // contentDiv.innerHTML += "<br>";
    }

    cardDom.appendChild(contentDiv);

    cardDom.style.left = Offset[0] + "px";
    cardDom.style.top = Offset[1] + "px";

    document.body.appendChild(cardDom);
    Cards.push(new Card(Cards.length, cardDom));
}

// createNewStick("Fruits", [createTextReminder("Just a fruits... What?"), createListOfTasks("Fruits", ["Banana", "Apple", "Your mom"])])
// createNewStick("Fruits", [createTextReminder("Just a fruits... What?"), createListOfTasks("Fruits", ["Banana", "Apple", "Your mom"])])
// createNewStick("Fruits", [createTextReminder("Just a fruits... What?"), createListOfTasks("Fruits", ["Banana", "Apple", "Your mom"])])
// createNewStick("Fruits", [createTextReminder("Just a fruits... What?"), createListOfTasks("Fruits", ["Banana", "Apple", "Your mom"])])