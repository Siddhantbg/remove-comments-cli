import * as fs from 'fs/promises';
import * as path from 'path';
import { processFiles } from '../src/utils/fileUtils.js';
import { mkdirSync, writeFileSync } from 'fs';

describe('processFiles integration test', () => {
  const testDir = 'test-files';
  const outDir = 'test-output';

  beforeAll(async () => {
    // Create test directories
    mkdirSync(path.join(outDir, testDir), { recursive: true });
    mkdirSync(path.join(testDir), { recursive: true });

    // Create test files
    writeFileSync(path.join(testDir, 'test.ts'), `
      // This comment should be removed
      //! This comment should be preserved
      /* This block comment should be removed */
      /*! This block comment should be preserved */
      const x = 42;
      const y = 100; //! This end-of-line comment should be preserved
      function process(value: number): number {
        return value * 2;
      }
      //! Important: Do not remove this function
      function doNotRemove(): void {
        console.log('This function is important');
      }
      export { process, doNotRemove };
    `);
  });

  afterAll(async () => {
    try {
      await fs.rm(outDir, { recursive: true, force: true });
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Error cleaning up:', error);
    }
  });

  beforeEach(async () => {
    // Clean up and recreate output directory before each test
    try {
      await fs.rm(outDir, { recursive: true, force: true });
      mkdirSync(path.join(outDir, testDir), { recursive: true });
    } catch (error) {
      console.error('Error resetting output directory:', error);
    }
  });

  it('should process files and remove comments correctly', async () => {
    // Process files
    await processFiles([`${testDir}/**/*.ts`], outDir, '!');

    // Read the processed file
    const normalOutput = await fs.readFile(path.join(outDir, testDir, 'test.ts'), 'utf-8');

    // Test comment removal and preservation
    expect(normalOutput).not.toContain('// This comment should be removed');
    expect(normalOutput).toContain('//! This comment should be preserved');
    expect(normalOutput).not.toContain('This block comment should be removed');
    expect(normalOutput).toContain('This block comment should be preserved');
    expect(normalOutput).toContain('const x = 42;');
    expect(normalOutput).toContain('//! This end-of-line comment should be preserved');
    expect(normalOutput).toContain('//! Important: Do not remove this function');
  });

  it('should handle empty files gracefully', async () => {
    // Create an empty file
    writeFileSync(path.join(testDir, 'empty.ts'), '');

    // Process files
    await processFiles([`${testDir}/**/*.ts`], outDir, '!');

    // Read the processed file
    const emptyOutput = await fs.readFile(path.join(outDir, testDir, 'empty.ts'), 'utf-8');

    // Test that empty file remains empty
    expect(emptyOutput).toBe('');
  });

  it('should handle files with only comments', async () => {
    // Create a file with only comments
    writeFileSync(path.join(testDir, 'comments-only.ts'), `
      // This should be removed
      //! This should be preserved
      /* This should be removed */
      /*! This should be preserved */
    `);

    // Process files
    await processFiles([`${testDir}/**/*.ts`], outDir, '!');

    // Read the processed file
    const commentsOutput = await fs.readFile(path.join(outDir, testDir, 'comments-only.ts'), 'utf-8');

    // Test comment removal and preservation
    expect(commentsOutput).not.toContain('// This should be removed');
    expect(commentsOutput).toContain('//! This should be preserved');
    expect(commentsOutput).not.toContain('/* This should be removed */');
    expect(commentsOutput).toContain('/*! This should be preserved */');
  });
});