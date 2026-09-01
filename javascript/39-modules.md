# Chapter 39: Modules (import / export)

**Interviewer:** Named vs default export? Modules kyun?

**Tum:**

"Modules code ko files mein split karte hain. Named export multiple, default ek. Import static (build time) ya dynamic `import()`."

---

## Named export

```js
// utils.js
export const add = (a, b) => a + b;
export function sub(a, b) { return a - b; }

// app.js
import { add, sub } from "./utils.js";
import { add as plus } from "./utils.js";
```

---

## Default export

```js
export default function App() {}
import App from "./App.js";
import Anything from "./App.js"; // naam kuch bhi
```

File mein **ek** default.

---

## Mix

```js
import App, { add } from "./mod.js";
```

---

## Dynamic import

```js
const mod = await import("./heavy.js");
mod.doWork();
```

Code-splitting / lazy load (React.lazy isi pe).

---

## Rules

- Modules automatically **strict mode**
- Top-level `await` modules mein allowed
- Browser: `<script type="module">`
- Circular imports careful — live bindings

---

## CommonJS vs ESM

| | CommonJS | ESM |
|--|----------|-----|
| Syntax | `require` / `module.exports` | `import` / `export` |
| Load | Runtime, sync (Node classic) | Static / async |
| Use | Purana Node | Modern JS + React |

---

## Interview Q&A

**Q1. Default vs named?**  
→ Default ek, naam rename free. Named exact names, tree-shake friendly.

**Q2. Dynamic import kab?**  
→ Lazy route / heavy lib.

**Q3. IIFE vs modules?**  
→ IIFE old private scope. Modules native split + reuse.

---

## Ek Line Summary

> "Named = many named bindings. Default = one main thing. Dynamic import() = lazy load. Modules strict + reusable files."
