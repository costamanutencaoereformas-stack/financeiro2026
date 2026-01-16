#!/usr/bin/env node

/**
 * Script para migrar usuários do formato antigo para o novo Supabase Auth
 * Execute com: node scripts/migrate-users.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
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

async function migrateUsers() {
  console.log('🔄 Migrador de Usuários para Supabase Auth\n');

  const databaseUrl = process.env.DATABASE_URL;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!databaseUrl || !supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Credenciais não encontradas');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const client = await pool.connect();
    
    // Buscar usuários existentes
    const { rows: oldUsers } = await client.query('SELECT * FROM users');
    
    console.log(`📊 Encontrados ${oldUsers.length} usuários no formato antigo:\n`);
    
    oldUsers.forEach((user, index) => {
      console.log(`${index + 1}. 👤 Username: ${user.username}`);
      console.log(`   🆔 ID: ${user.id}`);
      console.log(`   🔑 Role: ${user.role}`);
      console.log(`   ✅ Active: ${user.active}`);
      console.log('');
    });

    const migrate = await question('Deseja migrar estes usuários para o Supabase Auth? (s/n): ');
    
    if (migrate.toLowerCase() !== 's') {
      console.log('❌ Migração cancelada');
      client.release();
      await pool.end();
      rl.close();
      return;
    }

    console.log('\n🔄 Iniciando migração...');
    
    for (const user of oldUsers) {
      console.log(`\n⏳ Migrando usuário: ${user.username}`);
      
      // Criar email baseado no username
      const email = `${user.username}@localhost`;
      const password = 'temp123'; // Senha temporária
      
      try {
        // Criar usuário no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: user.name,
            original_username: user.username,
            original_id: user.id
          }
        });

        if (authError) {
          console.log(`❌ Erro ao criar usuário ${user.username}:`, authError.message);
          continue;
        }

        console.log(`✅ Usuário ${user.username} criado no Supabase Auth`);
        console.log(`   📧 Email: ${email}`);
        console.log(`   🔐 Senha temporária: ${password}`);
        
      } catch (error) {
        console.log(`❌ Erro ao migrar ${user.username}:`, error.message);
      }
    }

    console.log('\n🎉 Migração concluída!');
    console.log('\n📝 Resumo:');
    console.log('- Usuários foram criados no Supabase Auth');
    console.log('- Use os emails e senhas temporárias para fazer login');
    console.log('- Após o login, você pode alterar as senhas');
    console.log('\n🌐 Acesse http://localhost:5001 para testar o login');
    
    client.release();
    
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
  } finally {
    await pool.end();
    rl.close();
  }
}

migrateUsers();
