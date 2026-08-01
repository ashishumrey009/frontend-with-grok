# Chapter 9: map, filter, reduce

Ye teen sabse important array methods hain. Interview mein bahut poochhte hain.

---

## 1. map()

**Kya karta hai?**  
Array ke **har element** pe koi transformation apply karta hai aur **naya array** return karta hai (original change nahi hota).

### Syntax
```js
const newArray = array.map((element, index, array) => {
  return transformedValue;
});
```

### Example
```js
const numbers = [1, 2, 3, 4, 5];

const doubled = numbers.map(num => num * 2);
console.log(doubled); // [2, 4, 6, 8, 10]
console.log(numbers); // [1, 2, 3, 4, 5]  ← original same
```

```js
const users = [
  { name: "Ashish", age: 25 },
  { name: "Grok", age: 2 }
];

const names = users.map(user => user.name);
console.log(names); // ["Ashish", "Grok"]
```

**Important Points:**
- Hamesha **naya array** return karta hai
- Length original jitni hi rehti hai
- Side-effect ke liye mat use karo (uske liye `forEach`)

---

## 2. filter()

**Kya karta hai?**  
Array se **sirf un elements** ko nikalta hai jo condition pass karte hain. Naya array return karta hai.

### Syntax
```js
const filteredArray = array.filter((element, index, array) => {
  return condition; // true/false
});
```

### Example
```js
const numbers = [1, 2, 3, 4, 5, 6];

const even = numbers.filter(num => num % 2 === 0);
console.log(even); // [2, 4, 6]
```

```js
const users = [
  { name: "Ashish", age: 25 },
  { name: "Rahul", age: 17 },
  { name: "Priya", age: 30 }
];

const adults = users.filter(user => user.age >= 18);
console.log(adults);
// [{ name: "Ashish", age: 25 }, { name: "Priya", age: 30 }]
```

**Important Points:**
- Condition `true` return karo toh element rahega
- Length kam ho sakti hai (ya same)
- Original array change nahi hota

---

## 3. reduce()

**Kya karta hai?**  
Array ke saare elements ko **ek single value** mein reduce kar deta hai (sum, product, object, array kuch bhi).

### Syntax
```js
const result = array.reduce((accumulator, currentValue, index, array) => {
  return updatedAccumulator;
}, initialValue);
```

### Example 1: Sum
```js
const numbers = [1, 2, 3, 4, 5];

const sum = numbers.reduce((acc, curr) => {
  return acc + curr;
}, 0);

console.log(sum); // 15
```

### Example 2: Maximum
```js
const numbers = [3, 7, 2, 9, 5];

const max = numbers.reduce((acc, curr) => {
  return curr > acc ? curr : acc;
}, numbers[0]);

console.log(max); // 9
```

### Example 3: Object banana (bahut important)
```js
const users = [
  { id: 1, name: "Ashish" },
  { id: 2, name: "Grok" },
  { id: 3, name: "Rahul" }
];

const userMap = users.reduce((acc, user) => {
  acc[user.id] = user.name;
  return acc;
}, {});

console.log(userMap);
// { 1: "Ashish", 2: "Grok", 3: "Rahul" }
```

### Example 4: Flatten array
```js
const nested = [[1, 2], [3, 4], [5]];

const flat = nested.reduce((acc, curr) => {
  return acc.concat(curr);
}, []);

console.log(flat); // [1, 2, 3, 4, 5]
```

**Important Points:**
- `initialValue` dena almost hamesha recommended hai
- Agar `initialValue` nahi doge toh pehla element accumulator ban jata hai
- Bahut powerful hai — map + filter dono ka kaam bhi kar sakta hai

---

## 4. Comparison Table

| Method    | Kya return karta hai      | Length change? | Use case                      |
|-----------|---------------------------|----------------|-------------------------------|
| **map**   | Naya array (transformed)  | Same           | Transform every element       |
| **filter**| Naya array (filtered)     | Kam ho sakti   | Select some elements          |
| **reduce**| Single value (anything)   | N/A            | Aggregate / combine everything|

---

## 5. Chaining (Bahut Common)

```js
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const result = numbers
  .filter(num => num % 2 === 0)      // even numbers
  .map(num => num * 3)               // multiply by 3
  .reduce((acc, curr) => acc + curr, 0); // sum

console.log(result); // 90
```

---

## 6. Interview Tips

1. **map** vs **forEach** → map naya array return karta hai, forEach `undefined`
2. **filter** hamesha boolean return kare (truthy/falsy)
3. **reduce** mein `initialValue` dena best practice hai
4. reduce se map aur filter dono bana sakte ho (advanced)

---

**Next:** In teeno ke **polyfill** likhenge (simple + with thisArg support).
