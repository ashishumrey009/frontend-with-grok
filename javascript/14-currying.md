# Chapter 14: Currying Deep Dive (Interview Style)

Currying JavaScript interviews mein bahut common topic hai. Yeh functional programming ka important concept hai.

---

## 1. What is Currying?

**Simple definition:**

> Currying is a technique of converting a function that takes multiple arguments into a sequence of functions that each take a **single argument**.

Matlab:

```js
// Normal function
f(a, b, c)

// Curried version
f(a)(b)(c)
```

### Basic Example

```js
// Normal
function add(a, b, c) {
  return a + b + c;
}

add(1, 2, 3); // 6

// Curried
function add(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}

add(1)(2)(3); // 6
```

Arrow function se short version:

```js
const add = a => b => c => a + b + c;

add(1)(2)(3); // 6
```

---

## 2. Why do we use Currying?

1. **Reusability** — ek baar argument fix karke naya function bana sakte ho
2. **Partial Application** — kuch arguments pehle de sakte ho
3. **Function composition** mein madad milti hai
4. **Cleaner code** in some functional patterns

### Practical Example

```js
const multiply = a => b => a * b;

const double = multiply(2);
const triple = multiply(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15
```

Yahan `multiply(2)` ne ek naya function return kiya jisme `a` already fix ho gaya.

---

## 3. Manual Currying vs Generic Curry Function

### Manual (fixed arity)

```js
const sum = a => b => c => a + b + c;
```

### Generic Curry Function (Interview mein poochhte hain)

```js
function curry(fn) {
  return function curried(...args) {
    // Agar enough arguments mil gaye
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }

    // Warna naya function return karo jo baaki arguments wait kare
    return function (...nextArgs) {
      return curried.apply(this, args.concat(nextArgs));
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

console.log(curriedSum(1)(2)(3));     // 6
console.log(curriedSum(1, 2)(3));     // 6
console.log(curriedSum(1)(2, 3));     // 6
console.log(curriedSum(1, 2, 3));     // 6
```

---

## 4. Currying vs Partial Application

Yeh dono log aksar confuse karte hain.

| Feature              | Currying                          | Partial Application                  |
|----------------------|-----------------------------------|--------------------------------------|
| Arguments            | Hamesha **one at a time**         | Multiple arguments ek saath de sakte ho |
| Transformation       | f(a,b,c) → f(a)(b)(c)             | f(a,b,c) → f(a,b)(c) ya f(a)(b,c)   |
| Arity                | Har function ek hi argument leta  | Arity kam hoti jati hai              |

### Partial Application Example

```js
function partial(fn, ...fixedArgs) {
  return function (...remainingArgs) {
    return fn(...fixedArgs, ...remainingArgs);
  };
}

function greet(greeting, name) {
  return `${greeting}, ${name}!`;
}

const sayHello = partial(greet, "Hello");
console.log(sayHello("Ashish")); // Hello, Ashish!
```

---

## 5. Infinite Currying (Advanced)

Kabhi-kabhi interviewer poochhta hai:

> "Aisa function banao jo kitne bhi arguments le sake"

```js
function add(a) {
  return function(b) {
    if (b !== undefined) {
      return add(a + b);
    }
    return a;
  };
}

console.log(add(1)(2)(3)(4)()); // 10
console.log(add(5)(10)());      // 15
```

Ya better version:

```js
function sum(a) {
  const next = (b) => {
    if (b === undefined) return a;
    return sum(a + b);
  };
  return next;
}

console.log(sum(1)(2)(3)(4)()); // 10
```

---

## 6. Real-world Use Cases

### 1. Logging / Debugging
```js
const log = level => message => console.log(`[${level}] ${message}`);

const info = log("INFO");
const error = log("ERROR");

info("Server started");
error("Something broke");
```

### 2. Event handlers / Config
```js
const multiply = x => y => x * y;
const double = multiply(2);

[1, 2, 3].map(double); // [2, 4, 6]
```

### 3. Discount calculation
```js
const discount = rate => price => price - (price * rate);

const tenPercentOff = discount(0.1);
const twentyPercentOff = discount(0.2);

console.log(tenPercentOff(1000));    // 900
console.log(twentyPercentOff(1000)); // 800
```

---

## 7. Important Interview Questions (Q + A)

### Q1. What is currying?
**Answer:**  
Currying is the process of converting a function that takes multiple arguments into a sequence of functions that each take a single argument.

Example: `f(a, b, c)` becomes `f(a)(b)(c)`.

---

### Q2. Difference between Currying and Partial Application?
**Answer:**  
- **Currying** → transforms a function so that it takes one argument at a time.  
- **Partial Application** → fixes some arguments of a function and returns a new function that accepts the remaining arguments.

---

### Q3. Write a generic curry function.

```js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function (...nextArgs) {
      return curried.apply(this, args.concat(nextArgs));
    };
  };
}
```

---

### Q4. What will be the output?

```js
const add = a => b => c => a + b + c;
console.log(add(1)(2)(3));
console.log(add(1, 2)(3));
```

**Answer:**  
`6`  
`TypeError` (kyunki `add(1, 2)` ek function return karta hai jo sirf ek argument expect karta hai)

---

### Q5. Implement infinite currying for sum.

```js
function sum(a) {
  return function(b) {
    if (b !== undefined) {
      return sum(a + b);
    }
    return a;
  };
}

console.log(sum(1)(2)(3)(4)()); // 10
```

---

### Q6. Why is currying useful?
**Answer:**  
- Creates reusable specialized functions  
- Helps in function composition  
- Makes code more modular and declarative  
- Useful in functional programming patterns

---

### Q7. Can we curry an async function?
**Answer:**  
Yes, but humein carefully handle karna padega kyunki har step pe Promise return ho sakta hai.

---

### Q8. What is the arity of a function?
**Answer:**  
Arity means the number of arguments a function expects.  
`fn.length` se milti hai.

```js
function sum(a, b, c) {}
console.log(sum.length); // 3
```

Currying `fn.length` pe depend karti hai.

---

## 8. Coding Challenges

### Challenge 1: Basic Curry
```js
const multiply = a => b => c => a * b * c;
console.log(multiply(2)(3)(4)); // 24
```

### Challenge 2: Generic Curry
Upar diya hua `curry` function likho aur test karo.

### Challenge 3: Infinite Sum
```js
function sum(a) {
  return function(b) {
    if (b === undefined) return a;
    return sum(a + b);
  };
}
```

### Challenge 4: Curry with placeholder (Advanced)
Kabhi-kabhi poochhte hain ki arguments skip kaise karein (lodash jaisa).

---

## 9. Key Takeaways

- Currying = multi-argument function ko single-argument functions ki chain mein badalna
- `f(a,b,c)` → `f(a)(b)(c)`
- Partial Application alag concept hai
- Generic curry function interviews mein bahut poochha jata hai
- Infinite currying advanced level ka question hai
- Real world mein logging, config, discount, event handling etc. mein use hota hai

---

**Related Chapters:**  
- [05 - Closures Deep Dive](./05-closures-deep-dive.md)  
- [11 - Functions Deep Dive](./11-functions-deep-dive.md)  
- [13 - Arrow Functions](./13-arrow-functions.md)
