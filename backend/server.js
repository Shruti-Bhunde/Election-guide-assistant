const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
console.log("Fetch type:", typeof fetch);
require("dotenv").config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route
// app.post("/chat", async (req, res) => {
//     try {
//         const userMessage = req.body.message;

//         console.log("User:", userMessage);

//         const response = await fetch("https://api.openai.com/v1/responses", {
//             method: "POST",
//             headers: {
//                 "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({
//                 model: "gpt-4.1-mini",
//                 input: userMessage
//             })
//         });

//         const data = await response.json();

//         console.log("API RESPONSE:", data);

//         const reply =
//             data.output?.[0]?.content?.[0]?.text ||
//             "Sorry, I couldn't understand that.";

//         res.json({ reply });

//     } catch (err) {
//         console.error("❌ ERROR:", err);
//         res.status(500).json({ reply: "Server error" });
//     }
// });
app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;

    try {
        const response = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are an election assistant. Explain things simply and clearly to first-time voters."
                    },
                    {
                        role: "user",
                        content: userMessage
                    }
                ]
            })
        });

        const data = await response.json();

        res.json({
            reply: data.choices?.[0]?.message?.content || "No response from AI"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ reply: "Server error" });
    }
});

app.post("/chat", async (req, res) => {
    try {
        console.log("Incoming:", req.body);

        const userMessage = req.body.message;

        if (!userMessage) {
            return res.status(400).json({ reply: "No message" });
        }

        const response = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4.1-mini",
                input: userMessage
            })
        });

        const text = await response.text();
        console.log("RAW:", text);

        const data = JSON.parse(text);

        res.json({
            reply: data.output?.[0]?.content?.[0]?.text || "No response"
        });

    } catch (err) {
        console.error("❌ ERROR:", err);
        res.status(500).json({ reply: "Server error" });
    }
});

// Start server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});