// pages/api/ask.js
// Proxy para o Groq API (Llama 3.3 70B — 1.000 req/dia grátis, sem cartão)

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const { text, ctx } = req.body || {};
  if (!text) return res.status(400).json({ error: "Campo 'text' obrigatório" });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY não configurada" });

  const today = new Date().toISOString().split("T")[0];
  const wd = ["domingo","segunda","terça","quarta","quinta","sexta","sábado"][new Date().getDay()];

  const systemPrompt = `Você é o assistente de agenda de Lucas, profissional de audiovisual no Brasil.
HOJE: ${today} (${wd}). Resolva datas relativas para YYYY-MM-DD.

REGRAS:
- categoria: "trabalho"=captação/edição/render/entrega/gravação/color/decupagem; "reuniao"=call/briefing/alinhamento/orçamento; "pessoal"=médico/academia/família/contas/lazer
- status: "confirmado"(padrão)/"incerto"(talvez,pode ser,a confirmar)/"em_andamento"/"concluido"
- tipo: captacao|edicao|producao|reuniao|entrega|pessoal|outro
- prioridade: "media"(padrão)/"alta"(urgente)/"baixa"
- datas: array YYYY-MM-DD (pode ter vários dias). Sem data = []
- cliente: só para trabalho/reunião com cliente
- CONFLITO: se trabalho confirmado cair no mesmo dia de outro trabalho confirmado → avise na reply
- Reunião e pessoal nunca geram conflito

Agenda atual: [${ctx || "vazia"}]

Responda SOMENTE JSON minificado (sem markdown, sem espaços extras):
{"reply":"frase curta em pt-BR","operations":[{"type":"add","id":null,"commitment":{"titulo":"","cliente":"","categoria":"","tipo":"","datas":[],"hora":null,"status":"confirmado","prioridade":"media","notas":""}}]}

Tipos: add / update / complete(→concluido) / confirm(→confirmado) / delete(commitment={})
Se não for tarefa: operations=[]`;

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        temperature: 0.1,
        max_tokens: 1024,
        response_format: { type: "json_object" },
      }),
    });

    const data = await groqRes.json();

    if (!groqRes.ok) {
      return res.status(502).json({ error: data?.error?.message || `Groq HTTP ${groqRes.status}` });
    }

    const text_out = data?.choices?.[0]?.message?.content || "";
    return res.status(200).json({ text: text_out });

  } catch (err) {
    return res.status(500).json({ error: err.message || "Erro interno" });
  }
}
