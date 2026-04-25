const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 🔹 Serve frontend
app.use(express.static(path.join(__dirname, "frontend")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend/index.html"));
});

// 🔹 Chat Route (Gemini)
app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;

        if (!userMessage) {
            return res.status(400).json({ reply: "No message provided" });
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: `You are an election assistant. Answer clearly:\n${userMessage}` }]
                        }
                    ],
                    generationConfig: {
                        maxOutputTokens: 200,
                        temperature: 0.7
                    }
                })
            }
        );

        const data = await response.json();

        console.log("RAW GEMINI RESPONSE:", JSON.stringify(data, null, 2));

        if (!response.ok) {
            console.error("❌ Gemini API Error:", data);
            return res.status(500).json({
                reply: "Gemini API error"
            });
        }

        let reply = data?.candidates?.[0]?.content?.parts
            ?.map(p => p.text)
            ?.join("") || "No response from AI";

        return res.json({ reply });

    } catch (error) {
        console.error("❌ SERVER ERROR:", error);
        return res.status(500).json({ reply: "Server error" });
    }
});

// 🔹 Fallback route (important for frontend routing)
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// 🔹 Cloud Run PORT fix
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});