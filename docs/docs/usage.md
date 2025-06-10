---
id: usage
title: Usage Guide
sidebar_label: Usage
---

# Usage Guide

## Command Line Options

```bash
remove-comments [options] <file...>
```

### Options

- `-o, --output <dir>` - Output directory for processed files
- `-i, --in-place` - Modify files in place
- `-k, --keep-protected` - Keep protected comments (//! and /*!)
- `-v, --verbose` - Show detailed processing information
- `-h, --help` - Display help information

## Examples

### Basic Usage

Remove comments from a single file:
```bash
remove-comments src/index.js
```

### Process Multiple Files

Remove comments from all JavaScript files in a directory:
```bash
remove-comments src/**/*.js
```

### Keep Protected Comments

Preserve comments that start with //! or /*!:
```bash
remove-comments --keep-protected src/index.js
```

### In-place Modification

Modify files directly instead of creating new ones:
```bash
remove-comments --in-place src/**/*.ts
```

### Custom Output Directory

Save processed files to a specific directory:
```bash
remove-comments -o dist src/**/*.js
```

## Comment Types

The tool handles various types of comments:

### Single-line Comments
```javascript
// This comment will be removed
//! This protected comment will be preserved
```

### Multi-line Comments
```javascript
/* This comment will be removed */
/*! This protected comment will be preserved */
```

### JSDoc Comments
```javascript
/** 
 * This JSDoc comment will be preserved
 * @param {string} name
 * @returns {void}
 */
```

## Edge Cases

The tool properly handles various edge cases:

- Comments in string literals
- Nested comments
- Mixed comment types
- Comments in template literals
- URL-like content in strings 