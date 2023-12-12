const { c2es } = require('../dist');

c2es('./index.js', './index.mjs', {
  dynamicImport: true,
  requirePrefix: '_require_',
  map: {
    emit: true,
  },
});
