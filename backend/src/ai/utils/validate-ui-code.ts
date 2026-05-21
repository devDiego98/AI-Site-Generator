import { parse, type ParserPlugin } from '@babel/parser';
import type {
  BlockStatement,
  CallExpression,
  Expression,
  JSXOpeningElement,
  Node,
} from '@babel/types';
import { formatDesignEvaluationError } from './evaluate-ui-design';
import { hasMergedJsxTagAttributes } from './jsx-tag-utils';
import { hasOrphanRefAttribute } from './fix-orphan-ref';
import { isTrivialJsx, migrateToGeneratedApp, normalizeUiCode } from './normalize-ui-code';
import { runDesignQualityPipeline } from './fix-ui-design';

const PARSER_PLUGINS: ParserPlugin[] = ['jsx'];

const ROOT_COMPONENT_NAMES = ['GeneratedApp', 'GeneratedPage'] as const;

const UNSAFE_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /<script\b/i, message: 'script tags are not allowed' },
  {
    pattern: /dangerouslySetInnerHTML/i,
    message: 'dangerouslySetInnerHTML is not allowed',
  },
  { pattern: /\beval\s*\(/, message: 'eval is not allowed' },
  { pattern: /\bnew\s+Function\s*\(/, message: 'Function constructor is not allowed' },
];

export interface ValidateUiCodeResult {
  valid: boolean;
  error?: string;
}

function isRootComponentName(name: string | null | undefined): boolean {
  return ROOT_COMPONENT_NAMES.includes(
    name as (typeof ROOT_COMPONENT_NAMES)[number],
  );
}

function getDefaultExportName(
  declaration: Extract<
    import('@babel/types').ExportDefaultDeclaration,
    { type: 'ExportDefaultDeclaration' }
  >['declaration'],
): string | null {
  if (declaration.type === 'FunctionDeclaration' && declaration.id?.name) {
    return declaration.id.name;
  }

  if (declaration.type === 'Identifier') {
    return declaration.name;
  }

  if (
    declaration.type === 'ArrowFunctionExpression' ||
    declaration.type === 'FunctionExpression'
  ) {
    return 'GeneratedApp';
  }

  return null;
}

function getReturnJsxFromFunctionBody(
  code: string,
  body: BlockStatement,
): string | null {
  for (const statement of body.body) {
    if (statement.type !== 'ReturnStatement' || !statement.argument) {
      continue;
    }

    const start = statement.argument.start;
    const end = statement.argument.end;
    if (start == null || end == null) {
      continue;
    }

    return code.slice(start, end);
  }

  return null;
}

function extractRenderableJsx(code: string): string | null {
  let ast;
  try {
    ast = parse(code, {
      sourceType: 'module',
      plugins: PARSER_PLUGINS,
      errorRecovery: false,
    });
  } catch {
    return null;
  }

  const { body } = ast.program;

  for (const node of body) {
    if (node.type === 'ExportDefaultDeclaration') {
      const exportName = getDefaultExportName(node.declaration);
      if (!isRootComponentName(exportName)) {
        return null;
      }

      if (node.declaration.type === 'FunctionDeclaration') {
        return getReturnJsxFromFunctionBody(code, node.declaration.body);
      }

      if (
        (node.declaration.type === 'ArrowFunctionExpression' ||
          node.declaration.type === 'FunctionExpression') &&
        node.declaration.body.type === 'BlockStatement'
      ) {
        return getReturnJsxFromFunctionBody(code, node.declaration.body);
      }
    }
  }

  for (const node of body) {
    if (node.type === 'FunctionDeclaration' && isRootComponentName(node.id?.name)) {
      return getReturnJsxFromFunctionBody(code, node.body);
    }
  }

  return null;
}

function checkUnsafePatterns(code: string): string | null {
  for (const { pattern, message } of UNSAFE_PATTERNS) {
    if (pattern.test(code)) {
      return message;
    }
  }

  return null;
}

function getJsxElementName(openingElement: JSXOpeningElement): string | null {
  const { name } = openingElement;
  if (name.type === 'JSXIdentifier') {
    return name.name;
  }

  return null;
}

function walkAst(
  node: Node,
  visit: (node: Node, parent: Node | null) => void,
  parent: Node | null = null,
): void {
  visit(node, parent);

  for (const key of Object.keys(node)) {
    const child = (node as unknown as Record<string, unknown>)[key];
    if (!child) {
      continue;
    }

    if (Array.isArray(child)) {
      for (const item of child) {
        if (item && typeof item === 'object' && 'type' in item) {
          walkAst(item as Node, visit, node);
        }
      }
      continue;
    }

    if (typeof child === 'object' && 'type' in child) {
      walkAst(child as Node, visit, node);
    }
  }
}

function isComponentCallExpression(expression: Expression): boolean {
  if (expression.type !== 'CallExpression') {
    return false;
  }

  const callee = (expression as CallExpression).callee;
  return callee.type === 'Identifier';
}

function checkReturnJsxStructure(returnJsx: string): string | null {
  let rootExpression: Expression | null = null;
  try {
    const ast = parse(`const __uiReturn = (${returnJsx});`, {
      sourceType: 'module',
      plugins: PARSER_PLUGINS,
      errorRecovery: false,
    });
    const stmt = ast.program.body[0];
    if (stmt?.type === 'VariableDeclaration') {
      rootExpression = stmt.declarations[0]?.init ?? null;
    }
  } catch {
    return null;
  }

  if (!rootExpression) {
    return null;
  }

  let hasStructuralIssue = false;
  let issueMessage = '';

  walkAst(rootExpression, (node, parent) => {
    if (hasStructuralIssue) {
      return;
    }

    if (node.type === 'JSXElement') {
      const tagName = getJsxElementName(node.openingElement);
      if (isRootComponentName(tagName)) {
        hasStructuralIssue = true;
        issueMessage =
          'GeneratedApp must not render itself (no <GeneratedApp> in the return)';
        return;
      }
    }

    if (node.type === 'JSXExpressionContainer') {
      const isJsxChild =
        parent?.type === 'JSXElement' || parent?.type === 'JSXFragment';
      if (!isJsxChild) {
        return;
      }

      const { expression } = node;
      if (expression.type === 'JSXEmptyExpression') {
        return;
      }

      if (
        expression.type === 'FunctionExpression' ||
        expression.type === 'ArrowFunctionExpression'
      ) {
        hasStructuralIssue = true;
        issueMessage =
          'Do not declare nested components inside JSX — put all UI directly in GeneratedApp return';
        return;
      }

      if (isComponentCallExpression(expression)) {
        hasStructuralIssue = true;
        issueMessage =
          'Do not call nested components in JSX (e.g. {App()}) — render UI directly in GeneratedApp';
      }
    }
  });

  return hasStructuralIssue ? issueMessage : null;
}

function checkStructuralPatterns(code: string): string | null {
  const returnJsx = extractRenderableJsx(code);
  if (!returnJsx) {
    return null;
  }

  const jsxIssue = checkReturnJsxStructure(returnJsx);
  if (jsxIssue) {
    return jsxIssue;
  }

  if (hasMergedJsxTagAttributes(returnJsx)) {
    return 'JSX tags must have a space before attributes (use <nav className="..."> not <navclassName="...">)';
  }

  const nestedFunctionInJsx = /\{function\s+\w+\s*\(/;
  if (nestedFunctionInJsx.test(code)) {
    return 'Do not declare nested components inside JSX — put all UI directly in GeneratedApp return';
  }

  const selfReferencingJsx = /<Generated(?:App|Page)(?:\s|>)/;
  if (selfReferencingJsx.test(returnJsx)) {
    return 'GeneratedApp must not render itself (no <GeneratedApp> in the return)';
  }

  const componentCallInJsx = /\{\s*[A-Za-z_$][\w$]*\s*\(\s*\)\s*\}/;
  if (componentCallInJsx.test(returnJsx)) {
    return 'Do not call nested components in JSX (e.g. {App()}) — render UI directly in GeneratedApp';
  }

  if (hasOrphanRefAttribute(code)) {
    return 'ref={ref} is used without const ref = useRef(null) — define ref with useRef before using it, or remove ref={ref}';
  }

  return null;
}

export function validateUiCode(code: string): ValidateUiCodeResult {
  const trimmed = migrateToGeneratedApp(code.trim());
  if (!trimmed) {
    return { valid: false, error: 'UI code is empty' };
  }

  const unsafeReason = checkUnsafePatterns(trimmed);
  if (unsafeReason) {
    return { valid: false, error: unsafeReason };
  }

  try {
    parse(trimmed, {
      sourceType: 'module',
      plugins: PARSER_PLUGINS,
      errorRecovery: false,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'UI code has invalid syntax';
    return { valid: false, error: message };
  }

  if (!/export\s+default/.test(trimmed)) {
    return {
      valid: false,
      error: 'UI code must export a default GeneratedApp component',
    };
  }

  if (!/Generated(?:App|Page)/.test(trimmed)) {
    return {
      valid: false,
      error: 'UI code must define a GeneratedApp component',
    };
  }

  const returnJsx = extractRenderableJsx(trimmed);
  if (!returnJsx || isTrivialJsx(returnJsx)) {
    return {
      valid: false,
      error:
        'GeneratedApp must return meaningful JSX (not an empty element)',
    };
  }

  const structuralIssue = checkStructuralPatterns(trimmed);
  if (structuralIssue) {
    return { valid: false, error: structuralIssue };
  }

  return { valid: true };
}

export function prepareUiCode(raw: string): {
  code: string;
  validation: ValidateUiCodeResult;
} {
  const extracted = raw.trim();
  const normalized = normalizeUiCode(extracted);
  const syntaxValidation = validateUiCode(normalized);

  if (!syntaxValidation.valid) {
    return { code: normalized, validation: syntaxValidation };
  }

  const { code: designCode, evaluation } = runDesignQualityPipeline(normalized);

  if (!evaluation.passed) {
    return {
      code: designCode,
      validation: {
        valid: false,
        error: formatDesignEvaluationError(evaluation),
      },
    };
  }

  return { code: designCode, validation: { valid: true } };
}
