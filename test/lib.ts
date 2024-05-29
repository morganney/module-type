import { stdout } from 'node:process'
import { moduleType } from 'node-module-type'

const type = moduleType()

if (type === 'module') {
  import('./file.js')
    .then(() => {
      stdout.write('imported esm')
    })
    .catch(() => {
      stdout.write('a esm error occured')
    })
}

if (type === 'commonjs') {
  import('./file.cjs')
    .then(() => {
      stdout.write('imported cjs')
    })
    .catch(err => {
      stdout.write('a cjs error occured')
    })
}

if (type === 'unknown') {
  stdout.write('UNKNOWN')
}
