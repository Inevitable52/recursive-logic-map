// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 🔒 Check for API key
if (!OPENAI_API_KEY) {
  console.error('❌ ERROR: OPENAI_API_KEY not found in .env file.');
  process.exit(1);
}

// 🔧 Middleware
app.use(cors());
app.use(express.json());

// 🧠 Percy Proxy Route
app.post('/api/openai', async (req, res) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`🛑 OpenAI API Error [${response.status}]:`, data);
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (err) {
    console.error('🔥 Server Error:', err);
    res.status(500).json({ error: 'Proxy server failed to communicate with OpenAI.' });
  }
});

// 🚀 Launch the Percy Proxy Server
app.listen(PORT, () => {
  console.log(`✅ Percy Proxy Server is live at: https://recursive-logic-map.vercel.app/api`);
});
