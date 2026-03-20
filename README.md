# Extensio.ai – Chrome Extension Generator

Extensio.ai is a complete working project to generate Chrome extensions using the Gemini API.

## Project Structure

- `backend/`: Node.js + Express backend that communicates with Gemini API and handles zip creation.
- `frontend/`: Vanilla HTML/CSS/JS frontend to provide user prompts and download extensions.

## Setup Instructions

1.  **Configure API Key**
    - Navigate to the `backend/` directory.
    - Copy `.env.example` to `.env` and add your Gemini API Key.
    ```bash
    cp .env.example .env
    ```
    - Edit `.env` to set `GEMINI_API_KEY=your_key_here`

2.  **Start Backend**
    ```bash
    cd backend
    npm install
    npm start
    ```
    The server will run on `http://localhost:5000`. You can visit this URL to see the status "Extensio.ai backend running".

3.  **Use Frontend**
    - Open `frontend/index.html` in your web browser.
    - Enter a prompt like "Create a Chrome extension that changes all page text to red".
    - Click "Generate Extension".
    - An `extension.zip` file will automatically download.
