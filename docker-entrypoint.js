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

console.log('Running database seed script...');
try {
  execSync('npm run db:seed', {
    stdio: 'inherit',
    env: { ...process.env },
  });
  console.log('Database seeded successfully.');
} catch (error) {
  console.log('Note: Seeding skipped or data already exists (non-fatal).');
}

console.log('Starting Next.js standalone server...');
require('./server.js');