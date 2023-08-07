// immediately invoked function expression
(function () {
  console.log("SwordCut activated");

  let constructedWord = "";
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

  // check constructed word for stored commands
  async function checkWordForCommand(word) {
    //retrieve from storage if swordcuts has not yet been retrieved
    if (Object.keys(swordcuts).length === 0) {
      try {
        swordcuts = await retrieveSwordcuts();
        console.log(swordcuts);
      } catch (error) {
        onError(error);
      }
    }

    if (swordcuts[word]) {
      return swordcuts[word];
    } else return false;
  }

  // construct a word by checking the input events
  async function constructWord(element) {
    if (constructWord === "") {
      if (element.data === "/") {
        constructedWord = constructedWord.concat(element.data);
      }
    } else if (constructedWord[0] === "/") {
      // only fire when entering letters from english alphabet
      if (/^[a-zA-Z]/.test(element.data)) {
        constructedWord = constructedWord.concat(element.data);
      }
    }

    // check for command and/or return to empty word
    if (element.data === " " && constructedWord !== "") {
      try {
        const command = await checkWordForCommand(constructedWord);
        if (command) {
          let newText;
          let caretPosition = getCaretPosition(element.target);
          console.log(caretPosition);
          if (element.target.setSelectionRange) {
            newText =
              element.target.textContent.substring(
                0,
                caretPosition - (constructedWord.length + 1)
              ) +
              command +
              element.target.textContent.substring(caretPosition);
            element.target.textContent = newText;
            caretPosition =
              caretPosition - (constructedWord.length + 1) + command.length;
          } else if (element.target.isContentEditable) {
            console.log(element.target.textContent);

            const startOffset = caretPosition - (constructedWord.length + 1);
            const endOffset = caretPosition;
            newText =
              element.target.firstChild.textContent.substring(0, startOffset) +
              command +
              element.target.firstChild.textContent.substring(endOffset);
            console.log(newText);
            console.log(element.target);
            element.target.firstChild.textContent = newText;
            caretPosition = startOffset + command.length;
          }
          // Update caret position
          setCaretPosition(element.target, caretPosition);
        }
      } catch (error) {
        onError(error);
      }
      constructedWord = "";
    }
  }

  // add event listener to an input field
  function addInputEvent(element) {
    element.target.addEventListener("input", constructWord);
  }

  // remove event listener from an input field
  function removeInputEvent(element) {
    element.target.removeEventListener("input", constructWord);
    constructedWord = "";
  }

  function initialize() {
    window.addEventListener("focusin", addInputEvent);
    window.addEventListener("focusout", removeInputEvent);
  }

  initialize();
})();
