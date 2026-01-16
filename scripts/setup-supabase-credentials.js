#!/usr/bin/env node

/**
 * Script para configurar credenciais do Supabase no arquivo .env
 * Execute com: node scripts/setup-supabase-credentials.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🔧 Configurando credenciais do Supabase...\n');

// Verificar se .env existe
const envPath = path.join(projectRoot, '.env');
const envExamplePath = path.join(projectRoot, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Criando arquivo .env a partir do .env.example...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ Arquivo .env criado com sucesso!\n');
} else {
  console.log('✅ Arquivo .env já existe.\n');
}

// Ler o arquivo .env atual
let envContent = fs.readFileSync(envPath, 'utf8');

console.log('📋 Para configurar o Supabase, siga estes passos:\n');
console.log('1. Acesse seu projeto Supabase: https://supabase.com/dashboard');
console.log('2. Selecione seu projeto');
console.log('3. Vá em Settings > Database');
console.log('4. Copie a "Connection String" no modo "URI" (porta 6543)');
console.log('5. Vá em Settings > API');
console.log('6. Copie a URL do projeto e a chave "anon" (pública)\n');

// Exemplo de configuração
console.log('📝 Exemplo de como configurar suas variáveis:\n');

const exampleConfig = `
# ============================================
# BANCO DE DADOS - SUPABASE
# ============================================
DATABASE_URL=postgresql://postgres.abcdefghijklmnop:SuaSenhaAqui@aws-0-sa-east-1.pooler.supabase.com:6543/postgres

# ============================================
# SUPABASE AUTH (Frontend)
# ============================================
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# OUTRAS CONFIGURAÇÕES
# ============================================
SESSION_SECRET=sua-chave-secreta-muito-forte-e-aleatoria-aqui
NODE_ENV=development
PORT=5001
`;

console.log(exampleConfig);

console.log('🔍 Verificando configuração atual...\n');

// Verificar se as variáveis estão configuradas
const hasDatabaseUrl = envContent.includes('DATABASE_URL=');
const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL=');
const hasSupabaseAnonKey = envContent.includes('VITE_SUPABASE_ANON_KEY=');

if (hasDatabaseUrl && hasSupabaseUrl && hasSupabaseAnonKey) {
  console.log('✅ Parece que suas credenciais já estão configuradas!');
  console.log('🚀 Você pode iniciar a aplicação com: npm run dev');
} else {
  console.log('⚠️  Você precisa configurar as seguintes variáveis no arquivo .env:');
  
  if (!hasDatabaseUrl) console.log('   - DATABASE_URL (conexão com banco de dados)');
  if (!hasSupabaseUrl) console.log('   - VITE_SUPABASE_URL (URL do projeto Supabase)');
  if (!hasSupabaseAnonKey) console.log('   - VITE_SUPABASE_ANON_KEY (chave anônima do Supabase)');
  
  console.log('\n📝 Edite o arquivo .env manualmente ou use um editor de texto.');
}

console.log('\n🎯 Próximos passos:');
console.log('1. Configure as variáveis no arquivo .env');
console.log('2. Execute: npm run dev');
console.log('3. Acesse: http://localhost:5001');
console.log('\n💡 Dica: O arquivo .env está no .gitignore e não será enviado para o Git.');
