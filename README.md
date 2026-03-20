---

# 🚀 Extensio.ai — AI Chrome Extension Generator

Extensio.ai is a full-stack AI-powered web application that allows users to generate **fully functional Chrome Extensions** using simple natural language prompts. It leverages the power of the **Gemini API** to dynamically create extension files and deliver them as a downloadable ZIP.

---

# 📌 Project Overview

Creating Chrome extensions manually requires knowledge of:

* Manifest V3 structure
* JavaScript content scripts
* Permissions and APIs

This project simplifies the entire process by allowing users to:

👉 Describe the extension in plain English
👉 Automatically generate working extension files
👉 Download and use instantly

---

# ✨ Key Features

### 🧠 AI-Based Generation

* Uses Gemini API to generate extension code dynamically
* Converts user prompts into real working Chrome extensions

### 📦 Automatic ZIP Download

* Generated files are packaged into a ZIP
* Ready for **Load Unpacked** in Chrome

### ✅ Manifest V3 Compatible

* Ensures all extensions follow the latest Chrome standards
* Avoids deprecated APIs

### 🛡️ Error Handling & Fallback System

* Handles API failures gracefully
* Provides fallback extension if generation fails
* Logs errors for debugging

### 🔍 Smart Validation

* Checks required files:

  * `manifest.json`
  * `content.js`
  * `popup.html` (if needed)
* Prevents broken extensions

### 🎯 Clean & Minimal Code Output

* Optimized for performance
* Avoids unnecessary files

---

# 🏗️ Project Architecture

```
Extensio.ai/
│
├── backend/
│   ├── server.js                # Express server
│   ├── extensionGenerator.js   # Core AI logic
│   ├── debug logs              # Debugging files
│
├── frontend/
│   ├── index.html              # UI
│   ├── script.js               # API integration
│   ├── style.css               # Styling
│
├── .gitignore
├── README.md
```

---

# ⚙️ How It Works

### Step 1: User Input

User enters a prompt like:

```
Create a Chrome extension that changes all text to red
```

### Step 2: Backend Processing

* Request sent to Node.js backend
* Gemini API is called with structured prompt rules

### Step 3: AI Response Handling

* Raw response cleaned
* JSON extracted and validated
* Missing/invalid outputs handled

### Step 4: File Generation

* Files created:

  * manifest.json
  * content.js
  * popup.html (if required)

### Step 5: ZIP Creation

* Files compressed using `archiver`
* Sent as downloadable response

---

# 🧪 How to Run Locally

## 1️⃣ Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/zaalima-web-dev.git
cd zaalima-web-dev
```

---

## 2️⃣ Setup Backend

```bash
cd backend
npm install
```

Create `.env` file:

```
GEMINI_API_KEY=your_api_key_here
```

Run server:

```bash
npm start
```

---

## 3️⃣ Run Frontend

Open:

```
frontend/index.html
```

in your browser.

---

# 🧪 Testing the Generated Extension

1. Download ZIP
2. Extract files
3. Open Chrome
4. Go to:

```
chrome://extensions
```

5. Enable **Developer Mode**
6. Click **Load Unpacked**
7. Select extracted folder

---

# 🔐 Security Measures

* `.env` file is excluded using `.gitignore`
* API key is never exposed to frontend
* Key rotation handled after leak detection
* Supports API validation before execution

---

# 👨‍💻 Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js

### AI Integration

* Gemini API

### Utilities

* Axios (API calls)
* Archiver (ZIP creation)
* Dotenv (environment variables)

---

# ⚠️ Known Limitations

* AI output may vary depending on prompt clarity
* Very complex extensions may need manual tweaks
* Requires internet for API calls

---

# 🚀 Future Enhancements

* 🌐 Deploy as live SaaS platform
* 🧾 Show generated code preview before download
* 🗂️ Save user prompt history
* 🎨 Advanced UI improvements
* 🔐 User authentication system

---

# 👥 Team Collaboration

This project is developed collaboratively using GitHub:

* Branch-based development
* Pull request workflow
* Role-based contribution

---

# 💡 Learning Outcomes

Through this project, we implemented:

* Full-stack development
* API integration
* Error handling & debugging
* Secure key management
* Real-world deployment practices

---

# ⭐ Conclusion

Extensio.ai transforms the way Chrome extensions are built by making the process:

✅ Faster
✅ Easier
✅ Accessible to beginners

It bridges the gap between **idea → implementation** using AI.

---

# 📢 Note

```
.env file is intentionally excluded for security reasons.
Please add your own API key before running the project.
```

---

