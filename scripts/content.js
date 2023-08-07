// immediately invoked function expression
(function () {
  console.log("SwordCut activated");

  let command = "";
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
      element.focus();
      element.setSelectionRange(position, position);
    } else if (element.isContentEditable) {
      const selection = window.getSelection();
      const range = document.createRange();
      //assuming simple childnodes
      range.setStart(element.firstChild, position);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  function onError(error) {
    console.error("Error:", error);
  }

  // retrieve swordcuts from local storage
  async function retrieveSwordcuts() {
    const storageApi = window.browser ? browser.storage : chrome.storage; // Determine the storage API namespace
    console.log("retrieving swordcuts from storage");

    return new Promise((resolve, reject) => {
      storageApi.local.get(["swordcuts"], function (result) {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(
            result.swordcuts ||
              JSON.parse('{"/gd": "Good morning, how can I help you?"}')
          );
        }
      });
    });
  }

  // check constructed command for stored sentences
  async function checkCommand(command) {
    //retrieve from storage if swordcuts has not yet been retrieved
    if (Object.keys(swordcuts).length === 0) {
      try {
        swordcuts = await retrieveSwordcuts();
        //console.log(swordcuts);
      } catch (error) {
        onError(error);
      }
    }

    if (swordcuts[command]) {
      return swordcuts[command];
    } else return false;
  }

  // construct a command by checking the input events
  async function constructCommand(element) {
    if (command === "") {
      if (element.data === "/") {
        command = command.concat(element.data);
      }
    } else if (command[0] === "/") {
      // only fire when entering letters from english alphabet
      if (/^[a-zA-Z]/.test(element.data)) {
        command = command.concat(element.data);
      }
    }

    // check command and/or return to empty
    if (element.data === " " && command !== "") {
      try {
        const sentence = await checkCommand(command);
        if (sentence) {
          replaceElementText(element, command, sentence);
        }
      } catch (error) {
        onError(error);
      }
      command = "";
    }
  }

  // replace element content with new text
  function replaceElementText(element, command, sentence) {
    let newText;
    let caretPosition = getCaretPosition(element.target);
    //console.log(caretPosition);
    if (element.target.setSelectionRange) {
      // input and textarea
      newText =
        element.target.value.substring(
          0,
          caretPosition - (command.length + 1)
        ) +
        sentence +
        element.target.value.substring(caretPosition);
      element.target.value = newText;
      caretPosition = caretPosition - (command.length + 1) + sentence.length;
    } else if (element.target.isContentEditable) {
      // contenteditable
      //console.log(element.target.textContent);

      const startOffset = caretPosition - (command.length + 1);
      const endOffset = caretPosition;
      newText =
        element.target.firstChild.textContent.substring(0, startOffset) +
        sentence +
        element.target.firstChild.textContent.substring(endOffset);
      //console.log(newText);
      //console.log(element.target);
      element.target.firstChild.textContent = newText;
      caretPosition = startOffset + sentence.length;
    }
    // Update caret position
    setCaretPosition(element.target, caretPosition);
  }

  // add event listener to an input field
  function addInputEvent(element) {
    element.target.addEventListener("input", constructCommand);
  }

  // remove event listener from an input field
  function removeInputEvent(element) {
    element.target.removeEventListener("input", constructCommand);
    command = "";
  }

  function initialize() {
    window.addEventListener("focusin", addInputEvent);
    window.addEventListener("focusout", removeInputEvent);
  }

  initialize();
})();
