import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';

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
