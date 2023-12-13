# c2es

`c2es` transforms your commonjs code into esm!

> This package is still very experimental.  
> It converts commonjs code to esm but does not minify it.

input source code:

```js
const { readFileSync } = require('fs');
const { join: j } = require('path');

module.exports.readme = readFileSync(j(process.cwd(), 'package.json'), 'utf-8');
```

output will be:

```js
import * as $$require_a from 'node:fs';
import * as $$require_b from 'node:path';

var $$m = (m) => m.default || m;
var module = { exports: {} };
const { readFileSync } = $$m($$require_a);
const { join: j } = $$m($$require_b);

module.exports.readme = readFileSync(j(process.cwd(), 'package.json'), 'utf-8');

var $$default = module.exports;
var { readme: $$export_readme } = module.exports;

export { $$export_readme as readme, $$default as default };
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

- Export Default

input:

```ts
function a() {}

function b() {}

function c() {}

module.exports = function () {};

module.exports.a = a;
module.exports.b = b;
module.exports.c = c;
```

output:

```ts
var module = { exports: {} };
function a() {}
function b() {}
function c() {}

module.exports = function () {};
module.exports.a = a;
module.exports.b = b;
module.exports.c = c;

var $$default = module.exports;
var { a: $$export_a, b: $$export_b, c: $$export_c } = module.exports;

export { $$export_a as a, $$export_b as b, $$export_c as c, $$default as default };
```

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
var $$default = module.exports;
var {} = module.exports;
export { $$default as default };
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
import * as $$require_a from 'node:fs';
var $$m = (m) => m.default || m;
var module = { exports: {} };
function a() {
  const { name: n, version: v } = JSON.parse(
    $$m($$require_a).readFileSync('./package.json', 'utf-8')
  );
  console.log(n, v);
}
a();
var $$default = module.exports;
var {} = module.exports;
export { $$default as default };
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
var $$default = module.exports;
var {} = module.exports;
export { $$default as default };
```

## Build Package

Using [asto](https://github.com/do4ng/asto), you can build nodejs package easily.

```txt
$ npm i --save-dev asto @asto/esm
```

```js
const { asto } = require('asto');
const { esmLoader } = require('@asto/esm');

asto({
  loader: esmLoader(),
  entryPoints: [
    {
      input: 'src/index.js',
    },
  ],
});
```

## License

MIT
