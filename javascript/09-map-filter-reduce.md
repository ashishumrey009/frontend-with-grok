# Chapter 9: map, filter, reduce + Polyfills (Interview Style)

Bilkul bhai. Interview ke liye map, filter, reduce + unke polyfills ko simple way mein samajh le. JavaScript interview mein explanation + code dono important hain.

---

## 1. map()

### What does map() do?
map() array ke har element par operation karta hai aur **new array** return karta hai.

```js
const nums = [1, 2, 3, 4];

const result = nums.map(num => num * 2);

console.log(result);
// [2, 4, 6, 8]
```

### Interview explanation
> "Map is used when I want to transform every element of an array. It returns a new array having the same length as the original array."

### Polyfill of map()

```js
Array.prototype.myMap = function(callback) {
  const result = [];

  for (let i = 0; i < this.length; i++) {
    result.push(callback(this[i], i, this));
  }

  return result;
};
```

**Usage:**

```js
const nums = [1, 2, 3, 4];

const result = nums.myMap(num => num * 2);

console.log(result);
// [2, 4, 6, 8]
```

### Important callback arguments

```js
callback(currentValue, index, array)
```

Example:

```js
nums.myMap((value, index, array) => {
  console.log(value, index, array);
});
```

---

## 2. filter()

### What does filter() do?
filter() un elements ko select karta hai jo condition satisfy karte hain.

```js
const nums = [1, 2, 3, 4, 5, 6];

const result = nums.filter(num => num % 2 === 0);

console.log(result);
// [2, 4, 6]
```

### Interview explanation
> "Filter is used when I want to select elements based on a condition. It returns a new array and the resulting array can have fewer elements than the original."

### Polyfill of filter()

```js
Array.prototype.myFilter = function(callback) {
  const result = [];

  for (let i = 0; i < this.length; i++) {
    if (callback(this[i], i, this)) {
      result.push(this[i]);
    }
  }

  return result;
};
```

**Usage:**

```js
const nums = [1, 2, 3, 4, 5, 6];

const result = nums.myFilter(num => num % 2 === 0);

console.log(result);
// [2, 4, 6]
```

---

## 3. reduce()

Ye thoda important hai interview ke liye.

reduce() array ko **single value** mein reduce karta hai.

### Example:

```js
const nums = [1, 2, 3, 4];

const result = nums.reduce((sum, num) => {
  return sum + num;
}, 0);

console.log(result);
// 10
```

### Flow samajh

```text
sum = 0

0 + 1 = 1
1 + 2 = 3
3 + 3 = 6
6 + 4 = 10
```

### Interview explanation
> "Reduce executes a reducer function on each element and accumulates the result into a single value. The accumulator can be a number, string, object, array, or any other data structure."

### Reduce Polyfill

```js
Array.prototype.myReduce = function(callback, initialValue) {

  let accumulator;
  let startIndex;

  if (arguments.length >= 2) {
    accumulator = initialValue;
    startIndex = 0;
  } else {
    accumulator = this[0];
    startIndex = 1;
  }

  for (let i = startIndex; i < this.length; i++) {
    accumulator = callback(
      accumulator,
      this[i],
      i,
      this
    );
  }

  return accumulator;
};
```

**Usage:**

```js
const nums = [1, 2, 3, 4];

const result = nums.myReduce((sum, num) => {
  return sum + num;
}, 0);

console.log(result);
// 10
```

---

## Most Important Difference

Interview mein ye table yaad rakh:

| Method   | Purpose                  | Return       |
|----------|--------------------------|--------------|
| map()    | Transform every element  | New array    |
| filter() | Select elements          | New array    |
| reduce() | Accumulate / convert     | Single value |

### Example:

```js
const nums = [1, 2, 3, 4, 5];
```

**Map**
```js
nums.map(x => x * 2);
// [2, 4, 6, 8, 10]
```
Same number of elements.

**Filter**
```js
nums.filter(x => x > 3);
// [4, 5]
```
Can have fewer elements.

**Reduce**
```js
nums.reduce((sum, x) => sum + x, 0);
// 15
```
Usually one final value.

---

## One Interview Example Using All Three

```js
const users = [
  { name: "A", age: 20 },
  { name: "B", age: 17 },
  { name: "C", age: 25 }
];
```

### Get names of adults

```js
const result = users
  .filter(user => user.age >= 18)
  .map(user => user.name);

console.log(result);
// ["A", "C"]
```

### Calculate total age

```js
const totalAge = users.reduce((sum, user) => {
  return sum + user.age;
}, 0);

console.log(totalAge);
// 62
```

---

## Common Interview Question

> "Implement map, filter and reduce without using built-in methods."

You can write:

```js
Array.prototype.myMap = function(callback) {
  const result = [];

  for (let i = 0; i < this.length; i++) {
    result.push(callback(this[i], i, this));
  }

  return result;
};


Array.prototype.myFilter = function(callback) {
  const result = [];

  for (let i = 0; i < this.length; i++) {
    if (callback(this[i], i, this)) {
      result.push(this[i]);
    }
  }

  return result;
};


Array.prototype.myReduce = function(callback, initialValue) {

  let accumulator;
  let startIndex;

  if (arguments.length >= 2) {
    accumulator = initialValue;
    startIndex = 0;
  } else {
    accumulator = this[0];
    startIndex = 1;
  }

  for (let i = startIndex; i < this.length; i++) {
    accumulator = callback(
      accumulator,
      this[i],
      i,
      this
    );
  }

  return accumulator;
};
```

Then:

```js
const nums = [1, 2, 3, 4, 5];

console.log(nums.myMap(x => x * 2));
// [2, 4, 6, 8, 10]

console.log(nums.myFilter(x => x % 2 === 0));
// [2, 4]

console.log(nums.myReduce((sum, x) => sum + x, 0));
// 15
```

---

## Interview mein ek line mein:

- **Map** = transform
- **Filter** = select
- **Reduce** = accumulate

Aur polyfill ka basic pattern yaad rakh:

```text
prototype method
      ↓
create result/accumulator
      ↓
loop through array
      ↓
call callback
      ↓
return result
```

---

**Note:** Real built-in methods mein additional edge-cases hote hain (sparse arrays, invalid this, missing initialValue etc.). Interview mein basic polyfill upar wala usually sufficient hai. Agar interviewer deep dive kare, tab edge cases explain karna.
