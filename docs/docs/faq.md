---
id: faq
title: Frequently Asked Questions
sidebar_label: FAQ
---

# Frequently Asked Questions

## General Questions

### What types of files can I process?
The tool primarily supports JavaScript and TypeScript files, but it can handle any text-based source code files with C-style comments.

### Will it preserve my code formatting?
Yes, the tool only removes comments while maintaining all other aspects of your code, including whitespace and formatting.

### Can I process an entire directory?
Yes, you can use glob patterns like `src/**/*.js` to process all matching files in a directory and its subdirectories.

## Protected Comments

### What are protected comments?
Protected comments are special comments that start with `//!` or `/*!`. These comments are preserved by default when using the `--keep-protected` flag.

### Why would I want to keep protected comments?
Protected comments are useful for preserving important documentation, copyright notices, or other critical information while removing regular comments.

### Can I customize the protected comment markers?
Currently, the tool uses fixed markers (`//!` and `/*!`). Custom markers may be supported in future versions.

## Troubleshooting

### The tool is removing comments I want to keep
Make sure you're using the `--keep-protected` flag and marking important comments with `//!` or `/*!`.

### Some comments are not being removed
If certain comments aren't being removed, they might be:
- Part of a string literal
- Inside a template literal
- Using non-standard comment syntax

### The output files are empty
Check that:
1. The input files exist and are readable
2. You have write permissions for the output directory
3. The files contain valid source code

## Technical Details

### How does it handle nested comments?
The tool uses a state machine to track comment nesting levels and ensures proper handling of nested comments.

### Does it support JSX/TSX files?
Yes, the tool properly handles JSX/TSX syntax, including JSX comments `{/* */}`.

### What about comments in strings?
Comments that appear within string literals (including template literals) are preserved, as they are part of the string content rather than actual comments. 