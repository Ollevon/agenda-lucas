// pages/api/items.js
// GET  → carrega itens do Supabase
// POST → salva (upsert) itens no Supabase

const USER_ID = "default";

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
      if (!r.ok) {
        const err = await r.text();
        return res.status(502).json({ error: `Supabase GET erro ${r.status}: ${err}` });
      }
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
      // on_conflict=user_id garante UPDATE quando a linha já existe (upsert real)
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/agenda?on_conflict=user_id`,
        {
          method: "POST",
          headers: {
            ...headers,
            Prefer: "resolution=merge-duplicates,return=minimal",
          },
          body: JSON.stringify({
            user_id: USER_ID,
            items,
            updated_at: new Date().toISOString(),
          }),
        }
      );
      if (!r.ok) {
        const err = await r.text();
        return res.status(502).json({ error: `Supabase POST erro ${r.status}: ${err}` });
      }
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
