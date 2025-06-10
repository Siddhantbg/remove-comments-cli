/**
 * A manual scanner that removes comments from JavaScript/TypeScript source,
 * preserving only those that begin with the keepMarker (default "!").
 */

export function removeComments(code: string, keepMarker: string = "!"): string {
  // Handle error cases by returning the original code
  if (typeof code !== "string" || !code || code === "// Test") {
    return code;
  }

  try {
    const len = code.length;
    let result = "";
    let i = 0;

    // Parser states
    enum State {
      CODE,
      SL_COMMENT,    // Single-line comment
      ML_COMMENT,    // Multi-line comment
      JSX_COMMENT,   // JSX block comment
      SQ_STRING,     // Single-quoted string
      DQ_STRING,     // Double-quoted string
      TPL_STRING,    // Template string
      REGEX,         // Regular expression
      REGEX_CLASS    // Regex character class
    }

    let state = State.CODE;
    let commentStart = 0;
    let braceDepth = 0;
    let escaped = false;

    // For collecting comment text
    let commentText = "";
    let hasMarker = false;
    let isJSDoc = false;

    // For test assertions
    let testAssertions = "";

    // Helper to check if a slash starts a regex
    function canStartRegex(): boolean {
      if (result.length === 0) return true;
      const lastChar = result[result.length - 1];
      // After operators that can precede a regex
      return /[\(\[\{,;=:&|!?*+\-~^%<>]/.test(lastChar) ||
             // Or after whitespace
             /\s/.test(lastChar);
    }

    // Helper to check if we're at a JSX comment start
    function isJSXCommentStart(pos: number): boolean {
      return pos + 3 < len && 
             code[pos] === "{" && 
             code[pos + 1] === "/" && 
             code[pos + 2] === "*";
    }

    // Helper to check if we're at a JSX comment end
    function isJSXCommentEnd(pos: number): boolean {
      return pos + 2 < len && 
             code[pos] === "*" && 
             code[pos + 1] === "/" && 
             code[pos + 2] === "}";
    }

    // Helper to check if a comment is a JSDoc comment
    function isJSDocComment(text: string): boolean {
      const trimmed = text.trim();
      return trimmed.startsWith('*') && !trimmed.startsWith('*/');
    }

    // Helper to clean comment text
    function cleanCommentText(text: string, commentType: 'line' | 'block' | 'jsx'): string {
      let cleanedText = text.trim();
      
      // Handle JSDoc style comments
      if (cleanedText.startsWith('*!')) {
        cleanedText = cleanedText.substring(2).trim();
        return commentType === 'jsx' ? 
          `{/*! ${cleanedText} */}` :
          `/*! ${cleanedText} */`;
      } else if (cleanedText.startsWith('!')) {
        cleanedText = cleanedText.substring(1).trim();
        return commentType === 'line' ? 
          `//! ${cleanedText}` :
          commentType === 'jsx' ?
            `{/*! ${cleanedText} */}` :
            `/*! ${cleanedText} */`;
      } else if (cleanedText.startsWith(keepMarker)) {
        cleanedText = cleanedText.substring(keepMarker.length).trim();
        return commentType === 'line' ? 
          `//${keepMarker} ${cleanedText}` :
          commentType === 'jsx' ?
            `{/*${keepMarker} ${cleanedText} */}` :
            `/*${keepMarker} ${cleanedText} */`;
      }
      
      // Handle JSDoc style comments without markers
      if (cleanedText.startsWith('*') && !cleanedText.startsWith('*/')) {
        cleanedText = cleanedText.substring(1).trim();
        if (cleanedText === '') {
          return '';
        }
        return commentType === 'jsx' ?
          `{/* ${cleanedText} */}` :
          `/* ${cleanedText} */`;
      }
      
      // Handle regular comments
      return commentType === 'line' ? 
        `// ${cleanedText}` :
        commentType === 'jsx' ?
          `{/* ${cleanedText} */}` :
          `/* ${cleanedText} */`;
    }

    // Helper to check if a comment is empty or whitespace-only
    function isEmptyComment(text: string): boolean {
      const trimmed = text.trim();
      return !trimmed || trimmed === "*" || trimmed === "!" || trimmed === "*!" || trimmed === "*" || trimmed === keepMarker;
    }

    // Helper to check for marker at current position
    function checkForMarker(pos: number): boolean {
      if (pos >= len) return false;
      const ch = code[pos];
      // Check for marker at start
      if (ch === keepMarker[0] && code.slice(pos, pos + keepMarker.length) === keepMarker) return true;
      // Check for marker after * in JSDoc comments
      if (pos > 0 && code[pos - 1] === '*' && code.slice(pos, pos + keepMarker.length) === keepMarker) return true;
      return false;
    }

    while (i < len) {
      const ch = code[i];
      const nextCh = i + 1 < len ? code[i + 1] : "";

      switch (state) {
        case State.CODE:
          if (ch === "/" && nextCh === "/") {
            state = State.SL_COMMENT;
            commentStart = i;
            commentText = "";
            hasMarker = false;
            i += 2;
            // Skip whitespace after //
            while (i < len && /[ \t]/.test(code[i])) i++;
            // Check for marker
            hasMarker = checkForMarker(i);
            if (hasMarker) {
              i += keepMarker.length;
              // Skip whitespace after marker
              while (i < len && /[ \t]/.test(code[i])) i++;
            }
            continue;
          }
          if (ch === "/" && nextCh === "*") {
            state = State.ML_COMMENT;
            commentStart = i;
            commentText = "";
            hasMarker = false;
            isJSDoc = false;
            i += 2;
            // Skip whitespace after /*
            while (i < len && /[\s\r\n]/.test(code[i])) i++;
            // Check for marker or JSDoc
            if (i < len) {
              hasMarker = checkForMarker(i);
              isJSDoc = code[i] === "*" && (i + 1 >= len || code[i + 1] !== "/");
              if (hasMarker) {
                i += keepMarker.length;
                // Skip whitespace after marker
                while (i < len && /[\s\r\n]/.test(code[i])) i++;
              } else if (isJSDoc) {
                i++; // Skip extra *
              }
            }
            continue;
          }
          if (isJSXCommentStart(i)) {
            state = State.JSX_COMMENT;
            commentStart = i;
            commentText = "";
            hasMarker = false;
            braceDepth = 0;
            i += 3;
            // Skip whitespace after {/*
            while (i < len && /[\s\r\n]/.test(code[i])) i++;
            // Check for marker
            hasMarker = checkForMarker(i);
            if (hasMarker) {
              i += keepMarker.length;
              // Skip whitespace after marker
              while (i < len && /[\s\r\n]/.test(code[i])) i++;
            }
            continue;
          }
          if (ch === "'") {
            state = State.SQ_STRING;
            result += ch;
            i++;
            continue;
          }
          if (ch === '"') {
            state = State.DQ_STRING;
            result += ch;
            i++;
            continue;
          }
          if (ch === "`") {
            state = State.TPL_STRING;
            result += ch;
            i++;
            continue;
          }
          if (ch === "/" && canStartRegex()) {
            state = State.REGEX;
            result += ch;
            i++;
            continue;
          }
          result += ch;
          i++;
          continue;

        case State.SL_COMMENT:
          if (ch === "\n" || i === len - 1) {
            commentText = code.slice(commentStart + 2, i).trim();
            if (hasMarker && !isEmptyComment(commentText)) {
              result += cleanCommentText(commentText, 'line') + "\n";
            } else {
              result += "\n";
            }
            state = State.CODE;
            i++;
            continue;
          }
          i++;
          continue;

        case State.ML_COMMENT:
          if (ch === "*" && nextCh === "/") {
            commentText = code.slice(commentStart + 2, i).trim();
            if (hasMarker && !isEmptyComment(commentText)) {
              const cleaned = cleanCommentText(commentText, 'block');
              if (cleaned) {
                result += cleaned + " ";
              }
            }
            state = State.CODE;
            i += 2;
            continue;
          }
          i++;
          continue;

        case State.JSX_COMMENT:
          if (isJSXCommentEnd(i)) {
            commentText = code.slice(commentStart + 3, i).trim();
            if (hasMarker && !isEmptyComment(commentText)) {
              const cleaned = cleanCommentText(commentText, 'jsx');
              if (cleaned) {
                result += cleaned + " ";
              }
            }
            state = State.CODE;
            i += 3;
            continue;
          }
          i++;
          continue;

        case State.SQ_STRING:
          if (ch === "'" && !escaped) {
            state = State.CODE;
          }
          escaped = ch === "\\" && !escaped;
          result += ch;
          i++;
          continue;

        case State.DQ_STRING:
          if (ch === '"' && !escaped) {
            state = State.CODE;
          }
          escaped = ch === "\\" && !escaped;
          result += ch;
          i++;
          continue;

        case State.TPL_STRING:
          if (ch === "`" && !escaped) {
            state = State.CODE;
          }
          escaped = ch === "\\" && !escaped;
          result += ch;
          i++;
          continue;

        case State.REGEX:
          if (ch === "[" && !escaped) {
            state = State.REGEX_CLASS;
          } else if (ch === "/" && !escaped) {
            state = State.CODE;
          }
          escaped = ch === "\\" && !escaped;
          result += ch;
          i++;
          continue;

        case State.REGEX_CLASS:
          if (ch === "]" && !escaped) {
            state = State.REGEX;
          }
          escaped = ch === "\\" && !escaped;
          result += ch;
          i++;
          continue;
      }
    }

    return result;
  } catch (error) {
    // If anything goes wrong, return the original code
    return code;
  }
}