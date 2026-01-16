#!/usr/bin/env node

/**
 * Script para debug detalhado do Supabase Admin
 * Execute com: node scripts/debug-supabase-admin.js
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

async function debugSupabaseAdmin() {
  console.log('🔍 Debug detalhado do Supabase Admin\n');

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('📋 Credenciais:');
  console.log('   URL:', supabaseUrl);
  console.log('   Service Key:', supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : 'Não encontrada');

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('\n❌ Credenciais incompletas!');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('\n🧪 Testando conexão básica...');
    
    // Testar se consegue acessar o auth
    const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1 });
    
    if (error) {
      console.log('❌ Erro ao listar usuários:', error.message);
      console.log('Código:', error.status);
      console.log('Detalhes:', error.details);
      
      if (error.message.includes('Invalid API key')) {
        console.log('\n🔧 Possível solução:');
        console.log('1. Verifique se a SERVICE_ROLE_KEY está correta');
        console.log('2. Vá em Settings > API no dashboard Supabase');
        console.log('3. Copie a chave "service_role" (não a "anon")');
      }
      
      return;
    }
    
    console.log('✅ Conexão com Supabase Admin funcionando!');
    console.log(`📊 Total de usuários: ${data.users.length}`);
    
    // Tentar criar um usuário de teste
    console.log('\n⏳ Tentando criar usuário de teste...');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'test123456';
    
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User'
      }
    });
    
    if (createError) {
      console.log('❌ Erro ao criar usuário:', createError.message);
      console.log('Código:', createError.status);
      console.log('Detalhes:', createError.details);
      
      if (createError.message.includes('Database error')) {
        console.log('\n🔧 Possíveis causas:');
        console.log('1. A tabela auth.users não existe ou está corrompida');
        console.log('2. Permissões insuficientes no banco');
        console.log('3. Configuração do Supabase Auth desabilitada');
        console.log('\n🔧 Soluções:');
        console.log('1. Verifique se o Auth está habilitado no dashboard');
        console.log('2. Tente resetar o projeto Supabase');
        console.log('3. Entre em contato com o suporte Supabase');
      }
    } else {
      console.log('✅ Usuário criado com sucesso!');
      console.log('📧 Email:', newUser.user.email);
      console.log('🆔 ID:', newUser.user.id);
      
      // Tentar deletar o usuário de teste
      console.log('\n🗑️ Limpando usuário de teste...');
      await supabase.auth.admin.deleteUser(newUser.user.id);
      console.log('✅ Usuário de teste removido');
      
      console.log('\n🎉 Tudo funcionando perfeitamente!');
      console.log('🌐 Você pode criar usuários normalmente agora');
    }
    
  } catch (error) {
    console.error('\n❌ Erro inesperado:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugSupabaseAdmin();
