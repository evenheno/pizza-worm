// rollup.config.js
const typescript = require('@rollup/plugin-typescript');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { terser } = require('rollup-plugin-terser');
const commonjs = require('@rollup/plugin-commonjs');
const url = require('@rollup/plugin-url');

module.exports = {
  input: 'src/index.ts',
  output: {
    name: 'pworm',
    file: 'dist/pworm.min.js',
    format: 'esm',
    sourcemap: true
  },
  plugins: [
    typescript({ tsconfig: 'tsconfig.json' }),
    nodeResolve({
      extensions: ['.mjs', '.js', '.json', '.node', '.ts', '.tsx']
    }),
    commonjs(),
    url({
      include: ['**/*.png', '**/*.gif', '**/*.jpg', '**/*.jpeg', '**/*.mp3'],
      limit: 0, // No size limit for converting to base64
    }),
    terser({
      compress: {
        passes: 3,
        drop_console: false,
        drop_debugger: true,
        collapse_vars: true,
        keep_classnames: false,
        arrows: true,
        booleans: true,
        arguments: true,
        dead_code: true,
        hoist_vars: true,
        hoist_props: true,
        hoist_funs: true,
        properties: true
      },
      mangle: {
        keep_classnames: false,
        keep_fnames: false,
        module: true,
        toplevel: true,
        properties: {
          regex: /^_/
        }
      },
      output: {
        comments: false,
        semicolons: false,
        braces: false
      }
    }),
  ],
};
