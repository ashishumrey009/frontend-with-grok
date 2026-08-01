# Chapter 4: Coding Challenges – TDZ + Hoisting

Questions and solutions are shown together.

---

### Challenge 1: Predict the output

```js
console.log(a);
console.log(b);
console.log(c);

var a = 1;
let b = 2;
const c = 3;
```

**Solution:**
```
undefined
ReferenceError: Cannot access 'b' before initialization
```
(The third console.log never runs because the second one throws.)

**Explanation:**  
var is hoisted + initialized with undefined. let and const are in TDZ.

---

### Challenge 2: Fix the code so it prints 0 1 2

```js
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);
  }, 100);
}
```

**Solution (using let):**
```js
for (let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);
  }, 100);
}
```

**Alternative solution (using IIFE with var):**
```js
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(function() {
      console.log(j);
    }, 100);
  })(i);
}
```

---

### Challenge 3: What will this print?

```js
let x = 10;

function test() {
  console.log(x);
  let x = 20;
}

test();
```

**Solution:**  
`ReferenceError: Cannot access 'x' before initialization`

**Explanation:**  
The inner `let x` shadows the outer one and puts the local `x` into TDZ for the whole function body.

---

### Challenge 4: Make this code work without changing the order of lines much

```js
console.log(greeting);
const greeting = "Hello Grok";
```

**Solution:**  
You cannot make it work while keeping `const`. Change to `var`:

```js
console.log(greeting); // undefined
var greeting = "Hello Grok";
```

Or move the declaration above:

```js
const greeting = "Hello Grok";
console.log(greeting); // Hello Grok
```

---

### Challenge 5: Predict output

```js
function outer() {
  var a = 1;

  function inner() {
    console.log(a);
    var a = 2;
  }

  inner();
}

outer();
```

**Solution:**  
`undefined`

**Explanation:**  
Inside `inner`, `var a` is function-scoped to `inner`. It is hoisted and initialized with `undefined`. So it shadows the outer `a` and prints `undefined`.

---

### Challenge 6: Will this throw error?

```js
{
  console.log(typeof x);
  let x = 5;
}
```

**Solution:**  
Yes → `ReferenceError: Cannot access 'x' before initialization`

**Explanation:**  
`typeof` does **not** protect against TDZ. The block creates a binding for `x` immediately, so it is in TDZ when `typeof` runs.

---

### Challenge 7: Fix using const / let (no var)

```js
function createCounter() {
  var counters = [];

  for (var i = 0; i < 3; i++) {
    counters.push(function() {
      return i;
    });
  }

  return counters;
}

const counters = createCounter();
console.log(counters[0]()); // should be 0
console.log(counters[1]()); // should be 1
console.log(counters[2]()); // should be 2
```

**Solution:**
```js
function createCounter() {
  const counters = [];

  for (let i = 0; i < 3; i++) {
    counters.push(function() {
      return i;
    });
  }

  return counters;
}
```

---

### Challenge 8: What happens here?

```js
const a = 5;

if (true) {
  console.log(a);
  const a = 10;
}
```

**Solution:**  
`ReferenceError: Cannot access 'a' before initialization`

**Explanation:**  
Inner `const a` shadows the outer one. The whole `if` block has the inner `a` in TDZ when `console.log` runs.

---

### Challenge 9: Write a function that demonstrates TDZ clearly

**Task:** Write a small code snippet that forces a TDZ error and also shows a case where var would have given undefined.

**Example Solution:**
```js
console.log("=== var behavior ===");
console.log(x); // undefined
var x = 10;

console.log("=== let behavior ===");
try {
  console.log(y); // throws
  let y = 20;
} catch (err) {
  console.log(err.message);
}
```

---

### Challenge 10: Real-world style

```js
function processUser(user = defaultUser) {
  const defaultUser = { name: "Guest" };
  console.log(user);
}

processUser();
```

**Solution:**  
`ReferenceError: Cannot access 'defaultUser' before initialization`

**Explanation:**  
Default parameter `user = defaultUser` is evaluated before the function body runs. At that moment `defaultUser` is still in TDZ.

**Correct version:**
```js
function processUser(user = { name: "Guest" }) {
  console.log(user);
}
```
or
```js
const defaultUser = { name: "Guest" };

function processUser(user = defaultUser) {
  console.log(user);
}
```
