# React Chapter 05: useState + useEffect Polyfill

**Interviewer:** useState / useEffect ka mini polyfill likho.

**Tum:**

"Hooks ek array pe order se store hote hain. Har render pe index 0 se start. useState us slot se value/setter deta hai. useEffect deps compare karke effect + cleanup chalaata hai. Rules of Hooks isliye hain — order break mat karo."

Yeh **mini React** hai — interview mein itna kaafi. Real React Fiber + lanes use karta hai.

---

## Core idea — Hook array

```text
hooks = [ hook0, hook1, hook2, ... ]
cursor = 0   // har render reset

useState()  → hooks[cursor++]
useEffect() → hooks[cursor++]
```

Pehli render: slot create.  
Agli render: **same index** se wahi slot.

Isliye hooks ko `if` / loop mein nahi likhte.

---

## 1. Mini renderer + useState polyfill

```js
let hooks = [];
let cursor = 0;
let rerender;

function useState(initial) {
  const i = cursor++;

  if (hooks[i] === undefined) {
    hooks[i] =
      typeof initial === "function" ? initial() : initial;
  }

  const setState = (next) => {
    const prev = hooks[i];
    const value = typeof next === "function" ? next(prev) : next;

    if (Object.is(value, prev)) return; // same value = no render

    hooks[i] = value;
    rerender();
  };

  return [hooks[i], setState];
}

function render(Component) {
  cursor = 0;
  const el = Component();
  console.log("UI:", el);
  return el;
}

function start(Component) {
  rerender = () => render(Component);
  render(Component);
}

// Demo
function Counter() {
  const [count, setCount] = useState(0);

  return {
    count,
    inc: () => setCount((c) => c + 1),
  };
}

start(Counter);
// UI: { count: 0, inc: fn }
```

**Kya cover hua:**
- lazy init (`typeof initial === "function"`)
- functional updater (`setCount(c => c + 1)`)
- `Object.is` se bail out (React 16+)

---

## 2. useEffect polyfill

```js
function depsChanged(prev, next) {
  if (prev === undefined) return true; // first run
  if (prev.length !== next.length) return true;
  return next.some((d, i) => !Object.is(d, prev[i]));
}

function useEffect(effect, deps) {
  const i = cursor++;
  const prev = hooks[i]; // { deps, cleanup }

  const changed = !deps || depsChanged(prev?.deps, deps);

  if (changed) {
    prev?.cleanup?.();

    const cleanup = effect();
    hooks[i] = {
      deps,
      cleanup: typeof cleanup === "function" ? cleanup : undefined,
    };
  } else {
    hooks[i] = prev;
  }
}
```

**Deps rules (same as React):**

| deps | Behavior |
|------|----------|
| `undefined` (no array) | Har render |
| `[]` | Sirf pehli baar + unmount cleanup |
| `[id]` | `id` change pe |

Real React effect **paint ke baad** (async) chalta hai. Interview mini version sync chalega — yeh baat bol dena.

---

## 3. Dono saath (complete mini React)

```js
let hooks = [];
let cursor = 0;
let rerender;

function depsChanged(prev, next) {
  if (prev === undefined) return true;
  if (prev.length !== next.length) return true;
  return next.some((d, i) => !Object.is(d, prev[i]));
}

function useState(initial) {
  const i = cursor++;
  if (hooks[i] === undefined) {
    hooks[i] = typeof initial === "function" ? initial() : initial;
  }
  const setState = (next) => {
    const prev = hooks[i];
    const value = typeof next === "function" ? next(prev) : next;
    if (Object.is(value, prev)) return;
    hooks[i] = value;
    rerender();
  };
  return [hooks[i], setState];
}

function useEffect(effect, deps) {
  const i = cursor++;
  const prev = hooks[i];
  if (!deps || depsChanged(prev?.deps, deps)) {
    prev?.cleanup?.();
    const cleanup = effect();
    hooks[i] = {
      deps,
      cleanup: typeof cleanup === "function" ? cleanup : undefined,
    };
  }
}

function render(Component) {
  cursor = 0;
  return Component();
}

function start(Component) {
  rerender = () => render(Component);
  render(Component);
}
```

Unmount pe saari cleanups:
```js
function unmount() {
  hooks.forEach((h) => h?.cleanup?.());
  hooks = [];
  cursor = 0;
}
```

---

## 4. Demo — stale fix + cleanup

```js
function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("effect count =", count);
    return () => console.log("cleanup count =", count);
  }, [count]);

  return {
    count,
    inc: () => setCount((c) => c + 1),
  };
}
```

Flow:
```text
mount     → effect(0)
inc       → cleanup(0) → effect(1)
inc       → cleanup(1) → effect(2)
unmount   → cleanup(2)
```

---

## 5. Rules of Hooks — polyfill se clear

```js
// ❌ order break
function Bad({ flag }) {
  if (flag) useState(0); // kabhi slot 0, kabhi nahi
  useState(1);
}
```

Agar pehli render pe 2 hooks, doosri pe 1 — **galat slot**, state mix-up.

```js
// ✅ order fixed
function Good({ flag }) {
  const [a] = useState(0);
  const [b] = useState(1);
  if (flag) console.log(a);
}
```

---

## 6. Interview mein extra points

**Batching (simple):**
```js
let pending = false;
function schedule() {
  if (pending) return;
  pending = true;
  queueMicrotask(() => {
    pending = false;
    rerender();
  });
}
// setState ke andar rerender() ki jagah schedule()
```

**useRef polyfill (bonus, 2 line):**
```js
function useRef(initial) {
  const i = cursor++;
  if (hooks[i] === undefined) hooks[i] = { current: initial };
  return hooks[i];
}
```
Ref change se re-render nahi — kyunki setState nahi.

**useMemo polyfill:**
```js
function useMemo(factory, deps) {
  const i = cursor++;
  const prev = hooks[i];
  if (!prev || depsChanged(prev.deps, deps)) {
    hooks[i] = { deps, value: factory() };
  }
  return hooks[i].value;
}
```

---

## Interview Q&A

**Q1. Hook state kahan store hoti hai?**  
→ Component fiber pe linked list / array. Mini polyfill mein `hooks[]` + `cursor`.

**Q2. Kyun hooks top-level?**  
→ Index se identify. Conditional hook = galat slot.

**Q3. setState same value pe re-render?**  
→ React `Object.is` se skip. Polyfill mein bhi yeh check daalo.

**Q4. useEffect cleanup kab?**  
→ Deps change se pehle + unmount.

**Q5. Real React vs yeh polyfill?**  
→ Real: Fiber, render/commit, effect list paint ke baad, batching, Strict Mode double invoke. Polyfill teaching model hai.

**Q6. Multiple useState kaise alag rehte hain?**  
→ Alag indexes. `cursor++` har call pe.

---

## Ek Line Summary

> "Hooks array + cursor. useState slot mein value rakhta hai, setState slot update + rerender. useEffect deps `Object.is` se compare karke cleanup + effect. Order fix rakho — yahi Rules of Hooks hai."
