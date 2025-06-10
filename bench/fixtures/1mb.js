// Generate a large JavaScript file with comments
function generateCode(size) {
  let code = '';
  const lines = [
    '// Regular comment',
    '//! Important comment',
    '/* Block comment */',
    '/*! Important block comment */',
    'const x = 42;',
    'function test() { return true; }',
    'class Example { constructor() {} }',
    '// TODO: implement this',
    '/** JSDoc comment */',
    '//! TODO: fix this bug',
  ];

  while (code.length < size) {
    code += lines[Math.floor(Math.random() * lines.length)] + '\n';
  }

  return code;
}

// Generate 1MB of code
process.stdout.write(generateCode(1024 * 1024)); 