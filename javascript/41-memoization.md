# Chapter 41: Memoization

**Interviewer:** Memoization kya hai? Implement karo.

**Tum:**

"Same input pe function dubara compute na kare — result cache. Pure functions pe kaam karta hai. React mein `useMemo` / `React.memo` isi idea pe."

---

## Basic

```js
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const slowFib = (n) => (n <= 1 ? n : slowFib(n - 1) + slowFib(n - 2));
const fib = memoize(function f(n) {
  return n <= 1 ? n : fib(n - 1) + fib(n - 2);
});
```

Better key for objects: `WeakMap` per-arg ya custom serializer. `JSON.stringify` order/function pe toot sakta hai.

---

## vs Debounce / Cache

| | Memoize | Debounce |
|--|---------|----------|
| Goal | Same input skip compute | Rapid calls skip until pause |
| Store | Input → output | Timer |

---

## React connection

- `useMemo(() => compute(a), [a])` — value cache
- `useCallback(fn, deps)` — function identity cache
- `React.memo(Component)` — props same toh skip re-render

---

## Interview Q&A

**Q1. Kab use?**  
→ Expensive pure calc, recursion (fib), React heavy render.

**Q2. Kab nahi?**  
→ Impure fn, huge unique inputs (cache blow), memory tight.

**Q3. Cache leak?**  
→ Unbounded Map. LRU / size cap.

---

## Ek Line Summary

> "Memoization = input se output cache. Pure functions only. React.memo / useMemo same idea at UI layer."
