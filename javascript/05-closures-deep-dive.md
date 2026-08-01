# Chapter 5: JavaScript Closures – Deep Dive

## 1. What is a Closure?

A **closure** is created when a function remembers and can access variables from its **outer (enclosing) scope**, even after that outer function has finished executing.

In simple words:
> A function that “remembers” the environment in which it was created.

---

## 2. The Foundation: Lexical Scoping

JavaScript uses **lexical scoping** (also called static scoping).

This means the scope of a variable is determined by **where it is written in the source code**, not by where the function is called.

```js
function outer() {
  const message = "Hello from outer";

  function inner() {
    console.log(message); // has access to message
  }

  return inner;
}

const myFunc = outer();
myFunc(); // "Hello from outer"
```

Even though `outer()` has finished running, `inner` still remembers `message`.  
That memory is the **closure**.

---

## 3. How Closures Work Internally

When a function is created, it gets a hidden property called `[[Environment]]` that points to the **Lexical Environment** in which it was created.

When the outer function finishes:
- Its execution context is removed from the call stack
- But the Lexical Environment is kept alive in memory as long as any inner function still references it

This retained Lexical Environment is what we call the **closure**.

### Visual Model

```
outer() is called
│
├─ creates Lexical Environment { message: "Hello from outer" }
│
├─ creates inner function → inner.[[Environment]] = that Lexical Environment
│
├─ returns inner
│
outer() finishes → its execution context is gone
│
But the Lexical Environment stays alive because inner still points to it
│
When we call myFunc() later → it still can access message
```

---

## 4. Classic Examples

### Example 1: Basic Closure

```js
function makeCounter() {
  let count = 0;

  return function() {
    count++;
    return count;
  };
}

const counter1 = makeCounter();
console.log(counter1()); // 1
console.log(counter1()); // 2
console.log(counter1()); // 3

const counter2 = makeCounter(); // independent closure
console.log(counter2()); // 1
```

Each call to `makeCounter()` creates a **new** Lexical Environment, so `counter1` and `counter2` are completely independent.

---

### Example 2: Private Variables (Data Encapsulation)

```js
function createBankAccount(initialBalance) {
  let balance = initialBalance; // private

  return {
    deposit(amount) {
      balance += amount;
      return balance;
    },
    withdraw(amount) {
      if (amount > balance) return "Insufficient funds";
      balance -= amount;
      return balance;
    },
    getBalance() {
      return balance;
    }
  };
}

const account = createBankAccount(1000);
console.log(account.getBalance()); // 1000
console.log(account.deposit(500)); // 1500
console.log(account.withdraw(200)); // 1300
console.log(account.balance); // undefined (private)
```

This is one of the most powerful real-world uses of closures — creating private state.

---

### Example 3: Function Factory / Partial Application

```js
function multiply(a) {
  return function(b) {
    return a * b;
  };
}

const double = multiply(2);
const triple = multiply(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15
```

---

### Example 4: Closures in Callbacks & Event Listeners

```js
function setupButton(id, message) {
  const button = document.getElementById(id);

  button.addEventListener("click", function() {
    console.log(message); // remembers the message from outer scope
  });
}

setupButton("btn1", "Button 1 clicked");
setupButton("btn2", "Button 2 clicked");
```

---

## 5. Common Pitfall: Closures inside Loops

### The Famous Bug (with var)

```js
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);
  }, 100);
}
// Output: 3 3 3
```

**Why?**  
`var` is function-scoped. There is only **one** `i`. By the time the timeouts run, the loop is finished and `i === 3`.

### Solutions

**Solution 1: Use let (modern & clean)**
```js
for (let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);
  }, 100);
}
// Output: 0 1 2
```
`let` creates a **new binding** on every iteration.

**Solution 2: IIFE (old school)**
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

## 6. Closures and Memory

Closures keep the outer variables alive in memory.

This is useful, but can cause **memory leaks** if you are not careful:

```js
function heavyOperation() {
  const hugeData = new Array(1000000).fill("data");

  return function() {
    console.log(hugeData[0]); // still holds reference to hugeData
  };
}

const fn = heavyOperation();
// hugeData cannot be garbage collected as long as fn exists
```

