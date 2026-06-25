// pages/api/ask.js
// Proxy para o Google Gemini API — mantém a chave segura no servidor.

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "Campo 'prompt' obrigatório" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY não configurada no servidor" });

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      const msg = data?.error?.message || `Erro Gemini HTTP ${geminiRes.status}`;
      return res.status(502).json({ error: msg });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Erro interno ao chamar Gemini" });
  }
}
