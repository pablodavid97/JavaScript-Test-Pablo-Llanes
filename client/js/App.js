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

const ENTER_KEY = "Enter";
const UP_KEY = "ArrowUp";
const DOWN_KEY = "ArrowDown";

let newRequest = true;
const listSelection = new ListSelection();

// Autocomplete component
const showStates = async (event) => {
    let searchBar = document.getElementById("stateSearchBar");
    let clearBtn = document.getElementById("clearSearchBtn");
    let searchTxtLen = searchBar.value.length;

    if (isKeyAlphaOrReturn(event)) {
        if (searchTxtLen >= 2) {
            makeSearchRequest();
        }

        if (searchTxtLen == 0) {
            clearSearchInput();
        }

        clearBtn.addEventListener("click", event => {
            clearSearchInput()
        });
    }
    else {
        arrowKeySelection(event, listSelection);
        selectStateOnEnter(event);
    }
}

// returns true when input key is alphanumeric or return character
// this prevents from making unnecessary calls to API
const isKeyAlphaOrReturn = (e) => {
    let flag = false;

    if (
        (e.which >= 65 && e.which <= 90) || (e.keyCode >= 65 && e.keyCode <= 90) ||
        (e.which == 8 || e.keyCode == 8)
    ) {
        flag = true;
    }

    return flag;
}

const makeSearchRequest = async () => {
    let resultsCount = 0;
    let resultsList = [];
    let searchBar = document.getElementById("stateSearchBar");
    let clearBtn = document.getElementById("clearSearchBtn");

    const resData = await getStatesJSON(searchBar.value);
    resultsCount = resData.count;
    resultsList = resData.data;
    
    newRequest = true;
    clearBtn.style.display = "block";

    if (resultsCount > 0) {
        let stateList = createStateList(listSelection, resultsList);

        stateList.addEventListener("mouseover", event => {
            setInputValueHover(event)
        });

        stateList.addEventListener("click", event => {
            setInputValueClick(event)
        });
    } else {
        displayNoResultsMessage(resData.message);
    }
}

// aynchronous function that calls API to retrieve US States
const getStatesJSON = async (searchValue) => {
    const response = await fetch(`http://localhost:3000/api/states?term=${searchValue}`);
    const states = await response.json();
    return states
}

const createStateList = (listSelectionObj, list) => {
    let prevStateList = document.getElementById("stateList");
    let newStateList = document.createElement("UL");
        
    if (prevStateList) {
        app.removeChild(prevStateList);
    }
    newStateList.id = "stateList";
    newStateList.classList.add("app__search-list");
    newStateList.style.display = "block";
    app.appendChild(newStateList);

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

const setInputValueHover = (event) => {
    let searchBar = document.getElementById("stateSearchBar");
    let stateItem = getEventTarget(event)

    if (stateItem.tagName == "LI") {
        selectedState = stateItem.innerHTML;
        searchBar.value = selectedState;
    }
}

const setInputValueClick = (event) => {
    let app = document.getElementById("app");
    let searchBar = document.getElementById("stateSearchBar");
    let list = document.getElementById("stateList");
    let stateItem = getEventTarget(event);

    selectedState = stateItem.innerHTML;

    if (list) {
        app.removeChild(list);
    }
    searchBar.value = selectedState;
}

// returns element that has been selected based on user interaction (used for list click and hover)
const getEventTarget = (event) => {
    event = event || window.event;
    return event.target || event.srcElement;
}

const displayNoResultsMessage = (message) => {
    resultsMsg = message;

    console.log(resultsMsg);
}

const clearSearchInput = () => {
    let list = document.getElementById("stateList");
    let searchBar = document.getElementById("stateSearchBar");
    let clearBtn = document.getElementById("clearSearchBtn");

    searchBar.value = "";

    if (list) {
        app.removeChild(list);
    }
    clearBtn.style.display = "none";
}

const arrowKeySelection = (event, listSelectionObj) => {
    let searchBar = document.getElementById("stateSearchBar");
    let list = document.getElementById("stateList");
    let items = null;
    let activeItem = document.getElementsByClassName("app__search-item--selected")
    let selectedItem = null;
    let eventCode = event.code;

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

const selectStateOnEnter = (event) => {
    let list = document.getElementById("stateList");

    if (event.code == ENTER_KEY) {
        if (list) {
            list.parentElement.removeChild(list);
        }
    }
}

window.showStates = showStates;