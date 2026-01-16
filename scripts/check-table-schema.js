#!/usr/bin/env node

/**
 * Script para verificar o schema da tabela users
 * Execute com: node scripts/check-table-schema.js
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

async function checkTableSchema() {
  console.log('🔍 Verificando schema da tabela users\n');

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
    
    // Verificar colunas da tabela users
    const { rows: columns } = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Colunas da tabela users:');
    columns.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable})${col.column_default ? ` [default: ${col.column_default}]` : ''}`);
    });
    
    // Verificar dados existentes
    console.log('\n📊 Verificando dados existentes...');
    
    // Tentar diferentes consultas baseadas nas colunas encontradas
    const columnNames = columns.map(col => col.column_name);
    
    let query = 'SELECT ';
    if (columnNames.includes('id')) query += 'id';
    if (columnNames.includes('full_name')) query += ', full_name';
    if (columnNames.includes('username')) query += ', username';
    if (columnNames.includes('email')) query += ', email';
    if (columnNames.includes('role')) query += ', role';
    if (columnNames.includes('status')) query += ', status';
    if (columnNames.includes('created_at')) query += ', created_at';
    
    query += ' FROM users';
    
    const { rows: users } = await client.query(query);
    
    console.log(`\n👥 Total de usuários: ${users.length}\n`);
    
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`${index + 1}. 🆔 ID: ${user.id}`);
        if (user.username) console.log(`   👤 Username: ${user.username}`);
        if (user.email) console.log(`   📧 Email: ${user.email}`);
        if (user.full_name) console.log(`   👤 Nome: ${user.full_name}`);
        if (user.role) console.log(`   🔑 Role: ${user.role}`);
        if (user.status) console.log(`   ✅ Status: ${user.status}`);
        if (user.created_at) console.log(`   📅 Criado: ${user.created_at}`);
        console.log('');
      });
    }

    client.release();
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

checkTableSchema();
