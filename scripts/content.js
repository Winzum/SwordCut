// immediately invoked function expression
(function () {
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
    console.log(`Error: ${error}`);
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
  async function checkWordForCommand(w) {
    //retrieve from storage if swordcuts has not yet been retrieved
    if (Object.keys(swordcuts).length === 0) {
      try {
        swordcuts = await retrieveSwordcuts();
        console.log(swordcuts);
      } catch (error) {
        onError(error);
      }
    }

    if (swordcuts[w]) {
      return swordcuts[w];
    } else return false;
  }

  // construct a word by checking the input events
  async function constructWord(e) {
    if (word === "") {
      if (e.data === "/") {
        word = word.concat(e.data);
      }
    } else if (word[0] === "/") {
      // only fire when entering letters from english alphabet
      if (/^[a-zA-Z]/.test(e.data)) {
        word = word.concat(e.data);
      }
    }

    // check for command and/or return to empty word
    if (e.data === " " && word !== "") {
      try {
        const command = await checkWordForCommand(word);
        if (command) {
          let newText;
          let caretPosition = getCaretPosition(e.target);
          console.log(caretPosition);
          if (e.target.setSelectionRange) {
            newText =
              e.target.value.substring(0, caretPosition - (word.length + 1)) +
              command +
              e.target.value.substring(caretPosition);
            e.target.value = newText;
            caretPosition = caretPosition - (word.length + 1) + command.length;
          } else if (e.target.isContentEditable) {
            console.log(e.target.textContent);

            const startOffset = caretPosition - (word.length + 1);
            const endOffset = caretPosition;
            newText =
              e.target.firstChild.textContent.substring(0, startOffset) +
              command +
              e.target.firstChild.textContent.substring(endOffset);
            console.log(newText);
            console.log(e.target);
            e.target.firstChild.textContent = newText;
            caretPosition = startOffset + command.length;
          }
          // Update caret position
          setCaretPosition(e.target, caretPosition);
        }
      } catch (error) {
        onError(error);
      }
      word = "";
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

  function initialize() {
    window.addEventListener("focusin", addInputEvent);
    window.addEventListener("focusout", removeInputEvent);
  }

  initialize();
})();
