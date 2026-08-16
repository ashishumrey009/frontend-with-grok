# Chapter 26: Deep Clone (Implementation + Interview Questions)

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

// Deep clone chahiye taaki original safe rahe
```

| Type         | Nested Objects          | Use Case                    |
|--------------|-------------------------|-----------------------------|
| Shallow Copy | Same reference share    | Flat objects                |
| Deep Clone   | Completely independent  | Nested / complex objects    |

---

## 1. Basic Deep Clone (Interview mein yeh likhna)

```js
function deepClone(obj) {
  // null ya non-object (primitive)
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // Date
  if (obj instanceof Date) {
    return new Date(obj);
  }

  // Array
  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item));
  }

  // Object
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

## 2. Advanced Version (Circular Reference handle)

```js
function deepClone(obj, hash = new WeakMap()) {
  // null ya primitive
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // Circular reference check
  if (hash.has(obj)) {
    return hash.get(obj);
  }

  // Date
  if (obj instanceof Date) {
    return new Date(obj);
  }

  // RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }

  // Array
  if (Array.isArray(obj)) {
    const arrCopy = [];
    hash.set(obj, arrCopy);

    obj.forEach((item, index) => {
      arrCopy[index] = deepClone(item, hash);
    });

    return arrCopy;
  }

  // Object
  const cloned = {};
  hash.set(obj, cloned);

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key], hash);
    }
  }

  return cloned;
}
```

---

## Example

```js
const original = {
  name: "Ashish",
  age: 25,
  address: {
    city: "Indore",
    pin: 452001
  },
  hobbies: ["coding", "gym"],
  dob: new Date("1999-01-01")
};

// Circular reference
original.self = original;

const cloned = deepClone(original);

cloned.address.city = "Delhi";
cloned.hobbies.push("reading");

console.log(original.address.city); // "Indore" ✅
console.log(original.hobbies);      // ["coding", "gym"] ✅
console.log(cloned.self === cloned); // true (circular handle)
```

---

## 3. Shortcut Methods (Interview mein batana)

```js
// 1. JSON method (simple, but limitations)
const clone1 = JSON.parse(JSON.stringify(obj));
// ❌ Functions, undefined, Date, Map, Set, circular ref nahi handle karta

// 2. structuredClone (Modern Browser / Node 17+)
const clone2 = structuredClone(obj);
// ✅ Best built-in method
// ❌ Functions nahi copy karta
```

---

## Common Interview Questions

**Q1. Shallow copy vs Deep copy?**  
→ Shallow = sirf top level  
→ Deep = har nested level ki alag copy

**Q2. `JSON.parse(JSON.stringify())` kyun perfect nahi?**  
→ Functions, `undefined`, `Date`, `Map`, `Set`, circular references handle nahi karta.

**Q3. Circular reference kaise handle karoge?**  
→ `WeakMap` use karke already visited objects track karo.

**Q4. `structuredClone` kya hai?**  
→ Browser/Node ka built-in deep clone. Best modern solution.

**Q5. Deep clone mein performance?**  
→ Recursive + nested objects ki wajah se slow ho sakta hai. Bade objects pe carefully use karo.

**Q6. Map / Set kaise clone karoge?**  
```js
if (obj instanceof Map) {
  const mapCopy = new Map();
  hash.set(obj, mapCopy);
  obj.forEach((value, key) => {
    mapCopy.set(deepClone(key, hash), deepClone(value, hash));
  });
  return mapCopy;
}
```

---

## Ek Line Summary (Interview mein bol dena)

> "Deep clone mein har level ki alag copy banate hain. Basic version recursion se, advanced mein WeakMap se circular references handle karte hain. JSON method simple hai lekin limited. Modern way structuredClone hai."
