# Chapter 1: Scope, var vs let vs const

## What is Scope?

**Scope** means where a variable is accessible in your code.

There are 3 main types:

| Type of Scope      | Description                                      | Keywords          |
|--------------------|--------------------------------------------------|-------------------|
| **Global Scope**   | Accessible everywhere                            | var, let, const   |
| **Function Scope** | Accessible only inside the function              | var               |
| **Block Scope**    | Accessible only inside `{ }` (if, for, while...) | let, const        |

---

## var (Function Scoped - Old way)

- Function scoped (not block scoped)
- Can be re-declared
- Can be re-assigned
- Hoisted and initialized with `undefined`

```js
function test() {
  if (true) {
    var x = 10;
  }
  console.log(x); // 10  ← still accessible
}
test();
```

```js
console.log(a); // undefined (hoisted)
var a = 5;
```

```js
var name = "Ashish";
var name = "Grok"; // No error
```

---

## let (Block Scoped)

- Block scoped
- Can be re-assigned
- Cannot be re-declared in same scope
- Hoisted but stays in Temporal Dead Zone (TDZ)

```js
function test() {
  if (true) {
    let x = 10;
  }
  console.log(x); // ReferenceError
}
```

```js
console.log(b); // ReferenceError (TDZ)
let b = 20;
```

```js
let age = 25;
let age = 30; // SyntaxError
age = 30;     // This is allowed
```

---

## const (Block Scoped + Constant)

- Block scoped (same as let)
- Cannot be re-assigned
- Cannot be re-declared
- Must be initialized at declaration
- Also has TDZ

```js
const PI = 3.14;
PI = 3.14159; // TypeError

const name; // SyntaxError
```

**Important about objects/arrays:**

```js
const person = { name: "Ashish" };
person.name = "Grok"; // Works (mutation allowed)
person = {};          // Error (re-assignment not allowed)
```

---

## Quick Comparison

| Feature               | var              | let             | const            |
|-----------------------|------------------|-----------------|------------------|
| Scope                 | Function         | Block           | Block            |
| Hoisting              | Yes (undefined)  | Yes (TDZ)       | Yes (TDZ)        |
| Re-declare            | Yes              | No              | No               |
| Re-assign             | Yes              | Yes             | No               |
| Must initialize       | No               | No              | Yes              |
| Temporal Dead Zone    | No               | Yes             | Yes              |
| Preferred today       | No               | Yes             | Yes (default)    |

---

## Best Practice

- Use `const` by default
- Use `let` only when the value will change
- Almost never use `var` in modern JavaScript
