#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const envPath = path.join(projectRoot, '.env');

console.log('🔍 Debug das variáveis de ambiente\n');
console.log('📁 Caminho do projeto:', projectRoot);
console.log('📄 Caminho do .env:', envPath);
console.log('📋 Arquivo existe:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📝 Conteúdo do .env:');
  console.log(envContent);
  
  console.log('\n🔄 Processando variáveis...');
  envContent.split('\n').forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const envKey = key.trim();
        const envValue = valueParts.join('=').trim();
        process.env[envKey] = envValue;
        console.log(`   ${index + 1}. ${envKey} = ${envValue.substring(0, 20)}...`);
      }
    }
  });
  
  console.log('\n✅ DATABASE_URL:', process.env.DATABASE_URL ? 'Encontrada' : 'Não encontrada');
  if (process.env.DATABASE_URL) {
    console.log('🔗 URL:', process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':***@'));
  }
} else {
  console.log('❌ Arquivo .env não encontrado!');
}
