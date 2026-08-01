# Chapter 8: `this` Polyfills (Simple First) + Hard Questions + Edge Cases

Bhai, pehle **bilkul simple** polyfill (bina Symbol ke) sikhate hain — interview mein yahi mostly maangte hain.  
Phir problem batata hoon, phir Symbol wala improved version.

---

## 0. Sabse Important: Parameters ka Difference

Bahut log yahan confuse hote hain. Clear difference:

| Method     | Parameter Style       | Kyun? |
|------------|-----------------------|-------|
| **myCall** | `...args`             | Asli `call` mein arguments **individually** aate hain |
| **myApply**| `argsArray`           | Asli `apply` mein arguments **ek array** mein aate hain |
| **myBind** | `...args` + `...newArgs` | Bind ke time partial args individual aate hain, baad mein naye args |

### Example se samajh:

```js
// call  → arguments alag-alag
greet.call(user, "Hello", "!");

// apply → arguments array mein
greet.apply(user, ["Hello", "!"]);

// bind  → partial arguments individual
const bound = greet.bind(user, "Hello");
bound("!");
```

Isliye polyfill mein bhi same pattern follow karte hain.

---

## 1. Simple Polyfills (Bina Symbol ke)

### 1.1 Simple `myCall`

```js
Function.prototype.myCall = function(context, ...args) {
  context = context || globalThis;

  context.fn = this;
  const result = context.fn(...args);
  delete context.fn;

  return result;
};
```

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

### 1.3 Simple `myBind` (with apply)

```js
Function.prototype.myBind = function(context, ...args) {
  const originalFn = this;

  return function(...newArgs) {
    return originalFn.apply(context, [...args, ...newArgs]);
  };
};
```

---

## 2. `myBind` **bina apply/call** ke (Interview mein mana kare toh)

Agar interviewer bole "apply mat use karna", toh yeh version:

```js
Function.prototype.myBind = function(context, ...args) {
  const originalFn = this;

  return function(...newArgs) {
    context = context || globalThis;

    // temporarily function daal do
    context.fn = originalFn;

    // normal call kar do
    const result = context.fn(...args, ...newArgs);

    delete context.fn;
    return result;
  };
};
```

**Symbol ke saath (better):**

```js
Function.prototype.myBind = function(context, ...args) {
  const originalFn = this;

  return function(...newArgs) {
    context = context || globalThis;

    const key = Symbol();
    context[key] = originalFn;

    const result = context[key](...args, ...newArgs);

    delete context[key];
    return result;
  };
};
```

---

## 3. Simple Version ki Problem (Isliye Symbol aata hai)

```js
const obj = {
  fn: "main pehle se exist karta hoon"
};

function test() {
  console.log(this.fn);
}

test.myCall(obj);
// Output: function test() {...}   ← conflict!
```

Isliye Symbol use karte hain — unique key milti hai jo kabhi clash nahi karti.

---

## 4. Improved Versions with Symbol

### myCall with Symbol

```js
Function.prototype.myCall = function(context, ...args) {
  context = context || globalThis;

  const key = Symbol();
  context[key] = this;

  const result = context[key](...args);
  delete context[key];

  return result;
};
```

### myApply with Symbol

```js
Function.prototype.myApply = function(context, argsArray) {
  context = context || globalThis;

  const key = Symbol();
  context[key] = this;

  const result = context[key](...(argsArray || []));
  delete context[key];

  return result;
};
```

---

## 5. Better `myBind` (jo `new` ko bhi handle kare)

```js
Function.prototype.myBind = function(context, ...args) {
  const originalFn = this;

  const boundFn = function(...newArgs) {
    // new se call hua ho to this ko override mat karo
    const finalContext = this instanceof boundFn ? this : context;
    return originalFn.apply(finalContext, [...args, ...newArgs]);
  };

  if (originalFn.prototype) {
    boundFn.prototype = Object.create(originalFn.prototype);
  }

  return boundFn;
};
```

---

## 6. Hard Interview Questions (Q + Answer together)

### Q1. Multiple bind
```js
const bound1 = show.bind(obj1);
const bound2 = bound1.bind(obj2);
bound2(); // ?
```
**Answer:** Pehla wala `this` (obj1). Dusra bind ignore ho jata hai.

### Q2. bind + new
```js
const BoundPerson = Person.bind({ age: 99 });
const p = new BoundPerson("Ashish");
console.log(p.name); // Ashish
console.log(p.age);  // undefined
```
`new` ki priority higher hoti hai.

### Q3. Arrow function + call/apply/bind
Arrow function completely ignore karta hai. `this` change nahi hota.

### Q4. Method extract / destructuring
```js
const { greet } = user;
greet(); // undefined
```

---

## 7. Hardcore Edge Cases Summary

| Case                        | Result / Behavior                              |
|----------------------------|------------------------------------------------|
| Multiple `.bind()`         | Sirf pehla bind kaam karta hai                 |
| `new` + bound function     | `new` jeet jata hai                            |
| Arrow + call/apply/bind    | Kuch nahi hota, lexical this rehta hai         |
| Method extract (destructure)| `this` lost                                    |
| Strict mode plain call     | `this` = `undefined`                           |
| Non-strict plain call      | `this` = `window` / `global`                   |

---

## 8. Interview Strategy

1. Pehle simple version (bina Symbol) likho
2. Problem batao (property collision)
3. Symbol wala version dikhao
4. Agar apply mana kare → section 2 wala version likho
5. Time bache to `new` handling bhi add kar do

---

**Related Chapter:**  
[07 - this + call / apply / bind](./07-this-call-apply-bind.md)
