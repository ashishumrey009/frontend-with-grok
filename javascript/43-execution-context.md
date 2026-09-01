# Chapter 43: Execution Context

**Interviewer:** Execution context kya hai?

**Tum:**

"Har function call pe JS ek execution context banata hai — usme variables, `this`, scope chain. Global se start, Call Stack pe push/pop. Closures lexical environment ko yaad rakhte hain."

---

## Types

1. **Global Execution Context (GEC)** — script start
2. **Function Execution Context (FEC)** — har call
3. **Eval** (ignore in interviews mostly)

---

## Two phases

**Creation**
- `var` → `undefined` (hoist)
- `let`/`const` → TDZ
- Function declarations → memory
- `this` bind
- Outer lexical environment pointer

**Execution**
- Line by line assign + run

---

## Call Stack

```text
one() {
  two();
}

GEC
 ↓ one() push
 ↓ two() push
 ↓ two pop
 ↓ one pop
GEC
```

Stack overflow = infinite recursion.

---

## Lexical Environment

```js
function outer() {
  const x = 10;
  function inner() {
    console.log(x); // outer se
  }
  return inner;
}
```

`inner` ka context destroy hone ke baad bhi `x` closure se zinda.

---

## Connects to

| Concept | Relation |
|---------|----------|
| Hoisting / TDZ | Creation phase |
| Scope chain | Outer env pointer |
| `this` | Context creation |
| Closure | FEC gone, lexical env remains |
| Event loop | Stack empty tab queues |

---

## Interview Q&A

**Q1. GEC kab banta hai?**  
→ Script load.

**Q2. Har function call naya context?**  
→ Haan. Alag `this` + variables.

**Q3. Closure vs context?**  
→ Context stack se hat jata hai. Closure uske variables pack karke rakhta hai.

---

## Ek Line Summary

> "Execution context = function/script ka runtime box (vars + this + scope). Creation mein hoist, execution mein chal. Stack pe push/pop. Closure lexical env save karta hai."
