import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

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
})
