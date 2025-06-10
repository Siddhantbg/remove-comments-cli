import { parse } from '@babel/parser';
import * as traverseModule from '@babel/traverse';
import generate from '@babel/generator';

// Log the traverse module to see what's available
console.log('traverseModule:', traverseModule);

// Try to access the default export
const traverse = traverseModule.default;
console.log('traverse from default:', traverse);

// Try to use the module directly
console.log('Using module directly:', typeof traverseModule === 'function');

// Create a simple AST
const ast = parse('const x = 1;', {
  sourceType: 'module',
});

// Try to use traverse
if (typeof traverse === 'function') {
  console.log('Using traverse as function');
  traverse(ast, {
    enter(path) {
      console.log('Entered node:', path.type);
    },
  });
} else {
  console.log('traverse is not a function');
}