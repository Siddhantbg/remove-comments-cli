import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';

describe('CLI integration test', () => {
  const outputDir = path.resolve('tests/fixtures/output-cli');
  const inputDir = path.resolve('tests/fixtures/input');
  
  // Create test fixtures and output directory before tests
  beforeAll(async () => {
    try {
      // Create directories
      mkdirSync(outputDir, { recursive: true });
      mkdirSync(inputDir, { recursive: true });
      
      // Create test files
      writeFileSync(path.join(inputDir, 'normal.ts'), `
// This comment should be removed
const x = 1;
//! This comment should be preserved
const y = 2;
/* This block comment should be removed */
const z = 3;
/*! This block comment should be preserved */
const w = 4;
`);
      
      writeFileSync(path.join(inputDir, 'jsx.tsx'), `
// This comment should be removed
import React from 'react';
//! This comment should be preserved
export const Component = () => <div>{/* Comment */}</div>;
`);
      
      writeFileSync(path.join(inputDir, 'edge-cases.ts'), `
// Edge case tests for comment removal
const x = 1; //! Keep this comment
/* Remove this comment */
//! Preserve this one
`);
    } catch (error) {
      console.error('Error setting up test fixtures:', error);
      throw error; // Re-throw to fail the test
    }
  });

  // Clean up output directory after tests
  afterAll(async () => {
    try {
      await fs.rm(outputDir, { recursive: true, force: true });
      await fs.rm(inputDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Error cleaning up:', error);
    }
  });

  // Clean up and recreate output directory before each test
  beforeEach(async () => {
    try {
      await fs.rm(outputDir, { recursive: true, force: true });
      mkdirSync(outputDir, { recursive: true });
    } catch (error) {
      console.error('Error resetting output directory:', error);
    }
  });

  it('should process files via CLI and remove comments correctly', async () => {
    // Execute the CLI command with base directory
    const pattern = path.join(inputDir, '**', '*.{ts,tsx}').replace(/\\/g, '/');
    const cmd = `node dist/cli.js "${pattern}" -k "!" -o "${outputDir}"`;
    let exitCode = 0;
    let stdout = '';
    let stderr = '';
    
    try {
      const result = execSync(cmd, { stdio: 'pipe' });
      stdout = result.toString();
    } catch (error: any) {
      exitCode = error.status || 1;
      stderr = error.stderr?.toString() || '';
      console.error('CLI execution error:', stderr);
    }
    
    // Verify exit code
    expect(exitCode).toBe(0);

    // Read the processed files
    const normalOutput = await fs.readFile(
      path.join(outputDir, path.basename(inputDir), 'normal.ts'),
      'utf-8'
    );
    const jsxOutput = await fs.readFile(
      path.join(outputDir, path.basename(inputDir), 'jsx.tsx'),
      'utf-8'
    );
    const edgeCasesOutput = await fs.readFile(
      path.join(outputDir, path.basename(inputDir), 'edge-cases.ts'),
      'utf-8'
    );

    // Test normal.ts output
    expect(normalOutput).not.toContain('// This comment should be removed');
    expect(normalOutput).toContain('//! This comment should be preserved');
    expect(normalOutput).toContain('const x = 1');
    expect(normalOutput).toContain('const y = 2');
    
    // Test jsx.tsx output
    expect(jsxOutput).not.toContain('// This comment should be removed');
    expect(jsxOutput).toContain('//! This comment should be preserved');
    expect(jsxOutput).toContain('import React from \'react\'');
    
    // Test edge-cases.ts output
    expect(edgeCasesOutput).not.toContain('// Edge case tests for comment removal');
    expect(edgeCasesOutput).toContain('//! Keep this comment');
    expect(edgeCasesOutput).toContain('//! Preserve this one');
  });

  it('should handle invalid input paths gracefully', async () => {
    const cmd = `node dist/cli.js "non-existent-path/**/*.ts" -o "${outputDir}"`;
    let exitCode = 0;
    let stderr = '';
    
    try {
      execSync(cmd, { stdio: 'pipe' });
    } catch (error: any) {
      exitCode = error.status || 1;
      stderr = error.stderr?.toString() || '';
    }
    
    expect(exitCode).toBe(1);
    expect(stderr).toContain('No files found matching pattern');
  });
});