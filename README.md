# `module-type`

![CI](https://github.com/morganney/module-type/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/morganney/module-type/graph/badge.svg?token=IQVLYK9W88)](https://codecov.io/gh/morganney/module-type)
[![NPM version](https://img.shields.io/npm/v/module-type.svg)](https://www.npmjs.com/package/module-type)

Detects the module type of a running Node.js file, either `module` or `commonjs`. Mostly useful for authors of published packages and libraries.

## Example

Given a project with a `package.json` file like

```json
"type": "module"
```

You can use `module-type` in your own package to determine under which module system a file is running:

```js
import { moduleType } from 'module-type'

console.log(await moduleType()) // 'module'
```

If the project instead uses CommonJS (or leaves `type` undefined)

```json
"type": "commonjs"
```

Then

```js
const { moduleType } = require('module-type')
const main = async () => {
  console.log(await moduleType()) // 'commonjs'
}

main()
```

## Output

`module-type` and the corresponding exported function `moduleType` produces three possible output strings:

- `unknown` (only if something unexpected happens)
- `module`
- `commonjs`
