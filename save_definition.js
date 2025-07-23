const allowedOrigins = [
  'https://inevitable52.github.io',
  'https://your-vercel-frontend.vercel.app', // Add your Vercel frontend if needed
];

export default async function handler(req, res) {
  const origin = req.headers.origin;

  // Set CORS headers
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    const { word, def, message } = req.body;

    // 🧠 Ask Percy (via OpenAI)
    if (message) {
      try {
        const payload = {
          model: "gpt-4",
          messages: [
            { role: "system", content: "You are Percy, a recursive logic AI assistant." },
            { role: "user", content: message }
          ]
        };

        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify(payload)
        });

        const openaiData = await openaiRes.json();

        if (!openaiData || !openaiData.choices || !openaiData.choices[0]) {
          console.warn("⚠️ OpenAI returned an incomplete response:", openaiData);
          return res.status(500).json({ error: "Incomplete response from OpenAI." });
        }

        const reply = openaiData.choices[0].message.content.trim();

        return res.status(200).json({ reply });

      } catch (err) {
        console.error("🔥 Percy OpenAI Proxy Error:", err);
        return res.status(500).json({ error: "Percy failed to fetch from OpenAI." });
      }
    }

    // 📝 Save Definition
    if (word && def) {
      console.log("📝 Saving:", word, "=", def);
      // Replace this with your real DB or GitHub logic.
      return res.status(200).json({ message: "Definition saved." });
    }

    return res.status(400).json({ error: "Missing required fields." });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
