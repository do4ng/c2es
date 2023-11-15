import * as $$require_a from 'fs';
var $$m = (m) => m.default || m;
var module = { exports: {} };
const { readFileSync } = $$m($$require_a);

console.log(readFileSync('./main.js', 'utf-8'));
export default module;
