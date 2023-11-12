const { esbuildLoader } = require('asto');
const { nodeExternalsPlugin } = require('esbuild-node-externals');

/**
 * @type {import("asto").BuildOptions}
 */
module.exports = {
  loader: esbuildLoader({
    minify: false,
    plugins: [nodeExternalsPlugin()],
  }),

  entryPoints: [
    {
      input: 'src/index.ts',
    },
  ],
};
