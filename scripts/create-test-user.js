#!/usr/bin/env node

/**
 * Script para criar um usuário de teste no Supabase
 * Execute com: node scripts/create-test-user.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

// Carregar variáveis de ambiente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const envPath = path.join(projectRoot, '.env');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createTestUser() {
  console.log('👤 Criador de Usuário de Teste\n');

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Credenciais do service role não encontradas!');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('📋 Opções:');
    console.log('1. Criar usuário manualmente');
    console.log('2. Criar usuário de teste padrão');
    console.log('3. Listar usuários existentes');
    
    const option = await question('\nEscolha uma opção (1-3): ');

    if (option === '1') {
      const email = await question('📧 Email: ');
      const password = await question('🔐 Senha: ');
      const fullName = await question('👤 Nome completo: ');
      
      console.log('\n⏳ Criando usuário...');
      
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName
        }
      });

      if (error) {
        console.log('❌ Erro:', error.message);
      } else {
        console.log('✅ Usuário criado com sucesso!');
        console.log('📧 Email:', data.user.email);
        console.log('👤 Nome:', data.user.user_metadata?.full_name);
        console.log('🆔 ID:', data.user.id);
      }
      
    } else if (option === '2') {
      console.log('\n⏳ Criando usuário de teste padrão...');
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: 'teste@exemplo.com',
        password: 'teste123',
        email_confirm: true,
        user_metadata: {
          full_name: 'Usuário Teste'
        }
      });

      if (error) {
        console.log('❌ Erro:', error.message);
      } else {
        console.log('✅ Usuário de teste criado!');
        console.log('📧 Email: teste@exemplo.com');
        console.log('🔐 Senha: teste123');
        console.log('👤 Nome: Usuário Teste');
        console.log('🆔 ID:', data.user.id);
      }
      
    } else if (option === '3') {
      console.log('\n📋 Listando usuários...');
      
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        console.log('❌ Erro:', error.message);
      } else {
        console.log(`\n📊 Total de usuários: ${data.users.length}\n`);
        
        data.users.forEach((user, index) => {
          console.log(`${index + 1}. 📧 ${user.email}`);
          console.log(`   👤 ${user.user_metadata?.full_name || 'Sem nome'}`);
          console.log(`   🆔 ${user.id}`);
          console.log(`   ✅ Confirmado: ${user.email_confirmed ? 'Sim' : 'Não'}`);
          console.log('');
        });
      }
    } else {
      console.log('❌ Opção inválida!');
    }

    console.log('\n🌐 Acesse http://localhost:5001 para fazer login!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    rl.close();
  }
}

createTestUser();
