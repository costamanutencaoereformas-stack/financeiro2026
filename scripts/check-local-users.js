#!/usr/bin/env node

/**
 * Script para verificar usuários na tabela local
 * Execute com: node scripts/check-local-users.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

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

async function checkLocalUsers() {
  console.log('👥 Verificando usuários na tabela local\n');

  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL não encontrada');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    
    // Verificar usuários na tabela local
    const { rows } = await client.query('SELECT id, email, full_name, role, status, created_at FROM users ORDER BY created_at DESC');
    
    console.log(`📊 Total de usuários na tabela local: ${rows.length}\n`);
    
    if (rows.length === 0) {
      console.log('⚠️ Nenhum usuário encontrado na tabela local users');
      console.log('💡 Isso pode significar que:');
      console.log('   - Os usuários estão apenas no Supabase Auth');
      console.log('   - Ninguém fez login ainda para sincronizar');
      console.log('   - A tabela está vazia');
    } else {
      rows.forEach((user, index) => {
        console.log(`${index + 1}. 📧 ${user.email || 'Sem email'}`);
        console.log(`   👤 Nome: ${user.full_name || 'Sem nome'}`);
        console.log(`   🆔 ID: ${user.id}`);
        console.log(`   🔑 Role: ${user.role}`);
        console.log(`   ✅ Status: ${user.status}`);
        console.log(`   📅 Criado: ${user.created_at}`);
        console.log('');
      });
    }

    // Verificar se há usuários no Supabase Auth que não estão na tabela local
    console.log('🔍 Verificando sincronização...');
    
    client.release();
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

checkLocalUsers();
