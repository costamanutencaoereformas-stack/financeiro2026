# 🌐 Configuração de Domínio Personalizado

## 🎯 Domínio Desejado
**URL Final:** `https://financeirototal.vercel.app`

## 📋 Configuração no Vercel

### 1. Adicionar Domínio no Dashboard
1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione o projeto `financeiro2026`
3. Vá para **Settings → Domains**
4. Clique em "Add Domain"
5. Digite: `financeirototal.vercel.app`
6. Siga as instruções de configuração

### 2. Configurar DNS
Adicione os seguintes registros no seu provedor de DNS:

#### Registro Principal:
```
Tipo: CNAME
Nome: financeirototal
Valor: cname.vercel-dns.com
TTL: 300
```

#### Registro de Verificação (será solicitado pelo Vercel):
```
Tipo: TXT
Nome: _vercel
Valor: código-gerado-pelo-vercel
TTL: 300
```

### 3. Aguardar Propagação DNS
- **Tempo médio:** 5-30 minutos
- **Verificação:** Use ferramentas online como [whatsmydns.net](https://whatsmydns.net)

## 🔧 Configuração Adicional

### Variáveis de Ambiente
Configure no Vercel Dashboard → Settings → Environment Variables:
```env
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=seu-secret-aqui
NODE_ENV=production
```

### SSL/TLS
- ✅ **Certificado SSL:** Automático e gratuito via Vercel
- ✅ **HTTPS:** Habilitado automaticamente
- ✅ **Redirecionamento:** www → non-www configurado

## 📱 Teste Pós-Configuração

### Verificar Funcionamento:
1. **Acesse:** `https://financeirototal.vercel.app`
2. **Teste Login:** admin / admin123
3. **Verifique:** Todas as funcionalidades
4. **Monitore:** Logs no Vercel Dashboard

### Backup da Configuração
- **Domínio:** financeirototal.vercel.app
- **Projeto Vercel:** financeiro2026
- **Repositório:** costamanutencaoereformas-stack/financeiro2026

## 🚀 Status Final

Após configuração:
- ✅ **URL Personalizada:** `https://financeirototal.vercel.app`
- ✅ **SSL Automático:** Certificado gratuito
- ✅ **CI/CD Ativo:** Deploy automático via GitHub
- ✅ **Performance:** CDN global do Vercel
- ✅ **Monitoramento:** Logs e métricas em tempo real

---

## 📞 Suporte

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **DNS Help:** [vercel.com/docs/custom-domains](https://vercel.com/docs/custom-domains)
- **Issues:** [GitHub Issues](https://github.com/costamanutencaoereformas-stack/financeiro2026/issues)

**🎉 Domínio personalizado configurado com sucesso!**
