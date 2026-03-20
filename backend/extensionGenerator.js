const fs = require('fs');
const path = require('path');
const os = require('os');
const archiver = require('archiver');
const axios = require('axios');

async function verifyGeminiApiKey(apiKey) {
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY' || apiKey === 'EMPTY' || apiKey.trim() === '') {
        console.log("ROOT CAUSE DETECTED:\nAPI key failure - Key is missing or placeholder.");
        return { valid: false, error: "Invalid Gemini API key. Please configure backend/.env" };
    }

    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    try {
        const testResponse = await axios.post(testUrl, {
            contents: [ { parts: [ { text: "Respond with the word OK" } ] } ]
        }, { headers: { 'Content-Type': 'application/json' }, timeout: 10000 });

        const text = testResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (text.includes("OK")) {
            return { valid: true };
        }
        return { valid: false, error: "API Key did not return OK response." };

    } catch (err) {
        const errorData = err.response?.data || err.message;
        const status = err.response?.status;
        console.error("Gemini API error during validation:", errorData);
        
        let rootCause = "API key failure";
        if (status === 401 || status === 403) rootCause = "permission error / invalid key";
        if (status === 429) rootCause = "Gemini quota exceeded";
        
        console.log(`ROOT CAUSE DETECTED:\n${rootCause} - ${JSON.stringify(errorData)}`);
        return { valid: false, error: `Validation API request failed: ${status}` };
    }
}

function extractAndRepairJSON(text) {
    let cleanText = text;
    let repairLogs = [];

    if (cleanText.includes('```json')) {
        repairLogs.push("Stripped ```json markdown");
        cleanText = cleanText.replace(/```json\s*/g, '').replace(/```/g, '');
    } else if (cleanText.includes('```')) {
        repairLogs.push("Stripped general ``` markdown");
        cleanText = cleanText.replace(/```/g, '');
    }

    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        cleanText = jsonMatch[0];
        console.log("JSON extraction result:", "Extracted JSON block successfully.");
    } else {
        console.log("ROOT CAUSE DETECTED:\nJSON extraction failure - No valid JSON block found in response.");
        throw new Error("No JSON object found in response");
    }

    if (cleanText.match(/,\s*([\]}])/g)) {
        repairLogs.push("Removed trailing commas");
        cleanText = cleanText.replace(/,\s*([\]}])/g, '$1');
    }

    if (repairLogs.length > 0) {
        console.log("Auto-Repair System Activated:", repairLogs.join(", "));
    }

    return cleanText.trim();
}

async function callGemini(prompt, apiKey) {
    const systemInstruction = `You are an expert Chrome extension developer.

Return ONLY valid JSON.

Do NOT include markdown.
Do NOT include explanations.

Output exactly this format:

{
  "manifest.json": "...",
  "content.js": "...",
  "popup.html": "..."
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const data = {
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [ { parts: [{ text: prompt }] } ],
        generationConfig: { temperature: 0.2 }
    };

    console.log("Gemini request payload:", JSON.stringify(data, null, 2));

    let response;
    try {
        response = await axios.post(url, data, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        });
    } catch (err) {
        const errData = err.response?.data || err.message;
        console.log(`ROOT CAUSE DETECTED:\nGemini API request failed - ${JSON.stringify(errData)}`);
        throw err;
    }

    const outputText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const debugFilePath = path.join(__dirname, 'debug_gemini_output.txt');
    fs.writeFileSync(debugFilePath, outputText);
    console.log("Gemini raw response:", outputText);

    let jsonString = extractAndRepairJSON(outputText);

    const parsed = JSON.parse(jsonString);
    return parsed;
}

const FALLBACK_EXTENSION = {
    "manifest.json": JSON.stringify({
        "manifest_version": 3,
        "name": "Fallback Extension",
        "version": "1.0",
        "action": { "default_popup": "popup.html" },
        "permissions": ["activeTab", "scripting"]
    }, null, 2),
    "popup.html": `<!DOCTYPE html><html><head><style>body { width: 200px; padding: 10px; text-align: center; }</style></head><body><button id="btn">Change Background</button><script src="content.js"></script></body></html>`,
    "content.js": `document.getElementById('btn').addEventListener('click', () => { chrome.tabs.query({active: true, currentWindow: true}, (tabs) => { chrome.scripting.executeScript({ target: {tabId: tabs[0].id}, function: () => { document.body.style.backgroundColor = 'red'; } }); }); });`
};

async function generateExtension(prompt, res) {

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    const validation = await verifyGeminiApiKey(apiKey);

    if (!validation.valid) {
        return sendZip(res, FALLBACK_EXTENSION, true, { error: validation.error });
    }

    let parsedData = await callGemini(prompt, apiKey);

    if (!parsedData['manifest.json'] || !parsedData['content.js'] || !parsedData['popup.html']) {
        return sendZip(res, FALLBACK_EXTENSION, true, { error: "Missing required files" });
    }

    return sendZip(res, parsedData, false);
}

async function sendZip(res, parsedData, isFallback, errorObj = null) {

    if (isFallback) {
        res.status(400);
        if (errorObj) res.setHeader('X-Error-JSON', JSON.stringify(errorObj));
    }

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'extensio-'));

    try {

        for (const [filename, content] of Object.entries(parsedData)) {

            const filePath = path.join(tmpDir, filename);

            if (filePath.startsWith(tmpDir)) {

                let fileContent = content;

                // ✅ REMOVE ICONS FROM MANIFEST.JSON
                if (filename === "manifest.json") {
                    try {
                        const manifestObj = typeof content === "string" ? JSON.parse(content) : content;
                        delete manifestObj.icons;
                        fileContent = JSON.stringify(manifestObj, null, 2);
                    } catch (err) {
                        console.error("Manifest cleanup failed:", err.message);
                    }
                }

                fs.writeFileSync(filePath, String(fileContent));
            }
        }

        res.setHeader('Content-disposition', 'attachment; filename=extension.zip');
        res.setHeader('Content-type', 'application/zip');
        res.setHeader('Access-Control-Expose-Headers', 'X-Error-JSON');

        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.on('error', function(err) { throw err; });

        archive.pipe(res);

        archive.directory(tmpDir, false);

        await archive.finalize();

        console.log('ZIP created');
        console.log('Download sent');

    } finally {

        fs.rm(tmpDir, { recursive: true, force: true }, (err) => {
            if (err) console.error('Failed to cleanup temp dir:', err);
        });

    }
}

module.exports = { generateExtension };