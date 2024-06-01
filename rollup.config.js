// rollup.config.js
import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import url from '@rollup/plugin-url';

export default {
  input: 'src/index.ts',
  output: {
    name: 'pworm',
    file: 'dist/pworm.min.js',
    format: 'esm',
    sourcemap: true
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({ tsconfig: 'tsconfig.json' }),
    url({
      include: ['**/*.png', '**/*.gif', '**/*.jpg', '**/*.jpeg', '**/*.mp3'],
      limit: 0, // No size limit for converting to base64
    }),
    terser({
      compress: {
        passes: 35,
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
