// 1. Safety Log
console.log("AI Solver: Fixed Groq/Gemini Mode Loaded");

let activeModelName = null; 

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "solve_quiz") {
    solveAllQuestions();
  }
  return true; 
});

async function solveAllQuestions() {
  const data = await chrome.storage.local.get(['apiKey', 'provider']);
  const apiKey = data.apiKey;
  const provider = data.provider || 'gemini';

  if (!apiKey) {
    alert("Please click the extension icon and save your API Key first.");
    return;
  }

  console.log(`Using Provider: ${provider}`);

  // Auto-detect Gemini model if using Gemini
  if (provider === 'gemini' && !activeModelName) {
    try {
      activeModelName = await findBestGeminiModel(apiKey);
    } catch (e) {
      alert(`Gemini Error: ${e.message}`);
      return;
    }
  }

  // --- FIND QUESTIONS ---
  const inputs = Array.from(document.querySelectorAll('input[type="radio"], input[type="checkbox"]'));
  const questionGroups = {};
  
  inputs.forEach(input => {
    if (input.id && (input.id.includes('nav') || input.id.includes('toggle'))) return;
    const name = input.name || 'default_group';
    if (!questionGroups[name]) questionGroups[name] = [];
    questionGroups[name].push(input);
  });

  const groupNames = Object.keys(questionGroups);
  if (groupNames.length === 0) {
    alert("No quiz questions found on this page.");
    return;
  }

  // --- SOLVE LOOP ---
  for (const groupName of groupNames) {
    const groupInputs = questionGroups[groupName];
    
    // VISUAL: Yellow = Thinking
    groupInputs.forEach(input => {
      const parent = findClickableElement(input);
      if (parent) parent.style.outline = "2px dashed #FFC107";
    });

    await processQuestionGroup(groupInputs, apiKey, provider);
    
    // Delay (Groq is fast, so 500ms is enough)
    await new Promise(r => setTimeout(r, provider === 'groq' ? 500 : 1000));
  }
}

async function processQuestionGroup(inputs, apiKey, provider) {
  // A. Get Options
  const optionsMap = new Map();
  const optionsText = [];
  
  inputs.forEach(input => {
    const label = findClickableElement(input);
    if (label) {
      const text = label.innerText.replace(/\s+/g, ' ').trim();
      if (text) {
        optionsText.push(text);
        optionsMap.set(text, label);
      }
    }
  });

  // B. Get Question
  const questionText = findQuestionText(inputs[0]);
  
  if (!questionText || optionsText.length === 0) {
    inputs.forEach(i => { const p = findClickableElement(i); if(p) p.style.outline = "none"; });
    return;
  }

  // C. Call AI
  try {
    let answers = [];

    if (provider === 'openai') {
       answers = await getOpenAIAnswer(questionText, optionsText, apiKey);
    } else if (provider === 'groq') {
       answers = await getGroqAnswerRobust(questionText, optionsText, apiKey);
    } else if (provider === 'gemini') {
       answers = await getGeminiAuto(questionText, optionsText, apiKey, activeModelName);
    } else if (provider === 'mistral') {
       answers = await getMistralAnswer(questionText, optionsText, apiKey);
    }
    
    if (answers && answers.length > 0) {
      let clickedAny = false;
      for (const [text, element] of optionsMap) {
        const isMatch = answers.some(ans => 
           text.toLowerCase().includes(ans.toLowerCase()) || 
           ans.toLowerCase().includes(text.toLowerCase())
        );

        if (isMatch) {
          simulateClick(element);
          element.style.outline = "4px solid #4CAF50"; // Green
          element.style.backgroundColor = "rgba(76, 175, 80, 0.1)";
          clickedAny = true;
        } else {
          element.style.outline = "none";
        }
      }
      if (!clickedAny) console.warn("AI replied, but no match found.");
    }
  } catch (err) {
    alert(`${provider.toUpperCase()} Error: ${err.message}`);
    inputs.forEach(i => {
      const p = findClickableElement(i);
      if(p) p.style.outline = "2px solid red"; 
    });
  }
}

// --- HELPER FUNCTIONS ---
function findClickableElement(input) {
  if (input.parentElement && input.parentElement.tagName === 'LABEL') return input.parentElement;
  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) return label;
  }
  return input.parentElement;
}

