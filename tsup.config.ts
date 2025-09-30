import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],   // Entry point(s) to bundle
    format: ["esm", "cjs"],    // Output both ES Modules (for modern imports) and CommonJS (for Node)
    dts: true,                 // Generate TypeScript declaration files (.d.ts)
    sourcemap: true,           // Include source maps for debugging
    clean: true,               // Remove old build files before each new build
    minify: false,             // Don’t minify output (keeps logs readable in dev)
    treeshake: true,           // Remove unused exports (tree-shaking)
    target: "es2020"           // Compile target (output JS syntax level)
});
