# Chapter 32: Type Coercion + Primitive vs Reference

**Interviewer:** `==` vs `===`, truthy/falsy, primitive vs reference explain karo.

**Tum:**

"`===` type + value dono check karta hai. `==` pehle type coerce karta hai phir compare. Primitive value copy hoti hai, reference type address share karta hai."

---

## 1. Primitive vs Reference

**Primitive:** `string`, `number`, `boolean`, `null`, `undefined`, `bigint`, `symbol`  
Copy = value copy.

```js
let a = 10;
let b = a;
b = 20;
console.log(a); // 10  ✅ alag copy
```

**Reference:** `object`, `array`, `function`  
Copy = same memory address.

```js
const obj1 = { name: "Ashish" };
const obj2 = obj1;
obj2.name = "Rahul";
console.log(obj1.name); // "Rahul" ❌ same object
```

Nayi copy chahiye:
```js
const copy = { ...obj1 };          // shallow
const deep = structuredClone(obj1); // deep
```

---

## 2. `typeof` gotchas

```js
typeof null;        // "object"  ← famous bug
typeof [];          // "object"
typeof function(){}; // "function"
Array.isArray([]);  // true
```

---

## 3. Truthy / Falsy

**Falsy (sirf yeh 8):**
```js
false, 0, -0, 0n, "", null, undefined, NaN
```

Baaki sab **truthy** — `[]`, `{}`, `"0"`, `"false"` sab truthy.

```js
if ([]) console.log("runs"); // truthy!
Boolean([]); // true
```

---

## 4. `==` vs `===`

| | `===` Strict | `==` Loose |
|--|--------------|------------|
| Type check | Haan | Nahi (pehle coerce) |
| Interview | Hamesha prefer | Avoid unless samajh ke |

```js
0 == false;      // true
0 === false;     // false
"" == false;     // true
null == undefined; // true
null === undefined; // false
[] == false;     // true  (weird coercion)
[] === false;    // false
```

**Rule:** Code mein `===` use karo. `==` sirf tab jab `null == undefined` intentionally chahiye.

---

## 5. Type Coercion (interview favorites)

```js
"5" + 1;     // "51"   string win
"5" - 1;     // 4      number
true + true; // 2
[] + [];     // ""
[] + {};     // "[object Object]"
{} + [];     // 0  (block + array, tricky)

Number("");  // 0
Number("12px"); // NaN
parseInt("12px"); // 12

!!"hello";   // true
+"42";       // 42
```

`+` agar ek side string hai → concat.  
`-`, `*`, `/` → number banate hain.

---

## 6. `null` vs `undefined`

| | `undefined` | `null` |
|--|-------------|--------|
| Matlab | Value assign nahi hui | Intentionally empty |
| typeof | "undefined" | "object" |
| `==` | `null == undefined` ✅ | same |

---

## Interview Q&A

**Q1. Primitive vs Reference?**  
→ Primitive value copy. Object/array address share.

**Q2. `==` vs `===`?**  
→ `===` type+value. `==` pehle coerce.

**Q3. Falsy values?**  
→ `false, 0, -0, 0n, "", null, undefined, NaN`

**Q4. `typeof null`?**  
→ `"object"` — language bug. Check: `value === null`

**Q5. `[] == false` kyun true?**  
→ `[]` → `""` → `0`, `false` → `0`.

---

## Ek Line Summary

> "Primitive copy by value, objects by reference. `===` safe comparison. `==` hidden coercion karta hai. Falsy sirf 8 values hain — empty array/object truthy hain."
