# Chapter 26: Deep Clone (Complete + Interview Ready)

**Interviewer:** Deep clone implement karo.

**Tum:**

"Deep clone mein har level ki alag copy banate hain taaki nested objects bhi original se independent ho jaayein."

---

## Shallow Copy vs Deep Clone

```js
const original = {
  name: "Ashish",
  address: {
    city: "Indore"
  }
};

// Shallow copy
const shallow = { ...original };
shallow.address.city = "Delhi";
console.log(original.address.city); // "Delhi" ❌ (original bhi change)
```

| Type         | Nested Objects          | Use Case                    |
|--------------|-------------------------|-----------------------------|
| Shallow Copy | Same reference share    | Flat objects                |
| Deep Clone   | Completely independent  | Nested / complex objects    |

---

## 1. Basic Deep Clone (Interview mein pehle yeh likhna)

```js
function deepClone(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item));
  }

  const cloned = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }

  return cloned;
}
```

---

## 2. WeakMap kyun? Map kyun nahi? ⭐

```js
// Map use karo toh:
const hash = new Map();
// Map strong reference rakhta hai!
// Object kabhi garbage collect nahi hoga!
// → MEMORY LEAK! ❌

// WeakMap use karo toh:
const hash = new WeakMap();
// WeakMap WEAK reference rakhta hai!
// Jab object kahi aur use nahi hota
// → Automatically garbage collect! ✅

// Simple:
// Map   → Object ko "pakad" ke rakhta hai
// WeakMap → Object ko "dhila" pakadta hai
//           GC apna kaam kar sakta hai!
```

---

## 3. Complete Version (Sab handle karta hai)

```js
function deepClone(obj, hash = new WeakMap()) {

  // Primitive ya null
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // Circular reference
  if (hash.has(obj)) return hash.get(obj);

  // Date
  if (obj instanceof Date) {
    return new Date(obj);
  }

  // RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags);
  }

  // Map
  if (obj instanceof Map) {
    const mapCopy = new Map();
    hash.set(obj, mapCopy);
    obj.forEach((val, key) => {
      mapCopy.set(deepClone(key, hash), deepClone(val, hash));
    });
    return mapCopy;
  }

  // Set
  if (obj instanceof Set) {
    const setCopy = new Set();
    hash.set(obj, setCopy);
    obj.forEach((val) => {
      setCopy.add(deepClone(val, hash));
    });
    return setCopy;
  }

  // Array
  if (Array.isArray(obj)) {
    const arrCopy = [];
    hash.set(obj, arrCopy);
    obj.forEach((item, i) => {
      arrCopy[i] = deepClone(item, hash);
    });
    return arrCopy;
  }

  // Object — Prototype preserve karo!
  const cloned = Object.create(Object.getPrototypeOf(obj));
  hash.set(obj, cloned);

  // Normal keys
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key], hash);
    }
  }

  // Symbol keys
  Object.getOwnPropertySymbols(obj).forEach((sym) => {
    cloned[sym] = deepClone(obj[sym], hash);
  });

  return cloned;
}
```

---

## 4. Symbols clone nahi hote — Common Mistake!

```js
const original = {
  name: "Ashish",
  [Symbol("id")]: 123  // ← Symbol key!
};

// Basic deepClone se:
const cloned = deepClone(original);
// Symbol key missing! ❌
// Kyun? for...in aur hasOwnProperty Symbols ko skip karte hain!

// Fix:
Object.getOwnPropertySymbols(obj).forEach((sym) => {
  cloned[sym] = deepClone(obj[sym], hash);
});
```

---

## 5. Functions clone nahi hoti — Why?

```js
const obj = {
  name: "Ashish",
  greet: function () {
    console.log("Hello!");
  }
};

// JSON method:
JSON.parse(JSON.stringify(obj));
// { name: "Ashish" } — greet GAAYAB! ❌

// Functions ke paas closures hote hain:
function outer() {
  let count = 0;
  return function inner() {
    count++; // closure!
    console.log(count);
  };
}
const fn = outer();
// fn ko copy karo toh closure bhi copy?
// Impossible! Isliye functions skip karte hain!

// structuredClone bhi:
structuredClone({ fn: () => {} }); // ERROR! 💥

// Interview mein bolna:
// "Functions pure behavior hain, data nahi. Isliye clone nahi karte!"
```

---

## 6. Prototype copy nahi hoti — Gotcha!

