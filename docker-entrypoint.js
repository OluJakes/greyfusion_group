#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('Synchronizing Prisma database schema...');
try {
  execSync('prisma db push --accept-data-loss', {
    stdio: 'inherit',
    env: { ...process.env },
  });
  console.log('Database schema synchronized successfully.');
} catch (error) {
  console.error('Failed to synchronize database:', error);
  process.exit(1);
}

console.log('Starting Next.js standalone server...');
require('./server.js');