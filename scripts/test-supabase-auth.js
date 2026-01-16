#!/usr/bin/env node

/**
 * Script para testar as credenciais do Supabase Auth
 * Execute com: node scripts/test-supabase-auth.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

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

async function testSupabaseAuth() {
  console.log('🔍 Testando credenciais do Supabase Auth\n');

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('📋 Verificando variáveis:');
  console.log('   SUPABASE_URL:', supabaseUrl ? '✅ Encontrada' : '❌ Não encontrada');
  console.log('   VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Encontrada' : '❌ Não encontrada');
  console.log('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Encontrada' : '❌ Não encontrada');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('\n❌ Credenciais essenciais não encontradas!');
    process.exit(1);
  }

  try {
    console.log('\n🧪 Testando cliente Supabase (anon)...');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Testar conexão básica
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('⚠️ Erro ao acessar tabela (pode ser normal se não tiver permissão):', error.message);
    } else {
      console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    }

    // Testar auth
    console.log('\n🔐 Testando serviço de autenticação...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError && authError.message !== 'Invalid session') {
      console.log('⚠️ Erro no auth:', authError.message);
    } else {
      console.log('✅ Serviço de autenticação funcionando!');
    }

    if (supabaseServiceKey) {
      console.log('\n🛡️ Testando cliente com service role...');
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (adminError) {
        console.log('❌ Erro com service role:', adminError.message);
      } else {
        console.log('✅ Service role funcionando!');
        console.log(`📊 Total de usuários: ${adminData.users.length}`);
      }
    }

    console.log('\n🎉 Teste concluído!');
    console.log('📝 As credenciais parecem estar corretas para o frontend.');
    console.log('🌐 Acesse http://localhost:5001 para testar o login.');

  } catch (error) {
    console.error('\n❌ Erro ao testar Supabase:', error.message);
    
    if (error.message.includes('Invalid API key')) {
      console.log('\n🔧 Solução: Verifique se a ANON_KEY está correta');
    } else if (error.message.includes('fetch failed')) {
      console.log('\n🔧 Solução: Verifique se a URL do projeto está correta');
    }
  }
}

testSupabaseAuth();
