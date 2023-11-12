const { c2es } = require('../dist');

c2es('./index.js', './index.mjs', {
  insert: {
    beforeImport: '/*1*/',
    beforeDefines: '/*2*/',
    beforeExport: '/*3*/',
    afterImport: '/*1.1*/',
    afterDefines: '/*2.1*/',
    afterExport: '/*3.1*/',
  },
});
