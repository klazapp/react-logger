import type { LogLevel, Logger, EnableFn } from "./types";

// Minimal process type declaration for environments without @types/node
declare const process: { env: { NODE_ENV?: string } };

/**
 * Default enablement rule.
 * - In Node: enabled when NODE_ENV !== 'production'.
 * - In browser: enabled if localStorage.debug is truthy and not 'false',
 *   otherwise enabled when NODE_ENV !== 'production'.
 */
const defaultEnabled: EnableFn = () => {
  // Node runtime branch
  if (typeof window === "undefined") {
    return process.env.NODE_ENV !== "production";
  }
  // Browser runtime branch
  const ls = window.localStorage?.getItem("debug");
  return (ls && ls !== "false") || process.env.NODE_ENV !== "production";
};

// Active enablement rule used by the logger
let _isEnabled: EnableFn = defaultEnabled;

/**
 * Overrides the active enablement rule.
 * Use to centralize environment-specific toggling (e.g., feature flags).
 */
export function setEnableRule(fn: EnableFn) {
  _isEnabled = fn;
}

/**
 * Creates a namespaced, leveled logger.
 * - Namespace appears as a bracketed prefix in console output.
 * - 'debug' messages are suppressed when the enablement rule returns false.
 * - Other levels ('info' | 'warn' | 'error') bypass suppression to remain visible.
 */
export function makeLogger(ns: string): Logger {
  const emit =
      (lvl: LogLevel) =>
          (...a: any[]) => {
            if (!_isEnabled() && lvl === "debug") return;
            // Console method selection: 'debug' → console.log; others map 1:1.
            // eslint-disable-next-line no-console
            (console as any)[lvl === "debug" ? "log" : lvl](`[${ns}]`, ...a);
          };
  return {
    debug: emit("debug"),
    info: emit("info"),
    warn: emit("warn"),
    error: emit("error"),
  };
}

/**
 * Development-only logger factory.
 * - Expects a build-time global constant __DEV__ defined by the bundler.
 * - When __DEV__ is false, returns no-op functions so calls are tree-shaken or minimized.
 * - When __DEV__ is true, delegates to makeLogger.
 */
declare const __DEV__: boolean | undefined;

export const makeDevLogger = (ns: string): Logger => {
  if (typeof __DEV__ !== "undefined" && !__DEV__) {
    const noop = () => {};
    return { debug: noop, info: noop, warn: noop, error: noop };
  }
  return makeLogger(ns);
};
