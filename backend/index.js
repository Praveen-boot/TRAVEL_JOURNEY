const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini with the model found in your ListModels check
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  systemInstruction: `You are 'Wayfarer AI', an expert travel consultant. 
  1. Provide helpful, enthusiastic travel advice.
  2. If the user asks for a trip, itinerary, or plan, you MUST include a JSON block at the end of your response.
  3. The JSON must follow this exact structure: 
     {
       "destination": "City, Country",
       "days": [
         { "dayNumber": 1, "theme": "Arrival & Landmarks", "activities": ["Activity 1", "Activity 2"] }
       ],
       "estimatedBudget": "$XXX - $XXX"
     }
  4. Surround the JSON with triple backticks and the word 'json'.`
});

app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;

  try {
    // Start a chat session with the history passed from React
    const chatSession = model.startChat({
      history: history || [],
    });

    // Send the user message
    const result = await chatSession.sendMessage(message);
    const fullText = result.response.text();

    // --- PARSING LOGIC ---
    let chatReply = fullText;
    let structuredData = null;

    // Check if Gemini included a JSON code block
    if (fullText.includes("```json")) {
      const parts = fullText.split("```json");
      chatReply = parts[0].trim(); // Everything before the JSON
      
      const jsonContent = parts[1].split("```")[0].trim(); // Everything inside the backticks
      
      try {
        structuredData = JSON.parse(jsonContent);
      } catch (parseError) {
        console.error("Could not parse Gemini JSON:", parseError);
        // If parsing fails, structuredData remains null and React handles it gracefully
      }
    }

    // Send both the text and the data object back to React
    res.json({ 
      reply: chatReply, 
      data: structuredData 
    });

  } catch (error) {
    console.error("Gemini Backend Error:", error);
    res.status(500).json({ error: "The travel AI is temporarily offline." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Wayfarer Backend running on http://localhost:${PORT}`);
});