import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/bundle.min.js',
    format: 'iife',
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({ tsconfig: 'tsconfig.json' }),
    terser({
      compress: {
        passes: 15, // Apply multiple passes to achieve better compression
        drop_console: true, // Remove console statements
        drop_debugger: true, // Remove debugger statements
        collapse_vars: true,
        keep_classnames: false,
        keep_fargs: false
      },
      mangle: {
        toplevel: true, // Mangle top level variable names
        properties: {
          regex: /^_/ // Mangle properties that start with an underscore
        }
      },
      output: {
        comments: false, // Remove all comments
      }
    }),
  ],
};
