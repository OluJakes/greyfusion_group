#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('Running Prisma database migrations...');
try {
  execSync('prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env },
  });
  console.log('Migrations completed successfully.');
} catch (error) {
  console.error('Failed to run migrations:', error);
  process.exit(1);
}

console.log('Starting Next.js standalone server...');
require('./server.js');