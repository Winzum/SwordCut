function saveOptions(e) {
  e.preventDefault();
  const text = document.querySelector("#swordcuts").value;
  try {
    const jsonObject = JSON.parse(text);
    console.log("Parsed JSON object:", jsonObject);
    const storageApi = window.browser ? browser.storage : chrome.storage; // Determine the storage API namespace
    storageApi.local.set({
      swordcuts: jsonObject,
    });
  } catch (error) {
    console.error("Error parsing JSON:", error);
  }
}

function restoreOptions() {
  function setCurrentChoice(result) {
    document.querySelector("#swordcuts").value =
      JSON.stringify(result.swordcuts) ||
      '{"/gd": "Good morning, how can I help you?"}';
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }
  const storageApi = window.browser ? browser.storage : chrome.storage; // Determine the storage API namespace

  storageApi.local.get(["swordcuts"], function (result) {
    if (chrome.runtime.lastError) {
      onError(chrome.runtime.lastError);
    } else {
      setCurrentChoice(result);
    }
  });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
