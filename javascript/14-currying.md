# Chapter 14: Currying Deep Dive (Interview Style)

Currying JavaScript interviews mein bahut common topic hai. Yeh functional programming ka important concept hai.

---

## 1. What is Currying?

**Simple definition:**

> Currying is a technique of converting a function that takes multiple arguments into a sequence of functions that each take a **single argument**.

```js
// Normal
f(a, b, c)

// Curried
f(a)(b)(c)
```

### Basic Example

```js
const add = a => b => c => a + b + c;
add(1)(2)(3); // 6
```

---

## 2. Why use Currying?

- Reusability
- Partial application
- Function composition
- Cleaner functional code

```js
const multiply = a => b => a * b;

const double = multiply(2);
const triple = multiply(3);

double(5); // 10
triple(5); // 15
```

---

## 3. Generic Curry Function (Most Asked)

```js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn(...args);
    }
    return function (...nextArgs) {
      return curried(...args, ...nextArgs);
    };
  };
}
```

**Usage:**

```js
function sum(a, b, c) {
  return a + b + c;
}

const curriedSum = curry(sum);

console.log(curriedSum(1)(2)(3));   // 6
console.log(curriedSum(1, 2)(3));   // 6
console.log(curriedSum(1)(2, 3));   // 6
console.log(curriedSum(1, 2, 3));   // 6
```

**Kaise kaam karta hai?**

1. `args.length >= fn.length` → enough arguments mil gaye toh original function chala do
2. Warna naya function return karo jo baaki arguments wait kare
3. `...args, ...nextArgs` se pehle aur naye arguments merge ho jate hain

---

## 4. Currying vs Partial Application

| Feature     | Currying                      | Partial Application               |
|-------------|-------------------------------|-----------------------------------|
| Arguments   | One at a time                 | Multiple allowed at once          |
| Form        | `f(a)(b)(c)`                  | `f(a, b)(c)` or `f(a)(b, c)`      |

---

## 5. Advanced Currying Options

### 5.1 Infinite Currying

```js
function sum(a) {
  return function (b) {
    if (b === undefined) return a;
    return sum(a + b);
  };
}

sum(1)(2)(3)(4)(); // 10
sum(5)(10)(15)();  // 30
```

---

### 5.2 Infinite Currying (without last `()`)

```js
function add(a) {
  const next = (b) => add(a + b);
  next.valueOf = () => a;
  next.toString = () => a;
  return next;
}

console.log(+add(1)(2)(3)(4));     // 10
console.log(add(1)(2)(3)(4) + 0);  // 10
```

---

### 5.3 Curry with Placeholder (Lodash style)

```js
const _ = Symbol("placeholder");

function curryWithPlaceholder(fn) {
  return function curried(...args) {
    // Check if we have enough real arguments (no placeholders left)
    const realArgsCount = args.filter(arg => arg !== _).length;

    if (realArgsCount >= fn.length && !args.includes(_)) {
      return fn(...args);
    }

    return function (...nextArgs) {
      // Replace placeholders with new arguments
      const mergedArgs = [];
      let nextIndex = 0;

      for (let arg of args) {
        if (arg === _ && nextIndex < nextArgs.length) {
          mergedArgs.push(nextArgs[nextIndex++]);
        } else {
          mergedArgs.push(arg);
        }
      }

      // Add remaining new arguments
      while (nextIndex < nextArgs.length) {
        mergedArgs.push(nextArgs[nextIndex++]);
      }

      return curried(...mergedArgs);
    };
  };
}
```

**Usage:**

```js
function greet(greeting, name, punctuation) {
  return `${greeting}, ${name}${punctuation}`;
}

const curriedGreet = curryWithPlaceholder(greet);

// Skip middle argument
const greetHello = curriedGreet("Hello", _, "!");
console.log(greetHello("Ashish")); // Hello, Ashish!

// Skip first argument
const greetAshish = curriedGreet(_, "Ashish", "!");
console.log(greetAshish("Hi")); // Hi, Ashish!

// Skip last argument
const greetHiAshish = curriedGreet("Hi", "Ashish", _);
console.log(greetHiAshish("!!!")); // Hi, Ashish!!!
```

**Kaise kaam karta hai?**

1. `_` placeholder ki tarah kaam karta hai
2. Jab koi argument `_` hota hai, toh baad mein aane wale arguments uski jagah fill ho jate hain
3. Jab saare real arguments mil jate hain aur koi placeholder nahi bachta, tab original function call hota hai

---

### 5.4 Currying + Function Composition

```js
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x);

const add = a => b => a + b;
const multiply = a => b => a * b;

const add5 = add(5);
const double = multiply(2);

const process = compose(double, add5);

console.log(process(10)); // 30
```

---

### 5.5 Practical Examples

**API Builder**
```js
const request = method => url => data =>
  fetch(url, {
    method,
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  });

const post = request("POST");
const postUser = post("/api/users");

postUser({ name: "Ashish" });
```

**Validation**
```js
const minLength = min => value => value.length >= min;
const maxLength = max => value => value.length <= max;

const isValid = value => minLength(3)(value) && maxLength(20)(value);
```

---

## 6. Important Interview Questions

**Q1. What is currying?**  
Converting a multi-argument function into a chain of single-argument functions.

**Q2. Currying vs Partial Application?**  
Currying → one argument at a time.  
Partial → some arguments fixed in advance.

**Q3. Write a generic curry function.**

```js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn(...args);
    }
    return function (...nextArgs) {
      return curried(...args, ...nextArgs);
    };
  };
}
```

**Q4. Implement infinite currying.**  
(See section 5.1)

**Q5. How does curry use closures?**  
Har returned function apne outer arguments ko remember karta hai.

**Q6. What is arity?**  
Number of parameters a function expects (`fn.length`).

---

## 7. Key Takeaways

- Basic curry → `a => b => c => ...`
- Generic curry → `fn.length` ke basis pe kaam karta hai
- Infinite curry → kitne bhi arguments
- Placeholder curry → arguments skip kar sakte ho
- Composition ke saath bahut powerful ban jata hai
- Closures ki wajah se currying possible hai

---

**Related Chapters:**  
- [05 - Closures](./05-closures-deep-dive.md)  
- [11 - Functions Deep Dive](./11-functions-deep-dive.md)  
- [13 - Arrow Functions](./13-arrow-functions.md)
