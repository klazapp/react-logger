type LogLevel = "debug" | "info" | "warn" | "error";
type Logger = {
    debug: (...a: any[]) => void;
    info: (...a: any[]) => void;
    warn: (...a: any[]) => void;
    error: (...a: any[]) => void;
};
type EnableFn = () => boolean;
type ProxyOpts = {
    /** Opt-out per method name.
     *  Return true to skip logging for that method.
     */
    optOut?: (method: string) => boolean;
    /** Redact/transform arguments before logging.
     *  Useful for removing sensitive data (passwords, tokens).
     */
    redactArgs?: (args: any[], method: string) => any[];
    /** Redact/transform results before logging.
     *  Useful for masking sensitive return values or truncating large data.
     */
    redactResult?: (result: any, method: string) => any;
    /** Override log namespace for specific methods.
     *  Lets you group or rename logs per-method for clarity.
     */
    namespaceFor?: (method: string) => string | undefined;
};

/**
 * Overrides the active enablement rule.
 * Use to centralize environment-specific toggling (e.g., feature flags).
 */
declare function setEnableRule(fn: EnableFn): void;
/**
 * Creates a namespaced, leveled logger.
 * - Namespace appears as a bracketed prefix in console output.
 * - 'debug' messages are suppressed when the enablement rule returns false.
 * - Other levels ('info' | 'warn' | 'error') bypass suppression to remain visible.
 */
declare function makeLogger(ns: string): Logger;
declare const makeDevLogger: (ns: string) => Logger;

/**
 * Creates a Proxy that auto-logs method calls on an object.
 * Behavior:
 *   - Logs method entry with arguments (▶ args)
 *   - Logs successful return values (✅ result)
 *   - Logs thrown errors (❌ error)
 * Coverage:
 *   - Supports synchronous and asynchronous (Promise-like) methods
 * Controls:
 *   - Per-method opt-out via opts.optOut
 *   - Argument/result redaction via opts.redactArgs / opts.redactResult
 *   - Per-method namespace override via opts.namespaceFor
 */
declare function withDebugProxy<T extends object>(obj: T, name: string, opts?: ProxyOpts): T;

/**
 * TypeScript method decorator that injects logging for a single method.
 * Behavior:
 *   - Logs method arguments (▶ args)
 *   - Logs return values (✅ result)
 *   - Logs errors (❌ error)
 * Coverage:
 *   - Supports synchronous and asynchronous (Promise-like) methods
 * Parameters:
 *   - ns (optional): custom namespace for log entries; defaults to method name
 */
declare function DebugLog(ns?: string): (_: any, key: string, d: PropertyDescriptor) => void;

export { DebugLog, type EnableFn, type LogLevel, type Logger, type ProxyOpts, makeDevLogger, makeLogger, setEnableRule, withDebugProxy };
