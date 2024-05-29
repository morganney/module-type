import { stdout } from 'node:process'
import { tryImport } from './lib.js'

tryImport().then(value => {
  stdout.write(value)
})
