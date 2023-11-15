# c2es

`c2es` transforms your code into esm!

input source code:

```js
const { readFileSync } = require('fs');
const { join: j } = require('path');

module.exports.readme = readFileSync(j(process.cwd(), 'package.json'), 'utf-8');
```

output will be:

```js
import * as $$require_fs from 'node:fs';
import * as $$require_path from 'node:path';
var $$m = (m) => m.default || m;
var module = { exports: {} };
const { readFileSync } = $$m($$require_fs);
const { join: j } = $$m($$require_path);

module.exports.readme = readFileSync(j(process.cwd(), 'package.json'), 'utf-8');
export default module.exports;
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
var $$dynamic = async (m) => {
  if (global.require) {
    return require(m);
  }
  return $$m(await import(m));
};
var $$m = (m) => m.default || m;
var module = { exports: {} };
const target = './main.js';
const m = $$dynamic(target);
export default module.exports;
```

Dynamic import is not yet supported. You can get it to work by defining `require()`.

- Scope

input:

```ts
function a() {
  const { name: n, version: v } = JSON.parse(
    require('fs').readFileSync('./package.json', 'utf-8')
  );
  console.log(n, v);
}
a();
```

output:

```ts
import * as $$require_a from 'fs';
var $$m = (m) => m.default || m;
var module = { exports: {} };
function a() {
  const { name: n, version: v } = JSON.parse(
    $$m($$require_a).readFileSync('./package.json', 'utf-8')
  );
  console.log(n, v);
}
a();
export default module.exports;
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
import * as _require_a from 'node:fs';
var $$m = (m) => m.default || m;
var module = { exports: {} };
const { readFileSync } = $$m(_require_a);

console.log(readFileSync('./main.js', 'utf-8'));
export default module.exports;
```

- redundant load

input:

```ts
function a() {
  require('fs');
}

function b() {
  require('fs');
}

function c() {
  require('fs');
}
```

output:

```ts
import * as $$require_a from 'node:fs';
var $$m = (m) => m.default || m;
var module = { exports: {} };
function a() {
  $$m($$require_a);
}

function b() {
  $$m($$require_a);
}

function c() {
  $$m($$require_a);
}
export default module.exports;
```

## License

MIT
