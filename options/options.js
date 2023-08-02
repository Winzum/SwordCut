function saveOptions(e) {
  e.preventDefault();

  const text = document.querySelector("#swordcuts").value;
  try {
    const jsonObject = JSON.parse(text);
    console.log("Parsed JSON object:", jsonObject);
    browser.storage.sync.set({
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

  let getting = browser.storage.sync.get("swordcuts");
  getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
