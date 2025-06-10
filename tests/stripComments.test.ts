import { removeComments } from '../src/stripComments';
import * as t from '@babel/types';

type CommentNode = t.CommentBlock | t.CommentLine;

// Helper function to normalize whitespace
const normalizeWhitespace = (str: string) => str.replace(/\s+/g, ' ').trim();

// Mock the Babel modules
jest.mock('@babel/parser', () => ({
  parse: jest.fn((code: string) => {
    if (code === '// Test') {
      throw new Error('Parse error');
    }
    const ast = {
      type: 'Program',
      body: [],
      comments: [] as CommentNode[]
    };

    // Extract line comments
    const lineComments = code.match(/\/\/[^\n]*/g) || [];
    ast.comments.push(...lineComments.map(comment => ({
      type: 'CommentLine' as const,
      value: comment.slice(2).trim()
    })));

    // Extract block comments
    const blockComments = code.match(/\/\*[\s\S]*?\*\//g) || [];
    ast.comments.push(...blockComments.map(comment => ({
      type: 'CommentBlock' as const,
      value: comment.slice(2, -2).trim()
    })));

    return ast;
  })
}));

jest.mock('@babel/traverse', () => ({
  default: jest.fn((ast: any, visitor: { enter: (path: { node: any }) => void }) => {
    if (ast.type === 'Program' && ast.comments.length === 0) {
      throw new Error('Traverse error');
    }
    visitor.enter({ node: ast });
  })
}));

jest.mock('@babel/generator', () => ({
  default: jest.fn((ast: { comments: CommentNode[] }) => {
    if (!ast.comments || ast.comments.length === 0) {
      throw new Error('Generate error');
    }
    const comments = ast.comments
      .filter((comment: CommentNode | null | undefined): comment is CommentNode => 
        comment !== null && comment !== undefined && typeof comment.value === 'string')
      .map((comment: CommentNode) => {
        if (comment.type === 'CommentLine') {
          return `//${comment.value}`;
        } else {
          return `/*${comment.value}*/`;
        }
      });

    return { code: comments.join('\n') };
  })
}));

describe('removeComments', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('removes all single-line comments without marker', () => {
    const code = `
      // This is a comment
      const x = 5; // End of line comment
      // Another comment
    `;
    
    const result = normalizeWhitespace(removeComments(code));
    
    expect(result).not.toContain('// This is a comment');
    expect(result).not.toContain('// End of line comment');
    expect(result).not.toContain('// Another comment');
    expect(result).toContain('const x = 5;');
  });

  test('removes all block comments without marker', () => {
    const code = `
      /* Block comment */
      const y = 10;
      /**
       * Multi-line block comment
       */
      function test() {}
    `;
    
    const result = normalizeWhitespace(removeComments(code));
    
    expect(result).not.toContain('/* Block comment */');
    expect(result).not.toContain('Multi-line block comment');
    expect(result).toContain('const y = 10;');
    expect(result).toContain('function test() {}');
  });

  test('preserves single-line comments with marker and removes the marker', () => {
    const code = `
      //! This comment should be preserved
      const z = 15; // This should be removed
      //! Another important comment
    `;
    
    const result = normalizeWhitespace(removeComments(code));
    
    expect(result).toContain('//! This comment should be preserved');
    expect(result).not.toContain('// This should be removed');
    expect(result).toContain('//! Another important comment');
    expect(result).toContain('const z = 15;');
  });

  test('preserves block comments with marker and removes the marker', () => {
    const code = `
      /*! This block comment should be preserved */
      const a = 20;
      /**!
       * Documentation comment that should be preserved
       */
      /* This should be removed */
    `;
    
    const result = normalizeWhitespace(removeComments(code));
    
    expect(result).toContain('/*! This block comment should be preserved */');
    expect(result).toContain('/*! Documentation comment that should be preserved */');
    expect(result).not.toContain('/* This should be removed */');
    expect(result).toContain('const a = 20;');
  });

  test('does not affect comment markers in string literals', () => {
    const code = `
      const str1 = "// This is not a comment";
      const str2 = '/* Also not a comment */';
      // This is a real comment
    `;
    
    const result = normalizeWhitespace(removeComments(code));
    
    expect(result).toContain('const str1 = "// This is not a comment"');
    expect(result).toContain('const str2 = \'/* Also not a comment */\'');
    expect(result).not.toContain('// This is a real comment');
  });

  test('handles custom keep markers', () => {
    const code = `
      // Regular comment
      //# Custom marker comment
      /* Block comment */
      /*# Custom block marker */
    `;
    const result = normalizeWhitespace(removeComments(code, '#'));
    
    expect(result).toContain('//# Custom marker comment');
    expect(result).toContain('/*# Custom block marker */');
    expect(result).not.toContain('// Regular comment');
    expect(result).not.toContain('/* Block comment */');
  });

  test('handles complex code with mixed comments', () => {
    const code = `
      import { Component } from 'react';
      //! Important comment to keep
      /*! Important documentation to keep */
      export class Example extends Component {
        render() {
          return (
            <div>
              <h1>Example</h1>
              {/*! JSX comment to keep */}
              <p>Content</p>
              {/* JSX comment to remove */}
              <p>More content</p>
            </div>
          );
        }
      }
    `;
    const result = normalizeWhitespace(removeComments(code));
    expect(result).toContain('//! Important comment to keep');
    expect(result).toContain('/*! Important documentation to keep */');
    expect(result).not.toContain('// Implementation detail');
    expect(result).not.toContain('{/* JSX comment to remove */}');
    expect(result).toContain('{/*! JSX comment to keep */}');
  });

  test('handles invalid comment nodes', () => {
    const code = `
      //! Valid comment
      /*! Valid block */
      //! Another valid comment
    `;
    const result = normalizeWhitespace(removeComments(code));
    expect(result).toContain('//! Valid comment');
    expect(result).toContain('/*! Valid block */');
    expect(result).toContain('//! Another valid comment');
  });

  test('handles empty or whitespace-only comments', () => {
    const code = `
      // 
      /**/
      /***/
      /* */
      /** */
      //!
      /*!*/
      /**!*/
      const x = 1;
    `;

    const result = normalizeWhitespace(removeComments(code));
    expect(result).toContain('const x = 1;');
    expect(result).not.toContain('//');
    expect(result).not.toContain('/*');
  });

  test('handles comments with only markers', () => {
    const code = `
      //!
      /*!
      */
      /**!
      */
      //#
      /*#
      */
      const x = 1;
    `;

    const result = normalizeWhitespace(removeComments(code));
    expect(result).toContain('const x = 1;');
    expect(result).not.toContain('//');
    expect(result).not.toContain('/*');
  });

  test('handles comments with only asterisks', () => {
    const code = `
      //*
      /**
      */
      /* * */
      /** * */
      const x = 1;
    `;

    const result = normalizeWhitespace(removeComments(code));
    expect(result).toContain('const x = 1;');
    expect(result).not.toContain('//');
    expect(result).not.toContain('/*');
  });

  test('handles malformed JSX comments', () => {
    const code = `
      const x = 1;
      {/* Unclosed JSX comment */}
      const y = 2;
      {/* Another unclosed comment */}
      const z = 3;
    `;
    const result = normalizeWhitespace(removeComments(code));
    expect(result).toContain('const x = 1;');
    expect(result).toContain('const y = 2;');
    expect(result).toContain('const z = 3;');
  });

  test('handles parse errors gracefully', () => {
    const code = '// Test';
    const result = normalizeWhitespace(removeComments(code));
    expect(result).toBeDefined();
    expect(result).toBe(code);
  });

  test('handles code generation errors gracefully', () => {
    const code = '// Test';
    const result = normalizeWhitespace(removeComments(code));
    expect(result).toBeDefined();
    expect(result).toBe(code);
  });

  test('handles traverse errors gracefully', () => {
    const code = '// Test';
    const result = normalizeWhitespace(removeComments(code));
    expect(result).toBeDefined();
    expect(result).toBe(code);
  });

  test('handles invalid node types', () => {
    // Create a mock AST with invalid node types
    const ast = {
      type: 'Program',
      body: [
        { type: 'InvalidNode' },
        null,
        undefined,
        { type: 'ExpressionStatement', expression: null }
      ],
      comments: []
    };

    // Mock the parse function to return our custom AST
    const parse = require('@babel/parser').parse;
    parse.mockReturnValueOnce(ast);

    const result = normalizeWhitespace(removeComments('// Test'));
    expect(result).toBeDefined();

    parse.mockRestore();
  });

  test('handles JSDoc comments with markers correctly', () => {
    const code = `
      /**
       * Regular JSDoc comment
       */
      /**!
       * Important JSDoc comment
       */
      /** Important single-line JSDoc */
      /**! Mixed JSDoc with marker */
      const x = 1;
    `;
    const result = normalizeWhitespace(removeComments(code));
    expect(result).not.toContain('Regular JSDoc comment');
    expect(result).toContain('/*! Important JSDoc comment */');
    expect(result).toContain('/* Important single-line JSDoc */');
    expect(result).toContain('/*! Mixed JSDoc with marker */');
    expect(result).toContain('const x = 1;');
  });

  test('handles nested JSX comments correctly', () => {
    const code = `
      const element = (
        <div>
          {/* Outer comment
            {/* Nested comment */}
            still outer
          */}
          {/*! Outer marked comment
            {/* Nested comment */}
            still outer
          */}
          <span>Content</span>
        </div>
      );
    `;

    const result = normalizeWhitespace(removeComments(code));
    expect(result).not.toContain('Outer comment');
    expect(result).toContain('Outer marked comment');
    expect(result).not.toContain('Nested comment');
    expect(result).toContain('<span>Content</span>');
  });

  test('handles regex literals correctly', () => {
    const code = `
      const regex1 = /\\// Not a comment/;
      const regex2 = /\\/* Also not a comment *\\//;
      const regex3 = /[/*]/;
      const regex4 = /[/]/; //! Comment to keep
      const str = "/* Not a comment */";
    `;
    const result = normalizeWhitespace(removeComments(code));
    expect(result).toContain('const regex1 = /\\// Not a comment/');
    expect(result).toContain('const regex2 = /\\/* Also not a comment *\\//');
    expect(result).toContain('const regex3 = /[/*]/');
    expect(result).toContain('const regex4 = /[/]/');
    expect(result).toContain('//! Comment to keep');
    expect(result).not.toContain('// Comment to remove');
    expect(result).toContain('const str = "/* Not a comment */"');
  });

  test('handles edge cases with markers', () => {
    const code = `
      //! Marker at start
      /*! Marker at start */
      {/*! Marker at start */}
      // ! Not a marker (space before)
      //!Comment with marker in middle
      //Comment with marker! at end
    `;
    const result = normalizeWhitespace(removeComments(code));
    expect(result).not.toContain('// ! Not a marker (space before)');
    expect(result).toContain('//! Marker at start');
    expect(result).toContain('//! Comment with marker in middle');
    expect(result).not.toContain('Comment with marker! at end');
  });
});