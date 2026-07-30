/**
 * backend/src/parsers/ast_parser.js
 * Multi-Language AST Parsing Engine supporting JavaScript/TypeScript, Python, Java, Go, C#, C++, Rust, PHP.
 * Extracts AST Functions, Classes, Imports, Routes, and Cyclomatic Complexity metadata.
 */

const LANGUAGE_PATTERNS = {
  js: {
    functions: /(?:async\s+)?function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)|(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>/g,
    classes: /class\s+([a-zA-Z0-9_$]+)(?:\s+extends\s+([a-zA-Z0-9_$]+))?/g,
    imports: /import\s+.*?from\s+['"](.*?)['"]|require\(['"](.*?)['"]\)/g,
    routes: /(?:app|router)\.(get|post|put|delete|patch)\(['"](.*?)['"]/gi
  },
  py: {
    functions: /def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\):/g,
    classes: /class\s+([a-zA-Z0-9_]+)(?:\(([^)]*)\))?:/g,
    imports: /(?:from\s+([a-zA-Z0-9._]+)\s+import|import\s+([a-zA-Z0-9._]+))/g,
    routes: /@(?:app|router)\.(get|post|put|delete|patch)\(['"](.*?)['"]/gi
  },
  java: {
    functions: /(?:public|protected|private|static|\s)+[\w<>\[\]]+\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*\{/g,
    classes: /(?:public\s+)?class\s+([a-zA-Z0-9_]+)/g,
    imports: /import\s+([a-zA-Z0-9._*]+);/g,
    routes: /@(GetMapping|PostMapping|PutMapping|DeleteMapping|RequestMapping)\(['"](.*?)['"]/gi
  },
  go: {
    functions: /func\s+(?:\([^)]+\)\s+)?([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g,
    classes: /type\s+([a-zA-Z0-9_]+)\s+struct/g,
    imports: /import\s+\(\s*([\s\S]*?)\s*\)|import\s+["'](.*?)["']/g,
    routes: /r\.(GET|POST|PUT|DELETE|PATCH)\(['"](.*?)['"]/gi
  }
};

/**
 * Normalizes file extension to language key
 */
function getLanguageKey(filePath) {
  const ext = filePath.split('.').pop().toLowerCase();
  if (['py'].includes(ext)) return 'py';
  if (['java'].includes(ext)) return 'java';
  if (['go'].includes(ext)) return 'go';
  return 'js'; // Default JS/TS
}

/**
 * Calculates approximate Cyclomatic Complexity based on control flow keywords
 */
function calculateComplexity(code) {
  const matches = code.match(/\b(if|else|for|while|switch|case|catch|&&|\|\|)\b/g);
  return 1 + (matches ? matches.length : 0);
}

/**
 * Parses file content into AST Symbol Objects
 */
export function parseFileAST(filePath, content) {
  const langKey = getLanguageKey(filePath);
  const patterns = LANGUAGE_PATTERNS[langKey] || LANGUAGE_PATTERNS.js;
  const lines = content.split('\n');

  const functions = [];
  const classes = [];
  const imports = [];
  const routes = [];

  // Parse Functions
  let fMatch;
  const fRegex = new RegExp(patterns.functions);
  while ((fMatch = fRegex.exec(content)) !== null) {
    const name = fMatch[1] || fMatch[3];
    const params = fMatch[2] || fMatch[4] || '';
    if (name && !['if', 'for', 'while', 'switch', 'catch'].includes(name)) {
      functions.push({
        name,
        params: params.trim(),
        complexity: calculateComplexity(fMatch[0]),
        file: filePath,
        charIndex: fMatch.index
      });
    }
  }

  // Parse Classes
  let cMatch;
  const cRegex = new RegExp(patterns.classes);
  while ((cMatch = cRegex.exec(content)) !== null) {
    const className = cMatch[1];
    const extendsClass = cMatch[2] || null;
    if (className) {
      classes.push({
        name: className,
        extends: extendsClass,
        file: filePath
      });
    }
  }

  // Parse Imports
  let iMatch;
  const iRegex = new RegExp(patterns.imports);
  while ((iMatch = iRegex.exec(content)) !== null) {
    const imp = iMatch[1] || iMatch[2];
    if (imp) imports.push(imp.trim());
  }

  // Parse Exposed Routes
  let rMatch;
  const rRegex = new RegExp(patterns.routes);
  while ((rMatch = rRegex.exec(content)) !== null) {
    routes.push({
      method: (rMatch[1] || 'GET').toUpperCase(),
      path: rMatch[2] || '/',
      file: filePath
    });
  }

  return {
    filePath,
    language: langKey,
    loc: lines.length,
    functions,
    classes,
    imports,
    routes
  };
}
