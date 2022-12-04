var cardCreator = {
    dom: document.getElementById("creating-card"),
    contentDom: document.getElementById("content"),
    HeaderInput: document.getElementById("HeaderNameInput"),
    RemindTextInput: document.getElementById("RemindTextInput"),
    TaskListNameInput: document.getElementById("TaskListNameInput"),
    CreateNewStickButton: document.getElementById("CreateNewStickButton"),
    HeaderDate: document.getElementById("HeaderDate")
};

function copyDataToCreator(Card) {
    let data = Card.getCardData();
    cardCreator.HeaderInput.value = data[0];
    HeaderName = data[0];
    // console.log(data);
    for (let i = 0; i < data[1].length; i++) {
        if (data[1][i].Type == "Span") {
            addCreateRemindText(data[1][i].data);
        } else if (data[1][i].Type == "List") {
            let targetUL = addCreatorTaskList(data[1][i].name);
            for (let j = 0; j < data[1][i].data.length; j++) {
                addCreatorTaskToTaskList(data[1][i].data[j], targetUL);
            }
        }
    }


}
function addCreateRemindText(value) {
    let newTextRemind = createTextReminder(value);
    newTextRemind.className += " toCreate toDelete";

    let deleteButton = document.createElement("input");
    deleteButton.type = "button";
    deleteButton.value = "x";
    deleteButton.className = "nodeActionButton";
    deleteButton.addEventListener("click", (e) => {
        e.target.parentElement.previousSibling.remove();
        e.target.parentElement.remove();
    });
    newTextRemind.appendChild(deleteButton);
    let BR = document.createElement("br");
    BR.className = "toCreate toDelete";
    if (cardCreator.contentDom.lastElementChild.nodeName != "INPUT") {
        cardCreator.contentDom.appendChild(BR);
    }
    cardCreator.contentDom.appendChild(newTextRemind);
}
function addCreatorTaskToTaskList(value, targetUL) {
    let newLi = document.createElement("li");
    newLi.innerHTML += "<span class='taskText'>" + value + "</span>";
    let newCompletenessButton = document.createElement("img");
    newCompletenessButton.src = "Images/UncompleteTask.svg";
    newCompletenessButton.className = "completenessSvg";
    newCompletenessButton.classList.add("uncomplete");

    newLi.appendChild(newCompletenessButton);

    let TaskDeleteButton = document.createElement("input");
    TaskDeleteButton.type = "button";
    TaskDeleteButton.value = "x";
    TaskDeleteButton.className = "nodeActionButton";
    TaskDeleteButton.addEventListener("click", (e) => {
        e.target.parentElement.remove();
    });
    newLi.appendChild(TaskDeleteButton);

    targetUL.appendChild(newLi);
}
function addCreatorTaskList(name) {
    let ulMain = document.createElement("ul");
    ulMain.className = "tasks toCreate toDelete";
    ulMain.innerHTML += name;

    let ULDeleteButton = document.createElement("input");
    ULDeleteButton.type = "button";
    ULDeleteButton.value = "x";
    ULDeleteButton.className = "nodeActionButton";
    ULDeleteButton.addEventListener("click", (e) => {
        e.target.parentElement.remove
        e.target.parentElement.remove();
    });
    ulMain.appendChild(ULDeleteButton);


    let createNewTaskInput = document.createElement("input");
    createNewTaskInput.type = "text";
    createNewTaskInput.className = "toPreDelete";
    createNewTaskInput.addEventListener("keydown", (e) => {
        if (e.code == "Enter") {
            addCreatorTaskToTaskList(createNewTaskInput.value, ulMain);
            createNewTaskInput.value = "";
        }
    });


    ulMain.appendChild(createNewTaskInput);
    cardCreator.contentDom.appendChild(ulMain);
    return ulMain;
}
cardCreator.RemindTextInput.addEventListener("keydown", (e) => {
    if (e.code == "Enter") {
        addCreateRemindText(cardCreator.RemindTextInput.value);
        RemindTextInput.value = "";
    }
});
cardCreator.TaskListNameInput.addEventListener("keydown", (e) => {
    if (e.code == "Enter") {
        addCreatorTaskList(cardCreator.TaskListNameInput.value);
        cardCreator.TaskListNameInput.value = "";
    }
});
cardCreator.CreateNewStickButton.addEventListener("click", (e) => {
    let toCreateElements = cardCreator.dom.getElementsByClassName("toCreate");
    // console.log(toCreateElements);
    let nodeActionButtons = cardCreator.dom.getElementsByClassName("nodeActionButton");
    while (nodeActionButtons.length > 0) {
        nodeActionButtons[0].remove();
    }
    let toPreDeleteElements = cardCreator.dom.getElementsByClassName("toPreDelete");
    while (toPreDeleteElements.length > 0) {
        toPreDeleteElements[0].remove();
    }
    let clr = getCardRandomColor();
    let newNode = createNewStick(cardCreator.HeaderInput.value, toCreateElements, [cardCreator.dom.style.left,cardCreator.dom.style.top], clr);
    newNode.style.left = cardCreator.dom.style.left;
    newNode.style.top = cardCreator.dom.style.top;

    let toDeleteElements = cardCreator.dom.getElementsByClassName("toDelete");
    while (toDeleteElements.length > 0) {
        toDeleteElements[0].remove();
    }

});