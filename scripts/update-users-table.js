#!/usr/bin/env node

/**
 * Script para atualizar a tabela users com os campos necessários para Supabase Auth
 * Execute com: node scripts/update-users-table.js
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

async function updateUsersTable() {
  console.log('🔧 Atualizando tabela users para compatibilidade com Supabase Auth\n');

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
    
    console.log('📋 Verificando schema atual...');
    
    // Verificar colunas atuais
    const { rows: columns } = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
    `);
    
    const currentColumns = columns.map(col => col.column_name);
    console.log('Colunas atuais:', currentColumns.join(', '));
    
    // Adicionar colunas faltantes
    const updates = [];
    
    if (!currentColumns.includes('email')) {
      updates.push('ADD COLUMN email TEXT');
    }
    
    if (!currentColumns.includes('full_name')) {
      updates.push('ADD COLUMN full_name TEXT');
    }
    
    if (!currentColumns.includes('status')) {
      updates.push('ADD COLUMN status TEXT DEFAULT \'active\'');
    }
    
    if (!currentColumns.includes('team')) {
      updates.push('ADD COLUMN team TEXT');
    }
    
    if (!currentColumns.includes('created_at')) {
      updates.push('ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    }
    
    if (!currentColumns.includes('updated_at')) {
      updates.push('ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    }
    
    if (updates.length > 0) {
      console.log('\n⏳ Adicionando colunas faltantes...');
      
      const alterQuery = `ALTER TABLE users ${updates.join(', ')}`;
      console.log('Query:', alterQuery);
      
      await client.query(alterQuery);
      console.log('✅ Colunas adicionadas com sucesso!');
    } else {
      console.log('✅ Todas as colunas necessárias já existem!');
    }
    
    // Migrar dados existentes
    console.log('\n🔄 Migrando dados existentes...');
    
    // Atualizar email baseado no username se não existir
    await client.query(`
      UPDATE users 
      SET email = username || '@localhost' 
      WHERE email IS NULL AND username IS NOT NULL
    `);
    
    // Atualizar full_name baseado no name se não existir
    await client.query(`
      UPDATE users 
      SET full_name = name 
      WHERE full_name IS NULL AND name IS NOT NULL
    `);
    
    // Atualizar status baseado em active se não existir
    await client.query(`
      UPDATE users 
      SET status = CASE WHEN active = true THEN 'active' ELSE 'inactive' END 
      WHERE status IS NULL AND active IS NOT NULL
    `);
    
    console.log('✅ Dados migrados com sucesso!');
    
    // Verificar resultado final
    console.log('\n📊 Verificando resultado final...');
    
    const { rows: users } = await client.query(`
      SELECT id, username, email, full_name, role, status, team, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    console.log(`\n👥 Total de usuários: ${users.length}\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. 🆔 ID: ${user.id}`);
      console.log(`   👤 Username: ${user.username}`);
      console.log(`   📧 Email: ${user.email || 'Não definido'}`);
      console.log(`   👤 Nome: ${user.full_name || 'Não definido'}`);
      console.log(`   🔑 Role: ${user.role}`);
      console.log(`   ✅ Status: ${user.status}`);
      if (user.team) console.log(`   👥 Team: ${user.team}`);
      if (user.created_at) console.log(`   📅 Criado: ${user.created_at}`);
      console.log('');
    });
    
    console.log('🎉 Tabela users atualizada com sucesso!');
    console.log('🌐 Agora você pode criar usuários no Supabase Auth normalmente');
    
    client.release();
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Detalhes:', error.detail);
  } finally {
    await pool.end();
  }
}

updateUsersTable();
