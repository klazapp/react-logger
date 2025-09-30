# Klazapp React Logger

A tiny, flexible **TypeScript logger** for React and Node.js projects.  
It provides **namespaced logging**, **global toggles**, and **automatic instrumentation** via **proxies** and **decorators**.

---

## ⭐ Why use this?

Most projects begin with `console.log`. It works initially, but problems appear as the codebase grows:

- Logs become inconsistent and difficult to search
- Debug messages mix with warnings and errors
- Enabling or disabling logs requires code edits and redeployment
- Sensitive data may be exposed if not manually redacted

**Klazapp React Logger** addresses these issues with structured, configurable, and production-ready logging.

---

### 🔍 Comparison

| Aspect                  | `console.log`                       | React Logger                                          |
|-------------------------|-------------------------------------|-------------------------------------------------------|
| **Control**             | Hardcoded, requires code edits      | Runtime toggle via `DEBUG` env var or `localStorage.debug` |
| **Organization**        | Scattered, inconsistent             | Namespaced by feature/service                         |
| **Levels**              | None (all logs look the same)       | `debug`, `info`, `warn`, `error`                      |
| **Instrumentation**     | Manual, repetitive                  | Automatic via `withDebugProxy` or `@DebugLog` decorator |
| **Safety**              | Risk of leaking sensitive data      | Redaction options for args and results                |
| **Production**          | All logs bundled                   | Debug logs removable via dead-code elimination        |

---

### ✅ Key benefits

- **Global enable/disable toggle**: turn debug logs on or off at runtime without modifying source code
- **Namespaced logs**: group logs by feature or service (`UserService`, `Auth`, `PaymentFlow`)
- **Log levels**: structured severity categories (`debug`, `info`, `warn`, `error`)
- **Automatic instrumentation**:
    - Wrap objects with `withDebugProxy` to capture all method calls
    - Apply `@DebugLog` for fine-grained, per-method logging
- **Safe logging**: redact arguments or results to prevent sensitive data exposure
- **Dead-code elimination**: remove debug logs from production bundles to minimize size and risk
- **Cross-environment compatibility**: consistent usage in React frontend, Node backend, and shared libraries

---

## 📦 Installation

### From npm

```bash
npm i @klazapp/react-logger
```

### From GitHub

```bash
npm i github:klazapp/react-logger
```

---

## 🚀 Usage

### 1. Manual logging with namespaces

```ts
import { makeLogger } from "@klazapp/react-logger";

const log = makeLogger("UserService");

log.debug("fetching user", { id: 123 });
log.info("User created successfully");
log.warn("Retrying after failure");
log.error("Unexpected error", new Error("Oops"));
```

**Output:**

```
[UserService:debug] fetching user { id: 123 }
[UserService:info] User created successfully
[UserService:warn] Retrying after failure
[UserService:error] Unexpected error Error: Oops
```

---

### 2. Automatic logging with proxies

Wrap any service or object and log all method calls automatically:

```ts
import { withDebugProxy } from "@klazapp/react-logger";

class UserService {
  async getUser(id: string) {
    return { id, name: "Alice" };
  }
}

const userService = withDebugProxy(new UserService(), "UserService");

await userService.getUser("123");
```

**Output:**

```
[UserService.getUser:debug] → called with ["123"]
[UserService.getUser:debug] ← resolved with {"id":"123","name":"Alice"}
```

---

### 3. Method decorators (TypeScript only)

Enable decorators in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

Then use the `@DebugLog` decorator:

```ts
import { DebugLog } from "@klazapp/react-logger";

class PaymentService {
  @DebugLog()
  async processPayment(amount: number) {
    if (amount > 100) throw new Error("Limit exceeded");
    return { ok: true, amount };
  }
}

const service = new PaymentService();
await service.processPayment(50);
await service.processPayment(200).catch(() => {});
```

**Output:**

```
[PaymentService.processPayment:debug] → called with [50]
[PaymentService.processPayment:debug] ← resolved with {"ok":true,"amount":50}

[PaymentService.processPayment:debug] → called with [200]
[PaymentService.processPayment:error] ✖ threw Error: Limit exceeded
```

---

## ⚙️ Controlling logs

### In Node.js

Enable namespaces with the `DEBUG` env variable:

```bash
DEBUG="UserService,PaymentService" node app.js
```

Enable all:

```bash
DEBUG="*"
```

### In the browser

Set it in DevTools console:

```js
localStorage.debug = "UserService,*";
```

Then refresh the page.

---

## 🛠 Advanced features

* **Opt-out noisy methods**:

  ```ts
  const wrapped = withDebugProxy(service, "Service", {
    optOut: (method) => ["pollingLoop"].includes(method),
  });
  ```

* **Redact sensitive data**:

  ```ts
  withDebugProxy(service, "Auth", {
    redactArgs: (args) => ["***"],
  });
  ```

---

## 📖 Roadmap

* [ ] Structured JSON logs
* [ ] Browser-friendly pretty output
* [ ] Optional log shipping to backend

---

## 📜 License

MIT © Klazapp
