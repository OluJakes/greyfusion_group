#!/usr/bin/env node

const { spawn } = require('node:child_process')
const fs = require('node:fs')

const DB_PATH = '/data/sqlite.db'
const SEED_PATH = '/app/prisma/seed.db'

function needsSeed() {
      if (!fs.existsSync(DB_PATH)) return true
      try {
              const Database = require('better-sqlite3')
              const db = new Database(DB_PATH, { readonly: true })
              const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' LIMIT 1").get()
              db.close()
              return !row
      } catch (err) {
              return true
      }
}

try {
      if (needsSeed() && fs.existsSync(SEED_PATH)) {
              fs.copyFileSync(SEED_PATH, DB_PATH)
      }
} catch (err) {
      console.error('Seed copy failed:', err)
}

const command = process.argv.slice(2).join(' ')
const child = spawn(command, { shell: true, stdio: 'inherit', env: process.env })
child.on('exit', code => process.exit(code === null ? 1 : code))
