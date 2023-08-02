console.log("SwordCut activated");
let word = "";

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

// check constructed word for stored commands #add ability to add new ones #TODO make user changable
function checkWordForCommand(w) {
  //console.log(w);
  switch (w) {
    case "/gd":
      return "Good day, how can I help?";

    case "/que":
      return "Could you supply me with some further answers. Which users? Which contracts? What are the plate numbers?";

    case "/wb":
      return "Waiting for business.";

    default:
      return false;
  }
}

// construct a word by checking the input events
function constructWord(e) {
  if (word === "") {
    if (e.data === "/") {
      word = word.concat(e.data);
    }
  } else {
    // only fire when entering letters from english alphabet #TODO support others
    if (/^[a-zA-Z]/.test(e.data)) {
      word = word.concat(e.data);
    }
  }

  // check for command and/or return to empty word
  if (e.data === " " && word !== "") {
    const command = checkWordForCommand(word);
    if (command) {
      console.log("here");
      console.log(e.target);
      // e.target.textContent =
      //   e.target.textContent.substring(
      //     0,
      //     e.target.textContent.length - (word.length + 1)
      //   ) + command;
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
      //setCaretPosition(e.target, caretPosition + command.length);
    }

    word = "";
  }
}

// add event listener to an input field
function addInputEvent(e) {
  console.log(e.target);
  e.target.addEventListener("input", constructWord);
}

// remove event listener from an input field
function removeInputEvent(e) {
  e.target.removeEventListener("input", constructWord);
  word = "";
}

window.addEventListener("focusin", addInputEvent);
window.addEventListener("focusout", removeInputEvent);
