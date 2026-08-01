# Chapter 5: Closures Deep Dive (Interview Style)

Closures JavaScript ka sabse important concept hai. Interview mein almost har baar poochhte hain.

---

## 1. What is a Closure?

**Simple definition:**

> A closure is a function that remembers the variables from its outer scope even after the outer function has finished executing.

Matlab function apne surrounding environment ko yaad rakhta hai.

### Basic Example

```js
function outer() {
  let message = "Hello from outer";

  function inner() {
    console.log(message);
  }

  return inner;
}

const myFunc = outer();
myFunc(); // Hello from outer
```

Yahan `outer()` khatam ho chuka hai, lekin `inner` abhi bhi `message` ko access kar pa raha hai.  
Yahi **closure** hai.

---

## 2. Lexical Scoping (Foundation of Closure)

JavaScript **lexical scoping** use karta hai.

Matlab variable ka scope **code likhne ki jagah** se decide hota hai, call karne ki jagah se nahi.

```js
function outer() {
  let a = 10;

  function inner() {
    console.log(a); // 10
  }

  inner();
}

outer();
```

`inner` function `outer` ke variables dekh sakta hai kyunki woh uske andar likha gaya hai.

---

## 3. How Closure Works Internally

Jab bhi koi function create hota hai, uske saath ek hidden property `[[Environment]]` attach hoti hai.

Yeh property us **Lexical Environment** ko point karti hai jahan function banaya gaya tha.

Jab outer function khatam ho jata hai:
- Uska execution context call stack se hat jata hai
- Lekin Lexical Environment memory mein tab tak zinda rehta hai jab tak koi inner function usko reference kar raha ho

Isi retained environment ko hum **closure** kehte hain.

---

## 4. Classic Examples

### Example 1: Counter (Most Common)

```js
function createCounter() {
  let count = 0;

  return function() {
    count++;
    return count;
  };
}

const counter1 = createCounter();
console.log(counter1()); // 1
console.log(counter1()); // 2
console.log(counter1()); // 3

const counter2 = createCounter();
console.log(counter2()); // 1   ← alag closure
```

Har baar `createCounter()` call karne pe **naya** closure banta hai.

---

### Example 2: Private Variables (Data Hiding)

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
console.log(account.balance);      // undefined (private)
```

Yeh closures ka sabse powerful real-world use case hai — **data privacy**.

---

### Example 3: Function Factory

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

### Example 4: once() Function

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
initialize(); // kuch nahi hoga
```

---

## 5. Common Pitfall: Loop + Closure

### Problem (with var)

```js
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);
  }, 100);
}
// Output: 3 3 3
```

**Kyun?**  
`var` function-scoped hota hai. Poore loop ke liye **ek hi** `i` hota hai. Jab setTimeout chalta hai tab tak loop khatam ho chuka hota hai aur `i` ki value 3 hoti hai.

### Solution 1: let use karo (Recommended)

```js
for (let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);
  }, 100);
}
// Output: 0 1 2
```

`let` har iteration pe **naya binding** banata hai.

### Solution 2: IIFE (Old way)

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

Closure outer variables ko memory mein zinda rakhta hai.

Agar badi object ya array close over kar liya, toh memory leak ho sakta hai.

```js
function createLeak() {
  const bigData = new Array(1000000).fill("data");

  return function() {
    console.log(bigData[0]);
  };
}

const fn = createLeak();
// bigData tab tak memory mein rahega jab tak fn exist karta hai
```

**Best Practice:** Sirf wohi cheez close over karo jo actually chahiye.

---

## 7. Interview Questions (Q + Answer saath mein)

### Q1. What is a closure?
**Answer:**  
A closure is a function that has access to variables from its outer (enclosing) scope even after the outer function has finished execution.

---

### Q2. Are closures created only when we return a function?
**Answer:**  
No. A closure is created whenever an inner function is defined that references variables from an outer scope. Returning the function just allows us to use that closure later.

---

### Q3. What will be the output?

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

**Answer:** `1 2 1`  
Har baar `outer()` call karne pe naya independent closure banta hai.

---

### Q4. Why do we get 3 3 3 in this code?

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
```

**Answer:**  
Because `var` is function-scoped. There is only one `i`. By the time the timeouts execute, the loop has finished and `i` is 3.

---

### Q5. How does `let` fix the above problem?
**Answer:**  
`let` is block-scoped. Each iteration of the loop creates a new binding of `i`. So each callback closes over a different value.

---

### Q6. Can closures cause memory leaks?
**Answer:**  
Yes. If a closure holds a reference to a large object that is no longer needed, that object cannot be garbage collected as long as the closure exists.

---

### Q7. What is the difference between scope and closure?
**Answer:**  
- **Scope** → rules that decide where a variable can be accessed.  
- **Closure** → combination of a function + the lexical environment in which it was created.

---

### Q8. What will this print?

```js
function createFunctions() {
  let result = [];

  for (var i = 0; i < 3; i++) {
    result[i] = function() {
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

**Answer:** `3 3 3`  

**Fix with let:**
```js
for (let i = 0; i < 3; i++) {
  result[i] = function() {
    return i;
  };
}
```
Ab output `0 1 2` aayega.

---

### Q9. Real-world uses of closures?
**Answer:**  
- Data privacy / encapsulation  
- Function factories / partial application  
- Module pattern  
- Event handlers & callbacks  
- once(), debounce, throttle jaise utilities  
- Currying

---

## 8. Coding Challenges

### Challenge 1
Create a function `createGreeter(greeting)` that returns another function.

```js
function createGreeter(greeting) {
  return function(name) {
    return `${greeting}, ${name}!`;
  };
}

const sayHello = createGreeter("Hello");
console.log(sayHello("Ashish")); // Hello, Ashish!
```

---

### Challenge 2
Private counter banao (increment, decrement, getValue).

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

---

### Challenge 3
`once(fn)` implement karo.

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
```

---

## 9. Key Takeaways (Interview ke liye)

- Closure = function + uska lexical environment
- Har baar outer function call karne pe **naya** closure banta hai
- `var` + loop + async = classic bug (3 3 3)
- `let` se problem solve ho jati hai
- Closures se private variables bana sakte ho
- Memory leak se bachne ke liye sirf zaroori data close over karo
- Yeh topic interview mein almost guaranteed hai

---

**Related Chapters:**  
- [06 - Closure Memory Leaks](./06-closure-memory-leaks.md)  
- [01 - Scope, var vs let vs const](./01-scope-var-let-const.md)