**Best practice:** Only close over what you actually need.

---

## 7. Module Pattern (Before ES Modules)

```js
const Calculator = (function() {
  let result = 0; // private

  return {
    add(x) {
      result += x;
      return this;
    },
    subtract(x) {
      result -= x;
      return this;
    },
    getResult() {
      return result;
    }
  };
})();

Calculator.add(10).subtract(3);
console.log(Calculator.getResult()); // 7
```

This pattern was extremely popular before ES6 modules.

---

## 8. Interview Questions (Q + A together)

### Q1. What is a closure?
**A:** A closure is a function that has access to variables from its outer lexical scope even after the outer function has returned.

### Q2. Are closures created only when we return a function?
**A:** No. A closure is created whenever an inner function is defined that references variables from an outer scope. Returning it just allows us to use it later.

### Q3. What will this print?
```js
function outer() {
  let count = 0;
  return function() {
    return ++count;
  };
}
const c1 = outer();
const c2 = outer();
console.log(c1());
console.log(c1());
console.log(c2());
```
**A:** `1 2 1`  
Each call to `outer()` creates a separate closure.

### Q4. Why do we get 3 3 3 with var in a loop + setTimeout?
**A:** Because `var` is function-scoped. There is only one `i` shared by all the callbacks. By the time they run, the loop has finished and `i` is 3.

### Q5. How does `let` fix the loop + setTimeout problem?
**A:** `let` is block-scoped. Each iteration of the loop creates a new binding of the variable, so each callback closes over a different value.

### Q6. Can closures cause memory leaks?
**A:** Yes. If a closure holds a reference to a large object that is no longer needed, that object cannot be garbage collected.

### Q7. What is the difference between scope and closure?
**A:**  
- Scope is the set of rules that determine where variables can be accessed.  
- A closure is the combination of a function and the lexical environment in which that function was declared.

---

## 9. Coding Challenges (Q + Solution together)

### Challenge 1
Create a function `createGreeter(greeting)` that returns a function which takes a name and returns the full greeting.

**Solution:**
```js
function createGreeter(greeting) {
  return function(name) {
    return `${greeting}, ${name}!`;
  };
}

const sayHello = createGreeter("Hello");
console.log(sayHello("Ashish")); // Hello, Ashish!
```

### Challenge 2
Create a private counter that supports increment, decrement and getValue. Do not allow direct access to the count variable.

**Solution:**
```js
function createCounter(initial = 0) {
  let count = initial;

  return {
    increment() { return ++count; },
    decrement() { return --count; },
    getValue() { return count; }
  };
}
```

### Challenge 3
Fix this code so it prints 0 1 2 3 4

```js
for (var i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 100);
}
```

**Solution:**
```js
for (let i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 100);
}
```

### Challenge 4
Write a function `once(fn)` that takes a function and returns a new function that can only be called once. Subsequent calls should return the result of the first call.

**Solution:**
```js
function once(fn) {
  let called = false;
  let result;

  return function(...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

const initialize = once(() => console.log("Initialized"));
initialize(); // Initialized
initialize(); // nothing
```

### Challenge 5
Implement a simple function composition using closures.

```js
const add5 = x => x + 5;
const multiply3 = x => x * 3;

const composed = compose(multiply3, add5);
console.log(composed(10)); // should be 45
```

**Solution:**
```js
function compose(...fns) {
  return function(value) {
    return fns.reduceRight((acc, fn) => fn(acc), value);
  };
}
```

---

## 10. Key Takeaways

- Closures are created automatically whenever an inner function references outer variables.
- They allow data privacy and powerful patterns (module pattern, partial application, factories).
- `let` and `const` make closures safer in loops.
- Be careful about memory — only close over what you need.
- Closures are one of the most important concepts in JavaScript interviews.

---

**Next recommended topics:**  
- `this` keyword + call/apply/bind  
- Prototypes & Prototypal Inheritance  
- Asynchronous JavaScript (Callbacks → Promises → Async/Await)
