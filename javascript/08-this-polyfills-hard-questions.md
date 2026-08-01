# Chapter 8: `this` Polyfills (Simple First) + Hard Questions + Edge Cases

Bhai, pehle **bilkul simple** polyfill (bina Symbol ke) sikhate hain — interview mein yahi mostly maangte hain.  
Phir problem batata hoon, phir Symbol wala improved version.

---

## 1. Simple Polyfills (Bina Symbol ke) — Interview Style

### 1.1 Simple `myCall`

```js
Function.prototype.myCall = function(context, ...args) {
  // context null ya undefined ho to globalThis le lo
  context = context || globalThis;

  // function ko temporarily object ke andar daal do
  context.fn = this;

  // ab call karo → this automatically context ban jayega
  const result = context.fn(...args);

  // temporary property hata do
  delete context.fn;

  return result;
};
```

**Kaise kaam karta hai?**

```js
function greet(msg) {
  console.log(msg + ", " + this.name);
}

const user = { name: "Ashish" };

greet.myCall(user, "Hello"); // Hello, Ashish
```

Step-by-step:
1. `user.fn = greet`  → user object ke andar fn method aa gaya
2. `user.fn("Hello")` call hua → isliye `this` = user ban gaya
3. `delete user.fn` → saaf kar diya

---

### 1.2 Simple `myApply`

```js
Function.prototype.myApply = function(context, argsArray) {
  context = context || globalThis;

  context.fn = this;

  const result = context.fn(...(argsArray || []));

  delete context.fn;
  return result;
};
```

---

### 1.3 Simple `myBind`

```js
Function.prototype.myBind = function(context, ...args) {
  const originalFn = this;

  return function(...newArgs) {
    return originalFn.apply(context, [...args, ...newArgs]);
  };
};
```

**Example:**
```js
function multiply(a, b) {
  return a * b;
}

const double = multiply.myBind(null, 2);
console.log(double(5)); // 10
```

---

## 2. Simple Version ki Problem (Isliye Symbol aata hai)

Dekho yeh case:

```js
const obj = {
  fn: "main pehle se exist karta hoon"   // already property hai
};

function test() {
  console.log(this.fn);
}

test.myCall(obj);
```

**Output:** function test() { ... }   

Kyunki humne `obj.fn = test` karke original value overwrite kar di.

Yahi problem solve karne ke liye **Symbol** use hota hai.

---

## 3. Improved Version with Symbol

```js
Function.prototype.myCall = function(context, ...args) {
  context = context || globalThis;

  // Symbol unique key banata hai jo kabhi collide nahi karega
  const uniqueKey = Symbol();

  context[uniqueKey] = this;

  const result = context[uniqueKey](...args);

  delete context[uniqueKey];

  return result;
};
```

**Symbol kyun use karte hain?**
- Har `Symbol()` bilkul unique hota hai
- Kabhi bhi existing property se clash nahi karega
- Object ke normal keys (`for...in`, `Object.keys`) mein nahi dikhta

Yahi best practice hai production-level polyfill mein.

---

## 4. Better `myBind` (jo `new` ko bhi handle kare)

Interview mein advanced level pe yeh bhi poochhte hain:

```js
Function.prototype.myBind = function(context, ...args) {
  const originalFn = this;

  const boundFn = function(...newArgs) {
    // Agar new ke saath call hua to bound context ignore karo
    const finalContext = this instanceof boundFn ? this : context;
    return originalFn.apply(finalContext, [...args, ...newArgs]);
  };

  // prototype chain maintain karna (optional but good)
  if (originalFn.prototype) {
    boundFn.prototype = Object.create(originalFn.prototype);
  }

  return boundFn;
};
```

---

## 5. Hard Interview Questions (Q + Answer together)

### Q1. Multiple bind kya hota hai?

```js
const obj1 = { name: "First" };
const obj2 = { name: "Second" };

function show() {
  console.log(this.name);
}

const bound1 = show.bind(obj1);
const bound2 = bound1.bind(obj2);

bound2(); // ?
```

**Answer:** `First`  
**Reason:** Ek baar bind ho gaya to `this` permanently fix ho jata hai. Dusra bind ignore ho jata hai.

---

### Q2. `bind` + `new` ka priority?

```js
function Person(name) {
  this.name = name;
}

const BoundPerson = Person.bind({ age: 99 });
const p = new BoundPerson("Ashish");

console.log(p.name); // ?
console.log(p.age);  // ?
```

**Answer:**  
`Ashish`  
`undefined`  

**Reason:** `new` binding ki priority `bind` se higher hoti hai.

---

### Q3. Arrow function ko bind kar sakte ho?

```js
const arrow = () => console.log(this.name);
arrow.call({ name: "Grok" }); // ?
```

**Answer:** `undefined` (global this)  
**Reason:** Arrow function `call`/`apply`/`bind` ko completely ignore karta hai for `this`.

---

### Q4. Yeh output kya dega?

```js
const obj = {
  name: "Ashish",
  say() {
    return () => console.log(this.name);
  }
};

const fn = obj.say();
fn(); // ?
```

**Answer:** `Ashish`  
Kyunki arrow function `say` ke andar bana tha, isliye usne `this` = obj capture kar liya.

---

### Q5. Destructuring se this kyun toot jata hai?

```js
const user = {
  name: "Ashish",
  greet() {
    console.log(this.name);
  }
};

const { greet } = user;
greet(); // ?
```

**Answer:** `undefined`  
Method extract karte hi implicit binding toot jati hai.

---

## 6. Hardcore Edge Cases Summary

| Case                        | Result / Behavior                              |
|----------------------------|------------------------------------------------|
| Multiple `.bind()`         | Sirf pehla bind kaam karta hai                 |
| `new` + bound function     | `new` jeet jata hai                            |
| Arrow + call/apply/bind    | Kuch nahi hota, lexical this rehta hai         |
| Method extract (destructure)| `this` lost                                    |
| Strict mode plain call     | `this` = `undefined`                           |
| Non-strict plain call      | `this` = `window` / `global`                   |

---

## 7. Coding Challenges (Simple → Hard)

### Challenge 1 (Most Asked)
Write simple polyfill of `bind` (bina Symbol ke).

**Solution:**
```js
Function.prototype.myBind = function(context, ...args) {
  const fn = this;
  return function(...newArgs) {
    return fn.apply(context, [...args, ...newArgs]);
  };
};
```

### Challenge 2
Write `myCall` without using Symbol (simple version).

**Solution:** (already shown in section 1.1)

### Challenge 3
Predict + fix:

```js
const person = {
  name: "Ashish",
  greet() {
    console.log(this.name);
  }
};

setTimeout(person.greet, 0); // currently undefined
```

**Fix:**
```js
setTimeout(person.greet.bind(person), 0);
// or
setTimeout(() => person.greet(), 0);
```

---

## 8. Interview Mein Kaise Approach Karein

1. Pehle simple version likho (bina Symbol ke) — interviewer ko clear logic dikhao
2. Phir problem batao (property collision)
3. Phir Symbol wala improved version dikhao
4. Agar time bache to `new` handling bhi add kar do in bind

Yahi sequence sabse safe + impressive hota hai.

---

**Related Chapter:**  
[07 - this + call / apply / bind](./07-this-call-apply-bind.md)
