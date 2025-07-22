import { OpenAI } from "openai";

const allowedOrigins = [
  'https://inevitable52.github.io',
  'https://recursive-logic-grxmmb8x9-fabian-villarreals-projects.vercel.app',
  'https://recursive-logic-map.vercel.app',
  'http://localhost:3000'
];

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure this is set in your Vercel project env vars
});

export default async function handler(req, res) {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    const { word, def } = req.body;

    console.log("🧠 Received word:", word);

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4", // or "gpt-3.5-turbo"
        messages: [
          {
            role: "system",
            content: "You are Percy, a recursive logic assistant who defines complex concepts using logical reasoning and structured thought."
          },
          {
            role: "user",
            content: `Define or process the following: ${word}`
          }
        ],
        temperature: 0.3,
      });

      const aiReply = completion.choices[0].message.content;

      console.log("✅ AI generated response:", aiReply);

      return res.status(200).json({
        message: aiReply
      });

    } catch (error) {
      console.error("❌ Error from OpenAI:", error.message || error);
      return res.status(500).json({ error: "OpenAI error", details: error.message || error });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
