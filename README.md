# [`node-module-type`](https://www.npmjs.com/package/node-module-type)

![CI](https://github.com/morganney/module-type/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/morganney/module-type/graph/badge.svg?token=IQVLYK9W88)](https://codecov.io/gh/morganney/module-type)
[![NPM version](https://img.shields.io/npm/v/node-module-type.svg)](https://www.npmjs.com/package/node-module-type)

Detects if a Node.js file is executed as an ES module or CommonJS.

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

- `package.json` with `"type": "commonjs"` (or omitted)
- Uses file extensions of `.cjs`
- Started node with `--experimental-default-type=commonjs`

Then:

```js
const { moduleType } = require('node-module-type')

console.log(moduleType()) // 'commonjs'
```

This is all pretty obvious based on how `node-module-type` was loaded by the consuming package, however, library authors publishing a [dual package](https://nodejs.org/api/packages.html#dual-commonjses-module-packages) can provide conditional logic based on what module system your code is running under.

For example, when using TypeScript that compiles to different module systems where [detection](https://www.typescriptlang.org/docs/handbook/modules/reference.html#module-format-detection) is based on the [`module`](https://www.typescriptlang.org/tsconfig/#module) and nearest package.json `type` values.

```js
import { moduleType } from 'node-module-type'

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
