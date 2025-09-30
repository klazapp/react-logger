import { makeLogger } from "./logger";
import type { ProxyOpts } from "./types";

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
export function withDebugProxy<T extends object>(
    obj: T,
    name: string,
    opts: ProxyOpts = {}
): T {
    // Base logger for generic errors that are not method-specific
    const baseLog = makeLogger(name);

    return new Proxy(obj, {
        get(target, prop, receiver) {
            const orig = Reflect.get(target, prop, receiver);

            // Preserve non-function properties
            if (typeof orig !== "function") return orig;

            const methodName = String(prop);

            // Skip instrumentation for opted-out methods
            if (opts.optOut?.(methodName)) return orig;

            // Namespace: "<name>.<method>" unless overridden
            const ns = opts.namespaceFor?.(methodName) ?? `${name}.${methodName}`;
            const log = makeLogger(ns);

            // Wrapped callable that performs logging around the original method
            return function (...args: any[]) {
                // Optional argument redaction/transform before logging
                const a = opts.redactArgs ? opts.redactArgs(args, methodName) : args;
                log.debug("▶ args:", a);

                try {
                    const out = orig.apply(target, args);

                    // Async branch: handle Promise-like results
                    if (out && typeof (out as any).then === "function") {
                        return (out as Promise<any>)
                            .then((res) => {
                                // Optional result redaction/transform before logging
                                const r = opts.redactResult ? opts.redactResult(res, methodName) : res;
                                log.debug("✅ result:", r);
                                return res;
                            })
                            .catch((err) => {
                                baseLog.error(`❌ error in ${methodName}:`, err);
                                throw err;
                            });
                    }

                    // Sync branch: log immediate result
                    const r = opts.redactResult ? opts.redactResult(out, methodName) : out;
                    log.debug("✅ result:", r);
                    return out;
                } catch (err) {
                    // Synchronous throw path
                    baseLog.error(`❌ error in ${methodName}:`, err);
                    throw err;
                }
            };
        },
    });
}
