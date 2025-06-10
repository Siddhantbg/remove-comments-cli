---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
---

# Remove Comments CLI

A powerful command-line tool to remove comments from your code files while preserving important documentation comments.

## Features

- Removes single-line and multi-line comments from code files
- Preserves important documentation comments (marked with `//!` or `/*!`)
- Supports multiple programming languages
- Handles nested comments and edge cases
- Preserves code formatting and structure

## Installation

You can install the package globally using npm:

```bash
npm install -g remove-comments-cli
```

Or use it directly with npx:

```bash
npx remove-comments-cli [options] <file>
```

## Quick Start

1. Install the package globally:
   ```bash
   npm install -g remove-comments-cli
   ```

2. Run it on a file:
   ```bash
   remove-comments file.js
   ```

3. Or use it with multiple files:
   ```bash
   remove-comments src/**/*.ts
   ```

For more detailed usage instructions and options, check out the [Usage](usage) guide.

## Basic Usage

Remove all comments from a file:

```bash
npx remove-comments input.ts > output.ts
```

Process multiple files using glob patterns:

```bash
npx remove-comments "src/**/*.{js,ts}" --outDir dist
```

## Preserving Important Comments

By default, comments starting with `!` are preserved:

```typescript
// This comment will be removed
//! This important comment will be preserved
/* This block comment will be removed */
/*! This important block comment will be preserved */
```

You can specify custom markers to preserve different types of comments:

```bash
# Preserve comments starting with # or *
npx remove-comments "src/**/*.ts" -k "#*" --outDir dist
```

## Command Line Options

```bash
npx remove-comments --help

Options:
  -k, --keep-markers <chars>  Characters that mark comments to preserve (default: "!")
  -o, --outDir <dir>         Output directory for processed files
  -v, --verbose             Print detailed processing information
  -h, --help                Display help information
```

## Examples

### Process TypeScript Files

Process all TypeScript files in the `src` directory and preserve comments starting with `!` or `#`:

```bash
npx remove-comments "src/**/*.ts" -k "!#" --outDir dist
```

### Process JSX/TSX Files

Process React component files and preserve comments starting with `*`:

```bash
npx remove-comments "src/**/*.{jsx,tsx}" -k "*" --outDir dist
```

### Process Single File

Process a single file and output to stdout:

```bash
npx remove-comments input.js > output.js
```

### Verbose Output

Process files with detailed logging:

```bash
npx remove-comments "src/**/*.{js,ts}" -k "!" -o dist -v
```

## Exit Codes

The CLI uses the following exit codes:

- `0`: Success - all files processed successfully
- `1`: Fatal error - no files found or initialization failed
- `2`: Partial success - some files had errors but others were processed