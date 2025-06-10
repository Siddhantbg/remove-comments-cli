import { removeComments } from './src/stripComments';

const code = `
  /*! This block comment should be preserved */
  const a = 20;
  /**
   *! Documentation comment that should be preserved
   */
  /* This should be removed */
`;

const result = removeComments(code);
console.log('Original code:');
console.log(code);
console.log('\nProcessed code:');
console.log(result);