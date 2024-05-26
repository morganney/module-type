import { cwd } from 'node:process'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

/**
 * Determines the module type of a running Node.js file.
 *
 * @param {string} wd - working directory of the spawned process.
 * @returns {string} The type of module scope, either 'commonjs', 'module', or 'unknown'.
 */
export const moduleType = (wd = cwd()) => {
  const { stdout, stderr } = spawnSync('node', [resolve(import.meta.dirname, 'checkType.js')], { cwd: wd })
  // Only one of err or out will be non-falsy strings
  const err = stderr.toString()
  const out = stdout.toString()
  let type = 'unknown'

  /**
   * Based on error messaging from v8
   * @see https://github.com/nodejs/node/blob/bc13f23f7e25d750df9b0a7bfe891a3d69f995f3/deps/v8/src/common/message-template.h#L124
   */
  if (/outside a module/i.test(err)) {
    type = 'commonjs'
  }

  if (out) {
    type = out
  }

  return type
}
