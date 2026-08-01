# Chapter 7: `this` Keyword + call / apply / bind

## 1. What is `this`?

`this` is a special keyword in JavaScript that refers to the **execution context** (the object that is currently executing the function).

Important rule:
> The value of `this` is determined by **how a function is called**, not by where it is defined (except for arrow functions).

---

## 2. The 4 Main Binding Rules (Order of Priority)

JavaScript decides the value of `this` using these rules (highest priority first):

| Priority | Rule                  | When it applies                          | `this` value                  |
|----------|-----------------------|------------------------------------------|-------------------------------|
| 1        | `new` binding         | Function called with `new`               | The newly created object      |
| 2        | Explicit binding      | Using `call`, `apply`, or `bind`         | The object you pass           |
| 3        | Implicit binding      | Function called as a method (`obj.fn()`) | The object before the dot     |
| 4        | Default binding       | Plain function call                      | `window` / `global` (or `undefined` in strict mode) |

Arrow functions are an exception — they use **lexical `this`**.

---

## 3. Default Binding

```js
function showThis() {
  console.log(this);
}

showThis(); // window (browser) or global (Node)
            // undefined in strict mode
```

```js
"use strict";
function showThis() {
  console.log(this);
}
showThis(); // undefined
```

---

## 4. Implicit Binding

When a function is called as a method of an object, `this` refers to that object.

```js
const user = {
  name: "Ashish",
  greet() {
    console.log(`Hello, ${this.name}`);
  }
};

user.greet(); // Hello, Ashish  ← this = user
```

### The Classic Pitfall

```js
const user = {
  name: "Ashish",
  greet() {
    console.log(`Hello, ${this.name}`);
  }
};

const greetFn = user.greet;
greetFn(); // Hello, undefined  (this became window/undefined)
```

Why? Because we lost the implicit binding when we extracted the method.

---

## 5. Explicit Binding — `call`, `apply`, `bind`

These methods allow us to **manually set** what `this` should be.

### 5.1 `call()`

```js
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const user = { name: "Ashish" };

greet.call(user, "Hello", "!"); // Hello, Ashish!
```

- First argument → the value of `this`
- Remaining arguments → passed one by one to the function

---

### 5.2 `apply()`

Almost the same as `call`, but arguments are passed as an **array**.

```js
greet.apply(user, ["Hi", "!!!"]); // Hi, Ashish!!!
```

Useful when you already have arguments in an array.

---

### 5.3 `bind()`

`bind` does **not** call the function immediately.  
It returns a **new function** with `this` permanently bound.

```js
const boundGreet = greet.bind(user, "Hey");

boundGreet("~"); // Hey, Ashish~
boundGreet("!!"); // Hey, Ashish!!
```

You can also partially apply arguments (partial application).

---

## 6. Comparison Table

| Feature                  | `call`                  | `apply`                     | `bind`                          |
|--------------------------|-------------------------|-----------------------------|---------------------------------|
| Calls the function now?  | Yes                     | Yes                         | No (returns new function)       |
| How arguments are passed | Individual              | As an array                 | Individual (can be partial)     |
| Returns                  | Function result         | Function result             | A new bound function            |
| Use case                 | Immediate call          | Immediate call with array   | Create a permanent bound function |

---

## 7. `new` Binding

When you use `new`, JavaScript:
1. Creates a new empty object
2. Sets `this` to that new object
3. Links the object to the constructor’s prototype
4. Returns the object (unless you explicitly return another object)

```js
function Person(name) {
  this.name = name;
}

const p = new Person("Ashish");
console.log(p.name); // Ashish
```

---

## 8. Arrow Functions — Lexical `this`

Arrow functions do **not** have their own `this`.  
They inherit `this` from the surrounding (lexical) scope.

```js
const user = {
  name: "Ashish",
  regular() {
    console.log("regular:", this.name);
  },
  arrow: () => {
    console.log("arrow:", this.name);
  }
};

user.regular(); // regular: Ashish
user.arrow();   // arrow: undefined (or window.name)
```

