# Chapter 33: Arrays — map / filter / reduce + Polyfills

**Interviewer:** `map`, `filter`, `reduce` farak + polyfill likho.

**Tum:**

"`map` naya array return karta hai transform karke. `filter` condition se naya array. `reduce` array ko single value mein fold karta hai. `forEach` return nahi karta."

---

## Comparison

| Method | Return | Use |
|--------|--------|-----|
| `map` | Naya array (same length) | Transform |
| `filter` | Naya array (kam/barabar) | Select |
| `reduce` | Koi bhi value | Sum, object, flatten |
| `forEach` | `undefined` | Side effect only |
| `find` | Pehla match / undefined | Search one |
| `some` / `every` | boolean | Any / all |

```js
const nums = [1, 2, 3, 4];

nums.map((x) => x * 2);           // [2, 4, 6, 8]
nums.filter((x) => x % 2 === 0);  // [2, 4]
nums.reduce((acc, x) => acc + x, 0); // 10
nums.forEach((x) => console.log(x)); // undefined return
```

---

## Polyfill: map

```js
Array.prototype.myMap = function (cb) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      result[i] = cb(this[i], i, this);
    }
  }
  return result;
};
```

---

## Polyfill: filter

```js
Array.prototype.myFilter = function (cb) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && cb(this[i], i, this)) {
      result.push(this[i]);
    }
  }
  return result;
};
```

---

## Polyfill: reduce

```js
Array.prototype.myReduce = function (cb, initial) {
  let acc;
  let start = 0;

  if (arguments.length >= 2) {
    acc = initial;
  } else {
    if (this.length === 0) throw new TypeError("Reduce empty array");
    acc = this[0];
    start = 1;
  }

  for (let i = start; i < this.length; i++) {
    if (i in this) acc = cb(acc, this[i], i, this);
  }
  return acc;
};
```

---

## `slice` vs `splice`

| | `slice` | `splice` |
|--|---------|----------|
| Mutate original? | Nahi | Haan |
| Return | Copy portion | Removed items |

```js
[1, 2, 3, 4].slice(1, 3);     // [2, 3] original same
const a = [1, 2, 3, 4];
a.splice(1, 2);               // removes 2,3 — a = [1, 4]
```

---

## Interview patterns

```js
// flatten 1 level
[[1, 2], [3]].flat();

// unique
[...new Set([1, 1, 2])];

// group by
users.reduce((acc, u) => {
  (acc[u.role] ??= []).push(u);
  return acc;
}, {});
```

---

## Interview Q&A

**Q1. map vs forEach?**  
→ map naya array return. forEach side-effect, return undefined.

**Q2. reduce kab use?**  
→ Array → single value: sum, object, flatten, compose.

**Q3. map original mutate?**  
→ Nahi. Naya array.

**Q4. slice vs splice?**  
→ slice copy (immutable). splice mutate.

---

## Ek Line Summary

> "map transform, filter select, reduce fold to one value. forEach sirf loop. Interview mein inke polyfill + slice vs splice poochte hain."
