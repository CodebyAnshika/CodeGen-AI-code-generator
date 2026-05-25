require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// API route
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Return ONLY code in HTML, CSS, JS blocks."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        })
      }
    );

    const data = await response.json();

    res.json({
      reply: data.choices?.[0]?.message?.content || "No response"
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Server Error"
    });
  }
});

// Serve frontend files
app.use(express.static(__dirname));

// Homepage route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// IMPORTANT for Vercel
module.exports = app;