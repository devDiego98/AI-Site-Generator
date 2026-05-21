/**
 * Extracts default prop values from ReactBits .tsx sources.
 * Used by generate-reactbits-ai.mjs — not a checked-in JSON catalog.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const NON_COLOR_PROP =
  /^(colorNum|colorBalance|colorSpeed|className|style|children|items|variant|preset|animationType|shape|direction|enableWebcam|showPreview|modelsPath|lineStyle|scanDirection|pixelFilter|isRotate|BFECC|dt|imageSrc|effectOptions|mixBlendMode|quality|pillarWidth|pillarHeight|pillarRotation|rayCount|hoverDampness|offset|points|variant|COLOR_UPDATE_SPEED|BACK_COLOR|SIM_RESOLUTION|colorFrequency)$/i;

const COLOR_PROP =
  /color|hue|gradient|stops|tint|palette|lightColor|lineColor|baseColor|activeColor|scanColor|raysColor|sparkColor|borderColor|hoverFill|waveColor|eyeColor|topColor|bottomColor|backgroundColor|linesGradient|particleColors|gradientFrom|gradientTo|glowColor|BACK_COLOR|^COLOR$|^colors$|^color1$|^color2$|^color3$|saturation/i;

export function isColorProp(name) {
  if (NON_COLOR_PROP.test(name)) return false;
  return COLOR_PROP.test(name);
}

function parseDestructuring(body) {
  const defaults = {};
  const s = body.replace(/\s+/g, ' ').trim();
  let i = 0;

  const advance = () => {
    while (i < s.length && (s[i] === ',' || /\s/.test(s[i]))) i += 1;
  };

  while (i < s.length) {
    advance();
    if (i >= s.length) break;

    const skipMatch = s.slice(i).match(/^(\w+)(?::\s*[^,=]+)?\s*,/);
    if (skipMatch) {
      i += skipMatch[0].length;
      continue;
    }

    const keyMatch = s.slice(i).match(/^(\w+)(?::\s*[^,=]+)?\s*=\s*/);
    if (!keyMatch) break;

    const key = keyMatch[1];
    i += keyMatch[0].length;
    let depth = 0;
    let inString = null;
    const start = i;

    while (i < s.length) {
      const c = s[i];
      if (inString) {
        if (c === inString && s[i - 1] !== '\\') inString = null;
      } else if (c === '"' || c === "'") {
        inString = c;
      } else if (c === '(' || c === '[' || c === '{') {
        depth += 1;
      } else if (c === ')' || c === ']' || c === '}') {
        depth -= 1;
      } else if (c === ',' && depth === 0) {
        break;
      }
      i += 1;
    }

    defaults[key] = s.slice(start, i).trim();
    if (s[i] === ',') i += 1;
  }

  return defaults;
}

function sliceUntilMarkers(content, start, endRegexes) {
  let end = content.length;
  for (const re of endRegexes) {
    const m = content.slice(start).match(re);
    if (m?.index != null) end = Math.min(end, start + m.index);
  }
  return end > start ? content.slice(start, end) : null;
}

export function extractFromTsx(content, name) {
  const opens = [
    {
      re: new RegExp(`export default function ${name}\\s*\\(\\{`),
      ends: [
        /\}\s*:\s*\w+Props\s*\)\s*\{/s,
        /\}\s*:\s*\w+Props\s*\)/s,
        /\}\s*\)\s*=>\s*\{/s,
        /\}\s*\)\s*\{/s,
      ],
    },
    {
      re: new RegExp(`const ${name}:\\s*React\\.FC<[^>]+>\\s*=\\s*\\(\\{`),
      ends: [/\}\s*\)\s*=>\s*\{/s, /\}\s*\)\s*=>/s],
    },
    { re: new RegExp(`const ${name}\\s*=\\s*\\(\\{`), ends: [/\}\s*\)\s*=>\s*\{/s, /\}\s*\)\s*=>/s] },
  ];
  for (const { re, ends } of opens) {
    const m = content.match(re);
    if (m?.index != null) {
      const block = sliceUntilMarkers(content, m.index + m[0].length, ends);
      if (block) return parseDestructuring(block);
    }
  }

  const propsBody = content.match(
    new RegExp(
      `export default function ${name}\\([^)]*\\)[\\s\\S]*?const\\s*\\{`,
      's',
    ),
  );
  if (propsBody?.index != null) {
    const start = propsBody.index + propsBody[0].length;
    const block = sliceUntilMarkers(content, start, [/\}\s*=\s*props/s]);
    if (block) return parseDestructuring(block);
  }

  return null;
}

function formatDefaultForJsx(value) {
  if (
    value.startsWith('[') ||
    value.startsWith('{') ||
    value === 'true' ||
    value === 'false'
  ) {
    return `{${value}}`;
  }
  if (/^-?\d+(\.\d+)?$/.test(value)) return `{${value}}`;
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return `{${value}}`;
  }
  return `{${JSON.stringify(value)}}`;
}

function resolveConstLiteral(content, identifier) {
  const re = new RegExp(
    `const\\s+${identifier}\\b[^=]*=\\s*([^;]+);`,
    's',
  );
  const m = content.match(re);
  return m ? m[1].trim() : null;
}

function resolveDefaultValue(content, raw) {
  const trimmed = raw.trim();
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(trimmed)) {
    return resolveConstLiteral(content, trimmed) ?? trimmed;
  }
  return trimmed;
}

function isLiteralDefault(value) {
  const v = value.trim();
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(v)) return false;
  if (/^\{ r:\s*[\d.]/i.test(v)) return false;
  return true;
}

export function buildColorOnlyUsage(name, defaults, colorProps) {
  if (!colorProps.length) return `<${name} />`;
  const attrs = colorProps
    .filter((p) => defaults[p] != null && isLiteralDefault(defaults[p]))
    .map((p) => {
      const v = defaults[p];
      if (v.startsWith('[')) return `${p}={${v}}`;
      if (v.startsWith('"') || v.startsWith("'")) return `${p}={${v}}`;
      return `${p}={${formatDefaultForJsx(v).slice(1, -1)}}`;
    });
  if (!attrs.length) return `<${name} />`;
  return `<${name} ${attrs.join(' ')} />`;
}

export function formatDefaultsTable(defaults) {
  const entries = Object.entries(defaults);
  if (!entries.length) return '(built-in defaults — no props listed)';
  return entries.map(([k, v]) => `${k}=${v}`).join(', ');
}

/**
 * @param {string} reactBitsDir - path to frontend/src/ReactBits
 * @param {string[]} componentNames
 */
export async function loadReactBitsCatalog(reactBitsDir, componentNames) {
  const catalog = {};

  for (const name of componentNames) {
    const tsxPath = path.join(reactBitsDir, name, `${name}.tsx`);
    let defaults = {};
    let content = '';
    try {
      content = await fs.readFile(tsxPath, 'utf8');
      const raw = extractFromTsx(content, name) ?? {};
      defaults = Object.fromEntries(
        Object.entries(raw).map(([k, v]) => [k, resolveDefaultValue(content, v)]),
      );
    } catch {
      defaults = {};
    }
    const colorProps = Object.keys(defaults).filter(isColorProp);
    catalog[name] = {
      defaults,
      colorProps,
      usage: buildColorOnlyUsage(name, defaults, colorProps),
    };
  }

  return catalog;
}
