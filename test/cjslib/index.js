const { stdout } = require('node:process')
const { moduleType } = require('node-module-type')

stdout.write(moduleType())
