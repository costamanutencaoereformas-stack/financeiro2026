# 🚀 Configuração do Login com Supabase

O login via Supabase já foi implementado no frontend! Siga os passos abaixo para configurar as credenciais.

## 📋 Passos para Configurar

### 1. Obter Credenciais do Supabase

1. **Acesse seu projeto Supabase**: https://supabase.com/dashboard
2. **Selecione seu projeto**
3. **Vá em Settings > Database**
   - Copie a "Connection String" no modo "URI" (porta 6543)
4. **Vá em Settings > API**
   - Copie a URL do projeto
   - Copie a chave "anon" (pública)
   - Copie a chave "service_role" (para uso no backend)

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto com suas credenciais:

```bash
# ============================================
# BANCO DE DADOS - SUPABASE
# ============================================
DATABASE_URL=postgresql://postgres.abcdefghijklmnop:SUA_SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres

# ============================================
# SUPABASE AUTH (Frontend)
# ============================================
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# SUPABASE AUTH (Backend)
# ============================================
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# OUTRAS CONFIGURAÇÕES
# ============================================
SESSION_SECRET=sua-chave-secreta-muito-forte-e-aleatoria-aqui
NODE_ENV=development
PORT=5001
```

### 3. Configurar Autenticação no Supabase

No dashboard do Supabase:

1. **Vá para Authentication > Settings**
2. **Configure os provedores**:
   - **Email**: Ative o login com email/senha
   - **Google**: Configure o OAuth do Google (opcional)
3. **Configure a URL de redirecionamento**:
   - Adicione: `http://localhost:5001` (desenvolvimento)
   - Adicione: `https://seu-dominio.com` (produção)

### 4. Iniciar a Aplicação

```bash
npm run dev
```

Acesse: http://localhost:5001

## 🎯 Funcionalidades Implementadas

### ✅ Login/Registro
- **Email e Senha**: Login tradicional
- **Google OAuth**: Login com conta Google
- **Registro**: Novos usuários podem criar conta
- **Confirmação por Email**: Supabase envia email de confirmação

### ✅ Backend Integration
- **Verificação de Tokens**: Backend valida tokens JWT do Supabase
- **Sincronização de Usuários**: Usuários são criados/atualizados no banco local
- **Roles e Permissões**: Sistema de permissões mantido
- **Sessões Seguras**: Tokens verificados em cada requisição

### ✅ Frontend Features
- **Estado de Autenticação**: Contexto React gerencia estado
- **Redirecionamento Automático**: Usuários logados são redirecionados
- **Loading States**: Indicadores de carregamento
- **Tratamento de Erros**: Mensagens amigáveis de erro

## 🔧 Troubleshooting

### Erro: "Supabase não configurado"
- Verifique se as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão no `.env`

### Erro: "Token inválido"
- Verifique se `SUPABASE_SERVICE_ROLE_KEY` está configurada no backend
- Reinicie o servidor após alterar as variáveis de ambiente

### Login com Google não funciona
- Configure o OAuth no dashboard do Supabase
- Adicione a URL de redirecionamento correta
- Verifique se as credenciais do Google estão corretas

### Email de confirmação não chega
- Verifique a configuração de email no Supabase
- Configure um template de email personalizado se necessário

## 🎨 Personalização

### Customizar UI de Login
Edite `client/src/pages/login.tsx` para personalizar a interface.

### Customizar Fluxo de Autenticação
Edite `client/src/lib/auth.tsx` para modificar o comportamento.

### Adicionar Novos Provedores
Adicione novos provedores OAuth no dashboard do Supabase e atualize o frontend.

## 🚀 Deploy em Produção

1. **Configure variáveis de ambiente** no serviço de hosting
2. **Atualize URLs de redirecionamento** no Supabase
3. **Configure domínio personalizado** se necessário
4. **Teste o fluxo completo** em produção

---

**Pronto! 🎉 O login via Supabase está totalmente implementado e funcional.**
