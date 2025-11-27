import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { resolve, join } from 'node:path'
import { writeFile, rm, mkdtemp, chmod } from 'node:fs/promises'
import process from 'node:process'
import { once } from 'node:events'
import { Worker } from 'node:worker_threads'
import { tmpdir } from 'node:os'

import { moduleType } from '../src/moduleType.js'

describe('moduleType', () => {
  it('detects the module type of a running es module file', () => {
    const { stdout } = spawnSync('node', [resolve(import.meta.dirname, 'file.js')])
    const { stdout: esmout } = spawnSync('node', [resolve(import.meta.dirname, 'esmlib', 'index.js')])
    const { stdout: mjsext } = spawnSync('node', [resolve(import.meta.dirname, 'cjslib', 'file.mjs')])

    assert.equal(moduleType(), 'module')
    assert.equal(stdout.toString(), 'module')
    assert.equal(esmout.toString(), 'module')
    assert.equal(mjsext.toString(), 'module')
  })

  it('detects the module type of a running commonjs file', () => {
    const { stdout } = spawnSync('node', [resolve(import.meta.dirname, 'file.cjs')])
    const { stdout: cjslib } = spawnSync('node', [resolve(import.meta.dirname, 'cjslib', 'index.js')])
    const { stdout: cjsext } = spawnSync('node', [resolve(import.meta.dirname, 'esmlib', 'file.cjs')])

    assert.equal(stdout.toString(), 'commonjs')
    assert.equal(cjslib.toString(), 'commonjs')
    assert.equal(cjsext.toString(), 'commonjs')
  })

  /**
   * Shims `node` via PATH so the spawned process only emits the canonical
   * "Cannot use 'import.meta' outside a module" error on stderr, exercising the
   * regex-based fallback path.
   */
  it('falls back to stderr detection when checkType.js cannot emit stdout', async () => {
    const fakeNodeDir = await mkdtemp(join(tmpdir(), 'module-type-node-'))
    const fakeNodePath = join(fakeNodeDir, 'node')
    const script = ['#!/bin/sh', 'printf "Cannot use \'import.meta\' outside a module" >&2', 'exit 1'].join('\n')

    await writeFile(fakeNodePath, script)
    await chmod(fakeNodePath, 0o755)

    const originalPath = process.env.PATH ?? ''
    process.env.PATH = `${fakeNodeDir}:${originalPath}`

    try {
      assert.equal(moduleType(), 'commonjs')
    } finally {
      process.env.PATH = originalPath
      await rm(fakeNodeDir, { recursive: true, force: true })
    }
  })

  /**
   * Executes checkType.js inside a VM-based sandbox to mimic a CommonJS runtime
   * and force the branch that reports "commonjs".
   */
  it('detects commonjs scope when import.meta access throws', async () => {
    const workerSource = `
      const { parentPort, workerData } = require('node:worker_threads')
      const { readFile } = require('node:fs/promises')
      const { createContext, SourceTextModule, SyntheticModule } = require('node:vm')

      async function run() {
        try {
          const code = await readFile(workerData.filePath, 'utf8')
          const context = createContext({
            require: { main: {} },
            setTimeout,
            clearTimeout,
          })
          context.globalThis = context

          const outputs = []
          const module = new SourceTextModule(code, {
            context,
            identifier: workerData.filePath,
            initializeImportMeta() {
              throw new Error('import.meta unavailable')
            },
            importModuleDynamically: async (specifier) => {
              if (specifier === 'node:process') {
                const synthetic = new SyntheticModule(['stdout'], function () {
                  this.setExport('stdout', {
                    write: (value) => outputs.push(String(value)),
                  })
                }, { context })
                await synthetic.link(() => {})
                await synthetic.evaluate()
                return synthetic
              }

              throw new Error('Unsupported specifier: ' + specifier)
            },
          })

          await module.link(() => {})
          await module.evaluate()
          await new Promise((resolve) => setImmediate(resolve))
          parentPort.postMessage({ output: outputs.join('') })
        } catch (error) {
          parentPort.postMessage({ error: { message: error.message, stack: error.stack } })
        }
      }

      run()
    `.trim()
    const worker = new Worker(workerSource, {
      eval: true,
      workerData: { filePath: resolve(import.meta.dirname, '../src/checkType.js') },
      execArgv: ['--experimental-vm-modules'],
    })
    const [message] = await once(worker, 'message')

    await worker.terminate()

    if (message.error) {
      throw new Error(message.error.stack ?? message.error.message)
    }

    assert.equal(message.output, 'commonjs')
  })

  /**
   * Tests that ambiguous modules (no type field in package.json) are correctly
   * detected as ESM when using import/export syntax. This validates Node's
   * automatic module type detection (--experimental-detect-module, enabled by
   * default since v22.7.0).
   *
   * @see https://nodejs.org/api/cli.html#--experimental-detect-module
   */
  it('detects module type in ambiguous packages (no type field)', () => {
    // .js file with ESM syntax in a package without type field
    const { stdout: jsExt } = spawnSync('node', [resolve(import.meta.dirname, 'ambiguous', 'index.js')])
    // Extensionless file with ESM syntax in a package without type field
    const { stdout: noExt } = spawnSync('node', [resolve(import.meta.dirname, 'ambiguous', 'noext')])

    assert.equal(jsExt.toString(), 'module')
    assert.equal(noExt.toString(), 'module')
  })

  it('works with typescript libs', async () => {
    const nodeModulesBin = resolve(import.meta.dirname, '..', 'node_modules', '.bin')
    const bdp = join(nodeModulesBin, 'babel-dual-package')
    const tsx = join(nodeModulesBin, 'tsx')
    const dir = resolve(import.meta.dirname)
    const tslibDir = resolve(dir, 'tslib')
    const buildOut = join(tslibDir, 'dist')
    const tryTs = join(tslibDir, 'try.ts')
    const tryJs = join(buildOut, 'try.js')
    const args = ['--copy-files', '--extensions', '.ts', '--out-dir', buildOut, tslibDir]

    // Dual build (CJS and ESM) with babel-dual-package
    spawnSync(bdp, args)

    // Test ESM
    const { stdout: es } = spawnSync('node', [tryJs])
    assert.ok(/is esm/.test(es.toString()))

    // Test CJS
    await writeFile(join(buildOut, 'cjs', 'package.json'), JSON.stringify({ type: 'commonjs' }))
    const { stdout: cjs } = spawnSync('node', [join(buildOut, 'cjs', 'try.cjs')])
    assert.ok(/is cjs/.test(cjs.toString()))

    // Run directly against TypeScript files
    const { stdout: tsEsOut } = spawnSync(tsx, [tryTs])
    assert.ok(/is esm/.test(tsEsOut.toString()))
    await writeFile(join(tslibDir, 'package.json'), JSON.stringify({ type: 'commonjs' }))
    const { stdout: tsCjsOut } = spawnSync(tsx, [tryTs])
    assert.ok(/is cjs/.test(tsCjsOut.toString()))

    // Cleanup and restore
    await rm(buildOut, { force: true, recursive: true })
    await writeFile(join(tslibDir, 'package.json'), JSON.stringify({ type: 'module' }))
  })
})
