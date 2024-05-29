import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { resolve, join } from 'node:path'
import { writeFile, rm } from 'node:fs/promises'

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
