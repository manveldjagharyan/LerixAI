const express = require('express');
const fetch = require('node-fetch'); // Եթե Node 18+ ունես, fetch արդեն կա
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const API_KEY = 'քո_openrouter_key_here';

app.post('/chat', async (req, res) => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
