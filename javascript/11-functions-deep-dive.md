# Chapter 11: Functions Deep Dive (Interview Style)

Functions JavaScript ki jaan hain. Interview mein bahut deep poochhte hain. Yeh chapter declaration, definition, scope, hoisting, first-class functions sab cover karta hai.

---

## 1. Function Declaration vs Function Expression

### Function Declaration

```js
function greet(name) {
  return "Hello " + name;
}
```

- `function` keyword se start hota hai
- Name hona zaroori hai
- **Hoisted** hota hai (poora function)

### Function Expression

```js
const greet = function(name) {
  return "Hello " + name;
};
```

- Variable ke andar function assign hota hai
- Named ya anonymous dono ho sakta hai
- **Hoisted nahi** hota (sirf variable hoisted hota hai)

### Interview Line:
> "Function declaration is hoisted completely, while function expression is not. Only the variable is hoisted in case of expression."

---

## 2. Function Definition kya hota hai?

**Definition** matlab function ka actual body / implementation.

Jab hum likhte hain:

```js
function add(a, b) {
  return a + b;
}
```

Yeh function **declare** bhi hua hai aur **define** bhi hua hai.

Kuch languages mein declaration aur definition alag hote hain, lekin JavaScript mein mostly dono saath mein hote hain.

---

## 3. Types of Functions

### 1. Named Function
```js
function sayHi() {
  console.log("Hi");
}
```

### 2. Anonymous Function
```js
const sayHi = function() {
  console.log("Hi");
};
```

### 3. Arrow Function (ES6)
```js
const sayHi = () => {
  console.log("Hi");
};
```

### 4. Immediately Invoked Function Expression (IIFE)
```js
(function() {
  console.log("I run immediately");
})();
```

### 5. Constructor Function
```js
function Person(name) {
  this.name = name;
}

const p = new Person("Ashish");
```

---

## 4. Function Scope

JavaScript mein functions apna **scope** banate hain.

```js
function outer() {
  var a = 10;

  function inner() {
    console.log(a); // 10 (access kar sakta hai)
  }

  inner();
}

outer();
console.log(a); // Error (a is not defined)
```

### Important Points:
- Function ke andar declared variables bahar se access nahi ho sakte
- Inner function outer ke variables access kar sakta hai (Lexical Scope)
- Yeh concept **Closure** ki foundation hai

---

## 5. Hoisting with Functions

### Function Declaration → Fully Hoisted

```js
greet();

function greet() {
  console.log("Hello");
}
```

Kaam karega kyunki poora function upar utha diya gaya.

### Function Expression → Not Hoisted

```js
greet();

const greet = function() {
  console.log("Hello");
};
```

Error aayega: `Cannot access 'greet' before initialization` (let/const)  
ya `greet is not a function` (var ke case mein)

### Arrow Function bhi Expression ki tarah treat hota hai

```js
sayHi();

const sayHi = () => console.log("Hi");
// Error
```

---

## 6. First-Class Functions

JavaScript mein functions **First-Class Citizens** hain.

Matlab:

1. Function ko variable mein store kar sakte ho
2. Function ko doosre function mein argument bana ke bhej sakte ho
3. Function ko return kar sakte ho

### Example 1: Store in variable
```js
const greet = function(name) {
  return "Hello " + name;
};
```

### Example 2: Pass as argument (Callback)
```js
function processUser(name, callback) {
  console.log("Processing...");
  callback(name);
}

processUser("Ashish", function(name) {
  console.log("Hello " + name);
});
```

### Example 3: Return a function
```js
function multiplier(factor) {
  return function(number) {
    return number * factor;
  };
}

const double = multiplier(2);
console.log(double(5)); // 10
```

### Interview Line:
> "In JavaScript, functions are first-class citizens because they can be treated like any other value — assigned to variables, passed as arguments, and returned from other functions."

---

## 7. Higher-Order Functions

Jo function:
- Doosra function argument mein le, **ya**
- Function return kare

Use **Higher-Order Function** kehte hain.

Examples: `map`, `filter`, `reduce`, `setTimeout`, etc.

```js
const nums = [1, 2, 3];

const doubled = nums.map(function(num) {
  return num * 2;
});
```

Yahan `map` higher-order function hai.

---

## 8. Pure vs Impure Functions

### Pure Function
- Same input pe hamesha same output
- Koi side-effect nahi

```js
function add(a, b) {
  return a + b;
}
```

### Impure Function
- Side-effect karta hai (DOM change, API call, external variable modify)

```js
let total = 0;

function addToTotal(num) {
  total += num; // external variable change
  return total;
}
```

---

## 9. Arguments Object vs Rest Parameters

### Old way (arguments)
```js
function sum() {
  let total = 0;
  for (let i = 0; i < arguments.length; i++) {
    total += arguments[i];
  }
  return total;
}

sum(1, 2, 3, 4); // 10
```

### Modern way (Rest)
```js
function sum(...numbers) {
  return numbers.reduce((acc, curr) => acc + curr, 0);
}
```

---

## 10. Default Parameters

```js
function greet(name = "Guest") {
  console.log("Hello " + name);
}

greet();          // Hello Guest
greet("Ashish");  // Hello Ashish
```

---

## 11. Function vs Arrow Function (Important Differences)

| Feature              | Normal Function      | Arrow Function          |
|----------------------|----------------------|-------------------------|
| `this`               | Dynamic              | Lexical (surrounding)   |
| `arguments` object   | Hota hai             | Nahi hota               |
| Hoisting             | Declaration hoisted  | Expression (not hoisted)|
| Constructor (`new`)  | Use kar sakte ho     | Nahi kar sakte          |
| Syntax               | Verbose              | Short                   |

---

## 12. Common Interview Questions

**Q1. Difference between Function Declaration and Function Expression?**  
Declaration hoisted hoti hai, Expression nahi.

**Q2. What are First-Class Functions?**  
Functions ko value ki tarah treat kar sakte ho (store, pass, return).

**Q3. What is a Higher-Order Function?**  
Jo function doosre function ko argument le ya return kare.

**Q4. Are arrow functions hoisted?**  
Nahi, kyunki woh function expression hote hain.

**Q5. Can we use `new` with arrow function?**  
Nahi.

**Q6. What is IIFE?**  
Immediately Invoked Function Expression — define hote hi call ho jata hai.

---

## 13. Summary (Yaad rakhne layak)

- **Declaration** → `function name() {}` → fully hoisted
- **Expression** → `const name = function() {}` → not hoisted
- **Arrow** → lexical `this`, no `arguments`, no `new`
- **First-Class** → functions are values
- **Higher-Order** → functions that take/return functions
- **Scope** → function apna scope banata hai
- **Hoisting** → declaration upar chali jati hai

---

**Next recommended:** Closures (already covered) ya Callbacks & Asynchronous functions.
