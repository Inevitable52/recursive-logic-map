export default async function handler(req, res) {
  // ✅ Allow CORS from GitHub Pages
  res.setHeader("Access-Control-Allow-Origin", "https://inevitable52.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    const { word, def } = req.body;

    // 🔐 You can add auth/validation here if needed

    console.log("📝 Saving:", word, "=", def);

    // TODO: Save to GitHub repo here (or local file/db/etc)

    return res.status(200).json({ message: "Definition saved." });
  }

  res.status(405).json({ error: "Method not allowed" });
}
