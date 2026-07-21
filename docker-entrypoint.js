#!/usr/bin/env node

const { spawn } = require('node:child_process')

const command = process.argv.slice(2).join(' ')
const child = spawn(command, { shell: true, stdio: 'inherit', env: process.env })
child.on('exit', code => process.exit(code === null ? 1 : code))
