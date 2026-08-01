# Chapter 8: `this` Polyfills (Easy Way) + Hard Interview Questions + Edge Cases

## 1. Polyfills — Simple Interview Style

Interviewers almost always ask you to write polyfills for `call`, `apply`, and `bind`.  
Niche simple + clear version diya hai jo yaad rakhna easy hai.

---

### 1.1 Polyfill for `call`

**Idea:**  
Hum function ke andar temporarily `this` set karte hain, function chalaate hain, phir clean kar dete hain.

```js
Function.prototype.myCall = function(context, ...args) {
  // 1. Agar context null/undefined ho to global object use karo
  context = context || globalThis;

  // 2. Ek unique key banao taaki original property overwrite na ho
  const key = Symbol();

  // 3. Function ko context ke andar temporarily daal do
  context[key] = this;

  // 4. Function call karo
  const result = context[key](...args);

  // 5. Cleanup — temporary property hata do
  delete context[key];

  return result;
};
```

**Test:**
```js
function greet(greeting) {
  console.log(`${greeting}, ${this.name}`);
}

const user = { name: "Ashish" };
greet.myCall(user, "Hello"); // Hello, Ashish
```

---

### 1.2 Polyfill for `apply`

`apply` bilkul `call` jaisa hai, bas arguments array mein aate hain.

```js
Function.prototype.myApply = function(context, args = []) {
  context = context || globalThis;

  const key = Symbol();
  context[key] = this;

  const result = context[key](...args);  // array ko spread kar diya

  delete context[key];
  return result;
};
```

**Test:**
```js
greet.myApply(user, ["Hi"]); // Hi, Ashish
```

---

### 1.3 Polyfill for `bind` (Most Asked)

`bind` function ko **call nahi karta**, balki ek naya function return karta hai jisme `this` fix ho jata hai.

```js
Function.prototype.myBind = function(context, ...args) {
  const fn = this;                  // original function save kar lo

  return function(...newArgs) {
    // pehle wale args + naye args dono pass karo
    return fn.apply(context, [...args, ...newArgs]);
  };
};
```

**Even better version (handles `new` also):**
```js
Function.prototype.myBind = function(context, ...args) {
  const fn = this;

  const boundFn = function(...newArgs) {
    // Agar new ke saath call hua to this ko override mat karo
    const isNew = this instanceof boundFn;
    return fn.apply(isNew ? this : context, [...args, ...newArgs]);
  };

  // Prototype chain maintain karo (optional but good)
  if (fn.prototype) {
    boundFn.prototype = Object.create(fn.prototype);
  }

  return boundFn;
};
```

**Test:**
```js
const boundGreet = greet.myBind(user, "Hey");
boundGreet("!"); // Hey, Ashish!
```

---

### Quick Memory Trick for Interview

| Method   | Key Idea                              |
|----------|---------------------------------------|
| `call`   | Temporarily put function on object → call → delete |
| `apply`  | Same as call + arguments as array     |
| `bind`   | Return a new function that uses apply |

---

## 2. Hard Interview Questions (Q + A together)

### Question 1
```js
const obj = {
  name: "Grok",
  regular: function() {
    console.log(this.name);
  },
  arrow: () => {
    console.log(this.name);
  }
};

obj.regular(); // ?
obj.arrow();   // ?
```

**Answer:**  
`Grok`  
`undefined` (or empty string in browser)  

**Why?** Arrow function does not have its own `this`. It takes `this` from the surrounding scope (global).

---

### Question 2
```js
function User(name) {
  this.name = name;
  this.say = () => {
    console.log(this.name);
  };
}

const u = new User("Ashish");
const say = u.say;
say(); // ?
```

**Answer:** `Ashish`  

**Why?** Arrow function was created inside the constructor, so it lexically captured the `this` of that constructor call.

---

### Question 3 (Very Common)
```js
const person = {
  name: "Ashish",
  greet() {
    console.log(`Hello ${this.name}`);
  }
};

setTimeout(person.greet, 100); // What happens?
```

**Answer:** `Hello undefined`  

