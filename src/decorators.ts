import { makeLogger } from "./logger";

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
export function DebugLog(ns?: string) {
    return function (_: any, key: string, d: PropertyDescriptor) {
        const orig = d.value;

        d.value = function (...args: any[]) {
            const log = makeLogger(ns ?? key);

            // Log input arguments
            log.debug("▶ args:", args);

            try {
                const out = orig.apply(this, args);

                // Async branch: handle Promise results
                if (out && typeof out.then === "function") {
                    return out
                        .then((res: any) => {
                            log.debug("✅ result:", res);
                            return res;
                        })
                        .catch((err: any) => {
                            log.error("❌ error:", err);
                            throw err;
                        });
                }

                // Sync branch: log return value
                log.debug("✅ result:", out);
                return out;
            } catch (e) {
                // Log synchronous error
                log.error("❌ error:", e);
                throw e;
            }
        };
    };
}
