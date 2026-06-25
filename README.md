# Agenda Lucas — Guia de instalação

Stack: Next.js · Vercel (hospedagem grátis) · Supabase (banco grátis) · Google Gemini (IA grátis)

---

## Passo 1 — Criar a chave do Gemini (5 min)

1. Acesse https://aistudio.google.com/apikey
2. Faça login com sua conta Google
3. Clique em **"Create API key"** → **"Create API key in new project"**
4. Copie a chave gerada (começa com `AIza...`)
5. Guarde ela num bloco de notas por enquanto

---

## Passo 2 — Criar o banco no Supabase (5 min)

1. Acesse https://supabase.com e crie uma conta gratuita
2. Clique em **"New project"**, dê um nome (ex: `agenda-lucas`), escolha a senha e clique em **Create**
3. Aguarde o projeto subir (~1 min)
4. No menu lateral, clique em **SQL Editor** → **New Query**
5. Cole o conteúdo do arquivo `supabase-schema.sql` e clique em **RUN**
6. Vá em **Settings → API** e copie:
   - **Project URL** (ex: `https://abc123.supabase.co`)
   - **anon public** key

---

## Passo 3 — Subir o código no GitHub (5 min)

1. Acesse https://github.com e crie uma conta gratuita (se não tiver)
2. Clique em **"New repository"**, nome: `agenda-lucas`, deixe **Private**, clique em **Create**
3. Na próxima tela, clique em **"uploading an existing file"**
4. Arraste a pasta `agenda-lucas` inteira, ou os arquivos um a um:
   - `pages/index.js`
   - `pages/api/ask.js`
   - `pages/api/items.js`
   - `package.json`
   - `supabase-schema.sql`
5. Clique em **Commit changes**

---

## Passo 4 — Publicar no Vercel (5 min)

1. Acesse https://vercel.com e crie uma conta (pode entrar com o GitHub)
2. Clique em **"Add New Project"** → selecione o repositório `agenda-lucas`
3. Na tela de configuração, clique em **"Environment Variables"** e adicione as três:

   | Nome              | Valor                          |
   |-------------------|-------------------------------|
   | GEMINI_API_KEY    | sua chave do Gemini            |
   | SUPABASE_URL      | URL do projeto Supabase        |
   | SUPABASE_ANON_KEY | chave anon public do Supabase  |

4. Clique em **Deploy**
5. Aguarde ~2 minutos. O Vercel vai te dar uma URL tipo `agenda-lucas.vercel.app`

Pronto — sua agenda está no ar, funciona no celular e no computador, dados salvos no banco.

---

## Testar localmente (opcional)

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/agenda-lucas.git
cd agenda-lucas

# Instale as dependências
npm install

# Copie o arquivo de variáveis e preencha
cp .env.local.example .env.local
# Abra .env.local e cole as três chaves

# Rode o servidor local
npm run dev
# Acesse http://localhost:3000
```

---

## Dúvidas comuns

**O console não responde** → Confira se GEMINI_API_KEY está correto nas variáveis do Vercel.

**Os itens somem ao recarregar** → Confira SUPABASE_URL e SUPABASE_ANON_KEY, e se rodou o SQL do schema.

**Como atualizar o app** → Substitua os arquivos no GitHub. O Vercel faz o deploy automático.
