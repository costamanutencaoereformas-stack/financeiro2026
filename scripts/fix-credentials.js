#!/usr/bin/env node

/**
 * Script para corrigir as credenciais do Supabase
 * Execute com: node scripts/fix-credentials.js
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

async function fixCredentials() {
  console.log('🔧 Corretor de Credenciais Supabase\n');
  console.log('Vamos reconfigurar suas credenciais. Tenha em mãos:\n');
  console.log('1. Dashboard do Supabase aberto');
  console.log('2. Settings > Database (para URL de conexão)');
  console.log('3. Settings > API (para chaves)\n');

  try {
    // Obter PROJECT_REF
    const projectUrl = await question('🌐 Cole a URL completa do seu projeto Supabase (ex: https://uxncnpfywehwwsdjejtp.supabase.co): ');
    const projectRef = projectUrl.replace('https://', '').replace('.supabase.co', '').trim();
    
    console.log(`✅ PROJECT_REF extraído: ${projectRef}`);

    // Obter connection string completa
    const connectionString = await question('📡 Cole a Connection String completa do Settings > Database: ');
    
    // Obter chaves
    const anonKey = await question('🔑 Cole a ANON_KEY: ');
    const serviceKey = await question('🛡️ Cole a SERVICE_ROLE_KEY: ');

    // Gerar conteúdo do .env
    const envContent = `# ============================================
# BANCO DE DADOS - SUPABASE
# ============================================
${connectionString}

# ============================================
# SUPABASE AUTH (Frontend)
# ============================================
VITE_SUPABASE_URL=https://${projectRef}.supabase.co
VITE_SUPABASE_ANON_KEY=${anonKey}

# ============================================
# SUPABASE AUTH (Backend)
# ============================================
SUPABASE_URL=https://${projectRef}.supabase.co
SUPABASE_SERVICE_ROLE_KEY=${serviceKey}

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

    console.log('\n✅ Arquivo .env reconfigurado com sucesso!');
    console.log('📍 Local:', envPath);
    
    // Testar conexão
    console.log('\n🧪 Testando nova configuração...');
    const { execSync } = await import('child_process');
    
    try {
      const testResult = execSync('node scripts/test-db-connection.js', { 
        cwd: projectRoot, 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      console.log(testResult);
      console.log('\n🎉 Tudo pronto! Execute "npm run dev" para iniciar a aplicação.');
      
    } catch (testError) {
      console.log('❌ Ainda há problemas com a conexão:');
      console.log(testError.stdout || testError.message);
      console.log('\n🔧 Verifique manualmente as credenciais no dashboard do Supabase.');
    }

  } catch (error) {
    console.error('❌ Erro ao configurar:', error.message);
  } finally {
    rl.close();
  }
}

fixCredentials();
