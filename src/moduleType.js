export const moduleType = async () => {
  const { resolve } = await import('node:path')
  const { spawnSync } = await import('node:child_process')
  const { stdout, stderr } = spawnSync('node', [resolve(import.meta.dirname, 'checkType.js')])
  let type = 'unknown'

  // Only one of these will be non-falsy strings
  const err = stderr.toString()
  const out = stdout.toString()

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
