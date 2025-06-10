#!/usr/bin/env node

import { Command } from 'commander';
import { glob } from 'glob';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { removeComments } from './stripComments.js';

// Handle ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json
const packageJson = JSON.parse(
  await fs.readFile(new URL('../package.json', import.meta.url), 'utf8')
);

// Initialize commander
const program = new Command();

// Store help text for reuse
const helpText = `
Usage: remove-comments [options] <patterns...>

Options:
  -k, --keep-markers <markers>  Preserve comments whose first character is one of these
  -o, --output <dir>           Output directory for cleaned files
  -h, --help                   Show this help message
  -v, --verbose               Print detailed processing information
  -V, --version               Output the version number

Examples:
  # Remove all comments from a file
  $ remove-comments input.ts > output.ts

  # Process TypeScript files and preserve comments starting with ! or #
  $ remove-comments "src/**/*.ts" -k "!#" --outDir dist

  # Process JSX/TSX files and preserve comments starting with *
  $ remove-comments "src/**/*.{jsx,tsx}" -k "*" --outDir dist

  # Process multiple files with verbose output
  $ remove-comments "src/**/*.{js,ts}" -k "!" -o dist -v
`;

program
  .name('remove-comments')
  .description('Remove comments from JavaScript/TypeScript files while preserving important ones')
  .version(packageJson.version)
  .argument('<files>', 'Files to process (glob pattern)')
  .option('-k, --keep-markers <chars>', 'Characters that mark comments to preserve', '!')
  .option('-o, --outDir <dir>', 'Output directory for processed files')
  .option('-v, --verbose', 'Print detailed processing information')
  .addHelpText('after', helpText);

// Custom error handling for missing required arguments
program.exitOverride();

try {
  program.parse();
} catch (err: any) {
  if (err.code === 'commander.missingArgument') {
    console.error('error: missing required argument \'files\'\n');
    console.log(helpText);
    process.exit(1);
  }
  throw err;
}

const options = program.opts();
const files = program.args[0];
const keepMarkers = options.keepMarkers;
const outDir = options.outDir;
const verbose = options.verbose;

async function processFiles() {
  try {
    // Find all files matching the glob pattern
    const matches = await glob(files);
    if (matches.length === 0) {
      console.error('No files found matching pattern:', files);
      process.exit(1);
    }

    let hasErrors = false;
    let filesProcessed = 0;

    for (const file of matches) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const result = removeComments(content, keepMarkers);

        if (outDir) {
          // Create output directory structure
          const relativePath = path.relative(process.cwd(), file);
          const outPath = path.join(outDir, relativePath);
          const outDirPath = path.dirname(outPath);
          await fs.mkdir(outDirPath, { recursive: true });

          // Write output file
          await fs.writeFile(outPath, result);
          if (verbose) {
            console.log(`Processed: ${file} -> ${outPath}`);
          }
        } else {
          // Output to stdout if no outDir specified
          process.stdout.write(result);
        }

        filesProcessed++;
      } catch (err) {
        console.error(`Error processing file ${file}:`, err);
        hasErrors = true;
      }
    }

    if (verbose) {
      console.log(`\nProcessed ${filesProcessed} files`);
      if (hasErrors) {
        console.log('Some files had errors');
      }
    }

    // Exit with appropriate code
    if (hasErrors) {
      process.exit(2);
    } else if (filesProcessed === 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

processFiles();