**Fix options:**
```js
setTimeout(person.greet.bind(person), 100);
// or
setTimeout(() => person.greet(), 100);
```

---

### Question 4
What will be the output?

```js
function foo() {
  console.log(this);
}

const obj = { foo };

foo();           // 1
obj.foo();       // 2
foo.call(obj);   // 3
new foo();       // 4
```

**Answer:**
1. `window` / `global` (or `undefined` in strict mode)
2. `obj`
3. `obj`
4. New empty object

---

### Question 5 (Hard)
```js
function test() {
  console.log(this);
}

const bound = test.bind({ a: 1 }).bind({ a: 2 });
bound(); // ?
```

**Answer:** `{ a: 1 }`  

**Why?** `bind` creates a new function whose `this` is **already fixed**. Calling `.bind()` again on a bound function does **not** change the original bound `this`.

---

### Question 6
```js
const obj = {
  name: "Ashish",
  sayLater() {
    setTimeout(function() {
      console.log(this.name);
    }.bind(this), 0);
  }
};

obj.sayLater(); // ?
```

**Answer:** `Ashish`  

---

### Question 7 (Tricky)
Can we change `this` of an arrow function using `call`/`apply`/`bind`?

**Answer:** No. Arrow functions completely ignore `call`, `apply` and `bind` for `this`.

```js
const arrow = () => console.log(this);
arrow.call({ name: "Grok" }); // still global this
```

---

## 3. Hardcore Edge Cases

### Edge Case 1: `bind` + `new`

```js
function Person(name) {
  this.name = name;
}

const BoundPerson = Person.bind({ age: 25 });
const p = new BoundPerson("Ashish");

console.log(p.name); // Ashish
console.log(p.age);  // undefined
```

**Why?** `new` has higher priority than bound `this`. The bound object is ignored when used with `new`.

---

### Edge Case 2: Double bind

```js
const obj1 = { name: "First" };
const obj2 = { name: "Second" };

function show() {
  console.log(this.name);
}

const bound1 = show.bind(obj1);
const bound2 = bound1.bind(obj2);

bound2(); // First   ← second bind is ignored
```

---

### Edge Case 3: Losing `this` with destructuring

```js
const user = {
  name: "Ashish",
  greet() {
    console.log(this.name);
  }
};

const { greet } = user;
greet(); // undefined
```

Same problem as extracting the method.

---

### Edge Case 4: `this` inside nested regular function

```js
const obj = {
  name: "Grok",
  outer() {
    function inner() {
      console.log(this.name);
    }
    inner(); // undefined (default binding)
  }
};

obj.outer();
```

**Fix:** Use arrow or `.bind(this)` or store `const self = this`.

---

### Edge Case 5: Strict mode vs non-strict

```js
function test() {
  console.log(this);
}

test();               // window (non-strict)

(function() {
  "use strict";
  test();             // undefined
})();
```

---

## 4. Coding Challenges (Interview Style)

### Challenge 1
Write polyfill for `call` without using `Symbol` (older interview style).

**Solution:**
```js
Function.prototype.myCall = function(context, ...args) {
  context = context || globalThis;
  context.fn = this;
  const result = context.fn(...args);
  delete context.fn;
  return result;
};
```

### Challenge 2
Write a version of `bind` that also supports partial application of arguments.

**Solution:** (already shown above in the main polyfill)

### Challenge 3
Predict output:

```js
const obj = {
  name: "Ashish",
  say: function() {
    return () => console.log(this.name);
  }
};

const fn = obj.say();
fn(); // ?
```

**Answer:** `Ashish`  
Because the arrow function was created inside `say()`, so it captured `this` of `say()` which is `obj`.

---

## 5. Key Takeaways for Interview

- Polyfill of `call`/`apply` = temporarily attach function to object → call → delete
- Polyfill of `bind` = return a new function that uses `apply`
- Arrow functions ignore `call`/`apply`/`bind`
- Multiple `bind` → only first one wins
- `new` beats `bind`
- Always be careful when passing methods as callbacks

---

**Related Chapter:**  
[07 - this + call / apply / bind](./07-this-call-apply-bind.md)
