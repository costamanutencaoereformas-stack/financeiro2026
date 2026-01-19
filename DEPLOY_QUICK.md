# 🚀 Deploy Rápido - Gestão Financeira 2026

## 📋 Passos Imediatos

### 1. 🌐 Conectar GitHub ao Vercel

1. Acesse [vercel.com](https://vercel.com)
2. **Import Project** → **GitHub**
3. Selecione: `costamanutencaoereformas-stack/financeiro2026`
4. Clique em **Deploy**

### 2. ⚙️ Configurar Variáveis de Ambiente

No Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=seu-secret-aqui
NODE_ENV=production
```

### 3. 🗄️ Configurar Banco de Dados

**Opções Gratuitas:**
- [Supabase](https://supabase.com) → Create Project → Settings → Database
- [Neon](https://neon.tech) → New Project
- [Railway](https://railway.app) → New Project → PostgreSQL

### 4. 🔄 Deploy Automático

Após configurar, cada push no GitHub fará deploy automático!

---

## 🎯 URLs Após Deploy

- **App**: `https://financeiro2026.vercel.app`
- **API**: `https://financeiro2026.vercel.app/api/*`
- **Admin**: Login com `admin`/`admin123`

## 📱 Teste Rápido

```bash
# Testar API
curl https://financeiro2026.vercel.app/api/auth/me

# Verificar status
curl https://financeiro2026.vercel.app/api/categories
```

## 🛠️ Suporte

- **Issues**: [GitHub](https://github.com/costamanutencaoereformas-stack/financeiro2026/issues)
- **Documentação**: `README_DEPLOYMENT.md`

---

**✅ Pronto! Sua aplicação estará no ar em minutos.**
