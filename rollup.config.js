import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

export default [
  // UMD build (for browsers)
  {
    input: 'src/index.ts',
    output: [
      {
        name: 'ArchiMateRenderer',
        file: 'dist/umd/archimate-renderer.js',
        format: 'umd',
        sourcemap: true,
      },
      {
        name: 'ArchiMateRenderer',
        file: 'dist/umd/archimate-renderer.min.js',
        format: 'umd',
        sourcemap: true,
        plugins: [terser()],
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
      }),
    ],
  },
];
