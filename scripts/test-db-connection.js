#!/usr/bin/env node

/**
 * Script para testar a conexão com o banco de dados Supabase
 * Execute com: node scripts/test-db-connection.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Carregar variáveis de ambiente do arquivo .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const envPath = path.join(projectRoot, '.env');

// Ler e processar o arquivo .env
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

import { Pool } from 'pg';

async function testConnection() {
  console.log('🔍 Testando conexão com o banco de dados...\n');

  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL não encontrada nas variáveis de ambiente');
    process.exit(1);
  }

  console.log('📡 URL do banco:', databaseUrl.replace(/:([^:@]+)@/, ':***@'));

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('⏳ Conectando ao banco...');
    
    const client = await pool.connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Testar query simples
    const result = await client.query('SELECT version()');
    console.log('📊 Versão do PostgreSQL:', result.rows[0].version);
    
    // Verificar se tabelas existem
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    const tablesResult = await client.query(tablesQuery);
    console.log('\n📋 Tabelas encontradas:');
    
    if (tablesResult.rows.length === 0) {
      console.log('   ⚠️ Nenhuma tabela encontrada. Você precisa executar as migrations.');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`   ✓ ${row.table_name}`);
      });
    }
    
    client.release();
    
    console.log('\n🎉 Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('\n❌ Erro na conexão:');
    console.error('Código:', error.code);
    console.error('Mensagem:', error.message);
    
    if (error.code === '28P01') {
      console.error('\n🔧 Solução: Verifique se a senha do banco está correta no .env');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n🔧 Solução: Verifique se a URL e região estão corretas');
    } else if (error.code === 'XX000') {
      console.error('\n🔧 Solução: Verifique se PROJECT_REF e senha estão corretos');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
