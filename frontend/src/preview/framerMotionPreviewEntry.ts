/**
 * Exposes Framer Motion APIs as preview iframe globals (no imports in generated code).
 */
import {
  AnimatePresence,
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'

const FRAMER_MOTION_GLOBALS = {
  motion,
  AnimatePresence,
  useInView,
  useScroll,
  useTransform,
  useSpring,
} as const

function exposeGlobal(name: string, value: unknown): void {
  ;(globalThis as Record<string, unknown>)[name] = value
  try {
    ;(0, eval)(`var ${name} = globalThis[${JSON.stringify(name)}]`)
  } catch {
    /* strict mode or duplicate binding */
  }
}

for (const [name, value] of Object.entries(FRAMER_MOTION_GLOBALS)) {
  exposeGlobal(name, value)
}
