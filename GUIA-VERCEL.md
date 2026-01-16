# 🚀 Guia de Deploy no Vercel

Este guia explica como hospedar sua aplicação de Gestão Financeira no Vercel.

## 📋 Pré-requisitos

1.  Uma conta no [Vercel](https://vercel.com).
2.  Um repositório no GitHub com o código da aplicação.
3.  Um banco de dados PostgreSQL (recomendamos o **Supabase**).

---

## 📋 PASSO 1: Preparar o Código

Eu já preparei os arquivos necessários:
-   `api/index.ts`: Ponto de entrada para as funções serverless.
-   `vercel.json`: Configuração de rotas.
-   `server/index.ts`: Exportado para compatibilidade.
-   `server/auth.ts`: Removida restrição de domínio nos cookies.

**Comite as alterações:**
```powershell
git add .
git commit -m "Configurar para deploy no Vercel"
git push origin main
```

---

## 📋 PASSO 2: Configurar Novo Projeto no Vercel

1.  Acesse o Dashboard do Vercel e clique em **"New Project"**.
2.  Importe seu repositório do GitHub.
3.  Nas **Build & Development Settings**:
    -   **Build Command**: `npm run build`
    -   **Output Directory**: `dist/public`
    -   **Install Command**: `npm install`
4.  Nas **Environment Variables**, adicione (obrigatório):
    -   `DATABASE_URL`: Sua URL de conexão do Supabase (ex: `postgresql://postgres:[SENHA]@[HOST]:5432/postgres`).
    -   `SESSION_SECRET`: Uma string aleatória longa para as sessões.
    -   `NODE_ENV`: `production`

---

## 📋 PASSO 3: Executar Push do Banco de Dados

Como o Vercel é voltado para o frontend, a sincronização do banco de dados (Drizzle) deve ser feita manualmente ou via script de build. Recomendamos fazer localmente uma vez apontando para o banco de produção:

```powershell
# No seu terminal local, defina a URL temporariamente
$env:DATABASE_URL="sua-url-do-supabase-aqui"
npm run db:push
```

Ou, você pode alterar o **Build Command** no Vercel para incluir o push (não recomendado se o banco for muito lento no build):
`npm run build && npm run db:push`

---

## 📋 PASSO 4: Verificar o Deploy

1.  Aguarde o Vercel finalizar o build.
2.  Acesse a URL gerada (ex: `https://seu-projeto.vercel.app`).
3.  Tente fazer o primeiro registro (o primeiro usuário será o ADMIN).

---

## 🆘 Solução de Problemas

-   **Erro 500 na API**: Verifique nos logs do Vercel (aba "Logs") se a `DATABASE_URL` está correta.
-   **Erro de Login/Sessão**: Certifique-se de que a `SESSION_SECRET` foi definida.
-   **Frontend não carrega**: Verifique se o "Output Directory" foi definido como `dist/public`.

---

🎉 **Sua aplicação está pronta!**
