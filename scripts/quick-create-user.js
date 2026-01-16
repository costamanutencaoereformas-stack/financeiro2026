#!/usr/bin/env node

/**
 * Script rápido para criar usuário de teste
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

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

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function quickCreateUser() {
  console.log('🚀 Criando usuário de teste rapidamente...\n');

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
    
    const username = 'henrique';
    const email = 'henrique@casacosta.com';
    const password = 'Costa2025@';
    const fullName = 'Henrique Costa';
    
    const hashedPassword = await hashPassword(password);
    
    // Verificar se usuário já existe
    const { rows: existing } = await client.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    
    if (existing.length > 0) {
      // Atualizar usuário existente
      await client.query(`
        UPDATE users 
        SET email = $1, password = $2, name = $3, full_name = $3, role = 'admin', status = 'active', updated_at = CURRENT_TIMESTAMP
        WHERE username = $4
      `, [email, hashedPassword, fullName, username]);
      
      console.log('✅ Usuário atualizado com sucesso!');
    } else {
      // Criar novo usuário
      await client.query(`
        INSERT INTO users (username, email, password, name, full_name, role, status, active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $4, 'admin', 'active', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [username, email, hashedPassword, fullName]);
      
      console.log('✅ Usuário criado com sucesso!');
    }
    
    console.log('\n📋 Dados de acesso:');
    console.log('👤 Usuário:', username);
    console.log('🔐 Senha:', password);
    console.log('📧 Email:', email);
    console.log('👤 Nome:', fullName);
    console.log('🔑 Role: admin');
    
    console.log('\n🌐 Acesse: http://localhost:5001');
    console.log('📝 Use "henrique" como usuário e "Costa2025@" como senha');
    
    client.release();
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

quickCreateUser();
