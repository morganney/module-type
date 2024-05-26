# [`node-module-type`](https://www.npmjs.com/package/node-module-type)

![CI](https://github.com/morganney/module-type/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/morganney/module-type/graph/badge.svg?token=IQVLYK9W88)](https://codecov.io/gh/morganney/module-type)
[![NPM version](https://img.shields.io/npm/v/node-module-type.svg)](https://www.npmjs.com/package/node-module-type)

Detects the module type of a running Node.js file, either `module`, `commonjs`, or `unknown`.
Mostly useful for library/package authors and build toolchains.

## Requirements

- Node.js >= 20.11.0

## Example

If the project has:

- `package.json` with `"type": "module"`
- Uses file extensions of `.mjs`
- Started node with `--experimental-default-type=module`

Then:

```js
import { moduleType } from 'node-module-type'

console.log(moduleType()) // 'module'
```

If the project instead has:

- `package.json` with `"type": "commonjs"` (or undefined)
- Uses file extensions of `.cjs`
- Started node with `--experimental-default-type=commonjs`

Then:

```js
const { moduleType } = require('node-module-type')

console.log(moduleType()) // 'commonjs'
```

This is all pretty obvious based on how `node-module-type` was loaded by the consuming package, however library authors publishing a [dual package](https://nodejs.org/api/packages.html#dual-commonjses-module-packages) can provide conditional logic based on what module context your code is running under. For example, when consumed from a TypeScript project that compiles to different module systems based on `module` and `moduleResolution` from the `tsconfig.json`.

```js
import { moduleType } from 'node-module-type'
// const { moduleType } = require('node-module-type') for CJS projects

const type = moduleType()

if (type === 'commonjs') {
  // Code running under CommonJS module scope
}

if (type === 'module') {
  // Code running under ES module scope
}
```

## Output

`node-module-type` and the corresponding exported function `moduleType` produce three possible output strings:

- `unknown` (only if something unexpected happens)
- `module`
- `commonjs`
