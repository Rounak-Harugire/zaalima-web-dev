require('dotenv').config();
const axios = require('axios');
async function run() {
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    try {
        const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        console.log("AVAILABLE MODELS:", res.data.models.map(m => m.name).join(', '));
    } catch(e) {
        console.log("ERROR DATA:", e.response?.data);
    }
}
run();
