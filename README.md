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
  import('some-cjs-dependency').then().catch()
}

if (type === 'module') {
  // Code running under ES module scope
  import('some-esm-dependency').then().catch()
}
```

See the [tslib test](test/tslib) for a more comprehensive example.

## Output

`node-module-type` and the corresponding exported function `moduleType` produce three possible output strings:

- `unknown` (only if something unexpected happens)
- `module`
- `commonjs`

## Implementation Notes

### Why Child Process Instead of Worker Threads?

This library uses `spawnSync` to spawn a child process for module type detection. While [worker threads](https://nodejs.org/api/worker_threads.html) might seem like a lighter-weight alternative, they cannot be used for this purpose. Here's why:

**The Core Problem**: Worker threads share the same Node.js process environment as the main thread. A worker's module type is determined by how the worker itself is loaded, not by the caller's context:

- `new Worker(code, { eval: true })` - runs as CommonJS
- `new Worker('./file.mjs')` - runs as ESM  
- `new Worker('./file.js')` - depends on the worker file's nearest `package.json`

This means a worker thread cannot inherit or detect the module resolution context of the code that created it.

**Child Process Approach**: By spawning a new Node.js process that runs `checkType.js` in the caller's working directory, we get accurate module type detection based on:
- The nearest `package.json` `type` field
- File extension (`.mjs`, `.cjs`, `.js`)
- Node.js startup flags like `--experimental-default-type`

**Performance Tradeoff**:

| Approach | Avg. Time per Call | Correctness |
|----------|-------------------|-------------|
| Child Process (`spawnSync`) | ~50ms | ✓ Accurate |
| Worker Thread | ~22ms | ✗ Cannot detect caller's context |

The child process approach is approximately 2x slower, but it's the only method that correctly detects the module type of the calling code. For most use cases, this overhead is acceptable since module type detection typically happens once at startup.
