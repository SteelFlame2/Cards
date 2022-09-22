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
class DeleteAction {
    constructor(Header, Content, Position) {
        this.header = Header;
        this.content = Content;
        this.position = Position;
    }
    Backup() {
        // if ()
        let domContent = [];
        for (let i = 0; i < this.content.length; i++) {
            if (this.content[i].Type == "Span"){ 
                domContent.push(createTextReminder(this.content[i].data));
            } else if (this.content[i].Type == "List") {
                let listOfTasks = [];
                for (let j = 0; j < this.content[i].data.length; j++) {
                    listOfTasks.push(this.content[i].data[j]);
                }
                domContent.push(createListOfTasks(this.content[i].name,listOfTasks));
            }
        }
        createNewStick(this.header, domContent, this.position);
    }
}
var actionsHistory = [];
addFewKeyPressEvent(["KeyZ","ControlLeft"],()=>{
    if (actionsHistory.length > 0) {
        actionsHistory[actionsHistory.length-1].Backup();
        actionsHistory.splice(actionsHistory.length-1,1);
    }
});
addFewKeyPressEvent(["Escape"], ()=>{
    searchTab.style.display = "none";
});

var isSomeCardClicked = false;
class Card {
    constructor(id = -1, CardDOM) {
        this.id = id;
        this.cardDOM = CardDOM;
        this.data = this.getCardData();

        this.clickOffset = [0, 0];
        this.isClicked = false;

        this.isSelected = false;

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
            if (!isCntrlClicked) {
                for (let i = 0; i < Cards.length; i++) {
                    Cards[i].Unselect();
                }
            }
            this.Select();
            this.isClicked = true;
            isSomeCardClicked = true;
        });
        document.addEventListener("mouseup", (e) => {
            // this.isSelected = false;
            this.isClicked = false;
            isSomeCardClicked = false;
        });
        document.addEventListener("mousemove", (e) => {
            // if (this.isClicked) {
            //     this.cardDOM.style.top = (e.clientY - this.clickOffset[1]) + "px";
            //     this.cardDOM.style.left = (e.clientX - this.clickOffset[0]) + "px";
            // }
            if (this.isSelected && isSomeCardClicked) {
                this.cardDOM.style.left = Number(this.cardDOM.style.left.slice(0, -2)) + (e.movementX / window.devicePixelRatio) + "px";
                this.cardDOM.style.top = Number(this.cardDOM.style.top.slice(0, -2)) + (e.movementY / window.devicePixelRatio) + "px";
                backUpdate();
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
                this.Unselect();
                if (!Cards[selectedCard1]) return;
                Cards[selectedCard1].cardDOM.style.border = "";
                selectedCard1 = -1;
            }
        });
        let closer = this.cardDOM.getElementsByClassName("closer");
        if (closer.length > 0) {
            closer[0].addEventListener("mousedown", (e) => {
                actionsHistory.push(new DeleteAction(this.data[0], this.data[1], this.data[2]));
                let linesToDelete = [];
                for (let i = 0; i < Lines.length; i++) {
                    if (Lines[i].card1 == this || Lines[i].card2 == this) {
                        linesToDelete.push(i);
                    }
                }
                let newLines = [];
                for (let i = 0; i < Lines.length; i++) {
                    if (!linesToDelete.includes(i)) newLines.push(Lines[i]);
                    // deleteLine(linesToDelete[i]);
                }
                Lines = newLines;
                for (let i = this.id + 1; i < Cards.length; i++) {
                    Cards[i].id -= 1;
                }

                Cards.splice(this.id, 1);
                this.cardDOM.remove();
                deleteRecomendation(this.data[0]);
                return;
            });
        }
        this.cardDOM.addEventListener("dblclick",(e)=>{
            executeForLinesTree(this.findConnectedLines(),(ind,line)=>{
                line.card1.Select();
                line.card2.Select();
            });
        });
    }
    findConnectedLines() {
        if (Lines.length == 0) return [];
        let connectedLines = [];
        for (let i = 0; i < Lines.length; i++) {
            if (Lines[i].card1 == this || Lines[i].card2 == this) {
                connectedLines.push(Lines[i]);
            }
        }
        return connectedLines;
    }
    Select() {
        this.isSelected = true;
        this.cardDOM.style.border = "1px dashed green";
    }
    Unselect() {
        this.isSelected = false;
        this.cardDOM.style.border = "";

    }
    getCardData() {
        let HeaderText = this.cardDOM.children[0].children[0].innerText;
        let ContentData = [];
        let ContentChildrens = this.cardDOM.children[2].children;
        for (let i = 0; i < ContentChildrens.length; i++) {
            if (ContentChildrens[i].tagName == "SPAN") {
                ContentData.push({ Type: "Span", data: ContentChildrens[i].firstChild.innerText });
            } else if (ContentChildrens[i].tagName == "UL") {
                let ListTasks = [];
                for (let j = 0; j < ContentChildrens[i].children.length; j++) {
                    ListTasks.push(ContentChildrens[i].children[j].innerText);
                }
                ContentData.push({ Type: "List", name: ContentChildrens[i].firstChild.nodeValue, data: ListTasks });
            }
        }
        return [HeaderText, ContentData, [this.cardDOM.offsetLeft, this.cardDOM.offsetTop]];
    }
    isPointOnCard(x, y) {
        if (x > this.cardDOM.offsetLeft && x < this.cardDOM.offsetLeft + this.cardDOM.offsetWidth &&
            y > this.cardDOM.offsetTop && y < this.cardDOM.offsetTop + this.cardDOM.offsetHeight) {
            return true;
        }
        return false;
    }
    isCardInArea(Min, Max) {
        let _min = [
            Math.min(Min[0], Max[0]),
            Math.min(Min[1], Max[1]),
        ];
        let _max = [
            Math.max(Min[0], Max[0]),
            Math.max(Min[1], Max[1]),
        ];
        if (this.cardDOM.offsetLeft > _min[0] && this.cardDOM.offsetLeft < _max[0] &&
            this.cardDOM.offsetTop > _min[1] && this.cardDOM.offsetTop < _max[1]) {
            return true;
        }
        return false;
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
                <div>${Tasks[i]}</div><img src="Images/UncompleteTask.svg" class="completenessSvg" alt="Completeness">
            </li>
        `;
    }
    // completenessButton.onmousedown = function (e) {
    //     if (e.buttons == 1) {
    //         if (newCompletenessButton.classList[1] == "uncomplete") {
    //             newCompletenessButton.src = "Images/CompleteTask.svg";
    //             newCompletenessButton.classList.replace("uncomplete", "complete");
    //         } else {
    //             newCompletenessButton.src = "Images/UncompleteTask.svg";
    //             newCompletenessButton.classList.replace("complete", "uncomplete");
    //         }
    //     }
    // }
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
    let textSpan = document.createElement("span");
    textSpan.innerHTML = Text;
    Span.className = "textReminder";
    Span.appendChild(textSpan);
    try {
        let url = new URL(Text);
        let link = document.createElement("a");
        if (true) {
            let img = document.createElement("img");
            img.src = Text;
            img.className = "URLImage";
            img.alt = Text;
            link.href = Text;
            link.appendChild(img);
        }
        Span.appendChild(link);
        textSpan.className = "linkedTextReminder";
    } catch (err) {}
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

    let newNode = document.body.appendChild(cardDom);
    Cards.push(new Card(Cards.length, cardDom));

    addRecomendation(Header);

    return newNode;
}

createNewStick("Fruits", [createTextReminder("Just a fruits... What?"), createListOfTasks("Fruits", ["Banana", "Apple", "Your mom"])])
// createNewStick("Fruits", [createTextReminder("Just a fruits... What?"), createListOfTasks("Fruits", ["Banana", "Apple", "Your mom"])])
// createNewStick("Fruits", [createTextReminder("Just a fruits... What?"), createListOfTasks("Fruits", ["Banana", "Apple", "Your mom"])])
// createNewStick("Fruits", [createTextReminder("Just a fruits... What?"), createListOfTasks("Fruits", ["Banana", "Apple", "Your mom"])])