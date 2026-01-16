#!/usr/bin/env node

/**
 * Script para criar usuários diretamente no banco local (solução alternativa)
 * Execute com: node scripts/create-local-user.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import readline from 'readline';
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
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function createLocalUser() {
  console.log('👤 Criador de Usuário Local (Alternativa ao Supabase Auth)\n');

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
    
    console.log('📋 Opções:');
    console.log('1. Criar usuário manualmente');
    console.log('2. Criar usuário de teste padrão');
    console.log('3. Listar usuários existentes');
    console.log('4. Atualizar sistema para usar autenticação local');
    
    const option = await question('\nEscolha uma opção (1-4): ');

    if (option === '1') {
      const email = await question('📧 Email: ');
      const password = await question('🔐 Senha: ');
      const fullName = await question('👤 Nome completo: ');
      const role = await question('🔑 Role (admin/financial/viewer) [viewer]: ') || 'viewer';
      
      const username = await question('👤 Username (baseado no email): ') || email.split('@')[0];
      
      console.log('\n⏳ Criando usuário...');
      
      const hashedPassword = await hashPassword(password);
      
      const { rows } = await client.query(`
        INSERT INTO users (username, email, password, name, full_name, role, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, 'active', CURRENT_TIMESTAMP)
        RETURNING id, username, email, full_name, role, status, created_at
      `, [username, email, hashedPassword, fullName, fullName, role]);
      
      console.log('✅ Usuário criado com sucesso!');
      console.log('📧 Email:', rows[0].email);
      console.log('👤 Nome:', rows[0].full_name);
      console.log('🔑 Role:', rows[0].role);
      console.log('🆔 ID:', rows[0].id);
      
    } else if (option === '2') {
      console.log('\n⏳ Criando usuário de teste padrão...');
      
      const testEmail = 'henrique@casacosta.com';
      const testPassword = 'Costa2025@';
      const hashedPassword = await hashPassword(testPassword);
      
      const { rows } = await client.query(`
        INSERT INTO users (username, email, password, name, full_name, role, status, created_at)
        VALUES ($1, $2, $3, $4, $5, 'admin', 'active', CURRENT_TIMESTAMP)
        ON CONFLICT (email) DO UPDATE SET
          password = EXCLUDED.password,
          name = EXCLUDED.name,
          full_name = EXCLUDED.full_name,
          role = EXCLUDED.role,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id, username, email, full_name, role, status, created_at
      `, ['henrique', testEmail, hashedPassword, 'Henrique Costa', 'Henrique Costa']);
      
      console.log('✅ Usuário de teste criado/atualizado!');
      console.log('📧 Email:', testEmail);
      console.log('🔐 Senha:', testPassword);
      console.log('👤 Nome: Henrique Costa');
      console.log('🔑 Role: admin');
      console.log('🆔 ID:', rows[0].id);
      
    } else if (option === '3') {
      console.log('\n📋 Listando usuários...');
      
      const { rows } = await client.query(`
        SELECT id, email, full_name, role, status, created_at 
        FROM users 
        ORDER BY created_at DESC
      `);
      
      console.log(`\n📊 Total de usuários: ${rows.length}\n`);
      
      rows.forEach((user, index) => {
        console.log(`${index + 1}. 📧 ${user.email || 'Sem email'}`);
        console.log(`   👤 Nome: ${user.full_name || 'Sem nome'}`);
        console.log(`   🔑 Role: ${user.role}`);
        console.log(`   ✅ Status: ${user.status}`);
        console.log(`   🆔 ID: ${user.id}`);
        console.log(`   📅 Criado: ${user.created_at}`);
        console.log('');
      });
      
    } else if (option === '4') {
      console.log('\n🔄 Atualizando sistema para usar autenticação local...');
      
      // Atualizar o auth context para usar autenticação local
      console.log('⚠️ Esta opção requer modificações no código frontend');
      console.log('📝 Será necessário:');
      console.log('   1. Reverter o auth.tsx para usar autenticação local');
      console.log('   2. Atualizar as rotas de autenticação no backend');
      console.log('   3. Modificar a página de login');
      console.log('\n💡 Deseja fazer isso manualmente ou prefere criar um usuário local?');
    } else {
      console.log('❌ Opção inválida!');
    }

    if (option === '1' || option === '2') {
      console.log('\n🌐 Acesse http://localhost:5001 para fazer login!');
      console.log('📝 Use as credenciais criadas acima');
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
    rl.close();
  }
}

createLocalUser();