```js
class Person {
  constructor(name) {
    this.name = name;
  }
  greet() {
    console.log("Hello!", this.name);
  }
}

const p = new Person("Ashish");
const cloned = deepClone(p);

cloned.greet(); // ERROR! ❌
// Kyun? deepClone ne plain {} banaya
// Person.prototype link nahi hua!

// Fix:
const cloned = Object.create(Object.getPrototypeOf(obj));
```

---

## 7. structuredClone — Full Details

```js
const original = {
  name: "Ashish",
  date: new Date(),
  arr: [1, 2, 3],
  map: new Map([["a", 1]]),
  set: new Set([1, 2, 3])
};
original.self = original; // circular!

const cloned = structuredClone(original);
// ✅ Date, Map, Set, Circular reference handle karta hai
// ❌ Functions nahi copy karta
// ❌ DOM nodes nahi copy karta

// Support: Chrome 98+, Node.js 17+
```

---

## 8. Performance — Bade / Deeply Nested Objects

```js
// Recursive deepClone → Stack Overflow ho sakta hai! 💥

// Fix: Iterative approach with stack
function deepCloneIterative(obj) {
  const hash = new WeakMap();
  const stack = [];

  const root = Array.isArray(obj) ? [] : {};
  hash.set(obj, root);
  stack.push({ src: obj, target: root });

  while (stack.length) {
    const { src, target } = stack.pop();

    for (let key in src) {
      if (!src.hasOwnProperty(key)) continue;

      const val = src[key];

      if (val === null || typeof val !== "object") {
        target[key] = val;
        continue;
      }

      if (hash.has(val)) {
        target[key] = hash.get(val);
        continue;
      }

      const copy = Array.isArray(val) ? [] : {};
      hash.set(val, copy);
      target[key] = copy;
      stack.push({ src: val, target: copy });
    }
  }

  return root;
}
```

---

## Comparison Table

| Feature          | JSON | Basic Clone | Advanced Clone | structuredClone |
|------------------|------|-------------|----------------|-----------------|
| Primitives       | ✅   | ✅          | ✅             | ✅              |
| Nested Objects   | ✅   | ✅          | ✅             | ✅              |
| Date             | ❌   | ✅          | ✅             | ✅              |
| RegExp           | ❌   | ❌          | ✅             | ✅              |
| Map / Set        | ❌   | ❌          | ✅             | ✅              |
| Circular Ref     | ❌   | ❌          | ✅             | ✅              |
| Functions        | ❌   | ❌          | ❌             | ❌              |
| Symbols          | ❌   | ❌          | ✅             | ❌              |
| Prototype        | ❌   | ❌          | ✅             | ❌              |

---

## Complete Interview Q&A

**Q1. Shallow copy vs Deep copy?**  
→ Shallow = sirf top level  
→ Deep = har nested level ki alag copy

**Q2. `JSON.parse(JSON.stringify())` kyun perfect nahi?**  
→ Functions, `undefined`, `Date`, `Map`, `Set`, circular references handle nahi karta.

**Q3. Circular reference kaise handle karoge?**  
→ `WeakMap` use karke already visited objects track karo.

**Q4. WeakMap kyun use kiya Map nahi?**  
→ WeakMap weak reference rakhta hai toh objects garbage collect ho sakte hain. Map se memory leak hoti!

**Q5. Symbols copy kyun nahi hote basic clone mein?**  
→ `for...in` Symbols skip karta hai! `Object.getOwnPropertySymbols()` se fix hota hai.

**Q6. Functions clone kyun nahi karte?**  
→ Functions ke paas closures hote hain jo copy nahi ho sakte. "Functions are behavior, not data!"

**Q7. Class instance clone karo toh kya problem?**  
→ Prototype link toot jaata hai! `Object.create(Object.getPrototypeOf(obj))` se fix hota hai.

**Q8. Bahut deeply nested object mein kya problem?**  
→ Recursive approach mein Stack Overflow ho sakta hai! Iterative approach use karo.

**Q9. `structuredClone` kya handle nahi karta?**  
→ Functions, DOM nodes, Error objects (partially), WeakMap, WeakSet.

**Q10. `structuredClone` kya hai?**  
→ Browser/Node ka built-in deep clone. Best modern solution (Chrome 98+, Node 17+).

---

## Ek Line Summary (Interview mein bol dena)

> "Deep clone mein recursion se har level copy karte hain. WeakMap se circular reference handle — WeakMap isliye kyunki Map se memory leak hoti! Symbols aur Prototype ko alag handle karna padta hai. Modern way = structuredClone but functions copy nahi karta!"
