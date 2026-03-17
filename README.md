# Florence AI Solver

A powerful browser extension that automatically solves quiz questions using advanced AI models. Supports multiple AI providers including Groq, Google Gemini, OpenAI, and Mistral AI.

## 🚀 Features

- **Multi-Provider Support**: Choose from Groq, Gemini, OpenAI, or Mistral AI
- **Automatic Detection**: Detects quiz questions with radio buttons and checkboxes
- **Smart Answer Matching**: Uses AI to identify correct answers and auto-select them
- **Visual Feedback**: Highlights questions being processed and correct answers
- **Secure Storage**: API keys are stored locally in browser storage
- **Fast Processing**: Optimized for speed with minimal delays between questions

## 📋 Requirements

- **Browser**: Chrome, Edge, or any Chromium-based browser (Manifest V3)
- **API Key**: From one of the supported providers:
  - [Groq API Key](https://console.groq.com/)
  - [Google AI Studio](https://makersuite.google.com/app/apikey) (for Gemini)
  - [OpenAI API Key](https://platform.openai.com/api-keys)
  - [Mistral AI](https://console.mistral.ai/)

## 🛠️ Installation

### Option 1: From GitHub (Development)
1. Clone or download this repository
2. Open Chrome/Edge and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the `florence-solver` folder
5. The extension will appear in your extensions list

### Option 2: From Chrome Web Store (Coming Soon)
- Install directly from the Chrome Web Store (when published)

## 📖 Usage

1. **Install the extension** following the steps above
2. **Click the extension icon** in your browser toolbar
3. **Select your AI provider** from the dropdown (Gemini, OpenAI, Groq, or Mistral)
4. **Enter your API key** for the selected provider
5. **Click "Save Key"** to store your credentials securely
6. **Navigate to a quiz page** with multiple choice questions
7. **Click "🪄 Solve Page"** to let AI solve all questions automatically

### Visual Indicators
- **Yellow outline**: Question is being processed by AI
- **Green outline**: Correct answer has been selected
- **Red outline**: Error occurred (check console for details)

## 🤖 Supported AI Providers

### Groq
- Fast inference with multiple models
- Automatic model selection and fallback
- Models: GPT-OSS-20B, Llama 3.1, Llama 3.3, Mixtral

### Google Gemini
- Auto-detects best available model
- Preferred models: Gemini 1.5 Flash, Gemini 1.0 Pro
- Robust parsing of AI responses

### OpenAI
- Uses GPT-3.5-Turbo
- Reliable for complex questions
- Standard OpenAI API integration

### Mistral AI
- Open Mixtral 8x7B model
- Good performance for various question types

## 🔧 How It Works

1. **Question Detection**: Scans the page for radio buttons and checkboxes
2. **Content Extraction**: Extracts question text and answer options
3. **AI Processing**: Sends question to selected AI provider with structured prompt
4. **Answer Parsing**: Parses AI response to identify correct answers
5. **Auto-Selection**: Simulates clicks on correct answer elements
6. **Visual Feedback**: Provides real-time status updates

## ⚠️ Important Notes

- **Educational Use Only**: This tool is intended for educational purposes and learning assistance
- **Terms of Service**: Using automated tools on quizzes may violate platform terms of service
- **API Costs**: Be aware of API usage costs from your chosen provider
- **Accuracy**: AI answers are not always 100% accurate - verify important answers manually
- **Privacy**: API keys are stored locally and never transmitted except to the AI provider

## 🐛 Troubleshooting

### Extension not working
- Ensure you're on a page with quiz questions (radio buttons/checkboxes)
- Check that your API key is saved and valid
- Try refreshing the quiz page
- Check browser console for error messages

### AI not responding
- Verify your API key is correct and has sufficient credits
- Check internet connection
- Try switching to a different AI provider
- Some providers may have rate limits

### Questions not detected
- The extension works best with standard HTML forms
- Complex quiz platforms may not be supported
- Check if questions use radio buttons or checkboxes

## 🔒 Privacy & Security

- API keys are stored securely in browser local storage
- No data is collected or transmitted to external servers except AI API calls
- All processing happens locally in your browser
- Open source code for transparency

## 📝 License

This project is open source. Please see individual AI provider terms for their usage policies.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you encounter issues or have questions:
- Check the troubleshooting section above
- Open an issue on GitHub
- Ensure your browser and extension are up to date

---

**Disclaimer**: This tool is for educational purposes only. Users are responsible for complying with the terms of service of quiz platforms and AI providers.</content>
<parameter name="filePath">d:\florence-solver\README.md