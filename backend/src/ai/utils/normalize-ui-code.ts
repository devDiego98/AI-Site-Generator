import { stripOrphanRefAttributes } from './fix-orphan-ref';
import { fixMergedJsxTagAttributes } from './jsx-tag-utils';

const COMPONENT_MARKER =
  /(?:export\s+default\s+)?(?:function\s+Generated(?:App|Page)|const\s+Generated(?:App|Page)\s*=\s*(?:\([^)]*\)\s*=>|[^=]+=>))/;

export function isTrivialJsx(jsx: string): boolean {
  const trimmed = jsx.trim();
  if (!trimmed) {
    return true;
  }

  if (/^<[A-Za-z][\w.-]*(?:\s[^>]*)?\s*\/>\s*$/.test(trimmed)) {
    return true;
  }

  if (/^<>\s*<\/>$/.test(trimmed)) {
    return true;
  }

  const emptyElement = /^<([A-Za-z][\w.-]*)(?:\s[^>]*)?>\s*<\/\1>\s*$/;
  return emptyElement.test(trimmed);
}

function extractReturnJsx(functionBody: string): string | null {
  const returnWithParens = /\breturn\s*\(/;
  const match = returnWithParens.exec(functionBody);
  if (!match) {
    const inlineReturn = /\breturn\s+(<[\s\S]+?>)\s*;/.exec(functionBody);
    return inlineReturn?.[1]?.trim() ?? null;
  }

  const parenStart = functionBody.indexOf('(', match.index);
  if (parenStart === -1) {
    return null;
  }

  let depth = 0;
  for (let i = parenStart; i < functionBody.length; i++) {
    const char = functionBody[i];
    if (char === '(') {
      depth++;
    } else if (char === ')') {
      depth--;
      if (depth === 0) {
        return functionBody.slice(parenStart + 1, i).trim();
      }
    }
  }

  return null;
}

function findComponentStart(code: string): number {
  const match = COMPONENT_MARKER.exec(code);
  return match?.index ?? -1;
}

function extractOrphanJsx(code: string, componentStart: number): string | null {
  if (componentStart <= 0) {
    return null;
  }

  const before = code.slice(0, componentStart).trim();
  if (!before.startsWith('<')) {
    return null;
  }

  return before;
}

function extractFunctionBody(
  code: string,
  componentStart: number,
): string | null {
  const braceStart = code.indexOf('{', componentStart);
  if (braceStart === -1) {
    return null;
  }

  let depth = 0;
  for (let i = braceStart; i < code.length; i++) {
    const char = code[i];
    if (char === '{') {
      depth++;
    } else if (char === '}') {
      depth--;
      if (depth === 0) {
        return code.slice(braceStart + 1, i);
      }
    }
  }

  return null;
}

function buildComponent(jsx: string): string {
  return `export default function GeneratedApp() {
  const [currentPage, setCurrentPage] = React.useState('main');

  return (
    ${jsx}
  );
}`;
}

/** Rename legacy GeneratedPage exports to GeneratedApp. */
export function migrateToGeneratedApp(code: string): string {
  return code
    .replace(/\bGeneratedPage\b/g, 'GeneratedApp')
    .replace(
      /export\s+default\s+GeneratedApp\s*;/g,
      'export default GeneratedApp;',
    );
}

export function normalizeUiCode(code: string): string {
  const trimmed = stripOrphanRefAttributes(
    fixMergedJsxTagAttributes(migrateToGeneratedApp(code.trim())),
  );
  if (!trimmed) {
    return '';
  }

  const componentStart = findComponentStart(trimmed);
  if (componentStart === -1) {
    if (trimmed.startsWith('<')) {
      return buildComponent(trimmed);
    }
    return trimmed;
  }

  const orphanJsx = extractOrphanJsx(trimmed, componentStart);
  const functionBody = extractFunctionBody(trimmed, componentStart);
  const returnJsx = functionBody ? extractReturnJsx(functionBody) : null;
  const hasProperDefaultExport =
    /export\s+default\s+function\s+GeneratedApp\s*\(/.test(trimmed);

  if (
    hasProperDefaultExport &&
    returnJsx &&
    !isTrivialJsx(returnJsx) &&
    !orphanJsx
  ) {
    return trimmed;
  }

  const jsxToRender =
    returnJsx && !isTrivialJsx(returnJsx)
      ? returnJsx
      : (orphanJsx ?? returnJsx);

  if (!jsxToRender || isTrivialJsx(jsxToRender)) {
    return trimmed;
  }

  return buildComponent(jsxToRender);
}
