# [`module-type`](https://www.npmjs.com/package/module-type)

![CI](https://github.com/morganney/module-type/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/morganney/module-type/graph/badge.svg?token=IQVLYK9W88)](https://codecov.io/gh/morganney/module-type)
[![NPM version](https://img.shields.io/npm/v/module-type.svg)](https://www.npmjs.com/package/module-type)

Detects the module type of a running Node.js file, either `module`, `commonjs`, or `unknown`.
Whether this is useful remains to be seen, but might be for library/package authors.

## Example

If the project has:

- `package.json` with `"type": "module"` or
- Uses file extensions of `.mjs` or
- Started node with `--experimental-default-type=module`

Then:

```js
import { moduleType } from 'module-type'

console.log(await moduleType()) // 'module'
```

If the project instead:

- `package.json` with `"type": "commonjs"` (or undefined) or
- Uses file extensions of `.cjs` or
- Started node with `--experimental-default-type=commonjs`

Then:

```js
const { moduleType } = require('module-type')
const main = async () => {
  console.log(await moduleType()) // 'commonjs'
}

main()
```

This is all pretty obvious based on how `module-type` was loaded, however in a TypeScript project you can execute your file directly, with something like [`tsx`](https://github.com/privatenumber/tsx), and then determine under which module system you are running.

Given:

- `tsconfig.json` with `"module": "NodeNext"` and `"moduleResolution": "NodeNext"`

Then:

```ts
import { moduleType } from 'module-type'

;(async () => {
  console.log('running in module mode ', await moduleType())
})()
```

Produces output based on the `package.json`'s `type` or file extension when exected with `tsx`.

## Output

`module-type` and the corresponding exported function `moduleType` produces three possible output strings:

- `unknown` (only if something unexpected happens)
- `module`
- `commonjs`
