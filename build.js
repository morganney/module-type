import { resolve } from 'node:path'
/**
 * `cp` is still marked experimental.
 * @see https://github.com/nodejs/node/issues/44598
 */
/* eslint-disable-next-line n/no-unsupported-features/node-builtins */
import { mkdir, cp, rm, readFile, writeFile, rename } from 'node:fs/promises'

const dist = resolve('dist')
const esm = resolve(dist, 'esm')
const cjs = resolve(dist, 'cjs')

await mkdir(dist, { recursive: true })
await mkdir(esm, { recursive: true })
await mkdir(cjs, { recursive: true })
await cp(resolve('src'), esm, { recursive: true })
await cp(resolve('src'), cjs, { recursive: true })
await writeFile(
  resolve(cjs, 'moduleType.cjs'),
  (await readFile(resolve(cjs, 'moduleType.js')))
    .toString()
    .replace(/from\s(.+)/g, 'require($1)')
    .replace(/import\s{(.+)}/g, 'const {$1} =')
    .replace(/export const moduleType/, 'exports.moduleType')
    .replace(/\bimport\.meta\.dirname\b/, '__dirname')
    .replace(/checkType\.js/, 'checkType.cjs'),
)
await rename(resolve(cjs, 'checkType.js'), resolve(cjs, 'checkType.cjs'))
await rm(resolve(cjs, 'moduleType.js'))
