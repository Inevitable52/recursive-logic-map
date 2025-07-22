const allowedOrigins = [
  'https://inevitable52.github.io',
  'https://recursive-logic-grxmmb8x9-fabian-villarreals-projects.vercel.app',
  'https://recursive-logic-map.vercel.app',
  'http://localhost:3000',
];

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
    return res.status(200).end(); // Preflight OK
  }

  if (req.method === "POST") {
    const { word, def, message } = req.body;

    // 🧠 Ask Percy (OpenAI Proxy)
    if (message) {
      try {
        const payload = {
          model: "gpt-4",
          messages: [
            { role: "system", content: "You are Percy, a recursive logic AI assistant." },
            { role: "user", content: message }
          ]
        };

        const openaiRes = await fetch("http://localhost:3000", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const openaiData = await openaiRes.json();
        const reply = openaiData?.choices?.[0]?.message?.content || "🤖 No response from Percy.";

        return res.status(200).json({ reply });
      } catch (err) {
        console.error("🔥 Percy OpenAI Proxy Error:", err);
        return res.status(500).json({ error: "Percy failed to fetch from OpenAI." });
      }
    }

    // 📝 Save Definition
    if (word && def) {
      console.log("📝 Saving:", word, "=", def);
      // TODO: Replace with your actual saving logic (GitHub, database, etc.)
      return res.status(200).json({ message: "Definition saved." });
    }

    return res.status(400).json({ error: "Missing required fields." });
  }

  res.status(405).json({ error: "Method not allowed" });
}
