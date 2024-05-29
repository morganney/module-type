import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { resolve, join } from 'node:path'
import { writeFile, copyFile, rm } from 'node:fs/promises'

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
    const bdp = resolve(import.meta.dirname, '..', 'node_modules', '.bin', 'babel-dual-package')
    const fileTs = resolve(import.meta.dirname, 'lib.ts')
    const fileJs = resolve(import.meta.dirname, 'lib.js')
    const dir = resolve(import.meta.dirname)
    // Created by babel-dual-package
    const cjsOut = resolve(import.meta.dirname, 'cjs')
    const args = ['--extensions', '.ts', '--out-dir', dir, fileTs]

    // Dual build (CJS and ESM) with babel-dual-package
    spawnSync(bdp, args)

    const { stdout } = spawnSync('node', [fileJs])
    assert.ok(/imported esm/.test(stdout.toString()))

    await writeFile(join(cjsOut, 'package.json'), JSON.stringify({ type: 'commonjs' }))
    await copyFile(join(dir, 'file.cjs'), join(cjsOut, 'file.cjs'))

    const { stdout: cjs } = spawnSync('node', [resolve(cjsOut, 'lib.cjs')])
    assert.ok(/imported cjs/.test(cjs.toString()))

    await rm(cjsOut, { force: true, recursive: true })
    await rm(fileJs)
  })
})
