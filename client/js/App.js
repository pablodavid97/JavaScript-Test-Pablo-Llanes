'use strict';

import '../sass/app.scss';

class ListSelection {
    constructor() {
        this.start = 0;
        this.end = 0;
        this.position = -1;
    }

    setLimits(start, end) {
        this.start = start;
        this.end = end;
    }

    resetPosition() {
        this.position = -1;
    }

    increasePosition() {
        this.position++;

        if (this.position >= this.end) {
            this.position = this.start;
        }
    }

    decreasePosition() {
        this.position--;

        if (this.position < this.start) {
            this.position = this.end - 1;
        }
    }

    getPosition() {
        return this.position;
    }
}

const searchContainer = document.querySelector(".app__search-container");
const searchBar = document.getElementById("stateSearchBar");
const clearBtn = document.getElementById("clearSearchBtn");

const ENTER_KEY = "Enter";
const UP_KEY = "ArrowUp";
const DOWN_KEY = "ArrowDown";

let newRequest = false;
const listSelection = new ListSelection();

searchBar.addEventListener("keyup", e => {
    let searchTxtLen = searchBar.value.length;

    if (isKeyAlphaOrReturn(e)) {
        if (searchTxtLen >= 2) {
            makeSearchRequest();
        }
        else if (searchTxtLen == 0 && newRequest == true) {
            clearSearchInput();
        }
    }
    else {
        arrowKeySelection(e, listSelection);
        selectStateOnEnter(e);
    }
});

clearBtn.addEventListener("click", clearSearchInput);

// returns true when input key is alphanumeric or return character
// this prevents from making unnecessary calls to API
function isKeyAlphaOrReturn(e) {
    let flag = false;

    if (
        (e.which >= 65 && e.which <= 90) || (e.keyCode >= 65 && e.keyCode <= 90) ||
        (e.which == 8 || e.keyCode == 8)
    ) {
        flag = true;
    }

    return flag;
}

async function makeSearchRequest() {
    let resultsCount = 0;
    let resultsList = [];

    const resData = await getStatesJSON(searchBar.value);
    resultsCount = resData.count;
    resultsList = resData.data;

    newRequest = true;
    clearBtn.style.display = "flex";
    clearBtn.style.justifyContent = "center";
    clearBtn.style.alignItems = "center";

    if (resultsCount > 0) {
        let stateList = createStateList(listSelection, resultsList);

        stateList.addEventListener("mouseover", e => {
            setInputValueHover(e)
        });

        stateList.addEventListener("click", e => {
            setInputValueClick(e)
        });
    } else {
        displayNoResultsMessage(resData.message);
    }
}

// aynchronous function that calls API to retrieve US States
async function getStatesJSON(searchValue) {
    const response = await fetch(`http://localhost:3000/api/states?term=${searchValue}`);
    const states = await response.json();
    return states
}

function createStateList(listSelectionObj, list) {
    let prevStateList = document.getElementById("stateList");
    let newStateList = document.createElement("UL");

    if (prevStateList) {
        searchContainer.removeChild(prevStateList);
    }
    newStateList.id = "stateList";
    newStateList.classList.add("app__search-list");
    newStateList.style.display = "block";
    searchContainer.appendChild(newStateList);

    listSelectionObj.setLimits(0, list.length);

    // creates list nodes for each state found
    for (let state of list) {
        let stateItem = document.createElement("LI");
        stateItem.classList.add("app__search-item");
        stateItem.innerHTML = state.name;
        newStateList.appendChild(stateItem);
    }

    return newStateList
}

function setInputValueHover(e) {
    let stateItem = getEventTarget(e);
    let selectedState = null;

    if (stateItem.tagName == "LI") {
        selectedState = stateItem.innerHTML;
        searchBar.value = selectedState;
    }
}

function setInputValueClick(e) {
    let list = document.getElementById("stateList");
    let stateItem = getEventTarget(e);
    let selectedState = stateItem.innerHTML;

    if (list) {
        searchContainer.removeChild(list);
    }
    searchBar.value = selectedState;
}

// returns element that has been selected based on user interaction (used for list click and hover)
function getEventTarget(e) {
    e = e || window.e;
    return e.target || e.srcElement;
}

function displayNoResultsMessage(message) {
    resultsMsg = message;
    console.log(resultsMsg);
}

function clearSearchInput() {
    let list = document.getElementById("stateList");
    searchBar.value = "";

    if (list) {
        searchContainer.removeChild(list);
    }
    clearBtn.style.display = "none";
}

function arrowKeySelection(e, listSelectionObj) {
    let list = document.getElementById("stateList");
    let items = null;
    let activeItem = document.getElementsByClassName("app__search-item--selected")
    let selectedItem = null;
    let eventCode = e.code;

    if (eventCode == UP_KEY || eventCode == DOWN_KEY) {
        if (newRequest) {
            listSelection.resetPosition();
            newRequest = false;
        }

        if (eventCode == UP_KEY) {
            listSelectionObj.decreasePosition();
        } else if (eventCode == DOWN_KEY) {
            listSelectionObj.increasePosition();
        }

        if (activeItem.length > 0) {
            activeItem[0].classList.remove("app__search-item--selected");
        }

        if (list) {
            items = list.childNodes
            selectedItem = items[listSelectionObj.getPosition()];
            selectedItem.classList.add("app__search-item--selected");
            searchBar.value = selectedItem.innerHTML;
        }
    }
}

function selectStateOnEnter(e) {
    let list = document.getElementById("stateList");

    if (e.code == ENTER_KEY) {
        if (list) {
            list.parentElement.removeChild(list);
        }
    }
}