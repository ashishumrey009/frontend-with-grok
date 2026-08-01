# Chapter 3: TDZ + Hoisting Interview Questions

Questions and answers are shown together so you don't need to scroll.

---

### Question 1

```js
var x = 1;

function foo() {
  console.log(x);
  let x = 2;
}

foo();
```

**Answer:**  
`ReferenceError: Cannot access 'x' before initialization`

**Why?**  
Even though a global `var x = 1` exists, inside `foo()` the `let x` creates a new binding. This local binding enters TDZ as soon as the function is called. So `console.log(x)` hits the local `x` (still in TDZ), not the global one.

---

### Question 2

```js
function test() {
  console.log(a);
  console.log(b);
  console.log(c);

  var a = 1;
  let b = 2;
  const c = 3;
}

test();
```

**Answer:**  
```
undefined
ReferenceError
ReferenceError
```

**Why?**  
- `var a` is hoisted and initialized with `undefined`
- `let b` and `const c` are hoisted but stay in TDZ → accessing them throws error

---

### Question 3

```js
let a = 10;

function example() {
  console.log(a);

  if (true) {
    let a = 20;
  }
}

example();
```

**Answer:**  
`10`

**Why?**  
The `let a = 20` is inside the `if` block only. Outside that block the outer `a` (value 10) is visible. No TDZ issue here.

---

### Question 4

```js
function mystery() {
  console.log(typeof value);
  
  if (false) {
    let value = "hello";
  }
}

mystery();
```

**Answer:**  
`"undefined"`

**Why?**  
The `if (false)` block is never entered, so no binding for `value` is created in the outer scope. `typeof` treats it as an undeclared variable → returns `"undefined"`.

---

### Question 5

```js
const x = 1;

{
  console.log(x);
  const x = 2;
}
```

**Answer:**  
`ReferenceError: Cannot access 'x' before initialization`

**Why?**  
The block creates a new lexical environment. The inner `const x = 2` enters TDZ the moment the block starts. `console.log(x)` hits the inner `x` which is still in TDZ.

---

### Question 6

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 0);
}
```

**Answer:**  
```
3
3
3
0
1
2
```

**Why?**  
- `var i` is function-scoped → only one `i`. By the time timeouts run, loop finished and `i === 3`.
- `let j` is block-scoped → each iteration creates a new binding of `j`. Each timeout closes over a different `j`.

---

### Question 7

```js
function createFunctions() {
  var result = [];

  for (var i = 0; i < 3; i++) {
    result[i] = function () {
      return i;
    };
  }

  return result;
}

const funcs = createFunctions();
console.log(funcs[0]());
console.log(funcs[1]());
console.log(funcs[2]());
```

**Answer:**  
```
3
3
3
```

**How to fix with let:**
```js
for (let i = 0; i < 3; i++) {
  result[i] = function () {
    return i;
  };
}
```
Now it prints `0 1 2` because each iteration gets its own `i`.

---

### Question 8

```js
function demo(x = y, y = 2) {
  console.log(x, y);
}

demo();
```

**Answer:**  
`ReferenceError: Cannot access 'y' before initialization`

**Why?**  
Default parameters are evaluated left-to-right. When evaluating `x = y`, the variable `y` is still in TDZ.

---

### Pro Interview Tip

When interviewers ask about TDZ + Hoisting they want to see if you understand:

1. Difference between **creation** and **initialization** of variables
2. That `let`/`const` create bindings at the beginning of the scope (but stay uninitialized)
3. Shadowing behavior
4. Why `var` causes bugs in loops with closures
