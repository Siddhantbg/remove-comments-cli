import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default [
  // 1) Programmatic API
  {
    input: "src/index.ts",
    output: [
      { file: "dist/index.cjs.js", format: "cjs", exports: "named" },
      { file: "dist/index.esm.js", format: "esm" }
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
      json(),
      typescript({ tsconfig: "./tsconfig.json" })
    ]
  },
  // 2) CLI bundle
  {
    input: "src/cli.ts",
    output: {
      file: "dist/cli.cjs",
      format: "cjs",
      exports: "auto",
      banner: () => '#!/usr/bin/env node\n'
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      json(),
      typescript({ tsconfig: "./tsconfig.json" })
    ],
    external: ["commander", "glob", "@babel/parser", "@babel/traverse", "@babel/generator"]
  }
]; 