// Function to save options
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

// Function to restore options
function restoreOptions() {
  function setCurrentChoice(result) {
    document.querySelector("#swordcuts").value =
      JSON.stringify(result.swordcuts) ||
      '{"/gd": "Good morning, how can I help you?"}';
  }

  const storageApi = window.browser ? browser.storage : chrome.storage; // Determine the storage API namespace
  storageApi.local.get(["swordcuts"], (result) => {
    if (chrome.runtime.lastError) {
      console.error("Error retrieving swordcuts:", chrome.runtime.lastError);
    } else {
      setCurrentChoice(result);
    }
  });
}

// Add event listeners
document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
