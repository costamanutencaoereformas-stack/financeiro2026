# Gestão Financeira 2026 - Guia de Deploy

## 🚀 Deploy no Vercel (Recomendado)

### Pré-requisitos
1. Conta no GitHub
2. Conta no Vercel (gratuita)

### Passo a Passo

#### 1. Preparar o Repositório Git

```bash
# Inicializar Git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Preparar aplicação para deploy no Vercel"

# Criar repositório no GitHub e conectar
git remote add origin https://github.com/SEU_USUARIO/gestao-financeira-2026.git
git branch -M main
git push -u origin main
```

#### 2. Deploy no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"New Project"**
3. Importe seu repositório GitHub
4. O Vercel detectará automaticamente o projeto Next.js/React
5. Configure as variáveis de ambiente
6. Clique em **"Deploy"**
7. Aguarde o deploy (2-5 minutos)

#### 3. Configurar Banco de Dados

**Opção 1: Supabase (Recomendado)**
1. Acesse [supabase.com](https://supabase.com)
2. Crie um projeto PostgreSQL gratuito
3. Copie a connection string
4. Adicione no Vercel: `DATABASE_URL=postgresql://...`

**Opção 2: Neon.tech**
1. Acesse [neon.tech](https://neon.tech)
2. Crie um projeto PostgreSQL gratuito
3. Copie a connection string
4. Adicione no Vercel: `DATABASE_URL=postgresql://...`

#### 4. Variáveis de Ambiente no Vercel

No dashboard do Vercel, adicione:
- `DATABASE_URL` - String de conexão PostgreSQL
- `SESSION_SECRET` - Chave secreta para sessões
- `NODE_ENV=production`
- `SUPABASE_URL` (se usar Supabase)
- `SUPABASE_SERVICE_ROLE_KEY` (se usar Supabase)

#### 5. Aplicar Schema do Banco

Após o deploy, o schema será aplicado automaticamente via `seedDefaultData()`.

#### 6. Acessar Aplicação

Use as credenciais padrão:
- **Usuário:** `admin`
- **Senha:** `admin123`

---

## 🔧 Build Configuration

O projeto usa configuração otimizada para Vercel:
- **Frontend:** Vite build automático
- **Backend:** API routes em `/api`
- **Static:** Arquivos estáticos em `dist/public`

---

## 🌐 Alternativa: Railway.app

### Deploy no Railway

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Iniciar projeto
railway init

# Deploy
railway up
```

---

## ✅ Checklist Pós-Deploy

- [ ] Aplicação acessível via HTTPS
- [ ] Banco de dados conectado
- [ ] Login funcionando com admin/admin123
- [ ] Testar todas as funcionalidades principais
- [ ] Configurar backup do banco (recomendado)

---

## 🔒 Segurança

### Recomendações:
1. ✅ Use HTTPS (já configurado no Vercel)
2. ✅ Senhas fortes para usuários
3. ✅ Backup regular do banco de dados
4. ✅ Monitore logs de acesso
5. ✅ Atualize dependências regularmente

---

## 📊 Monitoramento

### Vercel Dashboard
- Logs em tempo real
- Métricas de uso
- Status do serviço
- Analytics integrado

---

## 💰 Custos

### Vercel Free Tier:
- ✅ 100GB bandwidth/mês
- ✅ Build time gratuito
- ✅ SSL/HTTPS incluído
- ✅ Deploy automático via Git
- ✅ Custom domains

### Upgrade quando necessário:
- **Pro**: $20/mês (mais bandwidth e features)
- **Enterprise**: Custom pricing

---

## 🆘 Suporte e Troubleshooting

### Problemas Comuns:

**1. Erro de conexão com banco**
- Verifique `DATABASE_URL` nas variáveis de ambiente
- Confirme que o banco permite conexões externas

**2. Aplicação não inicia**
- Verifique logs no Vercel Dashboard
- Confirme que `npm run build` funciona localmente

**3. Sessões não persistem**
- Verifique `SESSION_SECRET` está configurado
- Confirme que cookies estão habilitados

---

## 📞 Contato

Para suporte adicional:
- Documentação Vercel: https://vercel.com/docs
- Documentação Supabase: https://supabase.com/docs
- Documentação Neon: https://neon.tech/docs
