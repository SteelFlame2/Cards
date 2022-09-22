var searchTab = document.getElementById("searchTab");
var searchTabRecomends = document.getElementById("searchTab-recomendations");
var searchTabInput = document.getElementById("searchTab-target-input");

let searchHeaders = [];
let startWindowScale = 1;

searchTab.addEventListener("mousedown", (e)=>{
    if (e.target.id == "searchTab") {
        searchTab.style.display = "none";
    }
});
addFewKeyPressEvent(["KeyF","ShiftLeft"],()=>{
    if (searchTab.style.display == "none" || searchTab.style.display == '')
        searchTab.style.display = "flex";
    else
        searchTab.style.display = "none";
    // let headers = [];
    // for (let i = 0; i < Cards.length; i++) {
    //     headers.push(Cards[i].getCardData()[0]);
    // }
    // let search = searchText(searchTarget,headers);
    // Cards[search[1][0].from].Select();
    // let cardDom = Cards[search[1][0].from].cardDOM;
    // window.scrollTo(
    //     Number(cardDom.style.left.slice(0,-2)) - window.innerWidth/2,
    //     Number(cardDom.style.top.slice(0,-2)) - window.innerHeight/2);
});

function searchText(targetText, toFindTexts) {
    let scores = [];
    for (let i = 0; i < toFindTexts.length; i++) {
        scores[i] = {value: 0, ind: i};
        let sameLettersCount = 0;
        let sameLetters = [];
        for (let j = 0; j < targetText.length; j++) {
            sameLetters[j] = [];
            for (let k = 0; k < toFindTexts[i].length; k++) {
                if (targetText[j] == toFindTexts[i][k]) {
                    sameLettersCount++;
                    sameLetters[j].push({
                        pos1: j,
                        pos2: k,
                        letter: targetText[j]
                    });
                }
            }
        }
        if (sameLettersCount >= 1) {
            for (let j = 0; j < sameLetters.length; j++) {
                for (let k = 0; k < sameLetters[j].length; k++) {
                    scores[i].value += 1/(1+Math.sqrt(Math.pow(sameLetters[j][k].pos2-sameLetters[j][k].pos1,2)));   
                }
            }
        }
    }
    scores = scores.sort((a,b)=>{return b.value-a.value});
    let sortedTexts = [];
    let sortDirection = [];
    for (let i = 0; i < scores.length; i++) {
        sortedTexts.push(toFindTexts[scores[i].ind]);
        sortDirection.push({from:scores[i].ind, to:i});
    }
    return [sortedTexts,sortDirection];
}

searchTabInput.addEventListener("input",(e)=>{
    let headers = [];
    for (let i = 0; i < searchHeaders.length; i++) {
        headers.push(searchHeaders[i].value);
    }
    let search = searchText(searchTabInput.value,headers);

    let newSearchHeaders = [];
    for (let i = 0; i < search[1].length; i++) {
        newSearchHeaders.push({value:searchHeaders[search[1][i].from].value, count:searchHeaders[search[1][i].from].count});
    }
    searchTabRecomends.innerHTML = "";
    searchHeaders = newSearchHeaders;
    for (let i = 0; i < searchHeaders.length; i++) {
        searchTabRecomends.appendChild(createRecomendationDiv(searchHeaders[i].value));
    }
});
searchTabInput.onchange = (e)=>{
    
};

function createRecomendationDiv(text, id=0) {
    let mainDiv = document.createElement("div");
    mainDiv.className = "searchTab-recomendation " + id;
    mainDiv.innerHTML = text;
    mainDiv.addEventListener("mousedown",(e)=>{
        let targetIndex = 0;
        for (let i = 0; i < Cards.length; i++) {
            if (Cards[i].data[0] == mainDiv.innerHTML) {
                targetIndex = i;
                break;
            }
        }
        Cards[targetIndex].Select();
        let cardDom = Cards[targetIndex].cardDOM;
        window.scrollTo(
            Number(cardDom.style.left.slice(0,-2)) - window.innerWidth/2,
            Number(cardDom.style.top.slice(0,-2)) - window.innerHeight/2);
        searchTab.style.display = "none";
    });
    return mainDiv;
}
//TODO: Check on same group
function addRecomendation(header) {
    let isExist = false;
    let existInd = 0;
    for (let i = 0; i < searchHeaders.length; i++) {
        if (searchHeaders[i].value == header) {
            isExist = true;
            existInd = i;
            break;
        }
    }
    if (!isExist) {
        searchHeaders.push({value: header, count: 1});
        searchTabRecomends.appendChild(createRecomendationDiv(header));
    } else {
        searchHeaders[existInd].count++;
    }
}
function deleteRecomendation(header) {
    let targetIndex = -1;
    for (let i = 0; i < searchHeaders.length; i++) {
        if (searchHeaders[i].value == header) {
            targetIndex = i;
            break;
        }
    }
    if (searchHeaders[targetIndex].count == 1) {
        searchHeaders.splice(targetIndex,1);
        searchTabRecomends.getElementsByClassName("searchTab-recomendation")[targetIndex].remove();
    } else {
        searchHeaders[targetIndex].count--;
    }
}
function resetRecomendations() {
    searchTabRecomends.innerHTML = "";
    searchHeaders = [];
    for (let i = 0; i < Cards.length; i++) {
        let data = Cards[i].getCardData()[0];
        addRecomendation(data);
    }
}