# Chapter 34: Functions — Arrow vs Regular, IIFE, HOF, Currying

**Interviewer:** Arrow vs regular function, HOF, currying explain karo.

**Tum:**

"Arrow function ka apna `this` nahi — lexical this. Regular function call-site se `this` leti hai. HOF function ko argument/return karti hai. Currying multi-arg ko chain of unary functions banata hai."

---

## 1. Declaration vs Expression vs Arrow

```js
function add(a, b) { return a + b; }      // hoisted
const mul = function (a, b) { return a * b; }; // not hoisted
const div = (a, b) => a / b;              // lexical this, no arguments, no construct
```

---

## 2. Arrow vs Regular

| Feature | Regular | Arrow |
|---------|---------|-------|
| `this` | Call-site | Lexical (parent) |
| `arguments` | Haan | Nahi |
| `new` | Haan | Nahi (TypeError) |
| `prototype` | Haan | Nahi |
| Hoisting | Declaration hoisted | Nahi |

```js
const obj = {
  name: "Ashish",
  regular: function () { console.log(this.name); },
  arrow: () => console.log(this.name),
};
obj.regular(); // Ashish
obj.arrow();   // undefined (window/undefined)
```

Callbacks / React handlers mein arrow useful — `this` lock.

---

## 3. IIFE

```js
(function () {
  var secret = 1; // scope leak nahi
})();

(() => { console.log("arrow IIFE"); })();
```

Pehle modules se pehle private scope ke liye.

---

## 4. Higher-Order Function (HOF)

Function jo function **leta** hai ya **return** karta hai.

```js
function withLog(fn) {
  return function (...args) {
    console.log("calling", fn.name);
    return fn(...args);
  };
}

const addLogged = withLog(function add(a, b) { return a + b; });
addLogged(2, 3); // 5
```

`map`, `filter`, `setTimeout`, React `memo` — sab HOF.

---

## 5. Currying

```js
function curryAdd(a) {
  return function (b) {
    return function (c) {
      return a + b + c;
    };
  };
}
curryAdd(1)(2)(3); // 6

const add = (a) => (b) => (c) => a + b + c;
```

Generic idea:
```js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return (...next) => curried(...args, ...next);
  };
}
const sum = (a, b, c) => a + b + c;
curry(sum)(1)(2)(3); // 6
```

**Partial application** = kuch args pehle fix. Currying = har baar ek (ya grouped) arg.

---

## 6. Pure function

Same input → same output, no side effect.

```js
const pure = (x) => x * 2;          // ✅
let n = 0;
const impure = () => ++n;           // ❌
```

React state updates ke liye purity important.

---

## Interview Q&A

**Q1. Arrow ka `this`?**  
→ Lexical — surrounding scope se.

**Q2. HOF kya hai?**  
→ Function that takes or returns a function.

**Q3. Currying kyun?**  
→ Reuse, composition, partial config (`addTax(0.18)(price)`).

**Q4. Arrow se constructor?**  
→ Nahi. `new` error.

---

## Ek Line Summary

> "Arrow = lexical this, no new/arguments. HOF = function in/out. Currying = f(a,b,c) → f(a)(b)(c). IIFE = turant private scope."