### Very useful inside methods / callbacks

```js
const counter = {
  count: 0,
  start() {
    setInterval(() => {
      this.count++;          // arrow inherits this from start()
      console.log(this.count);
    }, 1000);
  }
};

counter.start();
```

If you used a normal function inside `setInterval`, `this` would be lost.

---

## 9. Common Interview Questions (Q + A together)

**Q1. How is the value of `this` determined?**  
**A:** By the call-site (how the function is invoked), following the binding rules: `new` > explicit (`call`/`apply`/`bind`) > implicit > default. Arrow functions are lexical.

**Q2. What is the difference between `call` and `apply`?**  
**A:** Both set `this` and call the function immediately. `call` accepts arguments individually, `apply` accepts them as an array.

**Q3. What does `bind` return?**  
**A:** A new function with `this` (and optionally some arguments) permanently bound.

**Q4. Why does this fail?**
```js
const obj = {
  name: "Grok",
  greet() { console.log(this.name); }
};
const fn = obj.greet;
fn(); // undefined
```
**A:** Because the method was extracted. Implicit binding is lost. Use `fn.call(obj)` or `obj.greet.bind(obj)`.

**Q5. Do arrow functions have their own `this`?**  
**A:** No. They take `this` from the enclosing lexical scope.

**Q6. Can you re-bind an arrow function with `call`/`apply`/`bind`?**  
**A:** No. Arrow functions ignore `call`, `apply`, and `bind` when it comes to `this`.

**Q7. What happens when you do `new` on a bound function?**  
**A:** The `new` binding has higher priority. `this` will be the newly created object, ignoring the bound value.

---

## 10. Coding Challenges (Q + Solution together)

### Challenge 1
Fix this code so it prints "Ashish".

```js
const user = {
  name: "Ashish",
  greet() {
    console.log(this.name);
  }
};

const greet = user.greet;
greet(); // currently undefined
```

**Solution:**
```js
const greet = user.greet.bind(user);
greet(); // Ashish

// or
user.greet.call(user);
```

---

### Challenge 2
Implement your own simple version of `bind` (basic version).

**Solution:**
```js
Function.prototype.myBind = function(context, ...args) {
  const fn = this;
  return function(...newArgs) {
    return fn.apply(context, [...args, ...newArgs]);
  };
};
```

---

### Challenge 3
What will be the output?

```js
const obj = {
  name: "Grok",
  sayLater() {
    setTimeout(function() {
      console.log(this.name);
    }, 100);
  }
};

obj.sayLater();
```

**Solution:**  
`undefined` (or empty in browser).  
Because the callback is a normal function → default binding.

**Fixed versions:**
```js
// Using arrow
setTimeout(() => console.log(this.name), 100);

// Using bind
setTimeout(function() {
  console.log(this.name);
}.bind(this), 100);
```

---

### Challenge 4
Create a function `multiply` that can be partially applied using `bind`.

```js
function multiply(a, b) {
  return a * b;
}

const double = multiply.bind(null, 2);
console.log(double(5)); // 10
```

---

### Challenge 5
Explain the output:

```js
function Person(name) {
  this.name = name;
}

const obj = {};
Person.call(obj, "Ashish");
console.log(obj.name); // ?
```

**Solution:**  
`Ashish`  
We used explicit binding to set `this` to `obj`, so the property was added to `obj`.

---

## 11. Key Takeaways

- `this` is decided by **how** the function is called (call-site).
- Order of priority: `new` > explicit (`call`/`apply`/`bind`) > implicit > default.
- Arrow functions are lexical — they ignore `call`/`apply`/`bind` for `this`.
- `bind` is extremely useful for event handlers and partial application.
- Losing `this` when passing methods as callbacks is one of the most common JavaScript bugs.

---

**Related chapters:**
- [05 - Closures Deep Dive](./05-closures-deep-dive.md)
- [06 - Closure Memory Leaks](./06-closure-memory-leaks.md)
