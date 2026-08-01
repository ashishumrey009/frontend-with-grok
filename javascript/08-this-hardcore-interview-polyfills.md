# Chapter 8: Hardcore `this` + call/apply/bind

Hard interview questions • Polyfills • Edge cases

---

## 1. Polyfills (Very Important for Interviews)

### 1.1 Polyfill for `call`

```js
Function.prototype.myCall = function(context, ...args) {
  // null / undefined should default to global object
  context = context ?? globalThis;

  // Create a unique temporary property
  const key = Symbol("tempFn");
  context[key] = this;               // this = the function we are calling

  const result = context[key](...args);

  delete context[key];               // cleanup
  return result;
};

// Test
function greet(msg) {
  console.log(`${msg}, ${this.name}`);
}
const user = { name: "Ashish" };
greet.myCall(user, "Hello"); // Hello, Ashish
```

---

### 1.2 Polyfill for `apply`

```js
Function.prototype.myApply = function(context, args = []) {
  context = context ?? globalThis;

  const key = Symbol("tempFn");
  context[key] = this;

  const result = context[key](...args);

  delete context[key];
  return result;
};
```

---

### 1.3 Polyfill for `bind` (Basic + Partial Application)

```js
Function.prototype.myBind = function(context, ...boundArgs) {
  const fn = this;

  return function(...newArgs) {
    return fn.apply(context, [...boundArgs, ...newArgs]);
  };
};

// Even better version that also supports `new`
Function.prototype.myBind = function(context, ...boundArgs) {
  const fn = this;

  const boundFn = function(...newArgs) {
    // If called with `new`, ignore the bound context
    const isNew = this instanceof boundFn;
    return fn.apply(isNew ? this : context, [...boundArgs, ...newArgs]);
  };

  // Maintain prototype chain for `new`
  if (fn.prototype) {
    boundFn.prototype = Object.create(fn.prototype);
  }

  return boundFn;
};
```

---

## 2. Hard Interview Questions (Q + A together)

### Q1. What will be the output?

```js
const obj = {
  name: "Grok",
  say() {
    console.log(this.name);
  }
};

const say = obj.say;
say();
obj.say();
(obj.say)();
(obj.say = obj.say)();
```

**Answer:**
```
undefined          // default binding
Grok               // implicit binding
Grok               // still implicit
undefined          // assignment returns the function → default binding
```

---

### Q2. Predict the output

```js
function foo() {
  console.log(this);
}

const obj = { foo };

foo();               // 1
obj.foo();           // 2
(obj.foo)();         // 3
(obj.foo = obj.foo)(); // 4
```

**Answer:**
1. `window` / `undefined` (strict)
2. `obj`
3. `obj`
4. `window` / `undefined` (because of the assignment)

---

### Q3. Hard one with bind + new

```js
function Person(name) {
  this.name = name;
}

const obj = { name: "Original" };
const BoundPerson = Person.bind(obj, "Ashish");

const p = new BoundPerson();
console.log(p.name);
console.log(obj.name);
```

**Answer:**
```
Ashish
Original
```

**Why?** `new` has higher priority than `bind`. When you use `new`, the bound `this` is ignored.

---

### Q4. What happens here?

```js
const obj = {
  name: "Ashish",
  greet: () => {
    console.log(this.name);
  }
};

obj.greet();
obj.greet.call({ name: "Grok" });
```

**Answer:**  
Both print `undefined` (or `window.name`).  
Arrow functions ignore `call` / `apply` / `bind` and take lexical `this`.

---

### Q5. Very common hard question

```js
const obj = {
  name: "Ashish",
  regular: function() {
    const arrow = () => console.log(this.name);
    arrow();
  },
  arrow: () => {
    const regular = function() {
      console.log(this.name);
    };
    regular();
  }
};

obj.regular(); // ?
obj.arrow();   // ?
```

**Answer:**
```
Ashish          // arrow inherits this from regular method
undefined       // regular function loses this
```

---

### Q6. Soft binding vs hard binding

What is the difference between hard binding (`bind`) and soft binding?

**Answer:**  
- **Hard binding** (`bind`): permanently sets `this`. Even `call`/`apply` later cannot change it (except with `new`).
- **Soft binding**: sets a default `this`, but still allows it to be overridden by `call`/`apply`/`new`.

