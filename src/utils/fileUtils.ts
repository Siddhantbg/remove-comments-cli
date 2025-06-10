import fs from 'fs/promises';
import path from 'path';
import * as glob from 'glob';
import { removeComments } from '../stripComments';

/**
 * Process multiple files by removing comments according to the specified marker
 * 
 * @param patterns - Glob patterns or file paths to process
 * @param keepMarker - Marker for comments to preserve
 * @param outDir - Output directory for processed files
 */
export async function processFiles(
  patterns: string[],
  keepMarker: string,
  outDir: string
): Promise<void> {
  // Expand glob patterns to get all matching files
  const files: string[] = [];
  for (const pattern of patterns) {
    // Handle both glob patterns and direct file paths
    if (glob.hasMagic(pattern)) {
      const matches = glob.globSync(pattern);
      files.push(...matches);
    } else {
      // For direct file paths, check if they exist
      try {
        await fs.access(pattern);
        files.push(pattern);
      } catch {
        // Skip if file doesn't exist
      }
    }
  }

  if (files.length === 0) {
    throw new Error('No files found matching the provided patterns');
  }

  // Process each file
  for (const filePath of files) {
    try {
      // Read the file content
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Process the content to remove comments
      const processedContent = removeComments(content, keepMarker);
      
      // Determine the output path, preserving the directory structure
      const relativePath = path.relative(process.cwd(), filePath);
      const outputPath = path.join(outDir, relativePath);
      const outputDir = path.dirname(outputPath);
      
      // Create the output directory if it doesn't exist
      await fs.mkdir(outputDir, { recursive: true });
      
      // Write the processed content to the output file
      await fs.writeFile(outputPath, processedContent, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to process file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}