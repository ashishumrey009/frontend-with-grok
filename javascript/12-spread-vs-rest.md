# Chapter 12: Spread vs Rest Operator

Dono `...` (three dots) use karte hain, lekin kaam bilkul opposite hota hai.

---

## 1. Rest Operator (`...`)

**Kya karta hai?**  
Multiple values ko **collect** karke **ek array** bana deta hai.

Zyadatar **function parameters** mein use hota hai.

### Example 1: Function mein

```js
function sum(...numbers) {
  console.log(numbers); // [1, 2, 3, 4]
  return numbers.reduce((acc, curr) => acc + curr, 0);
}

sum(1, 2, 3, 4); // 10
```

### Example 2: Destructuring ke saath

```js
const [first, second, ...rest] = [10, 20, 30, 40, 50];

console.log(first);  // 10
console.log(second); // 20
console.log(rest);   // [30, 40, 50]
```

```js
const { name, age, ...otherDetails } = {
  name: "Ashish",
  age: 25,
  city: "Bangalore",
  country: "India"
};

console.log(name);         // Ashish
console.log(otherDetails); // { city: "Bangalore", country: "India" }
```

### Interview Line:
> "Rest operator collects the remaining elements into an array."

---

## 2. Spread Operator (`...`)

**Kya karta hai?**  
Array ya Object ko **expand** (khol) deta hai.

### Example 1: Array ko expand karna

```js
const nums = [1, 2, 3];

console.log(...nums); // 1 2 3

const newArr = [...nums, 4, 5];
console.log(newArr); // [1, 2, 3, 4, 5]
```

### Example 2: Array copy karna

```js
const original = [1, 2, 3];
const copy = [...original];

copy.push(4);

console.log(original); // [1, 2, 3]
console.log(copy);     // [1, 2, 3, 4]
```

### Example 3: Do arrays ko merge karna

```js
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];

const merged = [...arr1, ...arr2];
console.log(merged); // [1, 2, 3, 4, 5, 6]
```

### Example 4: Object mein use

```js
const user = { name: "Ashish", age: 25 };

const updatedUser = {
  ...user,
  city: "Bangalore",
  age: 26          // overwrite bhi kar sakte ho
};

console.log(updatedUser);
// { name: "Ashish", age: 26, city: "Bangalore" }
```

### Example 5: Function arguments mein

```js
function greet(a, b, c) {
  console.log(a, b, c);
}

const nums = [10, 20, 30];
greet(...nums); // 10 20 30
```

### Interview Line:
> "Spread operator expands an array or object into individual elements."

---

## 3. Main Difference (Yaad rakhne layak)

| Feature            | Rest (`...`)                  | Spread (`...`)                     |
|--------------------|-------------------------------|------------------------------------|
| Kaam               | Collect karta hai             | Expand karta hai                   |
| Direction          | Many → One (Array)            | One → Many                         |
| Mostly use         | Function parameters           | Arrays & Objects                   |
| Location           | Left side (parameters)         | Right side (values)                |
| Result             | Hamesha Array banata hai      | Individual values nikalta hai      |

---

## 4. Easy Trick to Remember

- **Rest** → "Rest of the values ko ikattha kar do" (Collect)
- **Spread** → "Spread out kar do" (Expand)

```js
// REST  → function ke parameter mein
function sum(...nums) { }        // collect

// SPREAD → values ko failana
const arr = [...nums];           // expand
Math.max(...nums);               // expand
```

---

## 5. Common Interview Questions

**Q1. Spread aur Rest mein difference kya hai?**  
Rest collect karta hai (many → one), Spread expand karta hai (one → many).

**Q2. Kya dono same syntax use karte hain?**  
Haan, dono `...` use karte hain, lekin context se pata chalta hai kaunsa hai.

**Q3. Rest operator kahan use hota hai?**  
Function parameters aur destructuring mein.

**Q4. Spread se array copy kaise karte ho?**
```js
const copy = [...originalArray];
```

**Q5. Object ko copy karte time kya hota hai?**  
Shallow copy hota hai (nested objects reference share karte hain).

---

## 6. Practical Examples

### Example: Function with Rest + Spread

```js
function multiply(multiplier, ...numbers) {
  return numbers.map(num => num * multiplier);
}

console.log(multiply(2, 1, 2, 3, 4)); // [2, 4, 6, 8]
```

### Example: Merging objects

```js
const defaults = { theme: "dark", language: "en" };
const userSettings = { language: "hi" };

const finalSettings = {
  ...defaults,
  ...userSettings
};

console.log(finalSettings);
// { theme: "dark", language: "hi" }
```

---

## 7. Key Takeaways

- Dono `...` use karte hain lekin kaam ulta hai
- **Rest** → Collect (parameters / destructuring)
- **Spread** → Expand (arrays, objects, function calls)
- Rest hamesha **last parameter** hona chahiye
- Spread se shallow copy milti hai

---

**Related Chapters:**  
- [09 - map, filter, reduce](./09-map-filter-reduce.md)  
- [11 - Functions Deep Dive](./11-functions-deep-dive.md)