Example of soft binding idea:
```js
function softBind(fn, context) {
  return function(...args) {
    const ctx = (!this || this === globalThis) ? context : this;
    return fn.apply(ctx, args);
  };
}
```

---

### Q7. Output?

```js
function f() {
  console.log(this.x);
}

const obj1 = { x: 10, f };
const obj2 = { x: 20 };

obj1.f();
obj1.f.call(obj2);
const bound = obj1.f.bind(obj2);
bound();
bound.call(obj1);          // still 20
```

**Answer:**
```
10
20
20
20          // bind is permanent (hard binding)
```

---

## 3. Hardcore Edge Cases

### Edge Case 1: `this` inside a class

```js
class User {
  name = "Ashish";          // public field

  regular() {
    console.log(this.name);
  }

  arrow = () => {
    console.log(this.name);
  }
}

const u = new User();
const r = u.regular;
const a = u.arrow;

r(); // undefined (lost this)
a(); // Ashish   (arrow captured this at creation time)
```

---

### Edge Case 2: bind + prototype

```js
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function() {
  console.log(this.name + " makes a sound");
};

const boundSpeak = Animal.prototype.speak.bind({ name: "Dog" });
boundSpeak(); // Dog makes a sound
```

---

### Edge Case 3: call/apply with primitives

```js
function show() {
  console.log(typeof this, this);
}

show.call(5);        // object  Number {5}   (primitive is boxed)
show.call("hello");  // object  String {"hello"}
show.call(true);     // object  Boolean {true}
show.call(null);     // object  window / globalThis
show.call(undefined);// object  window / globalThis
```

In non-strict mode, primitives are converted to objects. In strict mode they stay as-is.

---

### Edge Case 4: Multiple binds

```js
function f() {
  console.log(this.name);
}

const f1 = f.bind({ name: "First" });
const f2 = f1.bind({ name: "Second" });

f2(); // First   ← only the first bind wins
```

---

### Edge Case 5: `this` in object literal methods vs shorthand

```js
const name = "Global";

const obj = {
  name: "Object",
  traditional: function() {
    console.log(this.name);
  },
  shorthand() {
    console.log(this.name);
  },
  arrow: () => console.log(this.name)
};

obj.traditional(); // Object
obj.shorthand();   // Object
obj.arrow();       // Global (or undefined in modules)
```

---

## 4. Coding Challenges (Hard Level)

### Challenge 1: Implement a softBind

Write a `softBind` function that sets a default `this` but still allows overriding with `call`/`apply`.

**Solution:**
```js
Function.prototype.softBind = function(defaultContext, ...boundArgs) {
  const fn = this;
  return function(...args) {
    const ctx = (!this || this === globalThis) ? defaultContext : this;
    return fn.apply(ctx, [...boundArgs, ...args]);
  };
};
```

---

### Challenge 2: Fix this code without using arrow function

```js
const counter = {
  count: 0,
  start() {
    setInterval(function() {
      this.count++;
      console.log(this.count);
    }, 1000);
  }
};

counter.start(); // currently broken
```

**Solutions:**
```js
// 1. Using bind
setInterval(function() {
  this.count++;
  console.log(this.count);
}.bind(this), 1000);

// 2. Self pattern (old school)
const self = this;
setInterval(function() {
  self.count++;
  console.log(self.count);
}, 1000);
```

---

### Challenge 3: What will this print?

```js
function outer() {
  const arrow = () => console.log(this);
  const regular = function() { console.log(this); };

  arrow();
  regular();
  arrow.call({ x: 1 });
  regular.call({ x: 1 });
}

outer.call({ name: "Outer" });
```

**Answer:**
```
{ name: "Outer" }     // arrow inherits from outer
window / undefined    // regular → default binding
{ name: "Outer" }     // arrow ignores call
{ x: 1 }              // regular respects call
```

---

## 5. Key Takeaways for Interviews

- You **must** know how to write polyfills for `call`, `apply`, and especially `bind`.
- `new` has higher priority than `bind`.
- Arrow functions completely ignore `call`/`apply`/`bind` for `this`.
- Multiple `.bind()` calls — only the first one matters.
- Extracting a method (`const fn = obj.method`) loses implicit binding.
- Soft binding is a real concept sometimes asked in senior interviews.
- Always be ready to explain the priority order of `this` binding.

---

**Previous chapter:** [07 - this + call/apply/bind](./07-this-call-apply-bind.md)
