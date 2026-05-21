/**
 * Registers all ReactBits background components as preview iframe globals.
 * Built with: npm run build:preview-runtime
 *
 * window[name] alone is not enough — Babel output runs in strict mode, so we also
 * create global var bindings via eval for bare identifiers like <LiquidEther />.
 */
import * as ReactBits from '@/ReactBits'

const REACT_BITS_NAMES = Object.keys(ReactBits) as (keyof typeof ReactBits)[]

function exposeGlobal(name: string, value: unknown): void {
  ;(globalThis as Record<string, unknown>)[name] = value
  try {
    // eslint-disable-next-line no-eval -- required for strict-mode preview scripts
    ;(0, eval)(`var ${name} = globalThis[${JSON.stringify(name)}]`)
  } catch {
    // Reserved identifiers — window assignment still works for window.LiquidEther access
  }
}

for (const name of REACT_BITS_NAMES) {
  exposeGlobal(name, ReactBits[name])
}

export {}