function findQuestionText(input) {
  let current = findClickableElement(input);
  for(let i=0; i<6; i++) {
    if(!current) break;
    let prev = current.previousElementSibling;
    while(prev) {
      if (['H1','H2','H3','P','DIV'].includes(prev.tagName) || prev.classList.contains('text-2xl')) {
        const text = prev.innerText.trim();
        if (text.length > 5) return text;
      }
      prev = prev.previousElementSibling;
    }
    current = current.parentElement;
  }
  return "Question text not found.";
}

// --- UPDATED GROQ FUNCTION (Using active models) ---
async function getGroqAnswerRobust(question, options, apiKey) {
  const prompt = `
    Question: "${question}"
    Options:
    ${options.map(o => "- " + o).join("\n")}
    Return ONLY a JSON array of correct answer strings.
  `;
  
  // NEW MODELS LIST
  const modelsToTry = [
    "openai/gpt-oss-20b",
    "llama-3.1-8b-instant",      // Replaced outdated model
    "llama-3.3-70b-versatile",   
    "mixtral-8x7b-32768"         
  ];

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 100
        })
      });

      const json = await response.json();
      
      if (json.error) {
        if (json.error.code === 'model_decommissioned' || json.error.code === 'model_not_found') {
           console.warn(`Groq model ${model} deprecated. Trying next...`);
           lastError = json.error.message;
           continue; 
        }
        throw new Error(json.error.message);
      }
      
      const content = json.choices[0].message.content;
      const match = content.match(/\[.*\]/s);
      if (match) return JSON.parse(match[0]);
      return [content.replace(/"/g, '').trim()];

    } catch (e) {
      lastError = e;
    }
  }
  throw new Error(`All Groq models failed. Last error: ${lastError}`);
}

// --- GEMINI FUNCTIONS ---
async function findBestGeminiModel(apiKey) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const json = await response.json();
  if (json.error) throw new Error(json.error.message);
  
  const validModels = json.models.filter(m => 
    m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")
  );
  if (validModels.length === 0) throw new Error("No models available.");

  const preferredOrder = ["gemini-1.5-flash", "gemini-1.0-pro", "gemini-pro"];
  for (const pref of preferredOrder) {
    const found = validModels.find(m => m.name.includes(pref));
    if (found) return found.name.replace("models/", ""); 
  }
  return validModels[0].name.replace("models/", "");
}

async function getGeminiAuto(question, options, apiKey, modelName) {
  const prompt = `
    Question: "${question}"
    Options:
    ${options.map(o => "- " + o).join("\n")}
    Instructions:
    1. Identify correct answer(s).
    2. If "All of the above" is valid, return "All of the above".
    3. If personal declaration, choose "Yes".
    4. Return ONLY a JSON array of strings.
  `;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  const json = await response.json();
  if (json.error) throw new Error(json.error.message);
  try {
    const content = json.candidates[0].content.parts[0].text;
    const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
    if (cleanContent.includes('[') && cleanContent.includes(']')) {
      return JSON.parse(cleanContent.substring(cleanContent.indexOf('['), cleanContent.lastIndexOf(']') + 1));
    }
    return [cleanContent.trim()];
  } catch (e) { return []; }
}

// --- OPENAI FUNCTION ---
async function getOpenAIAnswer(question, options, apiKey) {
  const prompt = `
    Question: "${question}"
    Options:
    ${options.map(o => "- " + o).join("\n")}
    Return ONLY a JSON array of correct answer strings.
  `;
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100
    })
  });
  const json = await response.json();
  if (json.error) throw new Error(json.error.message);
  const content = json.choices[0].message.content;
  if (content.includes('[')) return JSON.parse(content);
  return [content];
}

// --- MISTRAL FUNCTION ---
async function getMistralAnswer(question, options, apiKey) {
  const prompt = `
    Question: "${question}"
    Options:
    ${options.map(o => "- " + o).join("\n")}
    Return ONLY a JSON array of correct answer strings.
  `;
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "open-mixtral-8x7b",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100
    })
  });
  const json = await response.json();
  if (json.error) throw new Error(json.error.message);
  if (!json.choices || json.choices.length === 0) throw new Error("No choices in response: " + JSON.stringify(json));
  const content = json.choices[0].message.content;
  const cleanContent = content.replace(/^json\s*/i, '').replace(/```json\s*/i, '').replace(/```\s*$/, '').trim();
  if (cleanContent.includes('[')) return JSON.parse(cleanContent);
  return [cleanContent];
}

function simulateClick(element) {
  ['mousedown', 'mouseup', 'click'].forEach(eventType => {
    element.dispatchEvent(new MouseEvent(eventType, { bubbles: true, cancelable: true, view: window }));
  });
}