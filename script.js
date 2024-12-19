async function addPrompt() {
    const input = document.getElementById("add-prompt-input");  
    const obj = {};
    obj[`${new Date()}`] = input.value; // Add new prompt to the object
    await new Promise((resolve, reject) => {
        chrome.storage.sync.set(obj, function () {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                console.log("Prompt saved:", input.value);
                resolve();
            }
        });
    });
  input.value = "";
  load_prompts_saved_by_user();
}

  async function deletePrompt(key) {
    chrome.storage.sync.get(null, function(items) {
        chrome.storage.sync.remove(key, function() {
          load_prompts_saved_by_user();
        });

    });
  }

  async function setPrompt(text) {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true }); // Ensure active tab in current window
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      args: [text],
      func: (text) => {
        const textarea = document.getElementById("prompt-textarea");
        if (textarea && textarea.children.length > 0) {
          textarea.children[0].textContent = text;
        }
      },
    });
  }
  
  async function sayHello() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true }); // Ensure active tab in current window
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        console.log("Hello from extension");
        const textarea = document.getElementById("prompt-textarea");
        if (textarea && textarea.children.length > 0) {
          textarea.children[0].textContent = "custom prompt";
        }
        chrome.storage.sync.get(null, function (items) {
          //const allKeys = Object.keys(items);
          console.log("All keys:", items);
        });
      },
    });
  }

  async function load_prompts_saved_by_user() {
    const prompt_space = document.getElementById("prompts_saved_by_user");
              // Ensure the container exists
      if (!prompt_space) {
        alert("Element with ID 'prompts_saved_by_user' not found!");
        return;
      }

        chrome.storage.sync.get(null, function (items) {
            prompt_space.innerHTML = "";
            for(const [key, value]of Object.entries(items)){
                const promptElement = document.createElement("div", );
                promptElement.className= "prompt-item"

                const promptText = document.createElement("p")
                promptText.textContent = value
                const executeButton = document.createElement("button");
                executeButton.textContent = "run"
                executeButton.addEventListener("click", () => setPrompt(value))

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "delete"
                deleteButton.addEventListener("click", () => {
                    deletePrompt(key)
                    promptText.remove()
                    executeButton.remove()
                    deleteButton.remove()
                    promptElement.remove()
                })

                promptElement.appendChild(promptText)
                promptElement.appendChild(executeButton)
                promptElement.appendChild(deleteButton)
                prompt_space.appendChild(promptElement); 
            }
        });
  }
  
  function main() {
    load_prompts_saved_by_user()
    document.getElementById("myButton").addEventListener("click", sayHello);
    document.getElementById("add-prompt-button").addEventListener("click", addPrompt);
  }
  
  main();