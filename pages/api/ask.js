// pages/api/ask.js
// Recebe { text, ctx } do frontend, monta o prompt e chama o Gemini.
// O prompt fica aqui no servidor — nunca exposto no bundle do cliente.

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const { text, ctx } = req.body || {};
  if (!text) return res.status(400).json({ error: "Campo 'text' obrigatório" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY não configurada" });

  const today = new Date().toISOString().split("T")[0];
  const wd = ["domingo","segunda","terça","quarta","quinta","sexta","sábado"][new Date().getDay()];

  const prompt = `Você é o assistente de agenda de Lucas, profissional de audiovisual no Brasil.
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

Tipos de operação: add / update / complete(→concluido) / confirm(→confirmado) / delete(commitment={})
Se não for tarefa: operations=[]

MENSAGEM: ${text}`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      return res.status(502).json({ error: data?.error?.message || `Gemini HTTP ${geminiRes.status}` });
    }

    const text_out = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const finishReason = data?.candidates?.[0]?.finishReason || "";

    if (finishReason === "MAX_TOKENS") {
      return res.status(500).json({ error: "Resposta cortada pelo limite de tokens. Tente uma mensagem mais curta." });
    }

    return res.status(200).json({ text: text_out });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Erro interno" });
  }
}
