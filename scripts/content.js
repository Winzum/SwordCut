console.log("SwordCut activated");
let word = "";
let swordcuts = {};

// returns the caret's position
function getCaretPosition(element) {
  if (element.setSelectionRange) {
    const caretPosition = element.selectionStart;
    return caretPosition;
  } else if (element.contentEditable === "true") {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const caretPosition = range.startOffset;
      return caretPosition;
    }
  }
}

// set Caret position in given element
function setCaretPosition(element, position) {
  if (element.setSelectionRange) {
    // Input and Textarea elements
    element.setSelectionRange(position, position);
    element.focus();
  } else if (element.contentEditable === "true") {
    // Contenteditable elements
  }
}

// check constructed word for stored commands
function checkWordForCommand(w) {
  console.log(swordcuts);
  if (swordcuts[w]) {
    return swordcuts[w];
  } else return false;
}

// construct a word by checking the input events
function constructWord(e) {
  if (word === "") {
    if (e.data === "/") {
      word = word.concat(e.data);
    }
  } else {
    // only fire when entering letters from english alphabet
    if (/^[a-zA-Z]/.test(e.data)) {
      word = word.concat(e.data);
    }
  }

  // check for command and/or return to empty word
  if (e.data === " " && word !== "") {
    command = checkWordForCommand(word);
    if (command) {
      const caretPosition = getCaretPosition(e.target);
      console.log(caretPosition);
      if (e.target.setSelectionRange) {
        e.target.value =
          e.target.value.substring(0, caretPosition - (word.length + 1)) +
          command +
          e.target.value.substring(caretPosition);
      } else if (e.target.contentEditable === "true") {
        e.target.textContent =
          e.target.textContent.substring(0, caretPosition - (word.length + 1)) +
          command +
          e.target.textContent.substring(caretPosition);
      }
      word = "";
    }
  }
}

// add event listener to an input field
function addInputEvent(e) {
  // console.log(e.target);
  e.target.addEventListener("input", constructWord);
}

// remove event listener from an input field
function removeInputEvent(e) {
  e.target.removeEventListener("input", constructWord);
  word = "";
}

function onError(error) {
  console.log(`Error: ${error}`);
}

function onGot(item) {
  return (
    item.swordcuts || JSON.parse('{"/gd": "Good morning, how can I help you?"}')
  );
}

function retrieveSwordcuts() {
  console.log("retrieving swordcuts from storage");
  let getting = browser.storage.sync.get("swordcuts");
  return getting.then(onGot, onError);
}

retrieveSwordcuts()
  .then((retrievedSwordcuts) => {
    swordcuts = retrievedSwordcuts;
  })
  .catch((error) => {
    console.error("Error:", error);
  });

window.addEventListener("focusin", addInputEvent);
window.addEventListener("focusout", removeInputEvent);
