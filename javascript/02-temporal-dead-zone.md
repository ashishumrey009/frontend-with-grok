# Chapter 2: Temporal Dead Zone (TDZ) Mechanics

## What is Temporal Dead Zone?

The **Temporal Dead Zone** is the period between when a variable **enters its scope** and when it is **actually declared/initialized**.

During this time the variable exists in memory but is in an **uninitialized** state. Accessing it throws a `ReferenceError`.

---

## How it works step-by-step

```js
console.log(x); // ReferenceError
let x = 10;
```

1. Scope is entered → JavaScript creates a binding for `x` in the Lexical Environment.
2. The binding is created but **not initialized** (special internal state).
3. **TDZ starts** from this moment until the `let x = 10` line runs.
4. Any access during TDZ → `ReferenceError: Cannot access 'x' before initialization`
5. Declaration line is reached → variable is initialized → TDZ ends.
6. After that, normal access is allowed.

### Visual Timeline

```
Scope Entered
│
│  ┌────── Temporal Dead Zone ──────┐
│  │  x exists but is uninitialized                 │
│  │  Accessing x → ReferenceError                  │
│  └─────────────────────────────────────────────┘
│
let x = 10;   ← Initialization happens, TDZ ends
│
x is now usable
```

---

## Why var has no TDZ

```js
console.log(y); // undefined
var y = 20;
```

`var` is hoisted **and initialized with `undefined`** immediately when the scope is entered. No "uninitialized" state → no TDZ.

---

## TDZ applies to both let and const

```js
console.log(a); // ReferenceError
let a = 5;

console.log(b); // ReferenceError
const b = 10;
```

---

## Important Cases of TDZ

### 1. Simple access before declaration
```js
console.log(name); // ReferenceError
let name = "Ashish";
```

### 2. Using variable in its own declaration
```js
let x = x + 1; // ReferenceError
```

### 3. Function that tries to access before declaration
```js
function test() {
  console.log(value); // ReferenceError
}
test();
let value = 100;
```

### 4. Default parameters
```js
function example(a = b, b = 2) {
  // when evaluating a = b, b is still in TDZ
}
example(); // ReferenceError
```

### 5. typeof also respects TDZ
```js
console.log(typeof undeclaredVar); // "undefined" (safe)
console.log(typeof letVar);        // ReferenceError
let letVar = 10;
```

---

## Why was TDZ introduced?

1. Catch bugs early (accessing before declaration is almost always a mistake)
2. Consistency with `const` (which must be initialized)
3. Better mental model — variables should only be usable after their declaration line

---

## Quick Summary

| Feature                     | var                  | let / const               |
|----------------------------|----------------------|---------------------------|
| Hoisted                    | Yes                  | Yes                       |
| Initialized on hoist       | Yes (`undefined`)    | No (uninitialized)        |
| Temporal Dead Zone         | No                   | Yes                       |
| Access before declaration  | Returns `undefined`  | Throws `ReferenceError`   |
