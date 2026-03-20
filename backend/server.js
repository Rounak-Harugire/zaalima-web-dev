require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { generateExtension } = require('./extensionGenerator');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// GET / route required by instructions
app.get('/', (req, res) => {
    res.send('Extensio.ai backend running');
});

// POST /generate-extension route
app.post('/generate-extension', async (req, res) => {
    try {
        console.log('Prompt received');
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        await generateExtension(prompt, res);
    } catch (error) {
        console.error('Error generating extension:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

app.listen(PORT, () => {
    console.log('Server started');
    console.log(`Server running on port ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
});
