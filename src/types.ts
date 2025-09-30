// ---------------------------------------------------
// LogLevel: The severity or "importance" of a log.
// ---------------------------------------------------
// Use this to categorize messages, so they can be
// filtered, formatted, or shipped differently.
export type LogLevel = "debug" | "info" | "warn" | "error";

// Example:
// log.debug("Only useful for developers, usually silenced in prod");
// log.info("High-level flow messages, still safe for prod");
// log.warn("Something unexpected, but not fatal");
// log.error("Something went wrong, needs attention");


// ---------------------------------------------------
// Logger: The logger interface itself.
// ---------------------------------------------------
// Any logger must implement these methods, each corresponding
// to a LogLevel. They take arbitrary arguments (like console.log).
export type Logger = {
    debug: (...a: any[]) => void;  // Verbose developer info
    info: (...a: any[]) => void;   // General informational messages
    warn: (...a: any[]) => void;   // Warnings, recoverable issues
    error: (...a: any[]) => void;  // Errors, exceptions, critical events
};

// Example usage:
// const log: Logger = makeLogger("UserService");
// log.info("User added", { id: 123 });
// log.error("Failed to connect", err);


// ---------------------------------------------------
// EnableFn: A global or dynamic toggle function.
// ---------------------------------------------------
// Called at runtime to decide whether logging should run.
// Typically checks environment variables, NODE_ENV, or localStorage.
export type EnableFn = () => boolean;

// Example:
// setEnableRule(() => process.env.NODE_ENV !== "production");
// → Only enable logs in dev/test, disable in prod.


// ---------------------------------------------------
// ProxyOpts: Advanced config for auto-logging proxies.
// ---------------------------------------------------
// These options control *how* method call logging behaves when you
// wrap a service/class instance with `withDebugProxy`.
// ---------------------------------------------------
export type ProxyOpts = {
    /** Opt-out per method name.
     *  Return true to skip logging for that method.
     */
    optOut?: (method: string) => boolean;
    // Example:
    // optOut: (m) => ["chattyMethod", "render"].includes(m)

    /** Redact/transform arguments before logging.
     *  Useful for removing sensitive data (passwords, tokens).
     */
    redactArgs?: (args: any[], method: string) => any[];
    // Example:
    // redactArgs: (args, m) =>
    //   m === "login" ? ["<redacted>", "<redacted>"] : args

    /** Redact/transform results before logging.
     *  Useful for masking sensitive return values or truncating large data.
     */
    redactResult?: (result: any, method: string) => any;
    // Example:
    // redactResult: (res, m) =>
    //   m === "getUsers" ? `[${res.length} users]` : res

    /** Override log namespace for specific methods.
     *  Lets you group or rename logs per-method for clarity.
     */
    namespaceFor?: (method: string) => string | undefined;
    // Example:
    // namespaceFor: (m) => (m === "sync" ? "SyncJob" : undefined)
};
