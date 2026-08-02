# Chapter 15: Objects Deep Dive (Interview Style)

Objects JavaScript ki foundation hain. Almost har cheez object pe based hoti hai.

Reference: [javascript.info/object](https://javascript.info/object)

---

## 1. What is an Object?

Object ek **keyed collection** of data hai.

Har property = **key-value pair**
- Key → string ya Symbol
- Value → kuch bhi (number, string, function, object, array...)

```js
let user = {
  name: "Ashish",
  age: 25,
  isAdmin: true
};
```

Soch sakte ho object ko ek cabinet ki tarah jisme labelled drawers hain.

---

## 2. Creating Objects

### Object Literal (Most Used)
```js
let user = {};                    // empty object
let user = { name: "Ashish" };    // with properties
```

### Constructor Syntax
```js
let user = new Object();
```

Literal (`{}`) zyada preferred hai.

---

## 3. Property Access

### Dot Notation
```js
user.name;     // "Ashish"
user.age;      // 25
```

### Bracket Notation
```js
user["name"];           // "Ashish"
user["likes birds"];    // multi-word keys ke liye zaroori
```

**Kab bracket use karein?**
- Key mein space / special character ho
- Key variable mein stored ho

```js
let key = "name";
user[key];              // "Ashish"
```

---

## 4. Adding / Updating / Deleting Properties

```js
let user = { name: "Ashish" };

// Add
user.age = 25;
user["isAdmin"] = true;

// Update
user.name = "Grok";

// Delete
delete user.age;
```

---

## 5. Computed Properties

Property name runtime pe decide karna ho toh:

```js
let fruit = "apple";

let bag = {
  [fruit]: 5                // bag.apple = 5
};

// Expression bhi chalega
let bag2 = {
  [fruit + "Count"]: 10     // bag2.appleCount = 10
};
```

---

## 6. Property Value Shorthand

Jab variable name aur property name same ho:

```js
function makeUser(name, age) {
  return {
    name,     // same as name: name
    age       // same as age: age
  };
}

let user = makeUser("Ashish", 25);
```

---

## 7. Property Existence Check

### Method 1: `undefined` check
```js
if (user.age === undefined) {
  // property nahi hai ya value undefined hai
}
```

### Method 2: `in` operator (better)
```js
"age" in user;        // true / false

let key = "name";
key in user;          // true
```

**Important difference:**
```js
let obj = { test: undefined };

obj.test === undefined;   // true
"test" in obj;            // true  (property exist karti hai)
```

`in` operator tab true return karta hai jab property exist karti hai, chahe value `undefined` ho.

---

## 8. Looping over Properties (`for...in`)

```js
let user = {
  name: "Ashish",
  age: 25,
  isAdmin: true
};

for (let key in user) {
  console.log(key);        // name, age, isAdmin
  console.log(user[key]);  // Ashish, 25, true
}
```

---

## 9. Property Order

- **Integer-like keys** → numeric order mein sort hote hain
- **Baaki keys** → creation order mein rehte hain

```js
let codes = {
  "49": "Germany",
  "41": "Switzerland",
  "1": "USA"
};

for (let code in codes) {
  console.log(code); // 1, 41, 49  (numeric order)
}
```

---

## 10. Object References (Very Important)

Objects **by reference** copy hote hain, primitives **by value**.

```js
let user = { name: "Ashish" };
let admin = user;          // reference copy hua

admin.name = "Grok";
console.log(user.name);    // "Grok"  (same object)
```

```js
let a = {};
let b = {};
console.log(a === b);      // false (different objects)
```

`const` object ki properties change ho sakti hain:
```js
const user = { name: "Ashish" };
user.name = "Grok";        // allowed
// user = {}               // Error
```

---

## 11. Cloning / Copying Objects

### Shallow Copy

**Object.assign**
```js
let user = { name: "Ashish", age: 25 };
let clone = Object.assign({}, user);

clone.name = "Grok";
console.log(user.name);    // "Ashish"
```

**Spread operator**
```js
let clone = { ...user };
```

**Limitation:** Nested objects reference share karte hain (shallow copy).

```js
let user = {
  name: "Ashish",
  sizes: { height: 180, width: 50 }
};

let clone = Object.assign({}, user);
user.sizes.width = 60;
console.log(clone.sizes.width); // 60 (same nested object)
```

### Deep Copy

```js
let clone = structuredClone(user);

user.sizes.width = 60;
console.log(clone.sizes.width); // 50 (independent)
```

`structuredClone`:
- Nested objects ko properly copy karta hai
- Circular references support karta hai
- Functions support nahi karta

---

## 12. Object Methods + `this`

Function jo object ki property ho → **method** kehlata hai.

```js
let user = {
  name: "Ashish",
  sayHi() {                    // method shorthand
    console.log("Hi, " + this.name);
  }
};

user.sayHi(); // Hi, Ashish
```

`this` current object ko point karta hai (jiss object ne method call kiya).

```js
let user = { name: "Ashish" };
let admin = { name: "Admin" };

function sayHi() {
  console.log(this.name);
}

user.f = sayHi;
admin.f = sayHi;

user.f();   // Ashish
admin.f();  // Admin
```

**Arrow functions** ka apna `this` nahi hota — surrounding scope se lete hain.

---

## 13. Constructor Functions + `new`

Same structure ke multiple objects banane ke liye:

```js
function User(name) {
  this.name = name;
  this.isAdmin = false;

  this.sayHi = function() {
    console.log("My name is " + this.name);
  };
}

let user1 = new User("Ashish");
let user2 = new User("Grok");

user1.sayHi(); // My name is Ashish
```

**`new` kya karta hai?**
1. Naya empty object banata hai
2. `this` ko us object se bind karta hai
3. Function body execute karta hai
4. `this` return karta hai

---

## 14. Common Interview Questions

**Q1. Objects by reference copy hote hain ya by value?**  
By reference.

**Q2. Shallow copy aur Deep copy mein difference?**  
Shallow → top-level copy, nested objects share hote hain.  
Deep → saari nesting properly copy hoti hai.

**Q3. `Object.assign` vs spread `{...obj}`?**  
Dono shallow copy karte hain. Spread modern aur clean hai.

**Q4. `in` operator vs `undefined` check?**  
`in` property existence check karta hai (chahe value undefined ho).  
`=== undefined` value check karta hai.

**Q5. `for...in` kya iterate karta hai?**  
Enumerable own properties (and inherited enumerable properties).

**Q6. `this` method ke andar kya hota hai?**  
Jiss object ne method call kiya, woh.

**Q7. `const` object ki properties change ho sakti hain?**  
Haan. Sirf reassignment nahi ho sakti.

**Q8. `structuredClone` limitations?**  
Functions clone nahi kar sakta.

---

## 15. Key Takeaways

- Object = key-value pairs ka collection
- Dot vs Bracket notation samjho
- Objects by reference copy hote hain
- Shallow copy (`Object.assign` / spread) vs Deep copy (`structuredClone`)
- Methods ke andar `this` current object hota hai
- Constructor + `new` se multiple similar objects bana sakte ho
- `in` operator existence check ke liye best hai

---

**Related Chapters:**  
- [07 - this + call/apply/bind](./07-this-call-apply-bind.md)  
- [13 - Arrow Functions](./13-arrow-functions.md)  
- [05 - Closures](./05-closures-deep-dive.md)
