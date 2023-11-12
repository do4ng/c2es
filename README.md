# c2es

`c2es` transforms your code into esm!

input source code:

```js
const { readFileSync } = require('fs');
const { join: j } = require('path');

module.exports.readme = readFileSync(j(__dirname, 'readme.md'));
```

output will be:

```js
import { readFileSync as $$require_readFileSync } from 'fs';
import { join as $$require_j } from 'path';
var module = { exports: {} };
var readFileSync = $$require_readFileSync;
var j = $$require_j;

module.exports.readme = readFileSync(j(__dirname, 'readme.md'));
export default module;
```

## Apis

Provide entry and output filename. Automatically compiles and outputs to the appropriate file

```js
const { c2es } = require('c2es');

c2es('dist.js', 'dist.mjs', {
  dynamicImport: false,
  requirePrefix: '$$require_',
});
```

Or You can simply compile with cli

```bash
npx c2es dist.js --output dist.mjs
```

> `--output` option must be provided.

## Examples

- Dynamic Import

If your code has dynamic require, please add option `--dynamic`.

`npx c2es input.js --output output.js --dynamic`

> tip: Prefix `await` before `require`

input:

```ts
const target = './main.js';
const m = require(target);
```

output:

```ts
var $$dynamic_require = (m) => {
  if (require) {
    return require(m);
  }
  throw new Error(`Cannot load module "${m}"`);
};
var module = { exports: {} };
const target = './main.js';
var m = $$dynamic_require(target);
export default module;
```

Dynamic import is not yet supported. You can get it to work by defining `require()`.

- Scope

input:

```ts
function a() {
  const { name: n, version: v } = require('./package.json');
  console.log(n, v);
}
```

output:

```ts
import { name as $$require_n, version as $$require_v } from './package.json';
var module = { exports: {} };
function a() {
  var n = $$require_n;
  var v = $$require_v;
  console.log(n, v);
}
export default module;
```

- require prefix

`--require-prefix=<prefix>`

`npx c2es input.js --output output.js --require-prefix=_require_`

input:

```ts
const { readFileSync } = require('fs');

console.log(readFileSync('./main.js', 'utf-8'));
```

output:

```ts
import { readFileSync as _require_readFileSync } from 'fs';
var module = { exports: {} };
var readFileSync = _require_readFileSync;

console.log(readFileSync('./main.js', 'utf-8'));
export default module;
```

## License

MIT
