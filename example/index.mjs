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
