#!/usr/bin/env node

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

console.log('🔧 PaperFlow Troubleshooting Tool\n');

async function checkFile(filePath, description) {
  try {
    await fs.access(filePath);
    console.log(`✅ ${description}: ${filePath}`);
    return true;
  } catch (error) {
    console.log(`❌ ${description}: ${filePath} (MISSING)`);
    return false;
  }
}

async function checkEnvironmentFiles() {
  console.log('📁 Checking environment files...');
  
  const frontendEnv = await checkFile('.env', 'Frontend .env');
  const backendEnv = await checkFile('backend/.env', 'Backend .env');
  
  if (!frontendEnv) {
    console.log('💡 Creating frontend .env file...');
    await fs.writeFile('.env', `VITE_GEMINI_API_KEY=AIzaSyD2IOD95V-uZ7t13g19KUTjlcqZS1hXWno
VITE_API_BASE_URL=http://localhost:5000/api`);
    console.log('✅ Frontend .env created');
  }
  
  if (!backendEnv) {
    console.log('💡 Creating backend .env file...');
    await fs.writeFile('backend/.env', `# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Gemini AI Configuration
GEMINI_API_KEY=AIzaSyD2IOD95V-uZ7t13g19KUTjlcqZS1hXWno

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10
PDF_RATE_LIMIT_MAX=5

# Security
CORS_ORIGIN=http://localhost:5173`);
    console.log('✅ Backend .env created');
  }
}

async function checkDependencies() {
  console.log('\n📦 Checking dependencies...');
  
  try {
    await fs.access('node_modules');
    console.log('✅ Frontend dependencies installed');
  } catch {
    console.log('❌ Frontend dependencies missing');
    console.log('💡 Run: npm install');
  }
  
  try {
    await fs.access('backend/node_modules');
    console.log('✅ Backend dependencies installed');
  } catch {
    console.log('❌ Backend dependencies missing');
    console.log('💡 Run: cd backend && npm install');
  }
}

async function checkPorts() {
  console.log('\n🔌 Checking if ports are available...');
  
  // Simple port check by trying to connect
  const checkPort = (port) => {
    return new Promise((resolve) => {
      const net = require('net');
      const server = net.createServer();
      
      server.listen(port, () => {
        server.once('close', () => resolve(true));
        server.close();
      });
      
      server.on('error', () => resolve(false));
    });
  };
  
  const port5000Available = await checkPort(5000);
  const port5173Available = await checkPort(5173);
  
  if (port5000Available) {
    console.log('✅ Port 5000 (backend) is available');
  } else {
    console.log('❌ Port 5000 (backend) is in use');
    console.log('💡 Kill the process using port 5000 or change PORT in backend/.env');
  }
  
  if (port5173Available) {
    console.log('✅ Port 5173 (frontend) is available');
  } else {
    console.log('❌ Port 5173 (frontend) is in use');
    console.log('💡 This might be your frontend server running');
  }
}

async function startServers() {
  console.log('\n🚀 Starting servers...');
  
  console.log('Starting backend server...');
  const backend = spawn('npm', ['run', 'dev'], {
    cwd: 'backend',
    stdio: 'pipe',
    shell: true
  });
  
  backend.stdout.on('data', (data) => {
    console.log(`[Backend] ${data.toString().trim()}`);
  });
  
  backend.stderr.on('data', (data) => {
    console.log(`[Backend Error] ${data.toString().trim()}`);
  });
  
  // Wait a bit for backend to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('Starting frontend server...');
  const frontend = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    shell: true
  });
  
  frontend.stdout.on('data', (data) => {
    console.log(`[Frontend] ${data.toString().trim()}`);
  });
  
  frontend.stderr.on('data', (data) => {
    console.log(`[Frontend Error] ${data.toString().trim()}`);
  });
  
  console.log('\n✅ Servers started!');
  console.log('🌐 Frontend: http://localhost:5173');
  console.log('🔧 Backend: http://localhost:5000');
  console.log('\nPress Ctrl+C to stop servers');
  
  // Keep the process running
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping servers...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });
}

async function main() {
  try {
    await checkEnvironmentFiles();
    await checkDependencies();
    await checkPorts();
    
    console.log('\n❓ Do you want to start both servers? (y/n)');
    
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', async (key) => {
      if (key.toString() === 'y' || key.toString() === 'Y') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        await startServers();
      } else {
        console.log('\n💡 To start servers manually:');
        console.log('   Terminal 1: cd backend && npm run dev');
        console.log('   Terminal 2: npm run dev');
        process.exit(0);
      }
    });
    
  } catch (error) {
    console.error('❌ Error during troubleshooting:', error.message);
  }
}

main();