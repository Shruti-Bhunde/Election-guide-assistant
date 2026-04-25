const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

/**
 * 🔥 Generates COMPLETE response (auto-continues if cut)
 */
async function generateFullResponse(userMessage) {
    let fullReply = "";
    let attempts = 0;
    const maxAttempts = 4;

    let prompt = `You are an election assistant. 
Give a COMPLETE, detailed answer with proper structure. Do not stop mid-sentence.

User question: ${userMessage}

Answer:`;

    while (attempts < maxAttempts) {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        maxOutputTokens: 1024,
                        temperature: 0.7,
                        topP: 0.9,
                        topK: 40
                    }
                })
            }
        );

        const data = await response.json();

        const candidate = data?.candidates?.[0];
        const text = candidate?.content?.parts
            ?.map(p => p.text || "")
            .join("") || "";

        const finishReason = candidate?.finishReason;

        fullReply += text;

        console.log("Attempt:", attempts + 1);
        console.log("FinishReason:", finishReason);

        // 🔥 NEW SMART CHECK (IMPORTANT FIX)
        const looksIncomplete =
            text.trim().length < 80 ||              // too short chunk
            !/[.!?]$/.test(text.trim());            // ends mid-sentence

        if (!looksIncomplete && finishReason !== "MAX_TOKENS") {
            break;
        }

        // 🔁 continue only if needed
        prompt = `Continue the answer naturally. Do NOT repeat anything:

${fullReply}`;

        attempts++;
    }

    return fullReply || "No response from AI";
}


// ================= CHAT ROUTE =================
app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;

        if (!userMessage) {
            return res.status(400).json({ reply: "No message provided" });
        }

        const reply = await generateFullResponse(userMessage);

        return res.json({ reply });

    } catch (error) {
        console.error("❌ SERVER ERROR:", error);
        return res.status(500).json({ reply: "Server error" });
    }
});


// ================= FRONTEND =================
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});


// ================= START SERVER =================
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});