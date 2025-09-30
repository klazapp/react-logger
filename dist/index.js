// src/logger.ts
var defaultEnabled = () => {
  if (typeof window === "undefined") {
    return process.env.NODE_ENV !== "production";
  }
  const ls = window.localStorage?.getItem("debug");
  return ls && ls !== "false" || process.env.NODE_ENV !== "production";
};
var _isEnabled = defaultEnabled;
function setEnableRule(fn) {
  _isEnabled = fn;
}
function makeLogger(ns) {
  const emit = (lvl) => (...a) => {
    if (!_isEnabled() && lvl === "debug") return;
    console[lvl === "debug" ? "log" : lvl](`[${ns}]`, ...a);
  };
  return {
    debug: emit("debug"),
    info: emit("info"),
    warn: emit("warn"),
    error: emit("error")
  };
}
var makeDevLogger = (ns) => {
  if (typeof __DEV__ !== "undefined" && !__DEV__) {
    const noop = () => {
    };
    return { debug: noop, info: noop, warn: noop, error: noop };
  }
  return makeLogger(ns);
};

// src/withDebugProxy.ts
function withDebugProxy(obj, name, opts = {}) {
  const baseLog = makeLogger(name);
  return new Proxy(obj, {
    get(target, prop, receiver) {
      const orig = Reflect.get(target, prop, receiver);
      if (typeof orig !== "function") return orig;
      const methodName = String(prop);
      if (opts.optOut?.(methodName)) return orig;
      const ns = opts.namespaceFor?.(methodName) ?? `${name}.${methodName}`;
      const log = makeLogger(ns);
      return function(...args) {
        const a = opts.redactArgs ? opts.redactArgs(args, methodName) : args;
        log.debug("\u25B6 args:", a);
        try {
          const out = orig.apply(target, args);
          if (out && typeof out.then === "function") {
            return out.then((res) => {
              const r2 = opts.redactResult ? opts.redactResult(res, methodName) : res;
              log.debug("\u2705 result:", r2);
              return res;
            }).catch((err) => {
              baseLog.error(`\u274C error in ${methodName}:`, err);
              throw err;
            });
          }
          const r = opts.redactResult ? opts.redactResult(out, methodName) : out;
          log.debug("\u2705 result:", r);
          return out;
        } catch (err) {
          baseLog.error(`\u274C error in ${methodName}:`, err);
          throw err;
        }
      };
    }
  });
}

// src/decorators.ts
function DebugLog(ns) {
  return function(_, key, d) {
    const orig = d.value;
    d.value = function(...args) {
      const log = makeLogger(ns ?? key);
      log.debug("\u25B6 args:", args);
      try {
        const out = orig.apply(this, args);
        if (out && typeof out.then === "function") {
          return out.then((res) => {
            log.debug("\u2705 result:", res);
            return res;
          }).catch((err) => {
            log.error("\u274C error:", err);
            throw err;
          });
        }
        log.debug("\u2705 result:", out);
        return out;
      } catch (e) {
        log.error("\u274C error:", e);
        throw e;
      }
    };
  };
}

export { DebugLog, makeDevLogger, makeLogger, setEnableRule, withDebugProxy };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map