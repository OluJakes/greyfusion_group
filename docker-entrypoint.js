#!/usr/bin/env node

const { spawn } = require('node:child_process')
const fs = require('node:fs')

const DB_PATH = '/data/sqlite.db'
const SEED_PATH = '/app/prisma/seed.db'

try {
    if (!fs.existsSync(DB_PATH) && fs.existsSync(SEED_PATH)) {
          fs.copyFileSync(SEED_PATH, DB_PATH)
    }
} catch (err) {
    console.error('Seed copy failed:', err)
}

const command = process.argv.slice(2).join(' ')
const child = spawn(command, { shell: true, stdio: 'inherit', env: process.env })
child.on('exit', code => process.exit(code === null ? 1 : code))
