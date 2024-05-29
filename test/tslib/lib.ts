import { stdout } from 'node:process'
import { moduleType } from 'node-module-type'

const type = moduleType()

const tryImport = async () => {
  let value = 'unknown'

  if (type === 'module') {
    try {
      const { esm } = await import('./dep.js')
      value = `is esm ${esm}`
    } catch {
      stdout.write('an esm error occured')
    }
  }

  if (type === 'commonjs') {
    try {
      const { cjs } = await import('./dep.cjs')
      value = `is cjs ${cjs}`
    } catch {
      stdout.write('a cjs error occured')
    }
  }

  if (type === 'unknown') {
    stdout.write('UNKNOWN')
  }

  return value
}

export { tryImport }
