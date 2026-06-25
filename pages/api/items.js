// pages/api/items.js
// Lê e salva os compromissos no Supabase.
// GET  → retorna os itens do usuário
// POST → salva (upsert) os itens do usuário

const USER_ID = "default"; // app pessoal, um único usuário

export default async function handler(req, res) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: "Variáveis SUPABASE_URL / SUPABASE_ANON_KEY não configuradas" });
  }

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };

  // ── GET ──────────────────────────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/agenda?user_id=eq.${USER_ID}&select=items`,
        { headers }
      );
      const data = await r.json();
      const items = Array.isArray(data) && data[0]?.items ? data[0].items : [];
      return res.status(200).json({ items });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST (upsert) ─────────────────────────────────────────────────────────
  if (req.method === "POST") {
    const { items } = req.body || {};
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Campo 'items' deve ser um array" });
    }
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/agenda`, {
        method: "POST",
        headers: { ...headers, Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({
          user_id: USER_ID,
          items,
          updated_at: new Date().toISOString(),
        }),
      });
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
