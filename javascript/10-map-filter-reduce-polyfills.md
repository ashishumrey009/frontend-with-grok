# Chapter 10: map, filter, reduce — Polyfills

Pehle **simple interview version**, phir thoda improved version.

---

## 1. `map` Polyfill

### Simple Version (Interview Style)

```js
Array.prototype.myMap = function(callback) {
  const result = [];

  for (let i = 0; i < this.length; i++) {
    // sparse array handle karne ke liye
    if (i in this) {
      result.push(callback(this[i], i, this));
    }
  }

  return result;
};
```

### With `thisArg` support (Better)

```js
Array.prototype.myMap = function(callback, thisArg) {
  if (typeof callback !== "function") {
    throw new TypeError(callback + " is not a function");
  }

  const result = [];

  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      result.push(callback.call(thisArg, this[i], i, this));
    }
  }

  return result;
};
```

**Test:**
```js
const nums = [1, 2, 3];
console.log(nums.myMap(x => x * 2)); // [2, 4, 6]
```

---

## 2. `filter` Polyfill

### Simple Version

```js
Array.prototype.myFilter = function(callback) {
  const result = [];

  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      if (callback(this[i], i, this)) {
        result.push(this[i]);
      }
    }
  }

  return result;
};
```

### With `thisArg` support

```js
Array.prototype.myFilter = function(callback, thisArg) {
  if (typeof callback !== "function") {
    throw new TypeError(callback + " is not a function");
  }

  const result = [];

  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      if (callback.call(thisArg, this[i], i, this)) {
        result.push(this[i]);
      }
    }
  }

  return result;
};
```

**Test:**
```js
const nums = [1, 2, 3, 4, 5, 6];
console.log(nums.myFilter(x => x % 2 === 0)); // [2, 4, 6]
```

---

## 3. `reduce` Polyfill

Yeh thoda complex hai kyunki `initialValue` optional hota hai.

### Simple + Correct Version

```js
Array.prototype.myReduce = function(callback, initialValue) {
  if (typeof callback !== "function") {
    throw new TypeError(callback + " is not a function");
  }

  const hasInitial = arguments.length >= 2;
  let accumulator;
  let startIndex;

  if (hasInitial) {
    accumulator = initialValue;
    startIndex = 0;
  } else {
    // initialValue nahi diya gaya
    if (this.length === 0) {
      throw new TypeError("Reduce of empty array with no initial value");
    }

    // pehla defined element dhundo
    let found = false;
    for (let i = 0; i < this.length; i++) {
      if (i in this) {
        accumulator = this[i];
        startIndex = i + 1;
        found = true;
        break;
      }
    }

    if (!found) {
      throw new TypeError("Reduce of empty array with no initial value");
    }
  }

  for (let i = startIndex; i < this.length; i++) {
    if (i in this) {
      accumulator = callback(accumulator, this[i], i, this);
    }
  }

  return accumulator;
};
```

**Test:**
```js
const nums = [1, 2, 3, 4];

console.log(nums.myReduce((acc, curr) => acc + curr, 0)); // 10
console.log(nums.myReduce((acc, curr) => acc + curr));    // 10
```

---

## 4. Important Points (Interview mein poochhte hain)

### 1. `i in this` kyun likhte hain?
Sparse array handle karne ke liye.

```js
const arr = [1, , 3]; // index 1 missing hai
arr.myMap(x => x * 2); // [2, empty, 6]  ← empty skip nahi hona chahiye galat tarike se
```

### 2. `thisArg` kya hota hai?
Callback ke andar `this` set karne ke liye.

```js
const obj = { multiplier: 10 };

[1, 2, 3].myMap(function(x) {
  return x * this.multiplier;
}, obj); // [10, 20, 30]
```

### 3. reduce mein initialValue nahi diya toh?
Pehla element accumulator ban jata hai, loop doosre element se start hota hai.

### 4. Empty array + reduce (bina initialValue)
Error throw hota hai.

---

## 5. Short Memory Version (Interview ke liye)

### map
```js
Array.prototype.myMap = function(cb) {
  const res = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this) res.push(cb(this[i], i, this));
  }
  return res;
};
```

### filter
```js
Array.prototype.myFilter = function(cb) {
  const res = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && cb(this[i], i, this)) {
      res.push(this[i]);
    }
  }
  return res;
};
```

### reduce
```js
Array.prototype.myReduce = function(cb, init) {
  let acc = init;
  let start = 0;

  if (arguments.length < 2) {
    acc = this[0];
    start = 1;
  }

  for (let i = start; i < this.length; i++) {
    acc = cb(acc, this[i], i, this);
  }
  return acc;
};
```

(Note: Upar wala reduce sparse array properly handle nahi karta, lekin interview mein mostly chal jata hai)

---

## 6. Common Interview Questions

**Q1. map aur forEach mein difference?**  
map naya array return karta hai, forEach `undefined` return karta hai.

**Q2. reduce se map kaise banaoge?**
```js
array.reduce((acc, curr) => {
  acc.push(curr * 2);
  return acc;
}, []);
```

**Q3. reduce se filter kaise banaoge?**
```js
array.reduce((acc, curr) => {
  if (curr % 2 === 0) acc.push(curr);
  return acc;
}, []);
```

---

**Related Chapter:**  
[09 - map, filter, reduce Basics](./09-map-filter-reduce.md)
