// pages/api/ask.js
// Proxy Groq (Llama 3.3 70B). Prompt otimizado pra mínimo de tokens.

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const { text, ctx } = req.body || {};
  if (!text) return res.status(400).json({ error: "Campo 'text' obrigatório" });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY não configurada" });

  const today = new Date().toISOString().split("T")[0];
  const wd = ["dom","seg","ter","qua","qui","sex","sab"][new Date().getDay()];

  // Prompt enxuto. Agenda no formato: id|titulo|cliente|categoria|status|datas
  const sys = `Assistente de agenda audiovisual. HOJE=${today}(${wd}).
Converta a mensagem em JSON. SEMPRE resolva qualquer referência de tempo (amanhã, sexta, dia 15, semana que vem, próxima terça, fim do mês) para datas reais YYYY-MM-DD com zero à esquerda (ex: 2026-07-05). Só use datas=[] se NÃO houver nenhuma menção de tempo na mensagem.
categoria: trabalho(captação,edição,render,entrega,gravação)|reuniao(call,briefing)|pessoal(médico,academia,família)
status: confirmado(padrão)|incerto(talvez,a confirmar)|em_andamento|concluido
tipo: captacao|edicao|producao|reuniao|entrega|pessoal|outro. prioridade: media(padrão)|alta|baixa.
datas: array YYYY-MM-DD (vários dias ok). cliente só p/ trabalho/reuniao. local: endereço/lugar se mencionado (ex: "no sítio em Araruama", "estúdio X").
Conflito: 2 trabalhos confirmados no mesmo dia → avise no reply (reuniao/pessoal nunca conflitam).
${ctx ? `Agenda (id|titulo|cliente|cat|status|datas):\n${ctx}` : "Agenda vazia."}
Ops: add|update|complete(→concluido)|confirm(→confirmado)|delete(commitment={}). Use id existente p/ editar.
Responda SÓ JSON minificado:
{"reply":"frase curta","operations":[{"type":"add","id":null,"commitment":{"titulo":"","cliente":"","categoria":"","tipo":"","datas":[],"hora":null,"local":"","status":"confirmado","prioridade":"media","notas":""}}]}
reply≤1 frase. Sem tarefa→operations:[].`;

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
          { role: "system", content: sys },
          { role: "user", content: text },
        ],
        temperature: 0,
        max_tokens: 800,
        response_format: { type: "json_object" },
      }),
    });

    const data = await groqRes.json();
    if (!groqRes.ok) {
      return res.status(502).json({ error: data?.error?.message || `Groq HTTP ${groqRes.status}` });
    }
    const out = data?.choices?.[0]?.message?.content || "";
    return res.status(200).json({ text: out });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Erro interno" });
  }
}
