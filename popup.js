document.addEventListener('DOMContentLoaded', () => {
  const statusDiv = document.getElementById('status');

  // Load saved key and provider
  chrome.storage.local.get(['apiKey', 'provider'], (result) => {
    if (result.apiKey) {
      document.getElementById('apiKey').value = result.apiKey;
    }
    if (result.provider) {
      document.getElementById('provider').value = result.provider;
    } else {
      document.getElementById('provider').value = 'gemini'; // default
    }
  });

  // Save Key
  document.getElementById('saveBtn').addEventListener('click', () => {
    const key = document.getElementById('apiKey').value.trim();
    const provider = document.getElementById('provider').value;
    if (!key) {
      statusDiv.innerText = "Please enter a key.";
      return;
    }
    chrome.storage.local.set({ apiKey: key, provider: provider }, () => {
      statusDiv.innerText = "Key and provider saved!";
      setTimeout(() => statusDiv.innerText = "", 2000);
    });
  });

  // Trigger Solver
  document.getElementById('solveBtn').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (!tabs[0] || !tabs[0].id) {
        statusDiv.innerText = "No active tab.";
        return;
      }
      chrome.tabs.sendMessage(tabs[0].id, {action: "solve_quiz"})
        .then(() => window.close())
        .catch(() => {
          statusDiv.style.color = "red";
          statusDiv.innerText = "Error: Refresh the quiz page!";
        });
    });
  });
});