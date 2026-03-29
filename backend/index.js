const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Initialize with the most stable identifier
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use "gemini-1.5-flash" - this is the stable production name.
// If you still get a 404, the issue might be your API Key region or project setup.
// Change your model initialization to this:
// backend/index.js

// Update your model initialization
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash", // Using the stable model from your list
  systemInstruction: {
    role: "system",
    parts: [{
      text: `You are 'Wayfarer AI', a world-class travel consultant. 
      Your personality is:
      1. Enthusiastic, professional, and highly organized.
      2. You prioritize safety, local experiences, and budget-conscious tips.
      3. If a user asks a non-travel question, say: "I'd love to help with that, but my expertise is in world exploration! Shall we get back to planning your trip?"
      4. Always format your responses using Markdown for readability (bullet points for itineraries, bold text for locations).`
    }]
  }
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    // Basic content generation
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    
    res.json({ reply: text });
  } catch (error) {
    // Enhanced error logging to see EXACTLY what is failing
    console.error("--- API ERROR LOG ---");
    console.error("Status:", error.status);
    console.error("Message:", error.message);
    res.status(500).json({ error: "Gemini connection failed. Check console." });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));