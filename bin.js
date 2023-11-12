const animaux = require('animaux');
const c2es = require('./dist');

const app = animaux('c2es');

app.option('--require-prefix, -r').option('--dynamic, -d');

app.action((options) => {
  console.log(options);

  if (!options.output) {
    console.log(
      "'--output' option must be provided\n> npx c2es <entry> --output <output>"
    );
  }

  const path = options.__.join(' ');

  c2es.c2es(path, options.output, {
    dynamicImport: options.dynamic,
    requirePrefix: options['require-prefix'],
  });
});

app.parse(process.argv);
