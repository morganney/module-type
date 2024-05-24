import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

import { moduleType } from '../src/moduleType.js'

describe('moduleType', () => {
  it('detects the module type of a running es module file', async () => {
    const { stdout } = spawnSync('node', [resolve(import.meta.dirname, 'file.js')])

    assert.equal(await moduleType(), 'module')
    assert.equal(stdout.toString(), 'module')
  })

  it('detects the module type of a running commonjs file', async () => {
    const { stdout } = spawnSync('node', [resolve(import.meta.dirname, 'file.cjs')])

    assert.equal(stdout.toString(), 'commonjs')
  })
})
