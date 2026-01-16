#!/usr/bin/env node

/**
 * Script para configurar automaticamente as credenciais no arquivo .env
 * Execute com: node scripts/configure-env.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function configureEnv() {
  console.log('🔧 Configurador de Credenciais Supabase\n');
  console.log('Por favor, tenha suas credenciais do Supabase em mãos.\n');

  try {
    // Obter credenciais do usuário
    const projectRef = await question('📝 Digite o PROJECT_REF do seu Supabase (ex: abcdefghijklmnop): ');
    const password = await question('🔐 Digite a senha do seu banco de dados Supabase: ');
    const region = await question('🌍 Digite a região (ex: sa-east-1, us-east-1) [padrão: sa-east-1]: ') || 'sa-east-1';
    const anonKey = await question('🔑 Digite a chave ANON_KEY (começa com eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...): ');
    const serviceKey = await question('🛡️ Digite a SERVICE_ROLE_KEY (opcional, pressione Enter para pular): ');

    // Gerar conteúdo do .env
    const envContent = `# ============================================
# BANCO DE DADOS - SUPABASE
# ============================================
DATABASE_URL=postgresql://postgres.${projectRef}:${password}@aws-0-${region}.pooler.supabase.com:6543/postgres

# ============================================
# SUPABASE AUTH (Frontend)
# ============================================
VITE_SUPABASE_URL=https://${projectRef}.supabase.co
VITE_SUPABASE_ANON_KEY=${anonKey}

# ============================================
# SUPABASE AUTH (Backend)
# ============================================
SUPABASE_URL=https://${projectRef}.supabase.co
${serviceKey ? `SUPABASE_SERVICE_ROLE_KEY=${serviceKey}` : '# SUPABASE_SERVICE_ROLE_KEY='}

# ============================================
# OUTRAS CONFIGURAÇÕES
# ============================================
SESSION_SECRET=fincontrol-secret-key-${Date.now()}-change-in-production
NODE_ENV=development
PORT=5001
`;

    // Escrever no arquivo .env
    const envPath = path.join(projectRoot, '.env');
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Arquivo .env configurado com sucesso!');
    console.log('📍 Local:', envPath);
    console.log('\n🚀 Você pode iniciar a aplicação com:');
    console.log('   npm run dev');
    console.log('\n🌐 A aplicação estará disponível em:');
    console.log('   http://localhost:5001');

  } catch (error) {
    console.error('❌ Erro ao configurar o arquivo .env:', error.message);
  } finally {
    rl.close();
  }
}

configureEnv();
